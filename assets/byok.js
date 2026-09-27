(() => {
  "use strict";

  const STORAGE_KEY = "trancy_byok_engines";
  const requestedProvider = new URLSearchParams(location.search).get("provider");
  const presets = {
    OpenAI: {
      runtimeProvider: "OpenAI",
      name: "OpenAI",
      model: "gpt-4o-mini",
      endpoint: "https://api.openai.com/v1/chat/completions"
    },
    OpenRouter: {
      runtimeProvider: "OpenAI",
      name: "OpenRouter",
      model: "openai/gpt-4o-mini",
      endpoint: "https://openrouter.ai/api/v1/chat/completions"
    },
    DeepSeek: {
      runtimeProvider: "DeepSeek",
      name: "DeepSeek",
      model: "deepseek-chat",
      endpoint: "https://api.deepseek.com/chat/completions"
    },
    Google: {
      runtimeProvider: "Google",
      name: "Gemini",
      model: "gemini-2.0-flash",
      endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    },
    Anthropic: {
      runtimeProvider: "Anthropic",
      name: "Claude",
      model: "claude-3-5-haiku-latest",
      endpoint: "https://api.anthropic.com/v1/messages"
    },
    Microsoft: {
      runtimeProvider: "MicrosoftTranslator",
      name: "Microsoft Translator (Azure)",
      model: "microsoft-translate",
      endpoint: "https://api.cognitive.microsofttranslator.com/translate",
      supportsRegion: true
    },
    DeepL: {
      runtimeProvider: "DeepL",
      name: "DeepL API",
      model: "deepl-translate",
      endpoint: "https://api-free.deepl.com/v2/translate"
    },
    Custom: {
      runtimeProvider: "OpenAI",
      name: "Custom AI",
      model: "",
      endpoint: ""
    }
  };

  const $ = id => document.getElementById(id);
  const form = $("engine-form");
  const provider = $("provider");
  const nameInput = $("name");
  const modelInput = $("model");
  const endpointInput = $("endpoint");
  const keyInput = $("key");
  const regionInput = $("region");
  const regionLabel = $("region-label");
  const idInput = $("engine-id");
  const list = $("engine-list");
  const empty = $("empty");
  const status = $("status");
  const cancelEdit = $("cancel-edit");
  let engines = [];

  const getStored = async () => {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY] : [];
  };

  const persist = async () => {
    await chrome.storage.local.set({ [STORAGE_KEY]: engines });
    status.textContent = "已保存，重新打开翻译引擎列表即可选择";
    window.setTimeout(() => { status.textContent = ""; }, 3000);
  };

  const maskKey = value => {
    if (!value) return "未设置";
    if (value.length <= 8) return "••••••••";
    return `${value.slice(0, 4)}••••••••${value.slice(-4)}`;
  };

  const resetForm = () => {
    form.reset();
    idInput.value = "";
    $("form-title").textContent = "添加翻译引擎";
    cancelEdit.hidden = true;
    applyPreset(true);
  };

  const applyPreset = force => {
    const preset = presets[provider.value];
    if (!preset) return;
    if (force || !nameInput.value) nameInput.value = preset.name;
    if (force || !modelInput.value) modelInput.value = preset.model;
    if (force || !endpointInput.value) endpointInput.value = preset.endpoint;
    regionLabel.hidden = !preset.supportsRegion;
    if (!preset.supportsRegion) regionInput.value = "";
  };

  const createButton = (text, className, handler) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    if (className) button.className = className;
    button.addEventListener("click", handler);
    return button;
  };

  const render = () => {
    list.replaceChildren();
    empty.hidden = engines.length > 0;

    for (const engine of engines) {
      const row = document.createElement("div");
      row.className = "engine";

      const info = document.createElement("div");
      const title = document.createElement("div");
      title.className = "engine-name";
      title.textContent = engine.name;
      const meta = document.createElement("div");
      meta.className = "engine-meta";
      meta.textContent = `${engine.providerLabel || engine.provider} · ${engine.model} · ${maskKey(engine.key)}${engine.region ? ` · ${engine.region}` : ""} · ${engine.endpoint}`;
      info.append(title, meta);

      const actions = document.createElement("div");
      actions.className = "engine-actions";
      actions.append(
        createButton("编辑", "", () => editEngine(engine._id)),
        createButton("删除", "danger", () => removeEngine(engine._id))
      );

      row.append(info, actions);
      list.append(row);
    }
  };

  const editEngine = id => {
    const engine = engines.find(item => item._id === id);
    if (!engine) return;
    idInput.value = engine._id;
    provider.value = engine.providerId || "Custom";
    nameInput.value = engine.name;
    modelInput.value = engine.model;
    endpointInput.value = engine.endpoint;
    keyInput.value = engine.key;
    regionInput.value = engine.region || "";
    regionLabel.hidden = !(presets[provider.value]?.supportsRegion);
    $("form-title").textContent = "编辑翻译引擎";
    cancelEdit.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeEngine = async id => {
    const engine = engines.find(item => item._id === id);
    if (!engine || !window.confirm(`删除“${engine.name}”？`)) return;
    engines = engines.filter(item => item._id !== id);
    await persist();
    render();
    if (idInput.value === id) resetForm();
  };

  provider.addEventListener("change", () => applyPreset(true));
  cancelEdit.addEventListener("click", resetForm);

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const preset = presets[provider.value];
    const id = idInput.value || `byok-${crypto.randomUUID()}`;
    const engine = {
      _id: id,
      name: nameInput.value.trim(),
      provider: preset.runtimeProvider,
      providerId: provider.value,
      providerLabel: preset.name,
      model: modelInput.value.trim(),
      endpoint: endpointInput.value.trim(),
      key: keyInput.value.trim(),
      region: regionInput.value.trim(),
      type: "user",
      role: 2,
      enabled: true,
      available: true,
      icon: preset.runtimeProvider
    };

    const index = engines.findIndex(item => item._id === id);
    if (index >= 0) engines[index] = engine;
    else engines.push(engine);

    await persist();
    render();
    resetForm();
  });

  getStored().then(stored => {
    engines = stored;
    render();
    resetForm();
    if (requestedProvider && presets[requestedProvider]) {
      provider.value = requestedProvider;
      applyPreset(true);
    }
  }).catch(error => {
    status.textContent = `读取配置失败：${error.message || error}`;
  });
})();
