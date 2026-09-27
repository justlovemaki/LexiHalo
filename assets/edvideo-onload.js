(() => {
  "use strict";

  const forwardHotkey = event => {
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
      repeat: event.repeat
    };
    window.postMessage({
      to: "background",
      from: "content",
      detail,
      eventName: "hotkey"
    }, "*");
  };

  window.addEventListener("message", event => {
    if (event.source !== window || !event.data) return;
    const { eventName, ...message } = event.data;
    switch (eventName) {
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

  chrome.runtime.onMessage.addListener(message => {
    const { to, from, response } = message;
    if ((Array.isArray(to) && to.includes("content")) ||
        to === "content" ||
        (from === "content" && response)) {
      window.postMessage({ ...message, eventName: "message:content" }, "*");
    }
    return true;
  });

  const trustedTypes = window.trustedTypes;
  const trustedPolicy = (() => {
    if (!trustedTypes) return { createScriptURL: value => value };
    if (trustedTypes.defaultPolicy) return trustedTypes.defaultPolicy;
    try {
      return trustedTypes.createPolicy("default", {
        createScriptURL: value => value
      });
    } catch {
      return { createScriptURL: value => value };
    }
  })();

  const inject = asset => {
    try {
      const script = document.createElement("script");
      script.src = trustedPolicy.createScriptURL(chrome.runtime.getURL(asset));
      script.type = "module";
      document.documentElement.prepend(script);
    } catch (error) {
      console.error("[LexiHalo] Failed to inject video runtime", error);
    }
  };

  const boot = () => {
    inject("assets/edvideo-main.js");
    inject("assets/romanize-main.js");
    inject("assets/ld-main.js");
  };

  if (document.documentElement) {
    boot();
  } else {
    const observer = new MutationObserver(() => {
      if (!document.documentElement) return;
      observer.disconnect();
      boot();
    });
    observer.observe(document, { childList: true });
  }
})();
