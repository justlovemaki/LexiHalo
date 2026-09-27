(() => {
  "use strict";

  const request = (type, payload = {}) => new Promise((resolve, reject) => {
    let port;
    let settled = false;
    const requestId = crypto.randomUUID();
    const timeout = window.setTimeout(() => finish(null, new Error("Cache request timed out")), 15000);
    const finish = (response, error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      try { port?.disconnect(); } catch {}
      if (error) reject(error);
      else if (response?.ok) resolve(response.data);
      else reject(new Error(response?.error || "Cache request failed"));
    };
    try {
      port = chrome.runtime.connect({ name: "lexihalo-subtitle-ai" });
      port.onMessage.addListener(message => {
        if (message?.requestId === requestId) finish(message.response);
      });
      port.onDisconnect.addListener(() => {
        if (!settled) finish(null, new Error(chrome.runtime.lastError?.message || "Cache service disconnected"));
      });
      port.postMessage({ requestId, type, ...payload });
    } catch (error) {
      finish(null, error);
    }
  });

  const clearCache = async (button, scope) => {
    const originalText = button.textContent;
    button.style.pointerEvents = "none";
    button.textContent = "清理中…";
    try {
      await request("lexihalo:subtitle-ai:clear-cache", { scope });
      if (scope === "subtitle" || scope === "ai-subtitle") {
        try {
          window.dispatchEvent(new CustomEvent("edvideo:caption.reload", { detail: { body: { status: "on" } } }));
        } catch {}
      }
      button.textContent = "已清理";
      window.setTimeout(() => {
        button.textContent = originalText;
        button.style.pointerEvents = "";
      }, 1600);
    } catch (error) {
      button.textContent = "失败";
      button.title = error?.message || String(error);
      window.setTimeout(() => {
        button.textContent = originalText;
        button.style.pointerEvents = "";
      }, 2400);
    }
  };

  window.addEventListener("message", event => {
    if (event.source !== window || event.data?.eventName !== "lexihalo:cache-clear-request") return;
    const scope = event.data.scope;
    if (!["ai-subtitle", "subtitle", "immersive", "selection", "quick"].includes(scope)) return;
    const button = document.querySelector(`[data-lexihalo-cache-scope="${scope}"] span`) ||
      document.querySelector(`[data-lexihalo-cache-scope="${scope}"]`);
    if (button) clearCache(button, scope);
  });
})();
