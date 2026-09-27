(() => {
  "use strict";

  const REQUEST_EVENT = "lexihalo:subtitle-ai-request";
  const RESPONSE_EVENT = "lexihalo:subtitle-ai-response";
  const UI_ID = "lexihalo-subtitle-ai-settings";
  const CHUNK_SIZE = 28;
  const CONTEXT_BEFORE = 6;
  const CONTEXT_AFTER = 14;
  const state = {
    config: { segmentation: false, repair: false, engineId: "" },
    engines: [],
    configLoaded: false,
    configOpening: false,
    provider: null,
    providerListener: null,
    videoId: "",
    rawLines: null,
    rawSignature: "",
    processedSignature: "",
    observedSignature: "",
    processing: false,
    timer: 0,
    requestGeneration: 0,
    status: "",
    statusError: false
  };
  const pending = new Map();
  const zh = /^zh\b/i.test(navigator.language || "");
  const text = zh ? {
    title: "AI 分段与原字幕修复",
    engine: "处理引擎",
    processingEngine: "AI 处理模型",
    configure: "配置 AI 引擎",
    combinedTip: "由字幕菜单中的“AI 分段与原字幕修复”开关统一控制；开启后两项会同时执行。",

    aiCache: "AI 字幕处理缓存",
    aiCacheTip: "仅清除 AI 分段与原字幕修复结果。",
    subtitleCache: "字幕翻译缓存",
    subtitleCacheTip: "仅清除双语字幕翻译结果。",
    clearing: "正在清理缓存",
    cleared: "缓存已清理",
    disabled: "AI 处理已关闭",
    waiting: "等待原字幕",
    processing: "AI 处理中",
    boundary: "正在处理分段边界",
    appliedChanged: "AI 已处理并应用",
    appliedUnchanged: "AI 已处理并应用，但模型未修改字幕",
    overwritten: "AI 已生成结果，但字幕源覆盖了处理结果",
    done: "AI 处理完成",
    noEngine: "请先配置 AI 引擎",
    loadingEngine: "正在读取 AI 模型"
  } : {
    title: "AI segmentation & source repair",
    engine: "AI engine",
    processingEngine: "AI processing model",
    configure: "Configure AI engine",
    combinedTip: "Controlled by the single “AI segmentation & source repair” switch in the caption menu; both operations always run together.",

    aiCache: "AI subtitle processing cache",
    aiCacheTip: "Clear only AI segmentation and source-repair results.",
    subtitleCache: "Subtitle translation cache",
    subtitleCacheTip: "Clear only bilingual subtitle translation results.",
    clearing: "Clearing cache",
    cleared: "Cache cleared",
    disabled: "AI processing off",
    waiting: "Waiting for subtitles",
    processing: "Processing with AI",
    boundary: "Reconciling segment boundaries",
    appliedChanged: "AI processed and applied",
    appliedUnchanged: "AI processed and applied, but the model made no subtitle changes",
    overwritten: "AI produced a result, but the subtitle source overwrote it",
    done: "AI processing complete",
    noEngine: "Configure an AI engine first",
    loadingEngine: "Loading AI models"
  };

  const request = (type, payload = {}) => new Promise((resolve, reject) => {
    const requestId = crypto.randomUUID();
    const timeout = window.setTimeout(() => {
      pending.delete(requestId);
      reject(new Error(zh ? "AI 字幕请求超时" : "AI subtitle request timed out"));
    }, type.endsWith(":process") ? 100000 : 10000);
    pending.set(requestId, { resolve, reject, timeout });
    window.postMessage({ eventName: REQUEST_EVENT, requestId, type, payload }, "*");
  });

  window.addEventListener("message", event => {
    if (event.source !== window || event.data?.eventName !== RESPONSE_EVENT) return;
    const item = pending.get(event.data.requestId);
    if (!item) return;
    pending.delete(event.data.requestId);
    window.clearTimeout(item.timeout);
    if (event.data.response?.ok) item.resolve(event.data.response.data);
    else item.reject(new Error(event.data.response?.error || "AI subtitle request failed"));
  });

  const enabled = () => state.provider?.forceAITranslation === true;
  const signature = lines => (lines || []).map(line => `${line.start}:${line.end}:${line.text || ""}`).join("\u241e");
  const cloneLines = lines => lines.map(line => ({ ...line, tokens: Array.isArray(line.tokens) ? [...line.tokens] : [] }));

  const setStatus = (message, error = false, phase = "") => {
    state.status = message;
    state.statusError = error;
    if (phase) document.documentElement.setAttribute("data-lexihalo-subtitle-ai", phase);
    document.querySelectorAll(`#${UI_ID} .lexihalo-subtitle-ai-status, .lexihalo-caption-ai-status`).forEach(element => {
      element.textContent = message;
      element.classList.toggle("error", error);
    });
  };

  window.lexihaloBeforeEnableSubtitleAI = () => {
    if (state.engines.length) return true;
    if (!state.configLoaded) {
      setStatus(`${text.loadingEngine}…`);
      loadConfig().then(() => {
        if (state.configLoaded && !state.engines.length) window.lexihaloBeforeEnableSubtitleAI();
      });
      return false;
    }
    setStatus(text.noEngine, true, "blocked-no-engine");
    renderCaptionEngineSelector();
    if (!state.configOpening) {
      state.configOpening = true;
      request("lexihalo:subtitle-ai:open-config")
        .catch(error => setStatus(error?.message || String(error), true))
        .finally(() => { state.configOpening = false; });
    }
    return false;
  };

  const currentCacheKey = provider => {
    const cache = provider.captionCache?.get(provider.id);
    if (!cache) return null;
    if (provider.endableWhisper) return { cache, key: "whisperLines" };
    if (Array.isArray(cache.builtinLines)) return { cache, key: "builtinLines" };
    return { cache, key: "lines" };
  };

  const replaceProviderLines = lines => {
    const provider = state.provider;
    if (!provider || String(provider.id || "") !== state.videoId) return false;
    const target = currentCacheKey(provider);
    if (!target) return false;
    provider.captionCache.set(provider.id, { ...target.cache, [target.key]: lines });
    provider.translatingIdx = [];
    provider.tokenizeAttempted?.clear?.();
    provider.event?.emit?.("changed", { current: provider.current, forceUpdate: true });
    return true;
  };

  const restoreRaw = () => {
    if (!state.rawLines?.length || !state.provider || String(state.provider.id || "") !== state.videoId) return;
    const restored = cloneLines(state.rawLines);
    state.processedSignature = "";
    state.observedSignature = signature(restored);
    replaceProviderLines(restored);
  };

  const resetForVideo = videoId => {
    window.clearTimeout(state.timer);
    state.timer = 0;
    state.videoId = videoId;
    state.rawLines = null;
    state.rawSignature = "";
    state.processedSignature = "";
    state.observedSignature = "";
    state.processing = false;
    state.requestGeneration += 1;
  };

  const buildLines = (rawLines, segments) => {
    const output = segments.map((segment, index) => {
      const source = segment.source_ids.map(id => rawLines[id]).filter(Boolean);
      if (!source.length) throw new Error("AI returned an invalid source range");
      const first = source[0];
      const last = source[source.length - 1];
      const line = { ...first };
      delete line.translation;
      delete line.AITranslation;
      delete line.translateEngine;
      delete line.message;
      delete line.sameLangTo;
      line.idx = index;
      line.start = first.start;
      line.end = last.end;
      line.text = segment.text;
      line.tokens = [];
      line.vid = first.vid || state.videoId;
      return {
        line,
        firstId: segment.source_ids[0],
        lastId: segment.source_ids[segment.source_ids.length - 1]
      };
    });

    // When AI splits one long source cue, adjacent output segments share the
    // same source ID. Allocate that source time proportionally so the repaired
    // subtitles remain sequential instead of rendering simultaneously.
    for (let start = 0; start < output.length;) {
      let end = start + 1;
      let maxSourceId = output[start].lastId;
      while (end < output.length && output[end].firstId <= maxSourceId) {
        maxSourceId = Math.max(maxSourceId, output[end].lastId);
        end += 1;
      }
      if (end - start > 1) {
        const rangeStart = rawLines[output[start].firstId].start;
        const rangeEnd = rawLines[maxSourceId].end;
        const duration = Math.max(1, rangeEnd - rangeStart);
        const weights = output.slice(start, end).map(item => Math.max(1, Array.from(item.line.text).length));
        const totalWeight = weights.reduce((sum, value) => sum + value, 0);
        let cursor = rangeStart;
        for (let index = start; index < end; index += 1) {
          const isLast = index === end - 1;
          const share = duration * weights[index - start] / totalWeight;
          output[index].line.start = cursor;
          output[index].line.end = isLast ? rangeEnd : cursor + share;
          cursor = output[index].line.end;
        }
      }
      start = end;
    }

    return output.map((item, index) => {
      item.line.sid = `${state.videoId}:${item.line.start}:${item.line.end}:ai-${index}`;
      return item.line;
    });
  };

  const buildProgressiveLines = (rawLines, chunkResults) => {
    const output = [];
    for (let offset = 0; offset < rawLines.length; offset += CHUNK_SIZE) {
      const segments = chunkResults.get(offset);
      if (segments) output.push(...buildLines(rawLines, segments));
      else output.push(...cloneLines(rawLines.slice(offset, offset + CHUNK_SIZE)));
    }
    return output.map((line, index) => ({
      ...line,
      idx: index,
      sid: `${state.videoId}:${line.start}:${line.end}:ai-${index}`
    }));
  };

  const chunkOrderForCurrentTime = (rawLines, current) => {
    const offsets = [];
    for (let offset = 0; offset < rawLines.length; offset += CHUNK_SIZE) offsets.push(offset);
    let activeIndex = rawLines.findIndex(line => current >= line.start && current <= line.end);
    if (activeIndex < 0) {
      activeIndex = rawLines.findIndex(line => line.start > current);
      if (activeIndex < 0) activeIndex = Math.max(0, rawLines.length - 1);
    }
    const activeOffset = Math.floor(activeIndex / CHUNK_SIZE) * CHUNK_SIZE;
    return offsets.sort((a, b) => Math.abs(a - activeOffset) - Math.abs(b - activeOffset) || a - b);
  };

  const processCurrent = async (rawLines, rawSig) => {
    if (state.processing || !enabled()) return;
    if (!state.config.engineId && !state.engines.length) {
      setStatus(text.noEngine, true, "blocked-no-engine");
      return;
    }

    const provider = state.provider;
    const videoId = state.videoId;
    const generation = ++state.requestGeneration;
    const chunkResults = new Map();
    const offsets = chunkOrderForCurrentTime(rawLines, provider.current || 0);
    let completed = 0;
    let lastAppliedLines = null;
    state.processing = true;
    setStatus(`${text.processing}… 0/${rawLines.length}`, false, "processing");

    const requestRange = async (start, end) => {
      const lines = rawLines.slice(start, end).map((line, index) => ({
        id: start + index,
        text: line.text || ""
      }));
      const beforeStart = Math.max(0, start - CONTEXT_BEFORE);
      const contextBefore = rawLines.slice(beforeStart, start).map((line, index) => ({
        id: beforeStart + index,
        text: line.text || ""
      }));
      const contextAfter = rawLines.slice(end, end + CONTEXT_AFTER).map((line, index) => ({
        id: end + index,
        text: line.text || ""
      }));
      const result = await request("lexihalo:subtitle-ai:process", {
        engineId: state.config.engineId,
        language: provider.from || document.documentElement.lang || "auto",
        options: { segmentation: true, repair: true },
        lines,
        contextBefore,
        contextAfter
      });
      if (!Array.isArray(result?.segments)) throw new Error("AI did not return subtitle segments");
      return { segments: result.segments, count: lines.length };
    };

    try {
      for (const offset of offsets) {
        if (generation !== state.requestGeneration || provider !== state.provider || videoId !== state.videoId) return;
        const result = await requestRange(offset, Math.min(rawLines.length, offset + CHUNK_SIZE));
        chunkResults.set(offset, result.segments);
        completed += result.count;

        if (generation !== state.requestGeneration || provider !== state.provider || videoId !== state.videoId) return;
        const currentSig = signature(provider.lines || []);
        if (currentSig !== rawSig && currentSig !== state.processedSignature) {
          state.observedSignature = "";
          inspectProvider();
          return;
        }
        const processed = buildProgressiveLines(rawLines, chunkResults);
        state.processedSignature = signature(processed);
        state.observedSignature = state.processedSignature;
        if (!replaceProviderLines(processed)) throw new Error("Subtitle source changed before AI processing completed");
        lastAppliedLines = processed;
        setStatus(`${text.processing}… ${completed}/${rawLines.length}`, false, "applying");
      }

      // Re-run a small target window around every chunk edge. Unlike the
      // read-only lookahead context, these windows own lines on both sides of
      // the edge, so AI may merge or split across the boundary safely.
      let reconciled = Array.from(chunkResults.entries())
        .sort((a, b) => a[0] - b[0])
        .flatMap(([, segments]) => segments);
      const boundaries = [];
      for (let boundary = CHUNK_SIZE; boundary < rawLines.length; boundary += CHUNK_SIZE) boundaries.push(boundary);
      for (let boundaryIndex = 0; boundaryIndex < boundaries.length; boundaryIndex += 1) {
        if (generation !== state.requestGeneration || provider !== state.provider || videoId !== state.videoId) return;
        const boundary = boundaries[boundaryIndex];
        let start = Math.max(0, boundary - 6);
        let end = Math.min(rawLines.length, boundary + 8);
        let expanded = true;
        while (expanded) {
          expanded = false;
          for (const segment of reconciled) {
            const first = segment.source_ids[0];
            const last = segment.source_ids[segment.source_ids.length - 1];
            if (last < start || first >= end) continue;
            const nextStart = Math.min(start, first);
            const nextEnd = Math.max(end, last + 1);
            if (nextStart !== start || nextEnd !== end) {
              start = nextStart;
              end = nextEnd;
              expanded = true;
            }
          }
        }
        if (end - start > 64) throw new Error("字幕边界上下文过长，请缩短单条字幕后重试");
        const result = await requestRange(start, end);
        reconciled = reconciled.filter(segment => {
          const first = segment.source_ids[0];
          const last = segment.source_ids[segment.source_ids.length - 1];
          return last < start || first >= end;
        });
        reconciled.push(...result.segments);
        reconciled.sort((a, b) => a.source_ids[0] - b.source_ids[0]);

        const processed = buildLines(rawLines, reconciled);
        state.processedSignature = signature(processed);
        state.observedSignature = state.processedSignature;
        if (!replaceProviderLines(processed)) throw new Error("Subtitle source changed during boundary processing");
        lastAppliedLines = processed;
        setStatus(`${text.boundary}… ${boundaryIndex + 1}/${boundaries.length}`, false, "boundary");
      }

      if (!lastAppliedLines) throw new Error("AI completed without an applicable subtitle result");
      const expectedSignature = signature(lastAppliedLines);
      await new Promise(resolve => window.setTimeout(resolve, 450));
      if (generation !== state.requestGeneration || provider !== state.provider || videoId !== state.videoId) return;
      const actualSignature = signature(provider.lines || []);
      if (actualSignature !== expectedSignature) {
        setStatus(text.overwritten, true, "overwritten");
        console.warn("[LexiHalo subtitle AI] processed result was overwritten by the subtitle source", { videoId });
        return;
      }
      const rawText = rawLines.map(line => String(line.text || "").replace(/\s+/g, " ").trim()).join("\n");
      const appliedText = lastAppliedLines.map(line => String(line.text || "").replace(/\s+/g, " ").trim()).join("\n");
      const changed = rawText !== appliedText || rawLines.length !== lastAppliedLines.length;
      const summary = changed
        ? `${text.appliedChanged}：${rawLines.length} → ${lastAppliedLines.length}`
        : text.appliedUnchanged;
      setStatus(summary, false, changed ? "applied-changed" : "applied-unchanged");
      console.info("[LexiHalo subtitle AI] processing applied", {
        videoId,
        inputLines: rawLines.length,
        outputLines: lastAppliedLines.length,
        textChanged: rawText !== appliedText
      });
    } catch (error) {
      if (generation === state.requestGeneration) setStatus(error?.message || String(error), true, "error");
    } finally {
      if (generation === state.requestGeneration) state.processing = false;
    }
  };

  const inspectProvider = () => {
    const provider = state.provider;
    if (!provider) return;
    const videoId = String(provider.id || "");
    if (!videoId) return;
    if (videoId !== state.videoId) resetForVideo(videoId);

    if (!enabled()) {
      if (state.processedSignature) restoreRaw();
      setStatus(text.disabled, false, "off");
      return;
    }
    if (!state.config.engineId && !state.engines.length) {
      setStatus(text.noEngine, true, "blocked-no-engine");
      return;
    }

    const lines = provider.lines || [];
    if (!lines.length) {
      setStatus(text.waiting, false, "waiting");
      return;
    }
    const currentSig = signature(lines);
    if (currentSig === state.processedSignature || currentSig === state.observedSignature) return;

    state.rawLines = cloneLines(lines);
    state.rawSignature = currentSig;
    state.observedSignature = currentSig;
    window.clearTimeout(state.timer);
    state.timer = window.setTimeout(() => {
      state.timer = 0;
      processCurrent(cloneLines(state.rawLines), state.rawSignature);
    }, 1400);
  };

  const bindProvider = provider => {
    if (!provider || provider === state.provider) return;
    if (state.provider && state.providerListener) {
      state.provider.event?.off?.("changed", state.providerListener);
      state.provider.event?.off?.("video.change", state.providerListener);
    }
    state.provider = provider;
    resetForVideo(String(provider.id || ""));
    state.providerListener = inspectProvider;
    provider.event?.on?.("changed", state.providerListener);
    provider.event?.on?.("video.change", state.providerListener);
    inspectProvider();
  };

  const clearCaches = async (scope, skipBackground = false) => {
    const provider = state.provider;
    state.requestGeneration += 1;
    state.processing = false;
    window.clearTimeout(state.timer);
    state.timer = 0;
    setStatus(`${text.clearing}…`);
    try {
      if (!skipBackground) await request("lexihalo:subtitle-ai:clear-cache", { scope });
      if (provider) {
        provider.captionCache?.clear?.();
        provider.domTransCache?.clear?.();
        provider.domTokensCache?.clear?.();
        provider.tokenizeAttempted?.clear?.();
        provider.translatingIdx = [];
        state.rawLines = null;
        state.rawSignature = "";
        state.processedSignature = "";
        state.observedSignature = "";
        await provider.load?.();
        provider.event?.emit?.("changed", { current: provider.current, forceUpdate: true });
      }
      setStatus(text.cleared);
      window.setTimeout(() => {
        if (state.status === text.cleared) inspectProvider();
      }, 700);
    } catch (error) {
      setStatus(error?.message || String(error), true);
    }
  };

  const saveConfig = async patch => {
    const wasEnabled = enabled();
    if (state.processing) state.requestGeneration += 1;
    state.processing = false;
    window.clearTimeout(state.timer);
    state.timer = 0;
    if (state.processedSignature) restoreRaw();
    state.config = { ...state.config, ...patch };
    try {
      const result = await request("lexihalo:subtitle-ai:save-config", { settings: state.config });
      state.config = { ...state.config, ...result.settings };
    } catch (error) {
      setStatus(error?.message || String(error), true);
    }
    renderUI();
    renderCaptionEngineSelector();
    state.observedSignature = "";
    if (enabled()) inspectProvider();
    else if (wasEnabled) setStatus(text.disabled);
  };

  const createSwitch = (checked, onClick) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `lexihalo-subtitle-ai-switch${checked ? " checked" : ""}`;
    button.setAttribute("role", "switch");
    button.setAttribute("aria-checked", String(checked));
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      onClick();
    });
    button.append(document.createElement("span"));
    return button;
  };

  const createToggleRow = (label, tip, checked, onClick) => {
    const row = document.createElement("div");
    row.className = "item-table lexihalo-subtitle-ai-row";
    row.title = tip;
    const left = document.createElement("div");
    left.className = "left";
    const labels = document.createElement("div");
    labels.className = "lexihalo-subtitle-ai-labels";
    const name = document.createElement("div");
    name.className = "table-name";
    name.textContent = label;
    const description = document.createElement("small");
    description.textContent = tip;
    labels.append(name, description);
    left.append(labels);
    const action = document.createElement("div");
    action.className = "right-action";
    action.append(createSwitch(checked, onClick));
    row.append(left, action);
    return row;
  };

  const renderCaptionEngineSelector = () => {
    const host = document.getElementById("lexihalo-caption-ai-engine-host");
    if (!host) return;
    host.replaceChildren();

    const row = document.createElement("div");
    row.className = "trancy-menuitem lexihalo-caption-ai-engine-row";
    const label = document.createElement("div");
    label.className = "trancy-menuitem-label";
    label.textContent = text.processingEngine;
    const action = document.createElement("div");
    action.className = "trancy-menuitem-action";

    if (state.engines.length) {
      const select = document.createElement("select");
      select.className = "lexihalo-caption-ai-engine-select";
      for (const engine of state.engines) {
        const option = document.createElement("option");
        option.value = engine._id;
        option.textContent = `${engine.name || engine.model} · ${engine.model}`;
        select.append(option);
      }
      select.value = state.config.engineId || state.engines[0]._id;
      select.addEventListener("click", event => event.stopPropagation());
      select.addEventListener("change", event => {
        event.stopPropagation();
        saveConfig({ engineId: select.value });
      });
      action.append(select);
    } else {
      const configure = document.createElement("button");
      configure.type = "button";
      configure.className = "lexihalo-caption-ai-engine-configure";
      configure.textContent = text.configure;
      configure.addEventListener("click", event => {
        event.stopPropagation();
        request("lexihalo:subtitle-ai:open-config").catch(error => setStatus(error.message, true));
      });
      action.append(configure);
    }
    const status = document.createElement("div");
    status.className = `lexihalo-caption-ai-status${state.statusError ? " error" : ""}`;
    status.textContent = state.status || (enabled() ? text.waiting : text.disabled);
    row.append(label, action);
    host.append(row, status);
  };

  const renderUI = () => {
    const host = document.querySelector(".trancy-setting-pannel .page-setting-wrapper .section-cards.no-border");
    if (!host) return;
    document.getElementById(UI_ID)?.remove();

    const wrapper = document.createElement("div");
    wrapper.id = UI_ID;
    wrapper.addEventListener("click", event => event.stopPropagation());

    const heading = document.createElement("div");
    heading.className = "lexihalo-subtitle-ai-heading";
    const title = document.createElement("strong");
    title.textContent = text.title;
    const status = document.createElement("span");
    status.className = `lexihalo-subtitle-ai-status${state.statusError ? " error" : ""}`;
    status.textContent = state.status || (enabled() ? text.waiting : text.disabled);
    heading.append(title, status);

    const engineRow = document.createElement("div");
    engineRow.className = "item-table lexihalo-subtitle-ai-row";
    const engineLabel = document.createElement("div");
    engineLabel.className = "left";
    const engineName = document.createElement("div");
    engineName.className = "table-name";
    engineName.textContent = text.engine;
    engineLabel.append(engineName);
    const engineAction = document.createElement("div");
    engineAction.className = "right-action";
    if (state.engines.length) {
      const select = document.createElement("select");
      select.className = "lexihalo-subtitle-ai-engine";
      for (const engine of state.engines) {
        const option = document.createElement("option");
        option.value = engine._id;
        option.textContent = `${engine.name || engine.model} · ${engine.model}`;
        select.append(option);
      }
      select.value = state.config.engineId || state.engines[0]._id;
      select.addEventListener("change", () => saveConfig({ engineId: select.value }));
      engineAction.append(select);
    } else {
      const configure = document.createElement("button");
      configure.type = "button";
      configure.className = "lexihalo-subtitle-ai-configure";
      configure.textContent = text.configure;
      configure.addEventListener("click", () => request("lexihalo:subtitle-ai:open-config").catch(error => setStatus(error.message, true)));
      engineAction.append(configure);
    }
    engineRow.append(engineLabel, engineAction);

    const createCacheRow = (label, tip, scope) => {
      const row = document.createElement("div");
      row.className = "item-table lexihalo-subtitle-ai-row";
      row.title = tip;
      const left = document.createElement("div");
      left.className = "left";
      const name = document.createElement("div");
      name.className = "table-name";
      name.textContent = label;
      left.append(name);
      const action = document.createElement("div");
      action.className = "right-action";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "lexihalo-subtitle-ai-clear";
      button.textContent = zh ? "清理" : "Clear";
      button.disabled = state.processing;
      button.addEventListener("click", () => clearCaches(scope));
      action.append(button);
      row.append(left, action);
      return row;
    };

    wrapper.append(
      heading,
      engineRow,
      (() => {
        const note = document.createElement("div");
        note.className = "lexihalo-subtitle-ai-note";
        note.textContent = text.combinedTip;
        return note;
      })(),
      createCacheRow(text.aiCache, text.aiCacheTip, "ai-subtitle"),
      createCacheRow(text.subtitleCache, text.subtitleCacheTip, "subtitle")
    );
    host.append(wrapper);
  };

  const loadConfig = async () => {
    try {
      const config = await request("lexihalo:subtitle-ai:get-config");
      state.config = { ...state.config, ...(config?.settings || {}) };
      state.engines = Array.isArray(config?.engines) ? config.engines : [];
      state.configLoaded = true;
      if (!state.config.engineId && state.engines.length) state.config.engineId = state.engines[0]._id;
      setStatus(enabled() ? text.waiting : text.disabled);
      renderUI();
      renderCaptionEngineSelector();
      inspectProvider();
    } catch (error) {
      setStatus(error?.message || String(error), true);
    }
  };

  window.addEventListener("message", event => {
    if (event.source !== window) return;
    if (event.data?.eventName === "lexihalo:subtitle-ai-clear-local") {
      clearCaches(event.data.scope || "subtitle", true);
      return;
    }
    if (event.data?.eventName === "lexihalo:subtitle-ai-config-changed") {
      if (state.processing) state.requestGeneration += 1;
      state.processing = false;
      window.clearTimeout(state.timer);
      state.timer = 0;
      if (state.processedSignature) restoreRaw();
      state.config = { ...state.config, ...(event.data.settings || {}) };
      state.observedSignature = "";
      renderUI();
      renderCaptionEngineSelector();
      inspectProvider();
    }
  });

  const observer = new MutationObserver(() => {
    if (document.querySelector(".trancy-setting-pannel") && !document.getElementById(UI_ID)) renderUI();
    const engineHost = document.getElementById("lexihalo-caption-ai-engine-host");
    if (engineHost && !engineHost.firstElementChild) renderCaptionEngineSelector();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.setInterval(() => {
    if (window.captionProvider) {
      bindProvider(window.captionProvider);
      inspectProvider();
    }
  }, 500);
  window.addEventListener("focus", () => {
    if (!state.engines.length) loadConfig();
  });
  loadConfig();
})();
