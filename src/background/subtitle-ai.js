(() => {
  "use strict";

  const ENGINE_KEY = "trancy_byok_engines";
  const SETTING_KEY = "lexihalo_subtitle_ai";
  const CACHE_KEY = "lexihalo_subtitle_ai_cache_v1";
  const DIAGNOSTICS_KEY = "lexihalo_subtitle_ai_diagnostics_v1";
  const DEFAULTS = { segmentation: false, repair: false, engineId: "" };
  const MAX_CACHE_ENTRIES = 160;
  const MAX_DIAGNOSTIC_ENTRIES = 40;
  const AI_PROVIDER_IDS = new Set([
    "OpenAI",
    "OpenRouter",
    "DeepSeek",
    "Google",
    "Anthropic",
    "Custom",
  ]);

  let diagnosticsWrite = Promise.resolve();
  const safeEndpoint = (endpoint) => {
    try {
      const url = new URL(endpoint);
      return `${url.origin}${url.pathname}`;
    } catch {
      return "custom";
    }
  };
  const diagnosticEngine = (engine) => ({
    id: String(engine?._id || ""),
    name: String(engine?.name || ""),
    provider: String(engine?.providerId || engine?.provider || ""),
    model: String(engine?.model || ""),
    endpoint: safeEndpoint(engine?.endpoint || ""),
  });
  const recordDiagnostic = (entry) => {
    const safeEntry = {
      at: new Date().toISOString(),
      ...entry,
      error: entry.error ? String(entry.error).slice(0, 500) : undefined,
    };
    console.info("[LexiHalo AI subtitle diagnostics]", safeEntry);
    diagnosticsWrite = diagnosticsWrite
      .then(async () => {
        const stored = await chrome.storage.local.get(DIAGNOSTICS_KEY);
        const current = Array.isArray(stored[DIAGNOSTICS_KEY])
          ? stored[DIAGNOSTICS_KEY]
          : [];
        await chrome.storage.local.set({
          [DIAGNOSTICS_KEY]: [safeEntry, ...current].slice(
            0,
            MAX_DIAGNOSTIC_ENTRIES,
          ),
        });
      })
      .catch((error) =>
        console.warn("[LexiHalo] Failed to save AI diagnostics", error),
      );
  };

  const cleanSettings = (value) => ({
    segmentation: value?.segmentation === true,
    repair: value?.repair === true,
    engineId: typeof value?.engineId === "string" ? value.engineId : "",
  });

  const isAiEngine = (engine) => {
    if (!engine || !engine._id || !engine.key || !engine.model) return false;
    if (AI_PROVIDER_IDS.has(engine.providerId)) return true;
    return ["OpenAI", "DeepSeek", "Google", "Anthropic", "AI"].includes(
      engine.provider,
    );
  };

  const getConfig = async () => {
    const stored = await chrome.storage.local.get([ENGINE_KEY, SETTING_KEY]);
    const engines = (
      Array.isArray(stored[ENGINE_KEY]) ? stored[ENGINE_KEY] : []
    ).filter(isAiEngine);
    const settings = { ...DEFAULTS, ...cleanSettings(stored[SETTING_KEY]) };
    if (!engines.some((engine) => engine._id === settings.engineId)) {
      settings.engineId = engines[0]?._id || "";
    }
    return { settings, engines };
  };

  const sanitizeLines = (lines) => {
    if (!Array.isArray(lines) || !lines.length || lines.length > 64) {
      throw new Error("每次只能处理 1–64 条字幕");
    }
    return lines.map((line, index) => {
      const id = Number(line?.id);
      const text = String(line?.text || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 800);
      const translation = String(line?.translation || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 1200);
      if (!Number.isInteger(id) || !text)
        throw new Error(`第 ${index + 1} 条字幕无效`);
      return translation ? { id, text, translation } : { id, text };
    });
  };

  const sanitizeContextLines = (lines, label) => {
    if (!Array.isArray(lines)) return [];
    if (lines.length > 20) throw new Error(`${label}最多只能包含 20 条字幕`);
    return lines.map((line, index) => {
      const id = Number(line?.id);
      const text = String(line?.text || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 800);
      const translation = String(line?.translation || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 1200);
      if (!Number.isInteger(id) || !text)
        throw new Error(`${label}第 ${index + 1} 条字幕无效`);
      return translation ? { id, text, translation } : { id, text };
    });
  };

  const stripCodeFence = (value) => {
    let text = String(value || "")
      .trim()
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .replace(/<thought>[\s\S]*?<\/thought>/gi, "")
      .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, "")
      .replace(/<details>[\s\S]*?<\/details>/gi, "")
      .trim();

    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch) text = codeBlockMatch[1].trim();

    const firstBrace = text.indexOf("{");
    const firstBracket = text.indexOf("[");
    let startIdx = -1;
    let endIdx = -1;
    if (firstBracket >= 0 && (firstBrace < 0 || firstBracket < firstBrace)) {
      startIdx = firstBracket;
      endIdx = text.lastIndexOf("]");
    } else if (firstBrace >= 0) {
      startIdx = firstBrace;
      endIdx = text.lastIndexOf("}");
    }
    if (startIdx >= 0 && endIdx > startIdx) {
      text = text.slice(startIdx, endIdx + 1);
    }
    text = text.replace(/,\s*([\]}])/g, "$1");
    return text;
  };

  const parseSubtitleItems = (output) => {
    const cleaned = stripCodeFence(output);
    try {
      const payload = JSON.parse(cleaned);
      if (Array.isArray(payload)) return payload;
      if (payload && typeof payload === "object") {
        for (const key of [
          "items",
          "subtitles",
          "segments",
          "translations",
          "results",
          "lines",
          "data",
        ]) {
          if (Array.isArray(payload[key])) return payload[key];
        }
        const numKeys = Object.keys(payload)
          .filter((k) => /^\d+$/.test(k))
          .sort((a, b) => Number(a) - Number(b));
        if (numKeys.length > 0) {
          return numKeys.map((k) =>
            typeof payload[k] === "object"
              ? { id: Number(k), ...payload[k] }
              : { id: Number(k), translation: String(payload[k]) },
          );
        }
      }
    } catch {}

    const items = [];
    const itemRegex =
      /\{[^{}]*?(?:"id"\s*:\s*(\d+))?[^{}]*?"repaired"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"[^{}]*?"translation"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"[^{}]*?\}/gi;
    let match;
    while ((match = itemRegex.exec(cleaned)) !== null) {
      try {
        items.push({
          id: match[1] ? Number(match[1]) : items.length + 1,
          repaired: JSON.parse(`"${match[2]}"`),
          translation: JSON.parse(`"${match[3]}"`),
        });
      } catch {
        items.push({
          id: match[1] ? Number(match[1]) : items.length + 1,
          repaired: match[2],
          translation: match[3],
        });
      }
    }
    return items;
  };

  const validateSegments = (payload, lines, options) => {
    const segments = Array.isArray(payload?.segments) ? payload.segments : null;
    if (!segments?.length) throw new Error("AI 未返回有效字幕分段");

    const expected = lines.map((line) => line.id);
    const consumed = [];
    const normalized = segments.map((segment, index) => {
      const sourceIds = Array.isArray(segment?.source_ids)
        ? segment.source_ids.map(Number)
        : [];
      const text = String(segment?.text || "")
        .replace(/\s+/g, " ")
        .trim();
      if (!sourceIds.length || !text)
        throw new Error(`AI 返回的第 ${index + 1} 个分段无效`);
      if (!options.segmentation && sourceIds.length !== 1) {
        throw new Error("AI 修复结果意外改变了字幕分段");
      }
      consumed.push(...sourceIds);
      return { source_ids: sourceIds, text };
    });

    if (options.segmentation) {
      const expectedSet = new Set(expected);
      if (consumed.some((id) => !expectedSet.has(id)))
        throw new Error("AI 返回了未知的字幕 ID");
      if (consumed.some((id, index) => index > 0 && id < consumed[index - 1])) {
        throw new Error("AI 返回结果改变了字幕顺序");
      }
      const covered = consumed.filter(
        (id, index) => index === 0 || id !== consumed[index - 1],
      );
      if (
        covered.length !== expected.length ||
        covered.some((id, index) => id !== expected[index])
      ) {
        throw new Error("AI 返回结果未完整保留字幕顺序");
      }
      if (
        normalized.some((segment) =>
          segment.source_ids.some(
            (id, index) =>
              index > 0 && id !== segment.source_ids[index - 1] + 1,
          ),
        )
      ) {
        throw new Error("AI 返回了不连续的字幕范围");
      }
    } else {
      if (
        consumed.length !== expected.length ||
        consumed.some((id, index) => id !== expected[index])
      ) {
        throw new Error("AI 返回结果未完整保留字幕顺序");
      }
      if (normalized.length !== lines.length)
        throw new Error("AI 修复结果缺少字幕行");
    }
    return normalized;
  };

  const promptFor = (lines, language, options, contextBefore, contextAfter) => {
    const tasks = [];
    if (options.segmentation) {
      tasks.push(
        "按语义、标点、说话停顿和阅读长度重新分段。可合并相邻碎片，也可拆分过长字幕，但不要跨越明显停顿或不同说话人；每段尽量适合两行字幕显示",
      );
    } else {
      tasks.push("严格保留现有分段，每个输出段只能对应一个输入 ID");
    }
    if (options.repair) {
      tasks.push(
        "仅在上下文提供充分证据时修复 ASR 错词、漏标点、大小写、重复词和明显同音误识别；遵循最小修改原则，不得润色、改写、补写或把不确定片段强行解释成另一个词",
      );
    } else {
      tasks.push(
        "不得改写、翻译或修复用词，只允许为分段需要调整空格和标点衔接",
      );
    }

    return [
      "你是专业字幕编辑器。处理原语言字幕，不要翻译。",
      `字幕语言：${language || "auto"}`,
      `任务：${tasks.join("；")}。`,
      "每条数据中的 text 是原文，translation 是现有译文（可能为空，也可能包含机器翻译错误）。必须同时对照原文、译文和上下文进行语义消歧。",
      "译文只能作为辅助证据，不能被当作绝对正确答案；禁止从译文反向编造原文。原文与译文冲突时，应结合前后文选择最保守、改动最小的原文修复。",
      "最终 segments.text 只能输出修复后的原语言字幕，不得输出译文；旧译文会在修复后由当前翻译引擎重新生成。",
      "修复时必须结合整段上下文，尤其要参考后文来判断专有名词、同音误识别、代词指向、标点和句子边界；禁止把每条字幕当作互不相关的独立句子处理。",
      "修复优先级：忠实保留原意 > 最小字符改动 > 语法自然。上下文只用于消歧，不是让你自由改写。没有高置信度证据时必须保留原文。",
      "中文特别规则：严禁将口语常用字（如‘叫’、‘些’、‘给’、‘搞’）强行臆测拆字拼词；若原文口语能顺畅理解，必须原样保留，严禁擅自替换同音字。不要凭空增加动作、宾语或书面语词汇。",
      "不得做文案润色，不得把口语改成书面语，不得为了通顺改变说话人的真实措辞。",
      "输出前必须逐项自检每个字词改动：它必须由某条上下文直接支持；找不到直接证据的改动必须撤销。不要输出自检说明，只输出最终 JSON。",
      "必须遵守：",
      options.segmentation
        ? "1. 每个待处理字幕 ID 必须至少出现一次且顺序不得改变；仅在把一条过长字幕拆成多段时，才可在相邻输出中重复该 ID；严禁输出参考上下文的 ID。"
        : "1. 每个待处理字幕 ID 必须且只能出现一次，顺序不得改变；严禁输出参考上下文的 ID。",
      "2. source_ids 只能包含连续的输入 ID。",
      "3. 不得丢失语义、凭空补充内容或输出解释。",
      '4. 只返回严格 JSON：{"segments":[{"source_ids":[1,2],"text":"..."}]}。',
      "参考上文（只用于理解，不得输出这些 ID）：",
      JSON.stringify(contextBefore),
      "待处理字幕（只输出这些 ID）：",
      JSON.stringify(lines),
      "参考下文（必须用于消歧，只用于理解，不得输出这些 ID）：",
      JSON.stringify(contextAfter),
    ].join("\n");
  };

  const outputTokenBudget = (lineCount, sourceChars) => {
    const lines = Math.max(1, Number(lineCount || 1));
    const characters = Math.max(0, Number(sourceChars || 0));
    return Math.min(
      8192,
      Math.max(2048, Math.ceil(characters * 1.25) + lines * 128),
    );
  };

  const requestTuning = (engine, maxTokens) => {
    const providerId = engine.providerId || engine.provider;
    const model = String(engine.model || "").toLowerCase();
    let endpointHost = "";
    try {
      endpointHost = new URL(engine.endpoint).hostname.toLowerCase();
    } catch {}
    const officialOpenAi =
      providerId === "OpenAI" && endpointHost === "api.openai.com";
    const requestBody = {};
    const supportsJsonObject =
      officialOpenAi ||
      providerId === "OpenRouter" ||
      providerId === "DeepSeek";
    if (supportsJsonObject) {
      requestBody.response_format = { type: "json_object" };
    }
    if (providerId === "OpenRouter") {
      requestBody.reasoning = { effort: "low", exclude: true };
    }
    if (/qwen|qwq/.test(model)) requestBody.enable_thinking = false;
    if (/glm/.test(model)) requestBody.thinking = { type: "disabled" };

    const isGpt5 = /(^|\/)gpt-5(?:[.\-]|$)/.test(model);
    const useGpt5Controls =
      isGpt5 && (officialOpenAi || providerId === "OpenRouter");
    if (useGpt5Controls) {
      requestBody.reasoning_effort = "minimal";
      requestBody.max_completion_tokens = maxTokens;
    }
    if (providerId === "Google" || engine.provider === "Google") {
      requestBody.generationConfig = {
        temperature: 0.1,
        maxOutputTokens: maxTokens,
        responseMimeType: "application/json",
        ...(/^gemini-(?:2\.5|3)/.test(model)
          ? { thinkingConfig: { thinkingBudget: 0 } }
          : {}),
      };
    }
    return {
      temperature: useGpt5Controls ? undefined : 0.1,
      maxTokens: useGpt5Controls ? undefined : maxTokens,
      requestBody,
    };
  };

  const parseNumberedLines = (output, expectedCount) => {
    if (!output || typeof output !== "string") return [];
    const cleaned = output
      .replace(/<think[\s\S]*?<\/think>/gi, "")
      .replace(/<thought[\s\S]*?<\/thought>/gi, "")
      .replace(/<reasoning[\s\S]*?<\/reasoning>/gi, "")
      .trim();
    const lines = cleaned.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const parsed = new Map();
    for (const line of lines) {
      const match = line.match(/^(\d+)[\.\:\、\)\-\s]+(.+)$/);
      if (match) {
        const id = parseInt(match[1], 10);
        const text = match[2].trim();
        if (id > 0 && text) parsed.set(id, text);
      }
    }
    if (parsed.size >= Math.ceil(expectedCount * 0.5)) {
      return Array.from({ length: expectedCount }, (_, i) => ({
        id: i + 1,
        translation: parsed.get(i + 1) || "",
      }));
    }
    if (lines.length === expectedCount) {
      return lines.map((text, i) => ({ id: i + 1, translation: text }));
    }
    return [];
  };

  const callEngineWithRetry = async (
    engine,
    messages,
    {
      lineCount = 1,
      sourceChars = 0,
      requestGroup,
      requestGeneration,
    } = {},
  ) => {
    if (typeof globalThis.lexihaloExecuteStructuredAi !== "function") {
      throw new Error("AI provider adapter is not ready");
    }
    const maxTokens = outputTokenBudget(lineCount, sourceChars);
    const tuning = requestTuning(engine, maxTokens);

    // Method 1a: Standard structured parameters
    try {
      return await globalThis.lexihaloExecuteStructuredAi({
        engine,
        texts: [],
        from: "auto",
        to: "json",
        messages,
        requestGroup,
        requestGeneration,
        ...tuning,
      });
    } catch (firstError) {
      if (/superseded|aborted|cancelled/i.test(firstError?.message || "")) {
        throw firstError;
      }
      // Method 1b: "换个方法重试" - Strip vendor-specific parameters (fixes 400 Bad Request on OneAPI/proxies/models)
      console.warn(
        "[LexiHalo] AI primary attempt failed, retrying with stripped parameters...",
        firstError?.message,
      );
      return await globalThis.lexihaloExecuteStructuredAi({
        engine,
        texts: [],
        from: "auto",
        to: "text",
        messages,
        requestGroup,
        requestGeneration,
        temperature: 0.1,
        maxTokens,
      });
    }
  };

  const callEngine = (engine, prompt, options) =>
    callEngineWithRetry(
      engine,
      [
        {
          role: "system",
          content:
            "Return one strict JSON object only. Do not include Markdown or explanations.",
        },
        { role: "user", content: prompt },
      ],
      options,
    );

  const digest = async (value) => {
    const bytes = new TextEncoder().encode(value);
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(hash), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
  };

  const getCached = async (key) => {
    const stored = await chrome.storage.local.get(CACHE_KEY);
    return stored[CACHE_KEY]?.[key]?.segments || null;
  };

  const setCached = async (key, segments) => {
    const stored = await chrome.storage.local.get(CACHE_KEY);
    const cache =
      stored[CACHE_KEY] && typeof stored[CACHE_KEY] === "object"
        ? stored[CACHE_KEY]
        : {};
    cache[key] = { segments, at: Date.now() };
    const entries = Object.entries(cache).sort(
      (a, b) => (b[1]?.at || 0) - (a[1]?.at || 0),
    );
    await chrome.storage.local.set({
      [CACHE_KEY]: Object.fromEntries(entries.slice(0, MAX_CACHE_ENTRIES)),
    });
  };

  const failedSubtitleResult = (text, message) => ({
    message: message || "failed",
    translation: "",
    repairedText: text,
  });

  const translateMissingLines = async ({
    result,
    texts,
    from,
    to,
    engine,
  }) => {
    if (typeof globalThis.lexihaloTranslateTextFallback !== "function") {
      return result;
    }
    const missing = result
      .map((item, index) => (item.message === "ok" ? -1 : index))
      .filter((index) => index >= 0);
    let cursor = 0;
    const googleEngine = {
      _id: "google-translate",
      name: "Google Translator",
      type: "built-in",
      provider: "GoogleTranslator",
      model: "google-translate",
      schemaVersion: 2,
      modelRef: "google-translate/google-translate",
    };

    const translateOne = async (index) => {
      const sourceText = String(texts[index] || "");
      const fallbackTokens = outputTokenBudget(1, sourceText.length);
      const tuning = requestTuning(engine, fallbackTokens);
      const tunedAiEngine = {
        ...engine,
        temperature: tuning.temperature,
        maxTokens: tuning.maxTokens,
        requestBody: {
          ...(engine.requestBody || {}),
          ...tuning.requestBody,
        },
      };
      const request = {
        texts: [sourceText],
        from: from || "auto",
        to,
        useCache: true,
        cacheScope: "subtitle-fallback",
      };
      for (const [fallbackEngine, fallbackType] of [
        [tunedAiEngine, "ai-translation-only"],
        [googleEngine, "machine-translation"],
      ]) {
        const startedAt = performance.now();
        try {
          const response = await globalThis.lexihaloTranslateTextFallback({
            ...request,
            engine: fallbackEngine,
          });
          const translated = response?.[0];
          const succeeded =
            translated?.message === "ok" && translated.translation;
          recordDiagnostic({
            stage: fallbackType,
            status: succeeded ? "ok" : "failed",
            engine: diagnosticEngine(fallbackEngine),
            batchSize: 1,
            sourceChars: sourceText.length,
            maxTokens: fallbackTokens,
            durationMs: Math.round(performance.now() - startedAt),
            error: succeeded ? undefined : translated?.message,
          });
          if (succeeded) {
            result[index] = {
              message: "ok",
              translation: String(translated.translation).trim(),
              repairedText: sourceText,
              fallback: fallbackType,
            };
            return;
          }
        } catch (error) {
          recordDiagnostic({
            stage: fallbackType,
            status: "failed",
            engine: diagnosticEngine(fallbackEngine),
            batchSize: 1,
            sourceChars: sourceText.length,
            maxTokens: fallbackTokens,
            durationMs: Math.round(performance.now() - startedAt),
            error: error?.message || String(error),
          });
          console.warn(
            `[LexiHalo] Subtitle ${fallbackType} fallback failed`,
            error,
          );
        }
      }
    };

    const worker = async () => {
      while (cursor < missing.length) {
        const position = cursor++;
        await translateOne(missing[position]);
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(2, missing.length) }, () => worker()),
    );
    return result;
  };

  globalThis.lexihaloTranslateSubtitlesWithAi = async (params) => {
    const {
      texts,
      from,
      to,
      engine,
      useCache,
      requestGroup,
      requestGeneration,
    } = params;
    if (!isAiEngine(engine) || !Array.isArray(texts) || !texts.length)
      return null;

    const cacheKey = await digest(
      JSON.stringify({
        version: 9,
        type: "subtitle-ai-bilingual",
        engine: engine._id,
        model: engine.model,
        from: from || "auto",
        to,
        texts,
      }),
    );

    if (useCache !== false) {
      const cached = await getCached(cacheKey);
      if (Array.isArray(cached) && cached.length === texts.length) {
        recordDiagnostic({
          stage: "cache",
          status: "hit",
          engine: diagnosticEngine(engine),
          batchSize: texts.length,
          sourceChars: texts.reduce(
            (total, text) => total + String(text || "").length,
            0,
          ),
        });
        return cached;
      }
    }

    const prompt = [
      "You are an expert bilingual subtitle translator and editor.",
      `Source Language: ${from || "auto"}`,
      `Target Language: ${to}`,
      "Instructions for this sequential batch of subtitles:",
      "1. Read all subtitles in order to understand the conversational context.",
      "2. Conservatively repair ASR errors only when context provides clear evidence. Never rewrite colloquial speech.",
      "3. Translate every subtitle accurately and naturally.",
      "4. Return one JSON object with an items array. Preserve every numeric id.",
      `Input Subtitles: ${JSON.stringify(texts.map((text, index) => ({ id: index + 1, text })))}`,
      'Output JSON: {"items":[{"id":1,"repaired":"...","translation":"..."}]}',
    ].join("\n");

    let result = texts.map((text) =>
      failedSubtitleResult(text, "AI 字幕尚未返回结果"),
    );
    let primaryError = null;
    const sourceChars = texts.reduce(
      (total, text) => total + String(text || "").length,
      0,
    );
    const primaryTokens = outputTokenBudget(texts.length, sourceChars);
    const primaryStartedAt = performance.now();
    let output = "";
    let parsed = null;
    let isMethod2 = false;
    try {
      // Method 1: Structured JSON batch request
      try {
        output = await callEngineWithRetry(
          engine,
          [
            {
              role: "system",
              content:
                "Return one strict JSON object only. Do not include Markdown or explanations.",
            },
            { role: "user", content: prompt },
          ],
          {
            lineCount: texts.length,
            sourceChars,
            requestGroup,
            requestGeneration,
          },
        );
        parsed = parseSubtitleItems(output);
      } catch (method1Error) {
        if (
          /superseded|aborted|cancelled/i.test(method1Error?.message || "")
        ) {
          throw method1Error;
        }
        console.warn(
          "[LexiHalo] Method 1 (JSON) failed, trying Method 2 (Line-by-line)...",
          method1Error?.message,
        );
      }

      // Method 2: If Method 1 produced no items, "换个方法重试" with numbered line format
      if (!Array.isArray(parsed) || !parsed.length) {
        isMethod2 = true;
        const linePrompt = [
          `Translate each of the following ${texts.length} subtitles to ${to}.`,
          "Keep the line numbers. Output only the translated lines, nothing else:",
          ...texts.map((text, i) => `${i + 1}. ${text}`),
        ].join("\n");
        output = await callEngineWithRetry(
          engine,
          [
            {
              role: "system",
              content: `You are a professional subtitle translator. Translate into ${to}. Output only numbered lines.`,
            },
            { role: "user", content: linePrompt },
          ],
          {
            lineCount: texts.length,
            sourceChars,
            requestGroup,
            requestGeneration,
          },
        );
        parsed = parseNumberedLines(output, texts.length);
      }

      if (!Array.isArray(parsed) || !parsed.length) {
        throw new Error("AI 字幕换用多种方法重试后仍未返回可用条目");
      }
      const byId = new Map(
        parsed
          .filter((item) => item && typeof item === "object")
          .map((item) => [Number(item.id), item])
          .filter(([id]) => Number.isInteger(id) && id > 0),
      );
      result = texts.map((text, index) => {
        const item = byId.get(index + 1) || parsed[index];
        const translation = String(
          typeof item === "string"
            ? item
            : item?.translation ||
                item?.translated ||
                item?.target ||
                item?.target_text ||
                "",
        ).trim();
        if (!translation) {
          return failedSubtitleResult(
            text,
            `AI 未返回第 ${index + 1} 条字幕`,
          );
        }
        return {
          message: "ok",
          translation,
          repairedText:
            String(
              item?.repaired ||
                item?.corrected ||
                item?.source ||
                item?.original ||
                "",
            ).trim() || String(text || ""),
          fallback: isMethod2 ? "ai-translation-only" : undefined,
        };
      });
      const missingCount = result.filter(
        (item) => item.message !== "ok",
      ).length;
      recordDiagnostic({
        stage: "combined-repair-translation",
        status: missingCount ? "partial" : "ok",
        engine: diagnosticEngine(engine),
        batchSize: texts.length,
        sourceChars,
        maxTokens: primaryTokens,
        responseChars: output.length,
        missingCount,
        durationMs: Math.round(performance.now() - primaryStartedAt),
      });
    } catch (error) {
      primaryError = error;
      const isSuperseded = /superseded|aborted|cancelled/i.test(
        error?.message || "",
      );
      recordDiagnostic({
        stage: "combined-repair-translation",
        status: isSuperseded ? "superseded" : "failed",
        engine: diagnosticEngine(engine),
        batchSize: texts.length,
        sourceChars,
        maxTokens: primaryTokens,
        durationMs: Math.round(performance.now() - primaryStartedAt),
        error: error?.message || String(error),
      });
      if (isSuperseded) {
        return texts.map((text) => ({
          message: "superseded",
          translation: "",
          repairedText: text,
        }));
      }
      console.warn("[LexiHalo] Combined AI subtitle request failed", error);
      const message = error?.message || String(error);
      result = texts.map((text) => failedSubtitleResult(text, message));
    }

    if (result.some((item) => item.message !== "ok")) {
      result = await translateMissingLines({
        result,
        texts,
        from,
        to,
        engine,
      });
    }
    if (
      result.every(
        (item) => item.message === "ok" && item.fallback !== true,
      ) &&
      result.every((item) => !item.fallback)
    ) {
      await setCached(cacheKey, result);
    }
    return result;
  };

  const clearIndexedDbStore = (dbName, storeName) =>
    new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName);
      request.onerror = () =>
        reject(request.error || new Error(`无法打开缓存 ${dbName}`));
      request.onupgradeneeded = () => {
        // A missing database has no cache to clear. Abort so an empty database is
        // not left behind solely because the user clicked the cleanup button.
        request.transaction?.abort();
        resolve(false);
      };
      request.onsuccess = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(storeName)) {
          database.close();
          resolve(false);
          return;
        }
        const transaction = database.transaction(storeName, "readwrite");
        const clear = transaction.objectStore(storeName).clear();
        clear.onerror = () =>
          reject(clear.error || new Error(`无法清理缓存 ${dbName}`));
        transaction.oncomplete = () => {
          database.close();
          resolve(true);
        };
        transaction.onerror = () =>
          reject(transaction.error || new Error(`无法清理缓存 ${dbName}`));
      };
    });

  const TRANSLATION_SCOPES = new Set([
    "subtitle",
    "subtitle-refresh",
    "immersive",
    "selection",
    "quick",
    "general",
  ]);

  const clearCaches = async (scope) => {
    const target = typeof scope === "string" ? scope : "all";
    let aiSubtitleCacheCleared = false;
    let translationMemoryCacheCleared = false;
    let translationCacheCleared = false;

    if (target === "all" || target === "ai-subtitle" || target === "subtitle") {
      await chrome.storage.local.remove(CACHE_KEY);
      aiSubtitleCacheCleared = true;
    }
    if (target === "all") {
      globalThis.lexihaloClearTranslationMemoryCache?.();
      translationMemoryCacheCleared = true;
      try {
        translationCacheCleared = await clearIndexedDbStore(
          "CacheDB",
          "cacheStore",
        );
      } catch (error) {
        console.warn(
          "[LexiHalo subtitle AI] Failed to clear translation cache",
          error,
        );
        throw error;
      }
    } else if (
      target === "ai-subtitle" ||
      target === "subtitle" ||
      target === "subtitle-refresh"
    ) {
      globalThis.lexihaloClearTranslationMemoryCache?.("subtitle");
      translationMemoryCacheCleared = true;
    } else if (TRANSLATION_SCOPES.has(target)) {
      globalThis.lexihaloClearTranslationMemoryCache?.(target);
      translationMemoryCacheCleared = true;
    } else {
      throw new Error("未知的缓存类型");
    }
    return {
      scope: target,
      aiSubtitleCacheCleared,
      translationMemoryCacheCleared,
      translationCacheCleared,
    };
  };

  const processSubtitles = async (message) => {
    const lines = sanitizeLines(message.lines);
    const contextBefore = sanitizeContextLines(
      message.contextBefore,
      "参考上文",
    );
    const contextAfter = sanitizeContextLines(message.contextAfter, "参考下文");
    // Segmentation and source repair are one atomic preprocessing operation.
    // They must always run together; partial execution would produce timing and
    // text from different subtitle versions.
    const options = {
      ...cleanSettings(message.options),
      segmentation: true,
      repair: true,
    };

    const { settings, engines } = await getConfig();
    const engineId =
      typeof message.engineId === "string"
        ? message.engineId
        : settings.engineId;
    const engine = engines.find((item) => item._id === engineId) || engines[0];
    if (!engine)
      throw new Error("请先在 BYOK 页面配置 OpenAI、Gemini、Claude 等 AI 引擎");

    const language = String(message.language || "auto").slice(0, 40);
    const cacheKey = await digest(
      JSON.stringify({
        version: 5,
        engine: engine._id,
        model: engine.model,
        language,
        segmentation: options.segmentation,
        repair: options.repair,
        contextBefore,
        lines,
        contextAfter,
      }),
    );
    const cached = await getCached(cacheKey);
    if (cached)
      return {
        segments: validateSegments({ segments: cached }, lines, options),
        cached: true,
      };

    const output = await callEngine(
      engine,
      promptFor(lines, language, options, contextBefore, contextAfter),
      {
        lineCount: lines.length,
        sourceChars: lines.reduce(
          (total, line) => total + line.text.length,
          0,
        ),
        requestGroup: `subtitle-process:${engine._id}`,
        requestGeneration: 0,
      },
    );
    let parsed;
    try {
      parsed = JSON.parse(stripCodeFence(output));
    } catch {
      throw new Error("AI 返回的字幕不是有效 JSON，请重试或更换模型");
    }
    const segments = validateSegments(parsed, lines, options);
    await setCached(cacheKey, segments);
    return { segments, cached: false };
  };

  const handleMessage = async (message) => {
    switch (message?.type) {
      case "lexihalo:subtitle-ai:get-config": {
        const { settings, engines } = await getConfig();
        return {
          settings,
          engines: engines.map((engine) => ({
            _id: engine._id,
            name: engine.name,
            model: engine.model,
          })),
        };
      }
      case "lexihalo:subtitle-ai:save-config": {
        const settings = cleanSettings(message.settings);
        await chrome.storage.local.set({ [SETTING_KEY]: settings });
        return { settings };
      }
      case "lexihalo:subtitle-ai:open-config": {
        await chrome.tabs.create({ url: chrome.runtime.getURL("byok.html") });
        return { opened: true };
      }
      case "lexihalo:subtitle-ai:clear-cache":
        return clearCaches(message.scope);
      case "lexihalo:subtitle-ai:cancel":
        return globalThis.lexihaloCancelStructuredAiGroup?.(
          message.requestGroup,
          message.requestGeneration,
        ) || { cancelled: 0 };
      case "lexihalo:subtitle-ai:get-diagnostics": {
        await diagnosticsWrite;
        const stored = await chrome.storage.local.get(DIAGNOSTICS_KEY);
        return {
          entries: Array.isArray(stored[DIAGNOSTICS_KEY])
            ? stored[DIAGNOSTICS_KEY]
            : [],
        };
      }
      case "lexihalo:subtitle-ai:clear-diagnostics":
        await chrome.storage.local.remove(DIAGNOSTICS_KEY);
        return { cleared: true };
      case "lexihalo:subtitle-ai:process":
        return processSubtitles(message);
      default:
        throw new Error("未知的 AI 字幕请求");
    }
  };

  chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== "lexihalo-subtitle-ai") return;
    port.onMessage.addListener((message) => {
      const requestId = message?.requestId;
      if (
        !requestId ||
        typeof message?.type !== "string" ||
        !message.type.startsWith("lexihalo:subtitle-ai:")
      )
        return;
      handleMessage(message)
        .then(
          (data) =>
            port.postMessage({ requestId, response: { ok: true, data } }),
          (error) =>
            port.postMessage({
              requestId,
              response: { ok: false, error: error?.message || String(error) },
            }),
        )
        .catch(() => {});
    });
  });
})();
