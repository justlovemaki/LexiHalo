import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const profile = path.join(root, ".pi", "readable-e2e-profile");
fs.rmSync(profile, { recursive: true, force: true });
const errors = [];
const aiRequests = [];
const transcriptionRequests = [];
const transcriptionRequestHeaders = [];
const server = http.createServer((request, response) => {
  if (request.url?.startsWith("/audio-fixture")) {
    response.writeHead(200, {
      "content-type": "audio/webm",
      "content-length": "16",
    });
    response.end(Buffer.from("fixture-audio-01"));
    return;
  }
  if (request.url?.startsWith("/transcribe")) {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      const body = Buffer.concat(chunks).toString("latin1");
      transcriptionRequests.push(body);
      transcriptionRequestHeaders.push(request.headers);
      response.writeHead(200, { "content-type": "application/json" });
      response.end(
        JSON.stringify({
          language: "en",
          duration: 5,
          text: "generated from audio second timed caption",
          segments: [
            { start: 0, end: 2500, text: "generated from audio" },
            { start: 2500, end: 5000, text: "second timed caption" },
          ],
        }),
      );
    });
    return;
  }
  if (request.url?.startsWith("/ai")) {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      const body = Buffer.concat(chunks).toString("utf8");
      try {
        aiRequests.push(JSON.parse(body));
      } catch {
        aiRequests.push({ invalidBody: body });
      }
      let content = "bundle translation";
      if (body.includes("source_ids") || body.includes("待处理字幕")) {
        content = JSON.stringify({
          segments: [{ source_ids: [1], text: "repaired source" }],
        });
      } else if (body.includes("expert bilingual subtitle")) {
        content = JSON.stringify([
          { repaired: "repaired source", translation: "bundle translation" },
        ]);
      }
      const send = () => {
        response.writeHead(200, { "content-type": "application/json" });
        const payload = body.includes("responses envelope")
          ? {
              output: [
                {
                  content: [{ type: "output_text", text: content }],
                },
              ],
            }
          : body.includes("empty response fixture") &&
              body.includes("expert bilingual subtitle")
            ? { choices: [{ message: { content: "" } }] }
            : { choices: [{ message: { content } }] };
        response.end(JSON.stringify(payload));
      };
      if (body.includes("slow generation")) setTimeout(send, 500);
      else send();
    });
    return;
  }
  if (request.url?.startsWith("/caption")) {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(
      JSON.stringify({
        events: [
          {
            tStartMs: 0,
            dDurationMs: 2500,
            segs: [{ utf8: "source caption" }],
          },
        ],
      }),
    );
    return;
  }
  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  response.end(
    "<!doctype html><html><body><main><p>This paragraph is used by the readable bundle regression.</p></main></body></html>",
  );
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const localUrl = `http://127.0.0.1:${server.address().port}/`;
let context;
try {
  context = await chromium.launchPersistentContext(profile, {
    headless: false,
    args: [
      `--disable-extensions-except=${path.join(root, "dist")}`,
      `--load-extension=${path.join(root, "dist")}`,
      "--no-first-run",
    ],
  });
  const worker =
    context.serviceWorkers()[0] ||
    (await context.waitForEvent("serviceworker", { timeout: 20000 }));
  let backgroundReady = false;
  for (let attempt = 0; attempt < 100 && !backgroundReady; attempt += 1) {
    backgroundReady = await worker.evaluate(
      () => globalThis.__lexihaloReadableBackground === true,
    );
    if (!backgroundReady)
      await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!backgroundReady)
    throw new Error("Readable background did not initialize");
  const extensionId = new URL(worker.url()).host;

  const popup = await context.newPage();
  popup.on("pageerror", (error) => errors.push(`popup:${error.message}`));
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await popup
    .locator('[data-lexihalo-popup-runtime="readable"]')
    .waitFor({ timeout: 15000 });
  await popup.locator(".trancy-popup.ready").waitFor({ timeout: 15000 });

  const byok = await context.newPage();
  byok.on("pageerror", (error) => errors.push(`byok:${error.message}`));
  await byok.goto(`chrome-extension://${extensionId}/byok.html`);
  await byok
    .locator('html[data-lexihalo-byok-runtime="readable"]')
    .waitFor({ timeout: 15000 });
  await byok.locator("#engine-form").waitFor({ timeout: 15000 });
  await byok.locator("#name").fill("E2E Engine");
  await byok.locator("#model").fill("e2e-model");
  await byok.locator("#endpoint").fill(`${localUrl}ai`);
  await byok.locator("#transcription-model").fill("whisper-1");
  await byok.locator("#transcription-endpoint").fill(`${localUrl}transcribe`);
  await byok.locator("#transcription-language").fill("中文");
  await byok.locator("#transcription-prompt").fill("E2E glossary");
  await byok.locator("#key").fill("e2e-key");
  await byok.locator('#engine-form button[type="submit"]').click();
  await byok.locator(".engine-name", { hasText: "E2E Engine" }).waitFor({ timeout: 10000 });
  let storedEngines = await byok.evaluate(async () =>
    (await chrome.storage.local.get("trancy_byok_engines")).trancy_byok_engines,
  );
  if (
    storedEngines?.length !== 1 ||
    storedEngines[0].key !== "e2e-key" ||
    storedEngines[0].transcriptionModel !== "whisper-1" ||
    storedEngines[0].transcriptionEndpoint !== `${localUrl}transcribe` ||
    storedEngines[0].transcriptionLanguage !== "中文" ||
    storedEngines[0].transcriptionPrompt !== "E2E glossary"
  ) {
    throw new Error("BYOK create/persist failed");
  }
  const engineId = storedEngines[0]._id;
  await byok.getByRole("button", { name: "编辑" }).click();
  await byok.locator("#name").fill("E2E Engine Edited");
  await byok.locator('#engine-form button[type="submit"]').click();
  await byok.reload();
  await byok.locator(".engine-name", { hasText: "E2E Engine Edited" }).waitFor({ timeout: 10000 });
  storedEngines = await byok.evaluate(async () =>
    (await chrome.storage.local.get("trancy_byok_engines")).trancy_byok_engines,
  );
  if (storedEngines?.[0]?._id !== engineId || storedEngines[0].name !== "E2E Engine Edited") {
    throw new Error("BYOK edit/reload failed");
  }
  const requestBackground = (name, body) =>
    byok.evaluate(
      ({ name, body }) =>
        new Promise((resolve, reject) => {
          const uuid = `${name}-${crypto.randomUUID()}`;
          const timer = setTimeout(
            () => reject(new Error(`${name} timeout`)),
            10000,
          );
          const listener = (message) => {
            if (message?.uuid !== uuid || !message.response) return;
            clearTimeout(timer);
            chrome.runtime.onMessage.removeListener(listener);
            resolve(message.response);
          };
          chrome.runtime.onMessage.addListener(listener);
          chrome.runtime
            .sendMessage({
              from: "content",
              to: ["background"],
              name,
              body,
              uuid,
            })
            .catch(reject);
        }),
      { name, body },
    );
  const stateResponse = await requestBackground("getState", {});
  if (stateResponse?.data?.user?.id !== "standalone")
    throw new Error("Standalone state missing");
  const publicEngine = {
    _id: engineId,
    name: "E2E Engine Edited",
    provider: "OpenAI",
    providerId: "OpenAI",
    model: "e2e-model",
    endpoint: `${localUrl}ai`,
    type: "user",
  };
  const aiRequestsBeforeTranslation = aiRequests.length;
  const translated = await requestBackground("translateWithEngine", {
    texts: ["source"],
    from: "en",
    to: "zh-CN",
    cacheScope: "subtitle",
    useCache: false,
    engine: publicEngine,
  });
  if (
    translated?.[0]?.translation !== "bundle translation" ||
    translated?.[0]?.repairedText !== "repaired source"
  ) {
    throw new Error(`Bundle subtitle translation/repair failed: ${JSON.stringify(translated)}`);
  }
  if (aiRequests.length !== aiRequestsBeforeTranslation + 1) {
    throw new Error("AI subtitle repair unexpectedly issued a fallback model request");
  }
  const structuredRequest = aiRequests.at(-1);
  if (
    structuredRequest?.response_format !== undefined ||
    structuredRequest?.max_tokens > 8192 ||
    structuredRequest?.max_tokens < 768
  ) {
    throw new Error(
      `AI subtitle request tuning missing: ${JSON.stringify(structuredRequest)}`,
    );
  }

  const openRouterResult = await requestBackground("translateWithEngine", {
    texts: ["provider tuning"],
    from: "en",
    to: "zh-CN",
    cacheScope: "subtitle",
    useCache: false,
    engine: {
      _id: "test-openrouter",
      name: "OpenRouter Test",
      provider: "OpenAI",
      providerId: "OpenRouter",
      model: "openai/gpt-4.1-mini",
      endpoint: `${localUrl}ai`,
      key: "e2e-key",
      type: "user",
    },
  });
  if (openRouterResult?.[0]?.message !== "ok") {
    throw new Error(`OpenRouter subtitle request failed: ${JSON.stringify(openRouterResult)}`);
  }
  if (
    aiRequests.at(-1)?.reasoning?.exclude !== true ||
    aiRequests.at(-1)?.response_format?.type !== "json_object"
  ) {
    throw new Error("OpenRouter subtitle tuning was not applied");
  }

  const alternateEnvelope = await requestBackground("translateWithEngine", {
    texts: ["responses envelope"],
    from: "en",
    to: "zh-CN",
    cacheScope: "subtitle",
    useCache: false,
    engine: publicEngine,
  });
  if (
    alternateEnvelope?.[0]?.translation !== "bundle translation" ||
    alternateEnvelope?.[0]?.repairedText !== "repaired source"
  ) {
    throw new Error(
      `Alternate AI response envelope was not recovered: ${JSON.stringify(alternateEnvelope)}`,
    );
  }

  const emptyEnvelope = await requestBackground("translateWithEngine", {
    texts: ["empty response fixture"],
    from: "en",
    to: "zh-CN",
    cacheScope: "subtitle",
    useCache: false,
    engine: publicEngine,
  });
  if (
    emptyEnvelope?.[0]?.message !== "ok" ||
    emptyEnvelope?.[0]?.translation !== "bundle translation" ||
    emptyEnvelope?.[0]?.repairedText !== "empty response fixture" ||
    emptyEnvelope?.[0]?.fallback !== "ai-translation-only"
  ) {
    throw new Error(
      `Empty AI response handling failed: ${JSON.stringify(emptyEnvelope)}`,
    );
  }

  const partialBatch = await requestBackground("translateWithEngine", {
    texts: ["partial batch one", "partial batch two", "partial batch three"],
    from: "en",
    to: "zh-CN",
    cacheScope: "subtitle",
    useCache: false,
    engine: publicEngine,
  });
  if (
    partialBatch?.some((item) => item?.message !== "ok") ||
    partialBatch?.[0]?.translation !== "bundle translation" ||
    partialBatch?.[1]?.fallback !== "ai-translation-only" ||
    partialBatch?.[2]?.fallback !== "ai-translation-only"
  ) {
    throw new Error(
      `Partial AI subtitle batch fallback failed: ${JSON.stringify(partialBatch)}`,
    );
  }

  const longSource = "long subtitle ".repeat(240);
  await requestBackground("translateWithEngine", {
    texts: [longSource],
    from: "en",
    to: "zh-CN",
    cacheScope: "subtitle",
    useCache: false,
    engine: publicEngine,
  });
  if (aiRequests.at(-1)?.max_tokens <= 2048) {
    throw new Error("Long AI subtitle batch did not receive an adaptive token budget");
  }

  const slowRequest = requestBackground("translateWithEngine", {
    texts: ["slow generation"],
    from: "en",
    to: "zh-CN",
    cacheScope: "subtitle",
    useCache: false,
    requestGroup: "e2e-video",
    requestGeneration: 1,
    engine: publicEngine,
  });
  await new Promise((resolve) => setTimeout(resolve, 50));
  const latestRequest = requestBackground("translateWithEngine", {
    texts: ["latest generation"],
    from: "en",
    to: "zh-CN",
    cacheScope: "subtitle",
    useCache: false,
    requestGroup: "e2e-video",
    requestGeneration: 2,
    engine: publicEngine,
  });
  const [superseded, latest] = await Promise.all([slowRequest, latestRequest]);
  if (superseded?.[0]?.message === "ok" || latest?.[0]?.message !== "ok") {
    throw new Error(
      `AI subtitle generation cancellation failed: ${JSON.stringify({ superseded, latest })}`,
    );
  }
  await byok.locator("#refresh-diagnostics").click();
  await byok
    .locator("#diagnostics-output")
    .filter({ hasText: "combined-repair-translation" })
    .waitFor({ timeout: 10000 });
  if (!(await byok.locator("#diagnostics-output").innerText()).includes("ai-translation-only")) {
    throw new Error("AI subtitle fallback diagnostics were not recorded");
  }

  const cacheConfig = await byok.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const port = chrome.runtime.connect({ name: "lexihalo-subtitle-ai" });
        const requestId = crypto.randomUUID();
        const timer = setTimeout(
          () => reject(new Error("cache port timeout")),
          5000,
        );
        port.onMessage.addListener((message) => {
          if (message?.requestId !== requestId) return;
          clearTimeout(timer);
          port.disconnect();
          message.response?.ok
            ? resolve(message.response.data)
            : reject(new Error(message.response?.error));
        });
        port.postMessage({
          requestId,
          type: "lexihalo:subtitle-ai:get-config",
        });
      }),
  );
  if (!Array.isArray(cacheConfig.engines) || cacheConfig.engines[0]?._id !== engineId)
    throw new Error("Subtitle cache/config port failed");

  const transcribeAudio = () =>
    byok.evaluate(
      ({ engineId, audioUrl }) =>
        new Promise((resolve, reject) => {
          const port = chrome.runtime.connect({ name: "lexihalo-subtitle-ai" });
          const requestId = crypto.randomUUID();
          const timer = setTimeout(
            () => reject(new Error("audio transcription timeout")),
            10000,
          );
          port.onMessage.addListener((message) => {
            if (message?.requestId !== requestId) return;
            clearTimeout(timer);
            port.disconnect();
            message.response?.ok
              ? resolve(message.response.data)
              : reject(new Error(message.response?.error));
          });
          port.postMessage({
            requestId,
            type: "lexihalo:subtitle-ai:transcribe",
            engineId,
            audioUrl,
            mimeType: "audio/webm",
            videoId: "e2e-audio-video",
            language: "en-US",
            duration: 2500,
          });
        }),
      { engineId, audioUrl: `${localUrl}audio-fixture` },
    );
  const transcription = await transcribeAudio();
  if (
    transcription?.cached !== false ||
    transcription?.segments?.length !== 2 ||
    transcription?.segments?.[0]?.text !== "generated from audio" ||
    transcription?.segments?.[0]?.end !== 2500 ||
    transcription?.segments?.[1]?.start !== 2500 ||
    transcription?.segments?.[1]?.end !== 5000
  ) {
    throw new Error(`Audio transcription failed: ${JSON.stringify(transcription)}`);
  }
  const cachedTranscription = await transcribeAudio();
  if (cachedTranscription?.cached !== true || transcriptionRequests.length !== 1) {
    throw new Error("Audio transcription cache failed");
  }
  if (
    !String(transcriptionRequestHeaders[0]?.["content-type"] || "").startsWith(
      "multipart/form-data; boundary=",
    ) ||
    transcriptionRequestHeaders[0]?.authorization ||
    !transcriptionRequests[0]?.includes('name="model"') ||
    !transcriptionRequests[0]?.includes("whisper-1") ||
    !transcriptionRequests[0]?.includes('name="language"') ||
    !transcriptionRequests[0]?.includes('name="prompt"') ||
    !transcriptionRequests[0]?.includes("E2E glossary") ||
    !transcriptionRequests[0]?.includes('name="response_format"') ||
    !transcriptionRequests[0]?.includes("verbose_json") ||
    !transcriptionRequests[0]?.includes('name="temperature"') ||
    transcriptionRequests[0]?.includes('name="timestamp_granularities[]"')
  ) {
    throw new Error("OpenAI transcription multipart request is incomplete");
  }

  const processSubtitle = () =>
    byok.evaluate(
      ({ engineId }) =>
        new Promise((resolve, reject) => {
          const port = chrome.runtime.connect({ name: "lexihalo-subtitle-ai" });
          const requestId = crypto.randomUUID();
          const timer = setTimeout(() => reject(new Error("subtitle process timeout")), 10000);
          port.onMessage.addListener((message) => {
            if (message?.requestId !== requestId) return;
            clearTimeout(timer);
            port.disconnect();
            message.response?.ok
              ? resolve(message.response.data)
              : reject(new Error(message.response?.error));
          });
          port.postMessage({
            requestId,
            type: "lexihalo:subtitle-ai:process",
            engineId,
            language: "en",
            lines: [{ id: 1, text: "source subtitle" }],
            contextBefore: [],
            contextAfter: [],
            options: { segmentation: true, repair: true },
          });
        }),
      { engineId },
    );
  const repaired = await processSubtitle();
  if (repaired?.segments?.[0]?.text !== "repaired source" || repaired.cached !== false) {
    throw new Error(`Subtitle repair failed: ${JSON.stringify(repaired)}`);
  }
  const repairedCached = await processSubtitle();
  if (repairedCached?.segments?.[0]?.text !== "repaired source" || repairedCached.cached !== true) {
    throw new Error("Subtitle repair cache recovery failed");
  }

  const clearSubtitleCache = (scope) =>
    byok.evaluate(
      ({ scope }) =>
        new Promise((resolve, reject) => {
          const port = chrome.runtime.connect({ name: "lexihalo-subtitle-ai" });
          const requestId = crypto.randomUUID();
          const timer = setTimeout(
            () => reject(new Error(`cache clear timeout: ${scope}`)),
            5000,
          );
          port.onMessage.addListener((message) => {
            if (message?.requestId !== requestId) return;
            clearTimeout(timer);
            port.disconnect();
            message.response?.ok
              ? resolve(message.response.data)
              : reject(new Error(message.response?.error));
          });
          port.postMessage({
            requestId,
            type: "lexihalo:subtitle-ai:clear-cache",
            scope,
          });
        }),
      { scope },
    );

  await clearSubtitleCache("subtitle-refresh");
  const refreshedFromAiCache = await processSubtitle();
  if (refreshedFromAiCache?.cached !== true) {
    throw new Error("Subtitle refresh unexpectedly deleted persistent AI cache");
  }
  await clearSubtitleCache("ai-subtitle");
  const rebuiltAfterDeepClear = await processSubtitle();
  if (rebuiltAfterDeepClear?.cached !== false) {
    throw new Error("Deep AI subtitle cache clear did not force model processing");
  }

  const rules = await context.newPage();
  await rules.goto(`chrome-extension://${extensionId}/site-rules.html`);
  await rules
    .locator('html[data-lexihalo-site-rules-runtime="readable"]')
    .waitFor({ timeout: 15000 });
  await rules.locator("#immersive-new-rule").fill("127.0.0.1");
  await rules.locator("#immersive-add").click();
  await rules.locator(".rule-row code", { hasText: "127.0.0.1" }).waitFor({ timeout: 10000 });
  let savedRules = await rules.evaluate(async () =>
    (await chrome.storage.local.get("lexihalo_site_rules")).lexihalo_site_rules,
  );
  if (savedRules?.immersive?.[0] !== "127.0.0.1") throw new Error("Site-rule add/save failed");
  await rules.reload();
  await rules.locator(".rule-row code", { hasText: "127.0.0.1" }).waitFor({ timeout: 10000 });
  await rules.getByRole("button", { name: /删除规则 127\.0\.0\.1/ }).click();
  await rules.locator(".rule-empty").waitFor({ timeout: 10000 });
  savedRules = await rules.evaluate(async () =>
    (await chrome.storage.local.get("lexihalo_site_rules")).lexihalo_site_rules,
  );
  if (savedRules?.immersive?.length) throw new Error("Site-rule delete failed");
  await rules.locator("#immersive-new-rule").fill("127.0.0.1");
  await rules.locator("#immersive-add").click();
  await rules.locator(".rule-row code", { hasText: "127.0.0.1" }).waitFor({ timeout: 10000 });

  for (const action of [
    { type: "setting/setLanguage", payload: { key: "subtitle", value: "en" } },
    { type: "setting/setLanguage", payload: { key: "translation", value: "zh-CN" } },
    { type: "setTranslatorService", payload: { sentence: publicEngine, fulltext: publicEngine, subtitle: publicEngine } },
    { type: "setFulltextMode", payload: "dual" },
  ]) {
    const dispatched = await requestBackground("dispatch", action);
    if (dispatched?.message !== "ok") throw new Error(`State dispatch failed: ${action.type}`);
  }

  const reader = await context.newPage();
  reader.on("pageerror", (error) =>
    errors.push(`reader:${error.stack || error.message}`),
  );
  await reader.goto(localUrl);
  await reader
    .locator('html[data-lexihalo-reader-runtime="readable"]')
    .waitFor({ timeout: 25000 });
  await reader
    .locator('html[data-lexihalo-language-runtime="readable"]')
    .waitFor({ timeout: 15000 });
  await reader
    .locator('html[data-lexihalo-pos-runtime="readable"]')
    .waitFor({ timeout: 15000 });
  await reader
    .locator('html[data-lexihalo-immersive-always="1"]')
    .waitFor({ timeout: 15000 });
  const translatedNode = reader.locator("font.xt-dual, xt-dual, xt-trans").first();
  await translatedNode.waitFor({ state: "attached", timeout: 30000 });
  if (!(await translatedNode.textContent())?.includes("bundle translation")) {
    throw new Error("Immersive translation did not render translated DOM");
  }
  await reader.bringToFront();
  if (
    !(await reader.locator("main").innerText()).includes(
      "readable bundle regression",
    )
  )
    throw new Error("Reader page content unavailable");

  await reader.evaluate(() =>
    window.postMessage(
      {
        eventName: "trancy:slider-toggle",
        path: "/",
      },
      "*",
    ),
  );
  await reader
    .locator("#lexihalo-global-cache-group")
    .waitFor({ timeout: 10000 });
  await reader
    .getByText("重新载入当前字幕", { exact: true })
    .waitFor({ timeout: 10000 });
  await reader
    .getByText("彻底清除 AI 字幕缓存", { exact: true })
    .waitFor({ timeout: 10000 });
  for (const removedCacheControl of [
    "网页沉浸式翻译缓存",
    "划词与句子翻译缓存",
    "快速翻译缓存",
  ]) {
    if (
      (await reader.getByText(removedCacheControl, { exact: true }).count()) !==
      0
    ) {
      throw new Error(`Obsolete cache control is still visible: ${removedCacheControl}`);
    }
  }

  await translatedNode.evaluate((node) =>
    node.setAttribute("data-language-regression-old", "1"),
  );
  await reader.evaluate(() =>
    window.postMessage(
      {
        eventName: "trancy:slider-toggle",
        path: "/setting/language/translation",
      },
      "*",
    ),
  );
  const japaneseLanguage = reader
    .locator(".item-slider", { hasText: "日本語" })
    .first();
  await japaneseLanguage.waitFor({ state: "visible", timeout: 10000 });
  await japaneseLanguage.click();
  await reader
    .locator('[data-language-regression-old="1"]')
    .waitFor({ state: "detached", timeout: 10000 });
  const languageState = await requestBackground("getState", {});
  if (languageState?.data?.setting?.language?.translation !== "ja") {
    throw new Error("General translation language change was not persisted");
  }
  await reader
    .locator("font.xt-dual, xt-dual, xt-trans")
    .first()
    .waitFor({ state: "attached", timeout: 10000 });

  await context.route("https://www.youtube.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: `<!doctype html><html><body><div id="movie_player" class="html5-video-player"><video src="data:video/mp4;base64,"></video><button class="ytp-subtitles-button" aria-pressed="true"></button><button class="ytp-fullscreen-button"></button></div><script>const p=document.getElementById('movie_player');const v=p.querySelector('video');Object.defineProperty(v,'duration',{value:60});p.getPlayerState=()=>1;p.getPlayerResponse=()=>({videoDetails:{videoId:'readable-test',title:'Readable Test',lengthSeconds:'60'},captions:{playerCaptionsTracklistRenderer:{captionTracks:[{baseUrl:'${localUrl}caption',languageCode:'en',vssId:'.en',name:{simpleText:'English'}}]}}});p.getVolume=()=>100;p.setVolume=()=>{};p.play=()=>{};p.pause=()=>{};p.toggleSubtitlesCalls=[];p.toggleSubtitles=(enabled)=>{p.toggleSubtitlesCalls.push(enabled);p.querySelector('.ytp-subtitles-button').setAttribute('aria-pressed',String(enabled));};</script></body></html>`,
    }),
  );
  const video = await context.newPage();
  video.on("pageerror", (error) =>
    errors.push(`video:${error.stack || error.message}`),
  );
  await video.goto("https://www.youtube.com/watch?v=readable-test");
  await video
    .locator('html[data-lexihalo-video-runtime="readable"]')
    .waitFor({ timeout: 30000 });
  await video
    .locator("#xt-toggle-button")
    .waitFor({ state: "attached", timeout: 30000 });
  await video.locator("#xt-toggle-button .trancy-button-logo").click();
  await video
    .locator("#xt-toggle-button .trancy-panel-menu.visible")
    .waitFor({ timeout: 10000 });
  const primaryDownloadCount = await video
    .locator("#xt-toggle-button .trancy-primary-panel-menu")
    .getByText("下载完整双语字幕 (.srt)", { exact: true })
    .count();
  if (primaryDownloadCount !== 0) {
    throw new Error("Bilingual download must not appear beside More Features");
  }
  await video
    .locator("#xt-toggle-button .trancy-primary-panel-menu")
    .getByText("更多功能", { exact: true })
    .evaluate((label) => label.parentElement?.click());
  await video
    .locator("#xt-toggle-button .trancy-second-panel-menu")
    .getByText("下载完整双语字幕 (.srt)", { exact: true })
    .waitFor({ timeout: 10000 });
  const language = await video.evaluate(() => ({
    detected: window.detectLanguage(
      "This is a sufficiently long English sentence.",
    )?.[0]?.lang,
    lemma: window.posTagger
      .tagSentence("The cats are running quickly.")
      .find((token) => token.value === "cats")?.lemma,
    korean: window.romanize.ko("한국"),
    chinese: window.romanize.zh("你好"),
    captionProvider: Boolean(window.captionProvider),
    aiScheduler: window.captionProvider?.lexihaloAiScheduler,
  }));
  if (
    language.detected !== "en" ||
    language.lemma !== "cat" ||
    !language.korean ||
    !language.chinese ||
    !language.captionProvider ||
    language.aiScheduler?.maxConcurrent !== 2 ||
    language.aiScheduler?.stableBatch !== 6 ||
    language.aiScheduler?.retryDelayMs !== 2000 ||
    language.aiScheduler?.seekSettleMs !== 0 ||
    language.aiScheduler?.baselineFallbackForPreload !== true
  )
    throw new Error(`Language/video regression: ${JSON.stringify(language)}`);

  const youtubeBaselineFallback = await video.evaluate(() => {
    const provider = window.captionProvider;
    const originalCache = provider.captionCache.get(provider.id);
    const originalEngine = provider.engine;
    const originalBackfill = provider.backfillBaseline;
    const originalLastPretransCurrent = provider.lastPretransCurrent;
    let calls = 0;
    provider.captionCache.set(provider.id, {
      ...(originalCache || {}),
      lines: [],
      builtinLines: [],
    });
    provider.engine = {
      _id: "byok-baseline-regression",
      model: "regression-model",
      provider: "OpenAI",
    };
    provider.backfillBaseline = () => {
      calls += 1;
    };
    provider.lastPretransCurrent = provider.current;
    provider.drivePretranslate();
    provider.backfillBaseline = originalBackfill;
    provider.engine = originalEngine;
    provider.lastPretransCurrent = originalLastPretransCurrent;
    if (originalCache) provider.captionCache.set(provider.id, originalCache);
    else provider.captionCache.clear();
    return {
      calls,
      platform: provider.platform,
      hasExternalCorpus: provider.hasExternalCorpus,
    };
  });
  if (
    youtubeBaselineFallback.platform !== "youtube" ||
    youtubeBaselineFallback.hasExternalCorpus ||
    youtubeBaselineFallback.calls !== 1
  ) {
    throw new Error(
      `YouTube baseline fallback did not match streaming platforms: ${JSON.stringify(youtubeBaselineFallback)}`,
    );
  }

  const nativeCaptionSuppression = await video.evaluate(async () => {
    const provider = window.captionProvider;
    const player = document.querySelector(".html5-video-player");
    const button = player.querySelector(".ytp-subtitles-button");

    provider.restore();
    button.setAttribute("aria-pressed", "true");
    player.toggleSubtitlesCalls.length = 0;
    provider.suppressNativeCaptions();
    await new Promise((resolve) => setTimeout(resolve, 0));
    const disabledWhileLexiHaloIsActive =
      button.getAttribute("aria-pressed") === "false";
    provider.restore();
    const restoredWhenLexiHaloStops =
      button.getAttribute("aria-pressed") === "true";
    const enabledCycleCalls = [...player.toggleSubtitlesCalls];

    button.setAttribute("aria-pressed", "false");
    player.toggleSubtitlesCalls.length = 0;
    provider.suppressNativeCaptions();
    provider.restore();
    const stayedDisabledWhenOriginallyDisabled =
      button.getAttribute("aria-pressed") === "false";
    const disabledCycleCalls = [...player.toggleSubtitlesCalls];

    return {
      disabledWhileLexiHaloIsActive,
      restoredWhenLexiHaloStops,
      stayedDisabledWhenOriginallyDisabled,
      enabledCycleCalls,
      disabledCycleCalls,
    };
  });
  if (
    !nativeCaptionSuppression.disabledWhileLexiHaloIsActive ||
    !nativeCaptionSuppression.restoredWhenLexiHaloStops ||
    !nativeCaptionSuppression.stayedDisabledWhenOriginallyDisabled ||
    nativeCaptionSuppression.enabledCycleCalls[0] !== false ||
    nativeCaptionSuppression.enabledCycleCalls.at(-1) !== true ||
    nativeCaptionSuppression.disabledCycleCalls.includes(true)
  ) {
    throw new Error(
      `YouTube native caption suppression failed: ${JSON.stringify(nativeCaptionSuppression)}`,
    );
  }

  const chineseVariantTest = await video.evaluate(() => {
    const provider = window.captionProvider;
    const originalCache = provider.captionCache.get(provider.id);
    const originalTarget = provider.to;
    const originalLearningLanguage = provider.learningLang;
    const check = (text, target) => {
      const lines = Array.from({ length: 4 }, (_, index) => ({
        idx: 200 + index,
        start: index * 1000,
        end: (index + 1) * 1000,
        text,
        originalText: text,
      }));
      provider.captionCache.set(provider.id, {
        ...(originalCache || {}),
        lines,
        builtinLines: lines,
      });
      provider.langVoteCache.clear();
      provider.to = target;
      const detected = provider.corpusLang();
      const same = provider.syncCorpusSameLang();
      provider.learningLang = "zh-CN";
      provider.evalLookupAllowed();
      return {
        detected,
        same,
        marked: provider.lines.every((line) => line.sameLangTo === target),
        lookupAllowed: provider.isLookupAllowed,
      };
    };
    const simplifiedToTraditional = check(
      "这个视频讲述软件开发与学习",
      "zh-Hant",
    );
    const traditionalToTraditional = check(
      "這個影片講述軟體開發與學習",
      "zh-Hant",
    );
    const traditionalToSimplified = check(
      "這個影片講述軟體開發與學習",
      "zh-CN",
    );
    if (originalCache) provider.captionCache.set(provider.id, originalCache);
    else provider.captionCache.clear();
    provider.langVoteCache.clear();
    provider.to = originalTarget;
    provider.learningLang = originalLearningLanguage;
    return {
      simplifiedToTraditional,
      traditionalToTraditional,
      traditionalToSimplified,
    };
  });
  if (
    chineseVariantTest.simplifiedToTraditional.detected !== "zh-CN" ||
    chineseVariantTest.simplifiedToTraditional.same ||
    chineseVariantTest.simplifiedToTraditional.marked ||
    chineseVariantTest.traditionalToTraditional.detected !== "zh-Hant" ||
    !chineseVariantTest.traditionalToTraditional.same ||
    !chineseVariantTest.traditionalToTraditional.marked ||
    !chineseVariantTest.traditionalToTraditional.lookupAllowed ||
    chineseVariantTest.traditionalToSimplified.detected !== "zh-Hant" ||
    chineseVariantTest.traditionalToSimplified.same ||
    chineseVariantTest.traditionalToSimplified.marked
  ) {
    throw new Error(
      `Chinese subtitle variant detection failed: ${JSON.stringify(chineseVariantTest)}`,
    );
  }

  const languageReset = await video.evaluate(() => {
    const provider = window.captionProvider;
    const beforeGeneration = provider.translationGeneration;
    const translatedLine = {
      idx: 98,
      start: 0,
      end: 1000,
      text: "repaired source",
      originalText: "raw source",
      translation: "旧译文",
      AITranslation: "旧 AI 译文",
      translateEngine: "old-engine",
      message: "old error",
      sameLangTo: "zh-CN",
    };
    const cache = provider.captionCache.get(provider.id) || {};
    provider.captionCache.set(provider.id, {
      ...cache,
      lines: [translatedLine],
      builtinLines: [translatedLine],
    });
    provider.pretransFailedAt = Date.now();
    provider.baselineFailedAt = Date.now();
    provider.tokenizeFailedAt = Date.now();
    let reloads = 0;
    const onReload = () => {
      reloads += 1;
    };
    provider.event.on("caption:reload", onReload);
    provider.resetForLanguageChange();
    provider.event.off("caption:reload", onReload);
    const resetLine = provider.lines[0];
    return {
      generationAdvanced:
        provider.translationGeneration === beforeGeneration + 1,
      sourceRestored: resetLine?.text === "raw source",
      translationCleared:
        !resetLine?.translation &&
        !resetLine?.AITranslation &&
        !resetLine?.translateEngine &&
        !resetLine?.message &&
        !resetLine?.sameLangTo,
      failuresCleared:
        provider.pretransFailedAt === 0 &&
        provider.baselineFailedAt === 0 &&
        provider.tokenizeFailedAt === 0,
      reloads,
    };
  });
  if (
    !languageReset.generationAdvanced ||
    !languageReset.sourceRestored ||
    !languageReset.translationCleared ||
    !languageReset.failuresCleared ||
    languageReset.reloads !== 0
  ) {
    throw new Error(
      `Caption language reset failed: ${JSON.stringify(languageReset)}`,
    );
  }

  const seekScheduler = await video.evaluate(() => {
    const provider = window.captionProvider;
    const before = provider.translationGeneration;
    provider.aiInflightByGeneration.set(before, 2);
    provider.aiInflightRequests = 2;
    provider.lastPretransCurrent = provider.current + 5000;
    provider.drivePretranslate();
    return {
      before,
      after: provider.translationGeneration,
      currentInflight: provider.aiInflightRequests,
      oldInflight: provider.aiInflightByGeneration.get(before),
    };
  });
  if (
    seekScheduler.after !== seekScheduler.before + 1 ||
    seekScheduler.currentInflight !== 0 ||
    seekScheduler.oldInflight !== 2
  ) {
    throw new Error(
      `AI seek generation isolation failed: ${JSON.stringify(seekScheduler)}`,
    );
  }

  const retainTest = await video.evaluate(() => {
    const provider = window.captionProvider;
    const testLines = [{ idx: 99, start: 0, end: 1000, text: "repaired by ai", originalText: "raw", AITranslation: "已翻译", translation: "已翻译" }];
    const cache = provider.captionCache.get(provider.id) || {};
    provider.captionCache.set(provider.id, { ...cache, lines: testLines, builtinLines: testLines });
    // Simulate seeking
    provider.lastPretransCurrent = provider.current + 5000;
    provider.drivePretranslate();
    const after = provider.lines.find((l) => l.idx === 99);
    return {
      hasAiTranslation: after?.AITranslation === "已翻译",
      text: after?.text,
    };
  });
  if (!retainTest.hasAiTranslation || retainTest.text !== "repaired by ai") {
    throw new Error(`Seek reverted already translated lines: ${JSON.stringify(retainTest)}`);
  }

  const backwardSeekTest = await video.evaluate(async () => {
    const provider = window.captionProvider;
    // Simulate line in flight that gets superseded by backward seek
    const initialLine = { idx: 101, start: 50000, end: 53000, text: "going back", originalText: "going back" };
    const cache = provider.captionCache.get(provider.id) || {};
    provider.captionCache.set(provider.id, { ...cache, lines: [initialLine], builtinLines: [initialLine] });
    provider.current = 50000;
    provider.lastPretransCurrent = 50000;

    // Backward seek from 50000 to 5000
    provider.current = 5000;
    provider.drivePretranslate();

    // Verify seek reset pretransFailedAt and did not poison lines
    const currentLine = provider.lines.find((l) => l.idx === 101);
    return {
      generation: provider.translationGeneration,
      pretransFailedAt: provider.pretransFailedAt,
      hasErrorMessage: Boolean(currentLine?.message),
      hasFailedText: currentLine?.AITranslation?.includes("AI 翻译失败") || currentLine?.translation?.includes("AI 翻译失败"),
      retryCount: provider.aiRetryCounts.get(101) || 0,
    };
  });
  if (
    backwardSeekTest.pretransFailedAt !== 0 ||
    backwardSeekTest.hasErrorMessage ||
    backwardSeekTest.hasFailedText ||
    backwardSeekTest.retryCount !== 0
  ) {
    throw new Error(`Backward seek sanity failed: ${JSON.stringify(backwardSeekTest)}`);
  }

  const bilingualDownloadTest = await video.evaluate(async () => {
    const provider = window.captionProvider;
    // Set 2 lines, 1 translated, 1 untranslated.
    const twoLines = [
      {
        idx: 1,
        start: 0,
        end: 2000,
        text: "AI repaired Hello",
        originalText: "Raw Hello",
        AITranslation: "你好",
      },
      {
        idx: 2,
        start: 2000,
        end: 4000,
        text: "AI repaired World",
        originalText: "Raw World",
        AITranslation: undefined,
        translation: undefined,
      },
    ];
    const cache = provider.captionCache.get(provider.id) || {};
    provider.captionCache.set(provider.id, { ...cache, lines: twoLines, builtinLines: twoLines });
    const statusIncomplete = provider.getTranslationStatus();

    let incompleteBlocked = false;
    try {
      provider.downloadBilingualSrt("test");
    } catch (e) {
      incompleteBlocked = true;
    }

    // Now complete the second line and capture the generated SRT.
    const completedLines = twoLines.map((line, index) => ({
      ...line,
      AITranslation: index === 0 ? "你好" : "世界",
    }));
    provider.captionCache.set(provider.id, { ...cache, lines: completedLines, builtinLines: completedLines });
    const statusComplete = provider.getTranslationStatus();
    const originalCreateObjectURL = URL.createObjectURL.bind(URL);
    let downloadedBlob;
    URL.createObjectURL = (blob) => {
      downloadedBlob = blob;
      return originalCreateObjectURL(blob);
    };
    let completeAllowed = false;
    try {
      provider.downloadBilingualSrt("test");
      completeAllowed = true;
    } catch (e) {
      completeAllowed = false;
    } finally {
      URL.createObjectURL = originalCreateObjectURL;
    }
    const downloadedText = downloadedBlob ? await downloadedBlob.text() : "";

    return {
      incompleteStatus: statusIncomplete,
      incompleteBlocked,
      completeStatus: statusComplete,
      completeAllowed,
      exportedRepairedSource:
        downloadedText.includes("AI repaired Hello") &&
        downloadedText.includes("AI repaired World"),
      exportedRawSource:
        downloadedText.includes("Raw Hello") || downloadedText.includes("Raw World"),
    };
  });

  if (
    !bilingualDownloadTest.incompleteBlocked ||
    bilingualDownloadTest.incompleteStatus.isAllDone ||
    !bilingualDownloadTest.completeAllowed ||
    !bilingualDownloadTest.completeStatus.isAllDone ||
    !bilingualDownloadTest.exportedRepairedSource ||
    bilingualDownloadTest.exportedRawSource
  ) {
    throw new Error(`Bilingual download gating test failed: ${JSON.stringify(bilingualDownloadTest)}`);
  }

  const severe = errors.filter(
    (value) =>
      !/NotSupportedError|Failed to load resource: net::ERR_FAILED|ResizeObserver loop/i.test(
        value,
      ),
  );
  if (severe.length) throw new Error(severe.join("\n"));
  const reportsDir = path.join(root, "artifacts", "reports");
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(
    path.join(reportsDir, "browser-regression.json"),
    JSON.stringify(
      {
        status: "passed",
        surfaces: [
          "background",
          "popup",
          "options",
          "reader",
          "video",
          "language",
          "translation",
          "cache",
          "site-rules",
        ],
        errors: [],
      },
      null,
      2,
    ) + "\n",
  );
  console.log("Readable single-bundle Chromium regression passed.");
} finally {
  await context?.close().catch(() => {});
  await new Promise((resolve) => server.close(resolve));
}
