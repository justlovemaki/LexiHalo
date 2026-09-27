(() => {
  "use strict";

  const ROOT_ID = "lexihalo-subtitle-ai-sidebar";
  const HOST_ID = "lexihalo-subtitle-ai-sidebar-host";
  const state = {
    config: { segmentation: false, repair: false, engineId: "" },
    engines: [],
    loading: false,
    loaded: false,
    status: "",
    error: false
  };
  const zh = /^zh\b/i.test(navigator.language || "");
  const labels = zh ? {
    title: "AI 分段与原字幕修复",
    engine: "处理引擎",
    configure: "配置 AI 引擎",
    combinedTip: "由播放器字幕菜单中的同名开关统一控制；开启后 AI 分段和原字幕修复会同时执行。",

    cacheTitle: "缓存管理",
    aiCache: "AI 字幕处理缓存",
    aiCacheTip: "仅清除 AI 分段与原字幕修复结果；当前字幕会重新处理。",
    subtitleCache: "字幕翻译缓存",
    subtitleCacheTip: "仅清除双语字幕翻译结果；当前字幕会重新翻译。",
    immersiveCache: "沉浸式翻译缓存",
    immersiveCacheTip: "仅清除网页沉浸式翻译缓存，刷新页面后重新翻译。",
    selectionCache: "划词翻译缓存",
    selectionCacheTip: "仅清除划词、句子和词典回退翻译缓存。",
    quickCache: "快速翻译缓存",
    quickCacheTip: "仅清除快速翻译窗口使用的缓存。",
    clear: "清理",
    clearing: "清理中…",
    cleared: "已清理",
    saved: "设置已保存"
  } : {
    title: "AI segmentation & source repair",
    engine: "AI engine",
    configure: "Configure AI engine",
    combinedTip: "Controlled by the matching switch in the player caption menu; AI segmentation and source repair always run together.",

    cacheTitle: "Cache management",
    aiCache: "AI subtitle processing cache",
    aiCacheTip: "Clear only AI segmentation and source-repair results; current captions will be processed again.",
    subtitleCache: "Subtitle translation cache",
    subtitleCacheTip: "Clear only bilingual subtitle translations; current captions will be translated again.",
    immersiveCache: "Immersive translation cache",
    immersiveCacheTip: "Clear only immersive page translation cache; refresh to translate again.",
    selectionCache: "Selection translation cache",
    selectionCacheTip: "Clear only selection, sentence, and dictionary fallback translations.",
    quickCache: "Quick translation cache",
    quickCacheTip: "Clear only translations used by the quick translator.",
    clear: "Clear",
    clearing: "Clearing…",
    cleared: "Cleared",
    saved: "Settings saved"
  };

  const request = (type, payload = {}) => new Promise((resolve, reject) => {
    let port;
    let settled = false;
    const requestId = crypto.randomUUID();
    const timeout = window.setTimeout(() => finish(null, new Error("AI subtitle request timed out")), 15000);
    const finish = (response, error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      try { port?.disconnect(); } catch {}
      if (error) reject(error);
      else if (response?.ok) resolve(response.data);
      else reject(new Error(response?.error || "AI subtitle request failed"));
    };
    try {
      port = chrome.runtime.connect({ name: "lexihalo-subtitle-ai" });
      port.onMessage.addListener(message => {
        if (message?.requestId === requestId) finish(message.response);
      });
      port.onDisconnect.addListener(() => {
        if (!settled) finish(null, new Error(chrome.runtime.lastError?.message || "AI subtitle connection closed"));
      });
      port.postMessage({ requestId, type, ...payload });
    } catch (error) {
      finish(null, error);
    }
  });

  const setStatus = (message, error = false) => {
    state.status = message;
    state.error = error;
    const status = document.querySelector(`#${ROOT_ID} .lexihalo-subtitle-sidebar-status`);
    if (status) {
      status.textContent = message;
      status.classList.toggle("error", error);
    }
  };

  const item = (name, description, action) => {
    const group = document.createElement("div");
    group.className = "item-slider-group lexihalo-subtitle-sidebar-group";
    const row = document.createElement("div");
    row.className = "item-slider";
    const content = document.createElement("div");
    content.className = "item-slider-content";
    const left = document.createElement("div");
    left.className = "item-left";
    const title = document.createElement("span");
    title.textContent = name;
    left.append(title);
    const right = document.createElement("div");
    right.className = "item-right";
    right.append(action);
    content.append(left, right);
    row.append(content);
    if (description) {
      const detail = document.createElement("div");
      detail.className = "item-slider-des";
      detail.textContent = description;
      row.append(detail);
    }
    group.append(row);
    return group;
  };

  const makeSwitch = (checked, handler) => {
    const wrapper = document.createElement("div");
    wrapper.className = "lexihalo-subtitle-sidebar-switch";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "rd-switch";
    input.checked = checked;
    input.readOnly = true;
    wrapper.append(input);
    wrapper.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      handler();
    });
    return wrapper;
  };

  const notifyRuntime = () => {
    window.postMessage({
      eventName: "lexihalo:subtitle-ai-config-changed",
      settings: state.config
    }, "*");
  };

  const save = async patch => {
    state.config = { ...state.config, ...patch };
    render();
    try {
      const result = await request("lexihalo:subtitle-ai:save-config", { settings: state.config });
      state.config = { ...state.config, ...result.settings };
      notifyRuntime();
      setStatus(labels.saved);
    } catch (error) {
      setStatus(error?.message || String(error), true);
    }
  };

  const clearCache = async (button, scope, reloadSubtitles = false) => {
    const original = button.textContent;
    button.disabled = true;
    button.textContent = labels.clearing;
    try {
      await request("lexihalo:subtitle-ai:clear-cache", { scope });
      if (reloadSubtitles) window.postMessage({ eventName: "lexihalo:subtitle-ai-clear-local", scope }, "*");
      button.textContent = labels.cleared;
      setStatus(`${original}${zh ? "已清理" : " cleared"}`);
      window.setTimeout(() => { button.textContent = original; }, 1800);
    } catch (error) {
      button.textContent = original;
      setStatus(error?.message || String(error), true);
    } finally {
      button.disabled = false;
    }
  };

  const render = () => {
    const host = document.getElementById(HOST_ID);
    if (!host) {
      document.getElementById(ROOT_ID)?.remove();
      return;
    }

    document.getElementById(ROOT_ID)?.remove();
    const root = document.createElement("section");
    root.id = ROOT_ID;

    const heading = document.createElement("div");
    heading.className = "slider-label lg-label lexihalo-subtitle-sidebar-heading";
    const headingText = document.createElement("span");
    headingText.textContent = labels.title;
    const status = document.createElement("small");
    status.className = `lexihalo-subtitle-sidebar-status${state.error ? " error" : ""}`;
    status.textContent = state.status;
    heading.append(headingText, status);
    root.append(heading);

    if (state.engines.length) {
      const select = document.createElement("select");
      select.className = "lexihalo-subtitle-sidebar-engine";
      for (const engine of state.engines) {
        const option = document.createElement("option");
        option.value = engine._id;
        option.textContent = `${engine.name || engine.model} · ${engine.model}`;
        select.append(option);
      }
      select.value = state.config.engineId || state.engines[0]._id;
      select.addEventListener("change", () => save({ engineId: select.value }));
      root.append(item(labels.engine, "", select));
    } else {
      const configure = document.createElement("button");
      configure.type = "button";
      configure.className = "lexihalo-subtitle-sidebar-action";
      configure.textContent = labels.configure;
      configure.addEventListener("click", () => request("lexihalo:subtitle-ai:open-config").catch(error => setStatus(error.message, true)));
      root.append(item(labels.engine, "", configure));
    }

    const note = document.createElement("div");
    note.className = "lexihalo-subtitle-ai-note";
    note.textContent = labels.combinedTip;
    root.append(note);

    host.prepend(root);
  };

  const load = async () => {
    if (state.loading) return;
    state.loading = true;
    try {
      const result = await request("lexihalo:subtitle-ai:get-config");
      state.config = { ...state.config, ...(result?.settings || {}) };
      state.engines = Array.isArray(result?.engines) ? result.engines : [];
      if (!state.config.engineId && state.engines.length) state.config.engineId = state.engines[0]._id;
      state.loaded = true;
      render();
    } catch (error) {
      setStatus(error?.message || String(error), true);
    } finally {
      state.loading = false;
    }
  };

  const inspect = () => {
    const subtitleHost = document.getElementById(HOST_ID);
    if (!subtitleHost) document.getElementById(ROOT_ID)?.remove();
    else {
      if (!document.getElementById(ROOT_ID)) render();
      if (!state.loaded) load();
    }
  };

  window.addEventListener("message", event => {
    if (event.source !== window || event.data?.eventName !== "lexihalo:cache-clear-request") return;
    const scope = event.data.scope;
    if (!["ai-subtitle", "subtitle", "immersive", "selection", "quick"].includes(scope)) return;
    const button = document.querySelector(`[data-lexihalo-cache-scope="${scope}"]`);
    if (button) clearCache(button, scope, scope === "ai-subtitle" || scope === "subtitle");
  });

  const observer = new MutationObserver(inspect);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.setInterval(inspect, 750);
  window.addEventListener("focus", () => {
    if (document.getElementById(HOST_ID)) {
      state.loaded = false;
      load();
    }
  });
  inspect();
})();
