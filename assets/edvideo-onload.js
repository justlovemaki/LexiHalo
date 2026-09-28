(() => {
  "use strict";

  const forwardHotkey = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const detail = {
      type: event.type,
      key: event.key,
      code: event.code,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      isComposing: event.isComposing,
      repeat: event.repeat,
    };
    window.postMessage(
      {
        to: "background",
        from: "content",
        detail,
        eventName: "hotkey",
      },
      "*",
    );
  };

  window.addEventListener("message", async (event) => {
    if (event.source !== window || !event.data) return;
    const { eventName, ...message } = event.data;
    switch (eventName) {
      case "lexihalo:subtitle-ai-request": {
        const { requestId, type, payload } = message;
        if (!requestId || typeof type !== "string" || !type.startsWith("lexihalo:subtitle-ai:"))
          break;
        let port;
        let settled = false;
        const reply = (response) => {
          if (settled) return;
          settled = true;
          try {
            port?.disconnect();
          } catch {}
          window.postMessage(
            {
              eventName: "lexihalo:subtitle-ai-response",
              requestId,
              response,
            },
            "*",
          );
        };
        try {
          port = chrome.runtime.connect({ name: "lexihalo-subtitle-ai" });
          port.onMessage.addListener((result) => {
            if (result?.requestId === requestId) reply(result.response);
          });
          port.onDisconnect.addListener(() => {
            if (!settled)
              reply({
                ok: false,
                error: chrome.runtime.lastError?.message || "AI subtitle connection closed",
              });
          });
          port.postMessage({ requestId, type, ...(payload || {}) });
        } catch (error) {
          reply({ ok: false, error: error?.message || String(error) });
        }
        break;
      }
      case "message:background":
        try {
          if (!chrome.runtime?.id) break;
          const pending = chrome.runtime.sendMessage(chrome.runtime.id, message);
          pending?.catch?.(() => {});
        } catch {}
        break;
      case "hotkeys-uninstall":
        window.removeEventListener("keydown", forwardHotkey, true);
        document.removeEventListener("keydown", forwardHotkey, true);
        break;
      case "hotkeys-install":
        window.addEventListener("keydown", forwardHotkey, true);
        document.addEventListener("keydown", forwardHotkey, true);
        break;
    }
  });

  chrome.runtime.onMessage.addListener((message) => {
    const { to, from, response } = message;
    if (
      (Array.isArray(to) && to.includes("content")) ||
      to === "content" ||
      (from === "content" && response)
    ) {
      window.postMessage({ ...message, eventName: "message:content" }, "*");
    }
    return true;
  });

  document.documentElement?.setAttribute("data-lexihalo-video-bridge-runtime", "readable");
})();
