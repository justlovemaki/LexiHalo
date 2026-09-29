const VALID_CACHE_SCOPES = new Set([
  "all",
  "ai-subtitle",
  "subtitle",
  "subtitle-refresh",
  "immersive",
  "selection",
  "quick",
]);

function setCacheButtonsBusy(scope, busyText) {
  const buttons = Array.from(
    document.querySelectorAll(`[data-lexihalo-cache-scope="${scope}"]`),
  );
  const labels = buttons.map(
    (button) => button.querySelector("span") || button,
  );

  buttons.forEach((button) => {
    button.style.pointerEvents = "none";
    button.setAttribute("aria-disabled", "true");
  });
  labels.forEach((label) => {
    label.textContent = busyText;
  });

  return { buttons, labels };
}

function restoreCacheButtons({ buttons, labels }, text, delay) {
  window.setTimeout(() => {
    labels.forEach((label) => {
      label.textContent = text;
    });
    buttons.forEach((button) => {
      button.style.pointerEvents = "";
      button.removeAttribute("aria-disabled");
    });
  }, delay);
}

function requestCacheClear(scope) {
  return new Promise((resolve, reject) => {
    const requestId = crypto.randomUUID();
    let settled = false;
    let port;

    const settle = (error, value) => {
      if (settled) return;
      settled = true;
      try {
        port?.disconnect();
      } catch {}
      error ? reject(error) : resolve(value);
    };

    try {
      port = chrome.runtime.connect({ name: "lexihalo-subtitle-ai" });
      port.onMessage.addListener((message) => {
        if (!message || message.requestId !== requestId) return;
        message.response?.ok
          ? settle(null, message.response.data)
          : settle(new Error(message.response?.error || "清理失败"));
      });
      port.onDisconnect.addListener(() => {
        if (!settled) {
          settle(
            new Error(chrome.runtime.lastError?.message || "缓存服务未连接"),
          );
        }
      });
      port.postMessage({
        requestId,
        type: "lexihalo:subtitle-ai:clear-cache",
        scope,
      });
    } catch (error) {
      settle(error);
    }
  });
}

function reloadCaptions(scope) {
  if (
    scope !== "all" &&
    scope !== "ai-subtitle" &&
    scope !== "subtitle" &&
    scope !== "subtitle-refresh"
  )
    return;
  window.postMessage(
    { eventName: "edvideo:caption.purgeAndReload", scope },
    "*",
  );
  window.dispatchEvent(
    new CustomEvent("edvideo:caption.purgeAndReload", {
      detail: { scope },
    }),
  );
}

export async function clearScopedCache(scope) {
  if (!VALID_CACHE_SCOPES.has(scope)) {
    throw new Error("未知的缓存类型");
  }

  const requestScope = scope === "subtitle" ? "subtitle-refresh" : scope;
  const controls = setCacheButtonsBusy(scope, "清理中…");
  try {
    const result = await requestCacheClear(requestScope);
    controls.labels.forEach((label) => {
      label.textContent = "已清理";
    });
    reloadCaptions(requestScope);
    restoreCacheButtons(controls, "清理", 1600);
    return result;
  } catch (error) {
    controls.labels.forEach((label) => {
      label.textContent = "清理失败";
      label.title = error?.message || String(error);
    });
    restoreCacheButtons(controls, "清理", 2400);
    return null;
  }
}

// Override the legacy cache helper injected by the recovered bundle. The
// settings component calls this global directly for both cache actions.
window.lexihaloClearScopedCache = clearScopedCache;
