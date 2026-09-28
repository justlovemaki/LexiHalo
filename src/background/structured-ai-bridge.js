/**
 * Bridges background LLM provider adapters to subtitle-ai requests.
 * Evaluated inside the primary background application scope during build.
 */
export function recoverStructuredAiBridge(dependencies) {
  const TranslationEngineExecutor = dependencies.TranslationEngineExecutor;
  const getCatalog = dependencies.ii;
  const getPromptPack = dependencies.Lo;
  const normalizeEngine = dependencies.es;
  const resolveEngine = dependencies.di;

  let structuredExecutor;
  const getTranslationExecutor = () =>
    structuredExecutor ||
    (structuredExecutor = new TranslationEngineExecutor({
      getCatalog: () => getCatalog(),
      getPromptPack: () => getPromptPack(),
    }));

  const structuredRequests = new Map();

  globalThis.lexihaloCancelStructuredAiGroup = (group, generation) => {
    if (!group) return { cancelled: 0 };
    const nextGeneration = Number(generation) || 0;
    const current = structuredRequests.get(group);
    if (current && nextGeneration <= current.generation) {
      return { cancelled: 0, generation: current.generation };
    }
    let cancelled = 0;
    current?.controllers.forEach((controller) => {
      if (!controller.signal.aborted) {
        controller.abort();
        cancelled += 1;
      }
    });
    structuredRequests.set(group, {
      generation: nextGeneration,
      controllers: new Set(),
      updatedAt: Date.now(),
    });
    return { cancelled, generation: nextGeneration };
  };

  globalThis.lexihaloTranslateTextFallback = (request) =>
    getTranslationExecutor().translate(request);

  globalThis.lexihaloExtractAiResponseText = (payload) => {
    const extract = (value) => {
      if (typeof value === "string") return value.trim();
      if (Array.isArray(value)) {
        return value.map(extract).filter(Boolean).join("").trim();
      }
      if (!value || typeof value !== "object") return "";
      if (typeof value.value === "string") return value.value.trim();
      if (typeof value.text === "string") return value.text.trim();
      if (typeof value.content === "string") return value.content.trim();
      return extract(value.text) || extract(value.content);
    };
    const candidates = [
      payload?.choices?.[0]?.message?.content,
      payload?.choices?.[0]?.text,
      payload?.output_text,
      payload?.output,
      payload?.content,
      payload?.result,
      payload?.response,
      payload?.data?.choices?.[0]?.message?.content,
      payload?.data?.output_text,
      payload?.data?.output,
    ];
    for (const candidate of candidates) {
      const text = extract(candidate);
      if (text) return text;
    }
    const raw = payload?.error?.metadata?.raw;
    if (typeof raw === "string") {
      try {
        return globalThis.lexihaloExtractAiResponseText(JSON.parse(raw));
      } catch {}
    }
    return "";
  };

  globalThis.lexihaloExecuteStructuredAi = async (request) => {
    const executor = getTranslationExecutor();
    const catalog = await getCatalog();
    const normalized = normalizeEngine(request.engine, catalog).engine;
    if (!normalized.schemaVersion || normalized.schemaVersion < 2) {
      throw new Error("AI engine cannot be normalized to the provider adapter");
    }
    const resolved = resolveEngine(
      normalized,
      catalog,
      Boolean(request.useProxy),
    );
    const adapter = executor.adapters[resolved.provider.protocol];
    if (!adapter) {
      throw new Error("No provider adapter for " + resolved.provider.protocol);
    }
    const tunedEngine = {
      ...resolved.engine,
      requestHeaders: {
        ...(resolved.engine.requestHeaders || {}),
        ...(request.requestHeaders || {}),
      },
      requestBody: {
        ...(resolved.engine.requestBody || {}),
        ...(request.requestBody || {}),
      },
    };

    const group = request.requestGroup || "subtitle-default";
    const generation = Number(request.requestGeneration) || 0;
    let state = structuredRequests.get(group);
    if (!state || generation > state.generation) {
      state?.controllers.forEach((controller) => controller.abort());
      state = { generation, controllers: new Set(), updatedAt: Date.now() };
      structuredRequests.set(group, state);
    } else if (generation < state.generation) {
      throw new Error("AI subtitle request was superseded by a seek");
    }

    const controller = new AbortController();
    state.controllers.add(controller);
    state.updatedAt = Date.now();
    try {
      const result = await executor.rateLimiter.enqueue(() =>
        adapter.execute(
          { ...resolved, engine: tunedEngine },
          {
            texts: request.texts,
            from: request.from,
            to: request.to,
            messages: request.messages,
            temperature: request.temperature,
            maxTokens: request.maxTokens,
            topP: request.topP,
            topK: request.topK,
            signal: controller.signal,
          },
        ),
      );
      if (!result?.ok) {
        throw new Error(result?.error || "AI subtitle request failed");
      }
      return result.rawText || "";
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error("AI subtitle request superseded by seek");
      }
      throw error;
    } finally {
      state.controllers.delete(controller);
      state.updatedAt = Date.now();
      if (structuredRequests.size > 50) {
        const oldest = [...structuredRequests.entries()]
          .filter(([, value]) => value.controllers.size === 0)
          .sort((left, right) => left[1].updatedAt - right[1].updatedAt)
          .slice(0, structuredRequests.size - 50);
        oldest.forEach(([key]) => structuredRequests.delete(key));
      }
    }
  };
}
