(() => {
  "use strict";

  const provider = window.captionProvider;
  if (!provider) return;

  let youtubeNativeCaptionWasEnabled = false;
  let youtubeNativeCaptionSuppressionActive = false;
  let youtubeNativeCaptionObserver = null;
  const getYouTubeCaptionControls = () => {
    if (provider.platform !== "youtube") return {};
    const player = document.querySelector(".html5-video-player");
    return {
      player,
      button: player?.querySelector(".ytp-subtitles-button"),
    };
  };
  const setYouTubeNativeCaption = (enabled) => {
    const { player, button } = getYouTubeCaptionControls();
    if (!player || !button || typeof player.toggleSubtitles !== "function")
      return false;
    const current = button.getAttribute("aria-pressed") === "true";
    if (current !== enabled) player.toggleSubtitles(enabled);
    return true;
  };
  provider.suppressNativeCaptions = () => {
    if (provider.platform !== "youtube") return;
    const { button } = getYouTubeCaptionControls();
    if (!button) return;
    if (!youtubeNativeCaptionSuppressionActive) {
      youtubeNativeCaptionWasEnabled =
        button.getAttribute("aria-pressed") === "true";
      youtubeNativeCaptionSuppressionActive = true;
      youtubeNativeCaptionObserver?.disconnect();
      youtubeNativeCaptionObserver = new MutationObserver(() => {
        if (
          youtubeNativeCaptionSuppressionActive &&
          provider.strategy !== "none" &&
          button.getAttribute("aria-pressed") === "true"
        ) {
          youtubeNativeCaptionWasEnabled = true;
          setYouTubeNativeCaption(false);
        }
      });
      youtubeNativeCaptionObserver.observe(button, {
        attributes: true,
        attributeFilter: ["aria-pressed"],
      });
    }
    setYouTubeNativeCaption(false);
  };
  provider.restore = () => {
    if (provider.platform !== "youtube") return;
    youtubeNativeCaptionSuppressionActive = false;
    youtubeNativeCaptionObserver?.disconnect();
    youtubeNativeCaptionObserver = null;
    if (youtubeNativeCaptionWasEnabled) setYouTubeNativeCaption(true);
    youtubeNativeCaptionWasEnabled = false;
  };

  const isAiEngine = (engine) =>
    Boolean(
      engine?.model &&
        (String(engine._id || "").startsWith("byok-") ||
          [
            "OpenAI",
            "OpenRouter",
            "DeepSeek",
            "Google",
            "Anthropic",
            "Custom",
            "AI",
          ].includes(engine.providerId || engine.provider)),
    );

  const originalDispatchTranslate = provider.dispatchTranslate.bind(provider);
  const originalBackfillBaseline = provider.backfillBaseline.bind(provider);
  const originalDrivePretranslate = provider.drivePretranslate.bind(provider);
  provider.aiInflightRequests = 0;
  provider.aiInflightByGeneration = new Map();
  provider.translationGeneration = 0;
  provider.aiSeekSettledAt = 0;
  provider.aiRetryCounts = new Map();
  provider.aiRetryEngine = "";
  provider.lexihaloAiScheduler = {
    targetLead: 18,
    initialBatch: 3,
    stableBatch: 6,
    maxConcurrent: 2,
    retryDelayMs: 2000,
    seekSettleMs: 0,
    baselineFallbackForPreload: true,
  };

  const cancelGeneration = () => {
    window.postMessage(
      {
        eventName: "lexihalo:subtitle-ai-request",
        requestId: crypto.randomUUID(),
        type: "lexihalo:subtitle-ai:cancel",
        payload: {
          requestGroup: provider.id,
          requestGeneration: provider.translationGeneration,
        },
      },
      "*",
    );
  };

  provider.dispatchTranslate = async (lines) => {
    if (!isAiEngine(provider.engine)) return originalDispatchTranslate(lines);
    const generation = provider.translationGeneration;
    const inflight = provider.aiInflightByGeneration.get(generation) || 0;
    if (inflight >= 2) return;
    provider.aiInflightByGeneration.set(generation, inflight + 1);
    provider.aiInflightRequests = inflight + 1;
    try {
      return await originalDispatchTranslate(lines);
    } finally {
      const remaining = Math.max(
        0,
        (provider.aiInflightByGeneration.get(generation) || 1) - 1,
      );
      if (remaining) provider.aiInflightByGeneration.set(generation, remaining);
      else provider.aiInflightByGeneration.delete(generation);
      provider.aiInflightRequests =
        provider.aiInflightByGeneration.get(provider.translationGeneration) || 0;

      const isCurrentGeneration = generation === provider.translationGeneration;
      const lineIndices = new Set(lines.map((l) => l.idx));

      // Sanitize lines in cache & current view:
      // 1. Remove raw error strings from AITranslation / translation.
      // 2. Clear transient "superseded/aborted" error messages caused by seeking.
      const sanitizeList = (list) =>
        Array.isArray(list)
          ? list.map((item) => {
              if (!lineIndices.has(item.idx)) return item;
              const isAborted = /superseded|aborted|cancelled/i.test(
                item.message || "",
              );
              let clean = item;
              if (isAborted || (!isCurrentGeneration && item.message)) {
                clean = {
                  ...clean,
                  message: undefined,
                  AITranslation:
                    clean.AITranslation?.includes("AI 翻译失败") ||
                    clean.AITranslation?.includes("superseded")
                      ? undefined
                      : clean.AITranslation,
                  translation:
                    clean.translation?.includes("AI 翻译失败") ||
                    clean.translation?.includes("superseded")
                      ? undefined
                      : clean.translation,
                };
              }
              if (
                clean.AITranslation &&
                (clean.AITranslation.includes("AI 翻译失败") ||
                  clean.AITranslation.includes("superseded"))
              ) {
                clean = { ...clean, AITranslation: undefined };
              }
              if (
                clean.translation &&
                (clean.translation.includes("AI 翻译失败") ||
                  clean.translation.includes("superseded"))
              ) {
                clean = { ...clean, translation: undefined };
              }
              return clean;
            })
          : list;

      const cache = provider.captionCache?.cache;
      if (cache instanceof Map) {
        for (const [id, entry] of cache) {
          if (entry) {
            cache.set(id, {
              ...entry,
              lines: sanitizeList(entry.lines),
              builtinLines: sanitizeList(entry.builtinLines),
              whisperLines: sanitizeList(entry.whisperLines),
            });
          }
        }
      }

      if (!isCurrentGeneration) {
        // If the user seeked away while this batch was running:
        // Do NOT block new translations, and release translatingIdx.
        provider.pretransFailedAt = 0;
        if (Array.isArray(provider.translatingIdx)) {
          provider.translatingIdx = provider.translatingIdx.filter(
            (idx) => !lineIndices.has(idx),
          );
        }
      } else {
        for (const line of lines) {
          const current = provider.lines.find((item) => item.idx === line.idx);
          if (
            current?.message &&
            !/superseded|aborted|cancelled/i.test(current.message)
          ) {
            provider.aiRetryCounts.set(
              line.idx,
              (provider.aiRetryCounts.get(line.idx) || 0) + 1,
            );
          } else if (current?.translation || current?.AITranslation) {
            provider.aiRetryCounts.delete(line.idx);
          }
        }
      }
    }
  };

  provider.pretranslate = (currentIndex) => {
    const isSeeking = provider.seekFirstBatch;
    if (
      provider.isDestroyed ||
      !isAiEngine(provider.engine) ||
      !provider.to ||
      (!isSeeking && Date.now() - provider.pretransFailedAt < 2000) ||
      (provider.aiInflightByGeneration.get(provider.translationGeneration) ||
        0) >= 2
    )
      return;
    const lines = provider.lines;
    if (!lines.length || currentIndex < 0) return;
    const engineId = provider.engine?._id || "";
    if (provider.aiRetryEngine !== engineId) {
      provider.aiRetryEngine = engineId;
      provider.aiRetryCounts.clear();
    }
    const canTranslate = (line) =>
      provider.needTranslate(line) &&
      (provider.aiRetryCounts.get(line.idx) || 0) < 3;
    const targetLead = 18;
    const batchSize = 6;
    const limit = Math.min(lines.length, currentIndex + targetLead);
    const firstBatch = provider.seekFirstBatch;
    provider.seekFirstBatch = false;

    let candidates;
    if (firstBatch) {
      candidates = lines
        .slice(currentIndex, limit)
        .filter(canTranslate)
        .slice(0, 3);
    } else {
      const firstNeeded = lines
        .slice(currentIndex, limit)
        .findIndex(canTranslate);
      if (firstNeeded < 0) return;
      const absoluteIndex = currentIndex + firstNeeded;
      const stableStart = Math.floor(absoluteIndex / batchSize) * batchSize;
      candidates = lines
        .slice(stableStart, Math.min(lines.length, stableStart + batchSize))
        .filter(canTranslate);
    }
    if (candidates.length) provider.dispatchTranslate(candidates);
  };

  provider.drivePretranslate = () => {
    const previous = provider.lastPretransCurrent;
    const current = provider.current;
    if (previous >= 0 && Math.abs(current - previous) > 3000) {
      provider.translationGeneration += 1;
      provider.aiInflightRequests = 0;
      provider.translatingIdx = [];
      provider.seekFirstBatch = true;
      provider.pretransFailedAt = 0; // Clear failure lockout immediately on seek!
      cancelGeneration();
    }
    const result = originalDrivePretranslate();
    // Streaming/text-track platforms already run this fallback from the
    // provider tick. Preload platforms (notably YouTube and Prime Video) were
    // excluded, so AI captions had no immediate Google baseline while waiting
    // for the higher-quality model result.
    if (!provider.hasExternalCorpus && isAiEngine(provider.engine)) {
      provider.backfillBaseline();
    }
    return result;
  };

  provider.backfillBaseline = () => {
    return originalBackfillBaseline();
  };

  const resetLines = (lines) =>
    Array.isArray(lines)
      ? lines.map((line) => ({
          ...line,
          text: line.originalText || line.text,
          originalText: line.originalText || line.text,
          translation: undefined,
          AITranslation: undefined,
          translateEngine: undefined,
          message: undefined,
          sameLangTo: undefined,
        }))
      : lines;

  const purge = (scope, { reload = true } = {}) => {
    const cache = provider.captionCache?.cache;
    let restored = false;
    if (cache instanceof Map && cache.size) {
      for (const [id, entry] of cache) {
        cache.set(id, {
          ...entry,
          lines: resetLines(entry?.lines),
          builtinLines: resetLines(entry?.builtinLines),
          whisperLines: resetLines(entry?.whisperLines),
        });
      }
      restored = true;
    } else {
      provider.captionCache?.clear?.();
    }
    provider.domTransCache?.clear?.();
    provider.domTransInflight?.clear?.();
    provider.domTokensCache?.clear?.();
    provider.domTokensInflight?.clear?.();
    provider.translatingIdx = [];
    provider.lastPretransCurrent = -1;
    provider.seekFirstBatch = true;
    provider.pretransFailedAt = 0;
    provider.baselineFailedAt = 0;
    provider.tokenizeFailedAt = 0;
    provider.translationGeneration += 1;
    provider.aiSeekSettledAt = 0;
    provider.aiInflightRequests = 0;
    provider.aiInflightByGeneration.clear();
    provider.aiRetryCounts.clear();
    cancelGeneration();
    if (restored) {
      provider.event?.emit?.("changed", {
        current: provider.current,
        forceUpdate: true,
        cacheScope: scope,
      });
    } else if (reload) {
      provider.event?.emit?.("caption:reload");
    }
  };

  // DualCaptionApp calls this after either the global settings or the in-player
  // language selector changes. Invalidate language-bound translations before
  // its own effect reloads the selected source track; emitting caption:reload
  // here as well would start a duplicate, racing load.
  provider.resetForLanguageChange = (scope = "language-change") =>
    purge(scope, { reload: false });

  window.addEventListener("edvideo:caption.purgeAndReload", (event) =>
    purge(event?.detail?.scope),
  );
  window.addEventListener("message", (event) => {
    if (event.data?.eventName === "edvideo:caption.purgeAndReload")
      purge(event.data.scope);
  });

  const isLineTranslated = (line) =>
    Boolean(
      (line?.AITranslation && !line.AITranslation.includes("AI 翻译失败")) ||
        (line?.translation && !line.translation.includes("AI 翻译失败")),
    );

  provider.getTranslationStatus = () => {
    const lines = provider.lines || [];
    const total = lines.length;
    const done = lines.filter(isLineTranslated).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const isAllDone = total > 0 && done === total;
    return {
      total,
      done,
      pct,
      isAllDone,
      running: Boolean(provider.isBatchProcessingAll),
    };
  };

  provider.translateAllRemaining = async (onProgress) => {
    if (!provider.lines || !provider.lines.length) return false;
    if (provider.isBatchProcessingAll) return false;
    provider.isBatchProcessingAll = true;
    try {
      const batchSize = 6;
      while (!provider.isDestroyed && provider.isBatchProcessingAll) {
        const untranslated = provider.lines.filter(
          (line) => !isLineTranslated(line),
        );
        if (!untranslated.length) break;
        const total = provider.lines.length;
        const done = total - untranslated.length;
        const status = {
          total,
          done,
          pct: Math.round((done / total) * 100),
          running: true,
          isAllDone: false,
        };
        onProgress?.(status);
        provider.event?.emit?.("translation:progress", status);

        const batch = untranslated.slice(0, batchSize);
        await provider.dispatchTranslate(batch);
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
      const finalUntranslated = provider.lines.filter(
        (line) => !isLineTranslated(line),
      );
      const allDone = finalUntranslated.length === 0;
      const finalTotal = provider.lines.length;
      const finalDone = finalTotal - finalUntranslated.length;
      const finalStatus = {
        total: finalTotal,
        done: finalDone,
        pct: finalTotal > 0 ? Math.round((finalDone / finalTotal) * 100) : 0,
        running: false,
        isAllDone: allDone,
      };
      onProgress?.(finalStatus);
      provider.event?.emit?.("translation:progress", finalStatus);
      return allDone;
    } finally {
      provider.isBatchProcessingAll = false;
    }
  };

  provider.downloadBilingualSrt = (rawTitle) => {
    const lines = provider.lines || [];
    if (!lines.length) {
      throw new Error("当前视频暂无可用字幕");
    }
    const untranslated = lines.filter((l) => !isLineTranslated(l));
    if (untranslated.length > 0) {
      throw new Error(
        `字幕尚未全部处理完成（当前进度：${lines.length - untranslated.length}/${lines.length}），全部处理完后方可下载！`,
      );
    }

    const formatTimestamp = (ms) => {
      const millis = Math.floor(ms % 1000);
      const secs = Math.floor((ms / 1000) % 60);
      const mins = Math.floor((ms / 60000) % 60);
      const hours = Math.floor(ms / 3600000);
      return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
    };

    const srtBlocks = lines.map((line, index) => {
      const num = index + 1;
      const time = `${formatTimestamp(line.start)} --> ${formatTimestamp(line.end)}`;
      const translation = (line.AITranslation || line.translation || "").trim();
      // `text` is replaced with the AI-repaired source after translation;
      // `originalText` intentionally keeps the raw caption for cache resets.
      const repairedSource = (
        line.repairedText ||
        line.text ||
        line.originalText ||
        ""
      ).trim();
      let text = repairedSource;
      if (translation && translation !== repairedSource) {
        text = `${translation}\r\n${repairedSource}`;
      }
      return `${num}\r\n${time}\r\n${text}`;
    });

    const srtContent = "\ufeff" + srtBlocks.join("\r\n\r\n");
    const blob = new Blob([srtContent], {
      type: "application/octet-stream",
    });
    const url = window.URL.createObjectURL(blob);
    const safeTitle = String(rawTitle || "bilingual_subtitles")
      .replace(/[\/\\:*?"<>|]/g, "_")
      .replace(/[\r\n\t]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);
    const filename = `${safeTitle || "video"}_双语字幕.srt`;
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(url), 60000);
  };

  globalThis.lexihaloGetTranslationStatus = () =>
    provider.getTranslationStatus();
  globalThis.lexihaloTranslateAllSubtitles = (cb) =>
    provider.translateAllRemaining(cb);
  globalThis.lexihaloDownloadBilingualSubtitles = () =>
    provider.downloadBilingualSrt(document.title);
})();
