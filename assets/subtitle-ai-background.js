(() => {
  "use strict";

  const ENGINE_KEY = "trancy_byok_engines";
  const SETTING_KEY = "lexihalo_subtitle_ai";
  const CACHE_KEY = "lexihalo_subtitle_ai_cache_v1";
  const DEFAULTS = { segmentation: false, repair: false, engineId: "" };
  const MAX_CACHE_ENTRIES = 160;
  const AI_PROVIDER_IDS = new Set(["OpenAI", "OpenRouter", "DeepSeek", "Google", "Anthropic", "Custom"]);

  const cleanSettings = value => ({
    segmentation: value?.segmentation === true,
    repair: value?.repair === true,
    engineId: typeof value?.engineId === "string" ? value.engineId : ""
  });

  const isAiEngine = engine => {
    if (!engine || !engine._id || !engine.key || !engine.model) return false;
    if (AI_PROVIDER_IDS.has(engine.providerId)) return true;
    return ["OpenAI", "DeepSeek", "Google", "Anthropic", "AI"].includes(engine.provider);
  };

  const getConfig = async () => {
    const stored = await chrome.storage.local.get([ENGINE_KEY, SETTING_KEY]);
    const engines = (Array.isArray(stored[ENGINE_KEY]) ? stored[ENGINE_KEY] : []).filter(isAiEngine);
    const settings = { ...DEFAULTS, ...cleanSettings(stored[SETTING_KEY]) };
    if (!engines.some(engine => engine._id === settings.engineId)) {
      settings.engineId = engines[0]?._id || "";
    }
    return { settings, engines };
  };

  const sanitizeLines = lines => {
    if (!Array.isArray(lines) || !lines.length || lines.length > 64) {
      throw new Error("每次只能处理 1–64 条字幕");
    }
    return lines.map((line, index) => {
      const id = Number(line?.id);
      const text = String(line?.text || "").replace(/\s+/g, " ").trim().slice(0, 800);
      if (!Number.isInteger(id) || !text) throw new Error(`第 ${index + 1} 条字幕无效`);
      return { id, text };
    });
  };

  const sanitizeContextLines = (lines, label) => {
    if (!Array.isArray(lines)) return [];
    if (lines.length > 20) throw new Error(`${label}最多只能包含 20 条字幕`);
    return lines.map((line, index) => {
      const id = Number(line?.id);
      const text = String(line?.text || "").replace(/\s+/g, " ").trim().slice(0, 800);
      if (!Number.isInteger(id) || !text) throw new Error(`${label}第 ${index + 1} 条字幕无效`);
      return { id, text };
    });
  };

  const stripCodeFence = value => {
    let text = String(value || "").trim();
    const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    if (fenced) text = fenced[1].trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    return start >= 0 && end > start ? text.slice(start, end + 1) : text;
  };

  const validateSegments = (payload, lines, options) => {
    const segments = Array.isArray(payload?.segments) ? payload.segments : null;
    if (!segments?.length) throw new Error("AI 未返回有效字幕分段");

    const expected = lines.map(line => line.id);
    const consumed = [];
    const normalized = segments.map((segment, index) => {
      const sourceIds = Array.isArray(segment?.source_ids)
        ? segment.source_ids.map(Number)
        : [];
      const text = String(segment?.text || "").replace(/\s+/g, " ").trim();
      if (!sourceIds.length || !text) throw new Error(`AI 返回的第 ${index + 1} 个分段无效`);
      if (!options.segmentation && sourceIds.length !== 1) {
        throw new Error("AI 修复结果意外改变了字幕分段");
      }
      consumed.push(...sourceIds);
      return { source_ids: sourceIds, text };
    });

    if (options.segmentation) {
      const expectedSet = new Set(expected);
      if (consumed.some(id => !expectedSet.has(id))) throw new Error("AI 返回了未知的字幕 ID");
      if (consumed.some((id, index) => index > 0 && id < consumed[index - 1])) {
        throw new Error("AI 返回结果改变了字幕顺序");
      }
      const covered = consumed.filter((id, index) => index === 0 || id !== consumed[index - 1]);
      if (covered.length !== expected.length || covered.some((id, index) => id !== expected[index])) {
        throw new Error("AI 返回结果未完整保留字幕顺序");
      }
      if (normalized.some(segment => segment.source_ids.some((id, index) => index > 0 && id !== segment.source_ids[index - 1] + 1))) {
        throw new Error("AI 返回了不连续的字幕范围");
      }
    } else {
      if (consumed.length !== expected.length || consumed.some((id, index) => id !== expected[index])) {
        throw new Error("AI 返回结果未完整保留字幕顺序");
      }
      if (normalized.length !== lines.length) throw new Error("AI 修复结果缺少字幕行");
    }
    return normalized;
  };

  const promptFor = (lines, language, options, contextBefore, contextAfter) => {
    const tasks = [];
    if (options.segmentation) {
      tasks.push("按语义、标点、说话停顿和阅读长度重新分段。可合并相邻碎片，也可拆分过长字幕，但不要跨越明显停顿或不同说话人；每段尽量适合两行字幕显示");
    } else {
      tasks.push("严格保留现有分段，每个输出段只能对应一个输入 ID");
    }
    if (options.repair) {
      tasks.push("仅在上下文提供充分证据时修复 ASR 错词、漏标点、大小写、重复词和明显同音误识别；遵循最小修改原则，不得润色、改写、补写或把不确定片段强行解释成另一个词");
    } else {
      tasks.push("不得改写、翻译或修复用词，只允许为分段需要调整空格和标点衔接");
    }

    return [
      "你是专业字幕编辑器。处理原语言字幕，不要翻译。",
      `字幕语言：${language || "auto"}`,
      `任务：${tasks.join("；")}。`,
      "修复时必须结合整段上下文，尤其要参考后文来判断专有名词、同音误识别、代词指向、标点和句子边界；禁止把每条字幕当作互不相关的独立句子处理。",
      "修复优先级：忠实保留原意 > 最小字符改动 > 语法自然。上下文只用于消歧，不是让你自由改写。没有高置信度证据时必须保留原文。",
      "中文特别规则：不要因为连续汉字看起来像另一个词就擅自重新切词或替换同音字；不要凭空增加动作、宾语或主题。只有上下文明确支持时才可补漏字。",
      "不得做文案润色，不得把口语改成书面语，不得为了通顺改变说话人的措辞。",
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
      JSON.stringify(contextAfter)
    ].join("\n");
  };

  const fetchWithTimeout = async (url, init, timeout = 90000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      const body = await response.text();
      if (!response.ok) {
        let message = body;
        try {
          const parsed = JSON.parse(body);
          message = parsed?.error?.message || parsed?.error || parsed?.message || body;
        } catch {}
        throw new Error(`AI 请求失败 (${response.status})：${String(message).slice(0, 300)}`);
      }
      return JSON.parse(body);
    } catch (error) {
      if (error?.name === "AbortError") throw new Error("AI 字幕处理超时");
      throw error;
    } finally {
      clearTimeout(timer);
    }
  };

  const callEngine = async (engine, prompt) => {
    const providerId = engine.providerId || engine.provider;
    if (providerId === "Google" || engine.provider === "Google") {
      let endpoint = engine.endpoint || `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(engine.model)}:generateContent`;
      if (!/:generateContent(?:\?|$)/.test(endpoint)) {
        endpoint = `${endpoint.replace(/\/+$/, "")}/v1beta/models/${encodeURIComponent(engine.model)}:generateContent`;
      }
      const data = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": engine.key },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 8192, responseMimeType: "application/json" }
        })
      });
      return data?.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("") || "";
    }

    if (providerId === "Anthropic" || engine.provider === "Anthropic") {
      const endpoint = engine.endpoint || "https://api.anthropic.com/v1/messages";
      const data = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": engine.key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: engine.model,
          max_tokens: 8192,
          temperature: 0.1,
          messages: [{ role: "user", content: prompt }]
        })
      });
      return data?.content?.map(part => part.text || "").join("") || "";
    }

    const endpoint = engine.endpoint || (
      providerId === "DeepSeek" || engine.provider === "DeepSeek"
        ? "https://api.deepseek.com/chat/completions"
        : "https://api.openai.com/v1/chat/completions"
    );
    const data = await fetchWithTimeout(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${engine.key}` },
      body: JSON.stringify({
        model: engine.model,
        temperature: 0.1,
        max_tokens: 8192,
        messages: [
          { role: "system", content: "Return valid JSON only. You edit subtitles without translating them." },
          { role: "user", content: prompt }
        ]
      })
    });
    return data?.choices?.[0]?.message?.content || "";
  };

  const digest = async value => {
    const bytes = new TextEncoder().encode(value);
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join("");
  };

  const getCached = async key => {
    const stored = await chrome.storage.local.get(CACHE_KEY);
    return stored[CACHE_KEY]?.[key]?.segments || null;
  };

  const setCached = async (key, segments) => {
    const stored = await chrome.storage.local.get(CACHE_KEY);
    const cache = stored[CACHE_KEY] && typeof stored[CACHE_KEY] === "object" ? stored[CACHE_KEY] : {};
    cache[key] = { segments, at: Date.now() };
    const entries = Object.entries(cache).sort((a, b) => (b[1]?.at || 0) - (a[1]?.at || 0));
    await chrome.storage.local.set({ [CACHE_KEY]: Object.fromEntries(entries.slice(0, MAX_CACHE_ENTRIES)) });
  };

  const clearIndexedDbStore = (dbName, storeName) => new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);
    request.onerror = () => reject(request.error || new Error(`无法打开缓存 ${dbName}`));
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
      clear.onerror = () => reject(clear.error || new Error(`无法清理缓存 ${dbName}`));
      transaction.oncomplete = () => {
        database.close();
        resolve(true);
      };
      transaction.onerror = () => reject(transaction.error || new Error(`无法清理缓存 ${dbName}`));
    };
  });

  const TRANSLATION_SCOPES = new Set(["subtitle", "immersive", "selection", "quick", "general"]);

  const clearCaches = async scope => {
    const target = typeof scope === "string" ? scope : "all";
    let aiSubtitleCacheCleared = false;
    let translationMemoryCacheCleared = false;
    let translationCacheCleared = false;

    if (target === "all" || target === "ai-subtitle") {
      await chrome.storage.local.remove(CACHE_KEY);
      aiSubtitleCacheCleared = true;
    }
    if (target === "all") {
      globalThis.lexihaloClearTranslationMemoryCache?.();
      translationMemoryCacheCleared = true;
      try {
        translationCacheCleared = await clearIndexedDbStore("CacheDB", "cacheStore");
      } catch (error) {
        console.warn("[LexiHalo subtitle AI] Failed to clear translation cache", error);
        throw error;
      }
    } else if (TRANSLATION_SCOPES.has(target)) {
      globalThis.lexihaloClearTranslationMemoryCache?.(target);
      translationMemoryCacheCleared = true;
    } else if (target !== "ai-subtitle") {
      throw new Error("未知的缓存类型");
    }
    return { scope: target, aiSubtitleCacheCleared, translationMemoryCacheCleared, translationCacheCleared };
  };

  const processSubtitles = async message => {
    const lines = sanitizeLines(message.lines);
    const contextBefore = sanitizeContextLines(message.contextBefore, "参考上文");
    const contextAfter = sanitizeContextLines(message.contextAfter, "参考下文");
    // Segmentation and source repair are one atomic preprocessing operation.
    // They must always run together; partial execution would produce timing and
    // text from different subtitle versions.
    const options = { ...cleanSettings(message.options), segmentation: true, repair: true };

    const { settings, engines } = await getConfig();
    const engineId = typeof message.engineId === "string" ? message.engineId : settings.engineId;
    const engine = engines.find(item => item._id === engineId) || engines[0];
    if (!engine) throw new Error("请先在 BYOK 页面配置 OpenAI、Gemini、Claude 等 AI 引擎");

    const language = String(message.language || "auto").slice(0, 40);
    const cacheKey = await digest(JSON.stringify({
      version: 3,
      engine: engine._id,
      model: engine.model,
      language,
      segmentation: options.segmentation,
      repair: options.repair,
      contextBefore,
      lines,
      contextAfter
    }));
    const cached = await getCached(cacheKey);
    if (cached) return { segments: validateSegments({ segments: cached }, lines, options), cached: true };

    const output = await callEngine(engine, promptFor(lines, language, options, contextBefore, contextAfter));
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

  const handleMessage = async message => {
    switch (message?.type) {
      case "lexihalo:subtitle-ai:get-config": {
        const { settings, engines } = await getConfig();
        return {
          settings,
          engines: engines.map(engine => ({ _id: engine._id, name: engine.name, model: engine.model }))
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
      case "lexihalo:subtitle-ai:process":
        return processSubtitles(message);
      default:
        throw new Error("未知的 AI 字幕请求");
    }
  };

  chrome.runtime.onConnect.addListener(port => {
    if (port.name !== "lexihalo-subtitle-ai") return;
    port.onMessage.addListener(message => {
      const requestId = message?.requestId;
      if (!requestId || typeof message?.type !== "string" || !message.type.startsWith("lexihalo:subtitle-ai:")) return;
      handleMessage(message).then(
        data => port.postMessage({ requestId, response: { ok: true, data } }),
        error => port.postMessage({ requestId, response: { ok: false, error: error?.message || String(error) } })
      ).catch(() => {});
    });
  });
})();
