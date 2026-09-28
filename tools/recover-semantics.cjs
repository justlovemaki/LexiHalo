#!/usr/bin/env node
/**
 * Build a higher-level semantic source view for the two scope-hoisted entry bundles.
 * The output is analysis-oriented and intentionally separate from production assets.
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const localNodeModules = path.join(root, "node_modules");
const dependencyRoot = process.env.RECOVERY_NODE_MODULES
  ? path.resolve(process.env.RECOVERY_NODE_MODULES)
  : fs.existsSync(localNodeModules)
    ? localNodeModules
    : path.join(root, ".pi", "recovery-tools", "node_modules");
const parser = require(path.join(dependencyRoot, "@babel/parser"));
const traverse = require(path.join(dependencyRoot, "@babel/traverse")).default;
const generate = require(path.join(dependencyRoot, "@babel/generator")).default;
const t = require(path.join(dependencyRoot, "@babel/types"));

const outputRoot = path.join(root, "src-recovered");

const SEMANTIC_MAPS = {
  "edvideo-main": {
    e: "jsxRuntime",
    Os: "ExtensionClient",
    qs: "extensionClient",
    xs: "eventsModule",
    Ls: "defineClassField",
    Is: "runAsync",
    Es: "objectSpread",
    Ns: "objectSpreadWithDescriptors",
    As: "hasOwn",
    Cs: "getOwnPropertySymbols",
    js: "propertyIsEnumerable",
    nn: "detectBrowser",
    P_: "platformContext",
    Vf: "captionProvider",
    Ht: "logDebug",
    Vt: "logWarning",
    Wt: "logError",
    Zt: "detectVideoPlatform",
    Gt: "isPlatformEnabled",
    cn: "isDashboardHost",
    sn: "videoLocationPollTimer",
    gn: "createCustomElementRoot",
    _i: "createAction",
    bi: "createReducer",
    Hi: "DEFAULT_TRANSLATOR_ENGINE",
    hn: "DEFAULT_FULLTEXT_RULES",
    Ui: "initialState",
    vi: "configureStore",
    ys: "rootReducer",
    bs: "appStore",
    ws: "createAppStore",
    un: "React",
    kl: "useAppDispatch",
    Al: "useAppSelector",
    Pl: "shallowEqual",
    lC: "useDispatchBridge",
    pC: "useLocale",
    oC: "videoRouter",
    fl: "ReduxProvider",
    og: "resolvePlatformPlayer",
    $f: "ReactDOMClient",
    mA: "VideoLearningApp",
    HA: "DualCaptionApp",
    aj: "VideoToggleButton",
    sC: "initializeVideoRouter",
    hh: "CaptionUploader",
    Ff: "LruCache",
    Bf: "TRANSLATION_BATCH_POLICY",
    Df: "DEFAULT_TRANSLATION_ENGINE",
    nh: "BaseCaptionLoader",
    V_: "CaptionTrackProcessor",
    zf: "defineClassField",
    mf: "getCaptionPlatformConfig",
    gf: "getCaptionSourceMode",
    ff: "getCaptionTimingMode",
    vf: "getStreamingCaptionStrategy",
    yf: "usesConfiguredCaptionSource",
    bf: "hasCompleteCaptionCorpus",
    wf: "normalizeLanguageFamily",
    xf: "isSameLanguageFamily",
    Tf: "isSameNormalizedText",
    Sf: "countLanguageVotes",
    Cf: "inferDominantLanguage",
    Af: "sampleTexts",
    ce: "hasSignificantTimeOverlap",
    Pn: "normalizeLanguageCode",
    ln: "parseTimestamp",
    fn: "findYouTubePlayer",
    vn: "waitForYouTubePlayer",
    yn: "waitForElement",
    qf: "objectSpread",
    Rf: "objectSpreadWithDescriptors",
    Mf: "runAsync",
    uf: "fetchEdxSourceTranscript",
    xh: "NetflixCaptionLoader",
    Nh: "CourseraCaptionLoader",
    Dh: "UdemyCaptionLoader",
    Yh: "TedCaptionLoader",
    am: "HboCaptionLoader",
    hm: "DisneyCaptionLoader",
    gm: "EdxCaptionLoader",
    Am: "PrimeVideoCaptionLoader",
    Pm: "DeepLearningCaptionLoader",
    Mm: "BilibiliCaptionLoader",
    Hm: "BaseVideoPlayer",
    Vm: "YouTubePlayer",
    Um: "NetflixPlayer",
    Km: "StandardHtml5Player",
    Zm: "CourseraPlayer",
    Jm: "UdemyPlayer",
    Xm: "TedPlayer",
    Qm: "HboPlayer",
    rg: "DisneyPlayer",
    ig: "EdxPlayer",
    ag: "PrimeVideoPlayer",
    Fm: "defineClassField",
    $m: "defineClassField",
    Ym: "defineClassField",
    tg: "defineClassField",
    ng: "runAsync",
    Jt: "formatTimeRange",
    Bm: "eventSimulator",
    sj: "installStreamingCaptionInterceptor",
    cj: "installDomCaptionObserver",
    dj: "installTextTrackCaptionObserver",
    Qt: "playSound",
    Tb: "getDebounce",
    wj: "objectSpread",
    xj: "objectSpreadWithDescriptors",
    kj: "defineClassField",
    Tj: "runAsync",
    VA: "getTrackingContext",
  },
  popup: {
    n: "jsxRuntime",
    a: "React",
    o: "ReactDOMClient",
    T: "RESTRICTED_URL_PATTERNS",
    k: "detectUiLanguage",
    S: "openExtensionPage",
    w: "PopupApp",
    C: "popupRoot",
    y: "translations",
    u: "englishTranslations",
  },
  background: {
    Ka: "browserApi",
    Qa: "backgroundMessageBus",
    Ga: "eventsModule",
    Ja: "defineClassField",
    Xa: "runAsync",
    hi: "LruCache",
    mi: "defineClassField",
    Ii: "LegacyTranslationService",
    _i: "defineClassField",
    Pi: "runAsync",
    Si: "RequestQueue",
    Ei: "defineClassField",
    ji: "AuthResolver",
    Ri: "defineClassField",
    Mi: "runAsync",
    Ls: "OpenAiChatAdapter",
    As: "defineClassField",
    Ss: "runAsync",
    zs: "AnthropicAdapter",
    Ds: "defineClassField",
    Fs: "runAsync",
    Qs: "GeminiAdapter",
    Vs: "defineClassField",
    Xs: "runAsync",
    nl: "DeepLAdapter",
    el: "defineClassField",
    tl: "runAsync",
    hl: "LegacyMachineTranslationAdapter",
    dl: "defineClassField",
    pl: "runAsync",
    Cl: "TranslationEngineExecutor",
    _l: "defineClassField",
    Pl: "runAsync",
    uu: "IndexedDbCache",
    su: "defineClassField",
    lu: "runAsync",
    bu: "analyticsClient",
    Wl: "defineClassField",
    Yl: "runAsync",
    so: "AiTranslatorError",
    ro: "apiConfig",
    ao: "engineCatalog",
    po: "DEFAULT_PROMPT_PACK",
    Re: "createAction",
    Fe: "createReducer",
    nn: "DEFAULT_TRANSLATOR_ENGINE",
    $t: "DEFAULT_FULLTEXT_RULES",
    Zt: "objectSpread",
    en: "objectSpreadWithDescriptors",
    sn: "initialState",
    La: "rootReducer",
    Ot: "runAsync",
    It: "PERSIST_RETRY_DELAYS",
    At: "persistenceReadStatus",
    Et: "persistedUserPresent",
    St: "logoutInProgress",
    Lt: "persistenceWriteGuardReason",
    Rt: "serializedStateHasUser",
    Mt: "delay",
    jt: "readChromeStorage",
    xt: "getValueType",
    _t: "objectSpread",
    Nt: "reportPersistenceFailure",
    Ft: "guardedStorage",
    Ra: "PERSIST_KEY",
    Ma: "PERSIST_STORAGE_KEY",
    ja: "persistConfig",
    Ha: "persistedReducer",
    qa: "persistenceGuardMiddleware",
    Da: "store",
    Ba: "rehydrationPromise",
    eu: "rebuildContextMenus",
    rc: "toggleImmersiveSiteRule",
    ou: "getPopupContext",
    au: "configurePopupForTab",
    Ya: "getHydratedState",
    Al: "preloadTranslationConfiguration",
    fu: "runAsync",
    Xl: "runAsync",
    gu: "objectSpread",
    yu: "requestCache",
    Il: "translationExecutor",
    ii: "getEngineCatalog",
    Lo: "getPromptPack",
    li: "refreshEngineCatalog",
    Mo: "refreshPromptPack",
    Ml: "refreshFulltextRules",
    Jl: "md5",
  },
  "edreader-main": {
    Co: "ExtensionClient",
    So: "extensionClient",
    uo: "eventsModule",
    ko: "defineClassField",
    To: "runAsync",
    xo: "objectSpread",
    wo: "objectSpreadWithDescriptors",
    po: "apiConfig",
    ct: "detectBrowser",
    tt: "logDebug",
    nt: "logWarning",
    rt: "logError",
    st: "getLearningLanguage",
    pt: "matchesUrlRule",
    mt: "isDashboardContext",
    ft: "excludedTagNames",
    jo: "initializeExtensionClient",
    li: "rootReducer",
    eo: "collectObservableRoots",
    n_: "EnglishPosTokenizer",
    r_: "GenericWordTokenizer",
    i_: "DictionaryWordTokenizer",
    t_: "defineClassField",
    d_: "VocabularyHighlighter",
    __: "vocabularyHighlighter",
    l_: "defineClassField",
    c_: "runAsync",
    u_: "escapeRegex",
    uw: "BaseImmersiveTranslator",
    hw: "ImmersiveTranslationService",
    mw: "immersiveTranslator",
    Ex: "FulltextRuleResolver",
    Lx: "FulltextRuleResolver",
    Ox: "DisplayModeDetector",
    Ix: "DisplayModeDetector",
    Dx: "TranslationRenderer",
    Fx: "TranslationRenderer",
    aw: "TranslationUnitExtractor",
    ow: "TranslationUnitExtractor",
    $x: "isElementHidden",
    Ux: "isElementTranslated",
    lw: "defineClassField",
    cw: "runAsync",
    _w: "defineClassField",
    pw: "runAsync",
    gk: "controlCenter",
    hk: "defineClassField",
    mk: "runAsync",
    wk: "HotkeyManager",
    kk: "hotkeyManager",
    yk: "defineClassField",
    xk: "runAsync",
    hC: "SelectionTranslator",
    mC: "selectionTranslator",
    _C: "defineClassField",
    pC: "runAsync",
    EC: "SliderController",
    LC: "sliderController",
    NC: "defineClassField",
    PC: "runAsync",
    RC: "QuickTranslatorController",
    BC: "quickTranslator",
    IC: "defineClassField",
    zC: "runAsync",
    MC: "QuickTranslatorPanel",
    Hy: "DictionaryPage",
    yx: "ImmersiveTranslationSettings",
    kv: "SettingsHome",
    gw: "TranslationEngineSettings",
    ww: "AccountPage",
    Cw: "BrowserShortcutSettings",
    Tk: "CustomHotkeySettings",
    vk: "DualSubtitleSettings",
    Hw: "WordbookPage",
    lk: "VocabularyPage",
    xx: "FulltextWhitelistPage",
    Vy: "InterfaceLanguageSettings",
    Qy: "LearningLanguageSettings",
    ex: "TranslationLanguageSettings",
    nx: "VoiceSettings",
    ax: "SelectionTranslationSettings",
    hx: "WordHighlightStyleSettings",
    vx: "HighlightSiteRulesSettings",
    vw: "ThemeSettings",
    kw: "PremiumVoiceSettings",
    Sw: "LoginPage",
    jw: "SignupPage",
    Dw: "LanguageOnboardingPage",
    Yw: "WordDetailPanel",
    Yf: "WordActionButtons",
    mv: "SideNavigation",
    OT: "WordLookupCard",
    ZT: "SentenceTranslationCard",
    Lk: "initializeReaderRouter",
    jC: "SliderRoot",
    lo: "appStore",
    _k: "ControlCenterWidget",
    fk: "ControlCenterSettingsPanel",
    $a: "React",
    bi: "jsxRuntime",
    p_: "ReactDOMClient",
    Go: "ReduxProvider",
    is: "useAppSelector",
    Yc: "useApiClient",
    wu: "useDictionary",
    Gd: "useSseClient",
    yp: "useSpeech",
    Qf: "useWordSync",
    qk: "useDispatchBridge",
    Mk: "useSliderNavigation",
    Ok: "useLocale",
    Ik: "useToast",
    co: "createAppStore",
    no: "createCustomElementRoot",
    O_: "classNames",
    DC: "runCacheAsync",
    FC: "SUBTITLE_CACHE_STORE",
    HC: "openSubtitleCache",
    VC: "runStyleAsync",
    WC: "injectStylesheet",
    Qa: "collectShadowRoots",
    UC: "defineClassField",
    ZC: "runAsync",
  },
};

const PLAYER_METHOD_PARAMETERS = {
  constructor: ["video", "audio"],
  playAudio: ["start", "end"],
  mirror: ["target"],
  rate: ["playbackRate"],
  seek: ["time"],
  seekAutoPause: ["start", "end"],
  asyncPlayPart: ["start", "end"],
  cycle: ["start", "end"],
  backCycle: ["start", "end", "backwardMs"],
  repeat: ["start", "end", "delay"],
  on: ["eventName", "handler"],
  off: ["eventName", "handler"],
  preview: ["time"],
};

function parse(filename) {
  return parser.parse(fs.readFileSync(filename, "utf8"), {
    sourceType: "script",
    plugins: ["jsx"],
  });
}

function toActionIdentifier(actionType) {
  const base = actionType.split("/").pop();
  const identifier = base
    .replace(/[^A-Za-z0-9_$]+(.)/g, (_, character) => character.toUpperCase())
    .replace(/^[^A-Za-z_$]+/, "");
  return identifier ? `${identifier}Action` : null;
}

function inferActionCreatorNames(entryPath, semanticMap) {
  for (const [name, binding] of Object.entries(entryPath.scope.bindings)) {
    if (semanticMap[name] || !binding.path.isVariableDeclarator()) continue;
    const init = binding.path.node.init;
    if (
      !t.isCallExpression(init) ||
      !t.isIdentifier(init.callee) ||
      !["_i", "Re"].includes(init.callee.name) ||
      !t.isStringLiteral(init.arguments[0])
    ) {
      continue;
    }
    const inferredName = toActionIdentifier(init.arguments[0].value);
    if (inferredName) semanticMap[name] = inferredName;
  }
}

function getFunctionBodySize(functionPath) {
  return (
    functionPath.node.body &&
    functionPath.node.body.end - functionPath.node.body.start
  );
}

function findPrimaryEntryIife(ast) {
  const candidates = [];
  traverse(ast, {
    CallExpression(callPath) {
      const callee = callPath.get("callee");
      if (!callee.isArrowFunctionExpression() && !callee.isFunctionExpression())
        return;
      if (!callee.get("body").isBlockStatement()) return;
      candidates.push({
        path: callee,
        size: getFunctionBodySize(callee),
        statementCount: callee.node.body.body.length,
      });
    },
  });
  candidates.sort(
    (left, right) =>
      right.statementCount - left.statementCount || right.size - left.size,
  );
  if (!candidates.length) throw new Error("No entry IIFE found");
  return candidates[0].path;
}

function classMethodNames(classNode) {
  return new Set(
    classNode.body.body
      .filter((member) => t.isClassMethod(member) && t.isIdentifier(member.key))
      .map((member) => member.key.name),
  );
}

function findControllerClass(entryPath, requiredMethods) {
  let match = null;
  entryPath.traverse({
    Class(classPath) {
      const methods = classMethodNames(classPath.node);
      if (requiredMethods.every((method) => methods.has(method))) {
        match = classPath;
        classPath.stop();
      }
    },
  });
  if (!match)
    throw new Error(
      `Controller class not found (${requiredMethods.join(", ")})`,
    );
  return match;
}

function findClassForArtifact(entryPath, artifact) {
  if (!artifact.originalName) {
    return findControllerClass(entryPath, artifact.requiredMethods);
  }

  const binding = entryPath.scope.getBinding(artifact.originalName);
  if (!binding) throw new Error(`Binding ${artifact.originalName} not found`);
  if (binding.path.isClassDeclaration()) return binding.path;
  if (binding.path.isVariableDeclarator()) {
    const initPath = binding.path.get("init");
    if (initPath.isClassExpression()) return initPath;
    if (initPath.isNewExpression()) {
      const calleePath = initPath.get("callee");
      if (calleePath.isClassExpression()) return calleePath;
    }
  }
  throw new Error(`Binding ${artifact.originalName} is not backed by a class`);
}

function isReadOrWriteReference(identifierPath) {
  if (identifierPath.isReferencedIdentifier()) return true;
  const parent = identifierPath.parentPath;
  return Boolean(
    (parent.isAssignmentExpression() &&
      parent.get("left").node === identifierPath.node) ||
      (parent.isUpdateExpression() &&
        parent.get("argument").node === identifierPath.node),
  );
}

function renameUnboundIdentifiers(ast, semanticMap) {
  traverse(ast, {
    Identifier(identifierPath) {
      const nextName = semanticMap[identifierPath.node.name];
      if (!nextName || !isReadOrWriteReference(identifierPath)) return;
      if (identifierPath.scope.getBinding(identifierPath.node.name)) return;
      identifierPath.node.name = nextName;
    },
  });
}

const KNOWN_GLOBALS = new Set([
  "AbortController",
  "Array",
  "Audio",
  "Boolean",
  "Blob",
  "CustomEvent",
  "Date",
  "Document",
  "Element",
  "Error",
  "Event",
  "HTMLElement",
  "HTMLAnchorElement",
  "HTMLInputElement",
  "HTMLTextAreaElement",
  "IntersectionObserver",
  "Intl",
  "JSON",
  "Map",
  "Math",
  "MutationObserver",
  "Node",
  "NodeFilter",
  "Number",
  "Object",
  "Promise",
  "RegExp",
  "ResizeObserver",
  "Response",
  "Set",
  "String",
  "Text",
  "TextDecoder",
  "URL",
  "URLSearchParams",
  "WeakMap",
  "WeakSet",
  "arguments",
  "browser",
  "btoa",
  "chrome",
  "crypto",
  "clearInterval",
  "clearTimeout",
  "console",
  "decodeURIComponent",
  "document",
  "encodeURIComponent",
  "fetch",
  "globalThis",
  "indexedDB",
  "isNaN",
  "location",
  "navigator",
  "parseFloat",
  "parseInt",
  "queueMicrotask",
  "requestAnimationFrame",
  "setInterval",
  "setTimeout",
  "undefined",
  "window",
]);

function renameMethodParameters(ast, methodParameters) {
  if (!methodParameters) return;
  traverse(ast, {
    ClassMethod(methodPath) {
      if (!t.isIdentifier(methodPath.node.key)) return;
      const parameterNames = methodParameters[methodPath.node.key.name];
      if (!parameterNames) return;
      methodPath.node.params.forEach((parameter, index) => {
        const nextName = parameterNames[index];
        const identifier = t.isIdentifier(parameter)
          ? parameter
          : t.isAssignmentPattern(parameter) && t.isIdentifier(parameter.left)
            ? parameter.left
            : null;
        if (!identifier || !nextName || identifier.name === nextName) return;
        if (methodPath.scope.hasOwnBinding(nextName)) return;
        methodPath.scope.rename(identifier.name, nextName);
      });
    },
  });
}

function isWriteReference(identifierPath) {
  const parent = identifierPath.parentPath;
  return Boolean(
    (parent.isAssignmentExpression() &&
      parent.get("left").node === identifierPath.node) ||
      (parent.isUpdateExpression() &&
        parent.get("argument").node === identifierPath.node),
  );
}

function emitController({
  classPath,
  className,
  factoryName,
  semanticMap,
  mutable = [],
  instantiate = true,
  instantiateArgs = [],
  postClassCode = "",
  methodParameters,
}) {
  const classNode = t.cloneNode(classPath.node, true);
  const originalClassName = classNode.id && classNode.id.name;
  classNode.type = "ClassDeclaration";
  const classAst = t.file(t.program([classNode]));
  if (originalClassName && originalClassName !== className) {
    traverse(classAst, {
      ClassDeclaration(recoveredClassPath) {
        recoveredClassPath.scope.rename(originalClassName, className);
        recoveredClassPath.node.id = t.identifier(className);
        recoveredClassPath.stop();
      },
    });
  } else {
    classNode.id = t.identifier(className);
  }
  renameUnboundIdentifiers(classAst, semanticMap);
  renameMethodParameters(classAst, methodParameters);

  const renamedSource = generate(classAst, {
    comments: true,
    compact: false,
  }).code;
  const usedDependencies = new Set();
  const writtenDependencies = new Set();
  traverse(classAst, {
    Identifier(identifierPath) {
      if (!isReadOrWriteReference(identifierPath)) return;
      if (identifierPath.scope.getBinding(identifierPath.node.name)) return;
      if (!KNOWN_GLOBALS.has(identifierPath.node.name)) {
        usedDependencies.add(identifierPath.node.name);
        if (isWriteReference(identifierPath)) {
          writtenDependencies.add(identifierPath.node.name);
        }
      }
    },
  });

  const mutableSet = new Set([...mutable, ...writtenDependencies]);
  const constants = [...usedDependencies]
    .filter((name) => !mutableSet.has(name))
    .sort();
  const variables = [...usedDependencies]
    .filter((name) => mutableSet.has(name))
    .sort();
  const declarations = [
    ...variables.map((name) => `  let ${name} = dependencies.${name};`),
    ...constants.map((name) => `  const ${name} = dependencies.${name};`),
  ].join("\n");

  const returnExpression = instantiate
    ? `new ${className}(${instantiateArgs.join(", ")})`
    : className;
  return `/**\n * Semantic recovery of a scope-hoisted bundle class.\n *\n * Dependencies are injected because their original source-module boundaries were\n * erased by bundling. The class body preserves the recovered behavior.\n */\nexport function ${factoryName}(dependencies) {\n${declarations}\n\n${renamedSource
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n")}${
    postClassCode
      ? `\n\n${postClassCode
          .split("\n")
          .map((line) => `  ${line}`)
          .join("\n")}`
      : ""
  }\n\n  return ${returnExpression};\n}\n`;
}

function findFunctionForArtifact(entryPath, artifact) {
  const binding = entryPath.scope.getBinding(artifact.originalName);
  if (!binding) throw new Error(`Binding ${artifact.originalName} not found`);
  if (binding.path.isFunctionDeclaration()) return binding.path;
  if (binding.path.isVariableDeclarator()) {
    const initPath = binding.path.get("init");
    if (
      initPath.isFunctionExpression() ||
      initPath.isArrowFunctionExpression()
    ) {
      return initPath;
    }
  }
  throw new Error(
    `Binding ${artifact.originalName} is not backed by a function`,
  );
}

function emitFunctionArtifact({
  functionPath,
  functionName,
  factoryName,
  semanticMap,
  parameters = [],
}) {
  const originalName = functionPath.node.id
    ? functionPath.node.id.name
    : functionPath.parentPath.isVariableDeclarator() &&
        t.isIdentifier(functionPath.parentPath.node.id)
      ? functionPath.parentPath.node.id.name
      : null;
  const functionNode = t.cloneNode(functionPath.node, true);
  let declaration;
  if (t.isFunctionDeclaration(functionNode)) {
    declaration = functionNode;
  } else {
    declaration = t.variableDeclaration("const", [
      t.variableDeclarator(
        t.identifier(originalName || functionName),
        functionNode,
      ),
    ]);
  }
  const functionAst = t.file(t.program([declaration]));
  if (originalName && originalName !== functionName) {
    traverse(functionAst, {
      Program(programPath) {
        if (programPath.scope.hasBinding(originalName)) {
          programPath.scope.rename(originalName, functionName);
        }
      },
    });
  } else if (t.isFunctionDeclaration(declaration)) {
    declaration.id = t.identifier(functionName);
  } else {
    declaration.declarations[0].id = t.identifier(functionName);
  }

  renameUnboundIdentifiers(functionAst, semanticMap);
  traverse(functionAst, {
    Function(functionBindingPath) {
      if (functionBindingPath.getFunctionParent()) return;
      functionBindingPath.node.params.forEach((parameter, index) => {
        const nextName = parameters[index];
        const identifier = t.isIdentifier(parameter)
          ? parameter
          : t.isAssignmentPattern(parameter) && t.isIdentifier(parameter.left)
            ? parameter.left
            : null;
        if (!identifier || !nextName || identifier.name === nextName) return;
        if (!functionBindingPath.scope.hasOwnBinding(nextName)) {
          functionBindingPath.scope.rename(identifier.name, nextName);
        }
      });
      functionBindingPath.stop();
    },
  });

  const usedDependencies = new Set();
  const writtenDependencies = new Set();
  traverse(functionAst, {
    Identifier(identifierPath) {
      if (!isReadOrWriteReference(identifierPath)) return;
      if (identifierPath.scope.getBinding(identifierPath.node.name)) return;
      if (KNOWN_GLOBALS.has(identifierPath.node.name)) return;
      usedDependencies.add(identifierPath.node.name);
      if (isWriteReference(identifierPath)) {
        writtenDependencies.add(identifierPath.node.name);
      }
    },
  });
  const constants = [...usedDependencies]
    .filter((name) => !writtenDependencies.has(name))
    .sort();
  const variables = [...writtenDependencies].sort();
  const dependencyDeclarations = [
    ...variables.map((name) => `  let ${name} = dependencies.${name};`),
    ...constants.map((name) => `  const ${name} = dependencies.${name};`),
  ].join("\n");
  const recoveredSource = generate(functionAst, {
    comments: true,
    compact: false,
  }).code;

  return `/**\n * Semantic recovery of a scope-hoisted bundle function.\n */\nexport function ${factoryName}(dependencies) {\n${dependencyDeclarations}\n\n${recoveredSource
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n")}\n\n  return ${functionName};\n}\n`;
}

function emitExpressionArtifact({
  expressionPath,
  valueName,
  factoryName,
  semanticMap,
}) {
  const expressionNode = t.cloneNode(expressionPath.node, true);
  const originalName =
    expressionPath.parentPath.isVariableDeclarator() &&
    t.isIdentifier(expressionPath.parentPath.node.id)
      ? expressionPath.parentPath.node.id.name
      : valueName;
  const declaration = t.variableDeclaration("const", [
    t.variableDeclarator(t.identifier(originalName), expressionNode),
  ]);
  const expressionAst = t.file(t.program([declaration]));
  traverse(expressionAst, {
    Program(programPath) {
      if (
        originalName !== valueName &&
        programPath.scope.hasBinding(originalName)
      ) {
        programPath.scope.rename(originalName, valueName);
      }
    },
  });
  renameUnboundIdentifiers(expressionAst, semanticMap);

  const usedDependencies = new Set();
  const writtenDependencies = new Set();
  traverse(expressionAst, {
    Identifier(identifierPath) {
      if (!isReadOrWriteReference(identifierPath)) return;
      if (identifierPath.scope.getBinding(identifierPath.node.name)) return;
      if (KNOWN_GLOBALS.has(identifierPath.node.name)) return;
      usedDependencies.add(identifierPath.node.name);
      if (isWriteReference(identifierPath)) {
        writtenDependencies.add(identifierPath.node.name);
      }
    },
  });
  const constants = [...usedDependencies]
    .filter((name) => !writtenDependencies.has(name))
    .sort();
  const variables = [...writtenDependencies].sort();
  const dependencyDeclarations = [
    ...variables.map((name) => `  let ${name} = dependencies.${name};`),
    ...constants.map((name) => `  const ${name} = dependencies.${name};`),
  ].join("\n");
  const recoveredSource = generate(expressionAst, {
    comments: true,
    compact: false,
  }).code;

  return `/**\n * Semantic recovery of a scope-hoisted bundle value.\n */\nexport function ${factoryName}(dependencies) {\n${dependencyDeclarations}\n\n${recoveredSource
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n")}\n\n  return ${valueName};\n}\n`;
}

function findExpressionForArtifact(entryPath, artifact) {
  const binding = entryPath.scope.getBinding(artifact.originalName);
  if (!binding || !binding.path.isVariableDeclarator()) {
    throw new Error(`Expression binding ${artifact.originalName} not found`);
  }
  return binding.path.get("init");
}

function emitActionCreators(entryPath, semanticMap) {
  const actions = [];
  for (const [originalName, binding] of Object.entries(
    entryPath.scope.bindings,
  )) {
    if (!binding.path.isVariableDeclarator()) continue;
    const init = binding.path.node.init;
    if (
      !t.isCallExpression(init) ||
      !t.isIdentifier(init.callee) ||
      !["_i", "Re"].includes(init.callee.name) ||
      !t.isStringLiteral(init.arguments[0])
    ) {
      continue;
    }
    actions.push({
      name: semanticMap[originalName],
      type: init.arguments[0].value,
      line: binding.path.node.loc.start.line,
    });
  }
  actions.sort((left, right) => left.line - right.line);
  const declarations = actions
    .map(
      ({ name, type }) =>
        `  const ${name} = createAction(${JSON.stringify(type)});`,
    )
    .join("\n");
  const returnedNames = actions.map(({ name }) => `    ${name},`).join("\n");
  const typeEntries = actions
    .map(
      ({ name, type }) => `  ${JSON.stringify(name)}: ${JSON.stringify(type)},`,
    )
    .join("\n");
  return `/**\n * Action creators reconstructed from their preserved Redux action type strings.\n */\nexport const ACTION_TYPES = Object.freeze({\n${typeEntries}\n});\n\nexport function createActionCreators(createAction) {\n${declarations}\n\n  return {\n${returnedNames}\n  };\n}\n`;
}

function emitBackgroundMessageHandlers(entryPath, semanticMap) {
  const registrations = [];
  entryPath.traverse({
    CallExpression(callPath) {
      const callee = callPath.node.callee;
      if (
        !t.isMemberExpression(callee) ||
        !t.isIdentifier(callee.object, { name: "Qa" }) ||
        !t.isIdentifier(callee.property, { name: "on" }) ||
        !t.isStringLiteral(callPath.node.arguments[0]) ||
        !(
          t.isFunctionExpression(callPath.node.arguments[1]) ||
          t.isArrowFunctionExpression(callPath.node.arguments[1])
        )
      ) {
        return;
      }
      registrations.push({
        name: callPath.node.arguments[0].value,
        start: callPath.node.start,
        node: t.cloneNode(callPath.node, true),
      });
    },
  });
  registrations.sort((left, right) => left.start - right.start);
  const body = registrations.map(({ node }) => t.expressionStatement(node));
  const handlersAst = t.file(t.program(body));
  renameUnboundIdentifiers(handlersAst, {
    ...semanticMap,
    t: "handleShortcutCommand",
    n: "refreshUninstallUrl",
  });

  const usedDependencies = new Set();
  const writtenDependencies = new Set();
  traverse(handlersAst, {
    Identifier(identifierPath) {
      if (!isReadOrWriteReference(identifierPath)) return;
      if (identifierPath.scope.getBinding(identifierPath.node.name)) return;
      if (KNOWN_GLOBALS.has(identifierPath.node.name)) return;
      usedDependencies.add(identifierPath.node.name);
      if (isWriteReference(identifierPath)) {
        writtenDependencies.add(identifierPath.node.name);
      }
    },
  });
  const constants = [...usedDependencies]
    .filter((name) => !writtenDependencies.has(name))
    .sort();
  const variables = [...writtenDependencies].sort();
  const dependencyDeclarations = [
    ...variables.map((name) => `  let ${name} = dependencies.${name};`),
    ...constants.map((name) => `  const ${name} = dependencies.${name};`),
  ].join("\n");
  const recoveredSource = generate(handlersAst, {
    comments: true,
    compact: false,
  }).code;
  const names = registrations
    .map(({ name }) => JSON.stringify(name))
    .join(", ");

  return `/**\n * Recovered background message registrations.\n */\nexport const BACKGROUND_MESSAGE_NAMES = Object.freeze([${names}]);\n\nexport function registerBackgroundMessageHandlers(dependencies) {\n${dependencyDeclarations}\n\n${recoveredSource
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n")}\n\n  return BACKGROUND_MESSAGE_NAMES;\n}\n`;
}

function moduleImportId(binding) {
  if (!binding.path.isVariableDeclarator()) return null;
  const init = binding.path.node.init;
  if (
    t.isCallExpression(init) &&
    t.isIdentifier(init.callee, { name: "__webpack_require__" }) &&
    init.arguments.length &&
    (t.isNumericLiteral(init.arguments[0]) ||
      t.isStringLiteral(init.arguments[0]))
  ) {
    return String(init.arguments[0].value);
  }
  return null;
}

function classifySource(source) {
  if (
    source.length > 10000 &&
    /accountLogin|settingLanguage|caption_/.test(source)
  )
    return "localization";
  if (/createRoot|MutationObserver|document\.|window\./.test(source))
    return "browser-integration";
  if (/caption|subtitle/i.test(source)) return "captions";
  if (/translate|translation|translator/i.test(source)) return "translation";
  if (/\.jsx\)|\.jsxs\)|className:/.test(source)) return "react-ui";
  if (/dispatch|reducer|createStore|getState/.test(source)) return "state";
  if (/styled|Mui|data-emotion/.test(source)) return "styling";
  return "utility-or-domain";
}

function buildSymbolIndex(entryPath, source, semanticMap, moduleMap) {
  const labelsById = new Map(
    (moduleMap.modules || []).map((module) => [
      String(module.id),
      module.label,
    ]),
  );
  const bindings = Object.entries(entryPath.scope.bindings).map(
    ([name, binding]) => {
      const node = binding.path.node;
      const statement = binding.path.getStatementParent();
      const start = node.start == null ? statement.node.start : node.start;
      const end = node.end == null ? statement.node.end : node.end;
      const declarationSource = source.slice(start, end);
      const importId = moduleImportId(binding);
      let methods = [];
      if (binding.path.isClassDeclaration())
        methods = [...classMethodNames(binding.path.node)];
      if (
        binding.path.isVariableDeclarator() &&
        t.isClassExpression(binding.path.node.init)
      ) {
        methods = [...classMethodNames(binding.path.node.init)];
      }
      return {
        originalName: name,
        suggestedName: semanticMap[name] || null,
        kind: binding.kind,
        declarationType: binding.path.type,
        line: node.loc ? node.loc.start.line : null,
        endLine: node.loc ? node.loc.end.line : null,
        referenceCount: binding.referencePaths.length,
        domain: classifySource(declarationSource),
        webpackModule: importId
          ? { id: importId, label: labelsById.get(importId) || "module" }
          : null,
        methods,
      };
    },
  );
  bindings.sort((left, right) => (left.line || 0) - (right.line || 0));
  return bindings;
}

function writeJson(filename, value) {
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(filename, `${JSON.stringify(value, null, 2)}\n`);
}

function recoverBundleSemantics(bundleName, bundleConfig) {
  const bundleDir = path.join(root, "recovered", bundleName);
  const input = path.join(bundleDir, "bootstrap.readable.js");
  const source = fs.readFileSync(input, "utf8");
  const ast = parse(input);
  const entryPath = findPrimaryEntryIife(ast);
  const semanticMap = SEMANTIC_MAPS[bundleName];
  inferActionCreatorNames(entryPath, semanticMap);
  const moduleMap = JSON.parse(
    fs.readFileSync(path.join(bundleDir, "module-map.json"), "utf8"),
  );
  const symbolIndex = buildSymbolIndex(
    entryPath,
    source,
    semanticMap,
    moduleMap,
  );
  const outputDir = path.join(outputRoot, bundleConfig.outputDir);
  fs.mkdirSync(outputDir, { recursive: true });

  for (const artifact of bundleConfig.artifacts) {
    const artifactPath = path.join(outputDir, artifact.filename);
    fs.mkdirSync(path.dirname(artifactPath), { recursive: true });
    if (artifact.kind === "function") {
      const functionPath = findFunctionForArtifact(entryPath, artifact);
      fs.writeFileSync(
        artifactPath,
        emitFunctionArtifact({ functionPath, semanticMap, ...artifact }),
      );
    } else if (artifact.kind === "expression") {
      const expressionPath = findExpressionForArtifact(entryPath, artifact);
      fs.writeFileSync(
        artifactPath,
        emitExpressionArtifact({ expressionPath, semanticMap, ...artifact }),
      );
    } else if (artifact.kind === "actions") {
      fs.writeFileSync(
        artifactPath,
        emitActionCreators(entryPath, semanticMap),
      );
    } else if (artifact.kind === "message-handlers") {
      fs.writeFileSync(
        artifactPath,
        emitBackgroundMessageHandlers(entryPath, semanticMap),
      );
    } else {
      const classPath = findClassForArtifact(entryPath, artifact);
      fs.writeFileSync(
        artifactPath,
        emitController({ classPath, semanticMap, ...artifact }),
      );
    }
  }
  writeJson(path.join(outputDir, "symbol-index.json"), {
    source: path.relative(root, input).replace(/\\/g, "/"),
    symbolCount: symbolIndex.length,
    highConfidenceRenames: semanticMap,
    symbols: symbolIndex,
  });

  return {
    bundleName,
    symbolCount: symbolIndex.length,
    semanticMap,
    artifacts: bundleConfig.artifacts.map(
      (artifact) => `${bundleConfig.outputDir}/${artifact.filename}`,
    ),
  };
}

function recoverGlobalAssignment(bundleName, globalName, artifact) {
  const input = path.join(root, "recovered", bundleName, "bundle.readable.js");
  const ast = parse(input);
  let rightPath = null;
  traverse(ast, {
    AssignmentExpression(assignmentPath) {
      const left = assignmentPath.node.left;
      if (
        t.isMemberExpression(left) &&
        t.isIdentifier(left.object, { name: "window" }) &&
        t.isIdentifier(left.property, { name: globalName })
      ) {
        rightPath = assignmentPath.get("right");
        assignmentPath.stop();
      }
    },
  });
  if (!rightPath)
    throw new Error(`window.${globalName} not found in ${bundleName}`);

  const artifactPath = path.join(outputRoot, artifact.filename);
  fs.mkdirSync(path.dirname(artifactPath), { recursive: true });
  const semanticMap = artifact.semanticMap || {};
  const source =
    rightPath.isFunctionExpression() || rightPath.isArrowFunctionExpression()
      ? emitFunctionArtifact({
          functionPath: rightPath,
          semanticMap,
          ...artifact,
        })
      : emitExpressionArtifact({
          expressionPath: rightPath,
          semanticMap,
          ...artifact,
        });
  fs.writeFileSync(artifactPath, source);
  return artifact.filename;
}

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });

const video = recoverBundleSemantics("edvideo-main", {
  outputDir: "video",
  artifacts: [
    {
      filename: "VideoIntegrationController.js",
      className: "VideoIntegrationController",
      factoryName: "createVideoIntegrationController",
      requiredMethods: [
        "renderCaption",
        "renderCaptionInner",
        "renderApp",
        "addQuickButton",
      ],
      mutable: ["extensionClient"],
    },
    {
      filename: "VideoExtensionClient.js",
      originalName: "Os",
      className: "VideoExtensionClient",
      factoryName: "recoverVideoExtensionClientClass",
      requiredMethods: [
        "onKeyDown",
        "installHotkey",
        "translateWithEngine",
        "openPremiumLegacy",
      ],
      instantiate: false,
      methodParameters: {
        emit: ["name", "targets", "body"],
        on: ["name", "handler"],
        off: ["name"],
        dispatch: ["action", "notifyPage"],
        createWindow: ["options"],
        closeWindow: ["windowId"],
        open: ["url", "attachToken"],
        track: ["event"],
        openDashboard: ["url"],
        getStateChunks: ["options"],
        getState: ["forceRefresh"],
        toggle: ["status"],
        toggleSlider: ["path"],
        request: ["url", "init", "options"],
        translateWithEngine: ["payload"],
        sendNativeMessage: ["message"],
        openPremium: ["feature"],
        openPremiumLegacy: ["feature"],
      },
    },
    {
      filename: "CaptionProvider.js",
      originalName: "Hf",
      className: "CaptionProvider",
      factoryName: "createCaptionProvider",
      requiredMethods: [
        "onCaptionStreaming",
        "drivePretranslate",
        "appendStreamingLines",
        "evalSameLanguage",
      ],
      methodParameters: {
        onCaptionStreaming: ["lines"],
        seek: ["currentTime"],
        findSubtitle: ["currentTime"],
        normText: ["text"],
        setDomAnchor: ["text", "currentTime"],
        matchDomInLines: ["text", "currentTime"],
        dispatchTranslate: ["lines"],
        detectLinesLanguage: ["lines"],
        detectBatchLanguage: ["texts"],
        detectTextsLanguage: ["texts"],
        isSameLangLine: ["line"],
        setLookupAllowed: ["allowed"],
        setSameLanguage: ["sameLanguage"],
        setActiveLang: ["language"],
        appendStreamingLines: ["lines"],
        setSourceWaiting: ["waiting"],
      },
    },
    {
      filename: "translation/BaseCaptionLoader.js",
      originalName: "nh",
      className: "BaseCaptionLoader",
      factoryName: "recoverBaseCaptionLoaderClass",
      requiredMethods: ["cacheKeyOf", "preflight", "translate"],
      instantiate: false,
      methodParameters: {
        constructor: ["from", "to"],
        cacheKeyOf: ["texts", "from", "to"],
        addCache: ["key", "value"],
        getCache: ["key"],
        preflight: ["texts"],
        translate: ["texts"],
      },
    },
    {
      filename: "translation/CaptionTrackProcessor.js",
      originalName: "V_",
      className: "CaptionTrackProcessor",
      factoryName: "recoverCaptionTrackProcessorClass",
      requiredMethods: ["patchTranslation", "align", "tokenizeConcurrent"],
      instantiate: false,
    },
    {
      filename: "loaders/CaptionUploader.js",
      originalName: "hh",
      className: "CaptionUploader",
      factoryName: "recoverCaptionUploaderClass",
      requiredMethods: ["uploadOnly", "acquireJSON3", "downloadJSON3Caption"],
      instantiate: false,
    },
    {
      filename: "loaders/NetflixCaptionLoader.js",
      originalName: "xh",
      className: "NetflixCaptionLoader",
      factoryName: "recoverNetflixCaptionLoaderClass",
      requiredMethods: ["ensureSourceTrackSelected", "waitTimedText", "load"],
      instantiate: false,
    },
    {
      filename: "loaders/CourseraCaptionLoader.js",
      originalName: "Nh",
      className: "CourseraCaptionLoader",
      factoryName: "recoverCourseraCaptionLoaderClass",
      requiredMethods: ["getSubtitleURL", "download", "load"],
      instantiate: false,
    },
    {
      filename: "loaders/UdemyCaptionLoader.js",
      originalName: "Dh",
      className: "UdemyCaptionLoader",
      factoryName: "recoverUdemyCaptionLoaderClass",
      requiredMethods: ["getSubtitleURL", "fetchCaptionsFromAPI", "load"],
      instantiate: false,
    },
    {
      filename: "loaders/TedCaptionLoader.js",
      originalName: "Yh",
      className: "TedCaptionLoader",
      factoryName: "recoverTedCaptionLoaderClass",
      requiredMethods: ["load"],
      instantiate: false,
    },
    {
      filename: "loaders/HboCaptionLoader.js",
      originalName: "am",
      className: "HboCaptionLoader",
      factoryName: "recoverHboCaptionLoaderClass",
      requiredMethods: ["filterAdaptationSubtitles", "fetchSubtitles", "load"],
      instantiate: false,
    },
    {
      filename: "loaders/DisneyCaptionLoader.js",
      originalName: "hm",
      className: "DisneyCaptionLoader",
      factoryName: "recoverDisneyCaptionLoaderClass",
      requiredMethods: ["getStreamURLs", "fetchDisneySubtitles", "load"],
      instantiate: false,
    },
    {
      filename: "loaders/EdxCaptionLoader.js",
      originalName: "gm",
      className: "EdxCaptionLoader",
      factoryName: "recoverEdxCaptionLoaderClass",
      requiredMethods: ["download", "load"],
      instantiate: false,
    },
    {
      filename: "loaders/PrimeVideoCaptionLoader.js",
      originalName: "Am",
      className: "PrimeVideoCaptionLoader",
      factoryName: "recoverPrimeVideoCaptionLoaderClass",
      requiredMethods: ["waitSubtitleURLs", "parseTTML", "load"],
      instantiate: false,
    },
    {
      filename: "loaders/DeepLearningCaptionLoader.js",
      originalName: "Pm",
      className: "DeepLearningCaptionLoader",
      factoryName: "recoverDeepLearningCaptionLoaderClass",
      requiredMethods: ["waitSubtitle", "load"],
      instantiate: false,
    },
    {
      filename: "loaders/BilibiliCaptionLoader.js",
      originalName: "Mm",
      className: "BilibiliCaptionLoader",
      factoryName: "recoverBilibiliCaptionLoaderClass",
      requiredMethods: ["waitSubtitle", "load"],
      instantiate: false,
    },
    {
      filename: "players/BaseVideoPlayer.js",
      originalName: "Hm",
      className: "BaseVideoPlayer",
      factoryName: "recoverBaseVideoPlayerClass",
      requiredMethods: ["seek", "repeat", "emitChanged", "preview"],
      instantiate: false,
      methodParameters: PLAYER_METHOD_PARAMETERS,
    },
    {
      filename: "players/YouTubePlayer.js",
      originalName: "Vm",
      className: "YouTubePlayer",
      factoryName: "recoverYouTubePlayerClass",
      requiredMethods: ["skipAd", "preview"],
      instantiate: false,
      methodParameters: PLAYER_METHOD_PARAMETERS,
    },
    {
      filename: "players/NetflixPlayer.js",
      originalName: "Um",
      className: "NetflixPlayer",
      factoryName: "recoverNetflixPlayerClass",
      requiredMethods: ["player", "movieId", "repeat", "preview"],
      instantiate: false,
      methodParameters: PLAYER_METHOD_PARAMETERS,
    },
    {
      filename: "players/StandardHtml5Player.js",
      originalName: "Km",
      className: "StandardHtml5Player",
      factoryName: "recoverStandardHtml5PlayerClass",
      requiredMethods: [],
      instantiate: false,
    },
    {
      filename: "players/CourseraPlayer.js",
      originalName: "Zm",
      className: "CourseraPlayer",
      factoryName: "recoverCourseraPlayerClass",
      requiredMethods: ["restore"],
      instantiate: false,
    },
    {
      filename: "players/UdemyPlayer.js",
      originalName: "Jm",
      className: "UdemyPlayer",
      factoryName: "recoverUdemyPlayerClass",
      requiredMethods: ["rate", "play", "pause"],
      instantiate: false,
      methodParameters: PLAYER_METHOD_PARAMETERS,
    },
    {
      filename: "players/TedPlayer.js",
      originalName: "Xm",
      className: "TedPlayer",
      factoryName: "recoverTedPlayerClass",
      requiredMethods: [],
      instantiate: false,
    },
    {
      filename: "players/HboPlayer.js",
      originalName: "Qm",
      className: "HboPlayer",
      factoryName: "recoverHboPlayerClass",
      requiredMethods: ["restore", "offset"],
      instantiate: false,
    },
    {
      filename: "players/DisneyPlayer.js",
      originalName: "rg",
      className: "DisneyPlayer",
      factoryName: "recoverDisneyPlayerClass",
      requiredMethods: ["player", "playbackRate", "repeat", "preview"],
      instantiate: false,
      methodParameters: PLAYER_METHOD_PARAMETERS,
    },
    {
      filename: "players/EdxPlayer.js",
      originalName: "ig",
      className: "EdxPlayer",
      factoryName: "recoverEdxPlayerClass",
      requiredMethods: ["play", "pause"],
      instantiate: false,
    },
    {
      filename: "players/PrimeVideoPlayer.js",
      originalName: "ag",
      className: "PrimeVideoPlayer",
      factoryName: "recoverPrimeVideoPlayerClass",
      requiredMethods: [],
      instantiate: false,
    },
    {
      kind: "function",
      filename: "players/resolvePlatformPlayer.js",
      originalName: "og",
      functionName: "resolvePlatformPlayer",
      factoryName: "recoverResolvePlatformPlayer",
      parameters: ["platform"],
    },
    {
      kind: "actions",
      filename: "state/actionCreators.js",
    },
    {
      kind: "expression",
      filename: "state/initialState.js",
      originalName: "Ui",
      valueName: "initialState",
      factoryName: "recoverInitialState",
    },
    {
      kind: "expression",
      filename: "state/rootReducer.js",
      originalName: "ys",
      valueName: "rootReducer",
      factoryName: "recoverRootReducer",
    },
    {
      kind: "function",
      filename: "state/createAppStore.js",
      originalName: "ws",
      functionName: "createAppStore",
      factoryName: "recoverCreateAppStore",
      parameters: ["preloadedState"],
    },
    {
      kind: "function",
      filename: "ui/initializeVideoRouter.js",
      originalName: "sC",
      functionName: "initializeVideoRouter",
      factoryName: "recoverInitializeVideoRouter",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "ui/VideoLearningApp.js",
      originalName: "mA",
      functionName: "VideoLearningApp",
      factoryName: "recoverVideoLearningApp",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "ui/DualCaptionApp.js",
      originalName: "HA",
      functionName: "DualCaptionApp",
      factoryName: "recoverDualCaptionApp",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "ui/VideoToggleButton.js",
      originalName: "aj",
      functionName: "VideoToggleButton",
      factoryName: "recoverVideoToggleButton",
      parameters: ["props"],
    },
  ],
});

const reader = recoverBundleSemantics("edreader-main", {
  outputDir: "reader",
  artifacts: [
    {
      filename: "ReaderIntegrationController.js",
      className: "ReaderIntegrationController",
      factoryName: "createReaderIntegrationController",
      requiredMethods: ["bootstrap", "injectDevReloadButton"],
    },
    {
      filename: "ReaderExtensionClient.js",
      originalName: "Co",
      className: "ReaderExtensionClient",
      factoryName: "recoverReaderExtensionClientClass",
      requiredMethods: [
        "rebuildContextMenus",
        "rehighlight",
        "translateWithEngine",
        "openPremiumLegacy",
      ],
      instantiate: false,
      methodParameters: {
        emit: ["name", "targets", "body"],
        on: ["name", "handler"],
        off: ["name", "handler"],
        dispatch: ["action", "notifyPage"],
        createWindow: ["options"],
        closeWindow: ["windowId"],
        sendNativeMessage: ["message"],
        open: ["url", "attachToken"],
        openDashboard: ["url"],
        getStateChunks: ["options"],
        getState: ["forceRefresh"],
        handle: ["name", "event"],
        toggleSlider: ["path"],
        rebuildContextMenus: ["fulltextEnabled"],
        request: ["path", "init", "options"],
        translateWithEngine: ["payload"],
        track: ["event"],
        openPremium: ["feature"],
        openPremiumLegacy: ["feature"],
      },
    },
    {
      filename: "BaseImmersiveTranslator.js",
      originalName: "uw",
      className: "BaseImmersiveTranslator",
      factoryName: "recoverBaseImmersiveTranslatorClass",
      requiredMethods: [
        "initFulltextState",
        "duplicateUnit",
        "queryTranslationElements",
        "appendStyles",
      ],
      instantiate: false,
    },
    {
      filename: "ImmersiveTranslationService.js",
      originalName: "hw",
      className: "ImmersiveTranslationService",
      factoryName: "createImmersiveTranslationService",
      requiredMethods: [
        "translateIntersection",
        "translateDual",
        "handleTranslationHover",
        "disable",
      ],
      postClassCode:
        'ImmersiveTranslationService.ENGINE_WRAPPER_TAGS = new Set(["XT-MARK", "XT-DUAL", "XT-CONTENT", "XT-BR", "XT-TRANS"]);',
      methodParameters: {
        addUnit: ["unit"],
        translateIntersection: ["elements", "mode"],
        renderSentenceCard: ["element"],
        onChangeNode: ["nodes"],
        onChangeTextNodes: ["textNodes"],
        replaceTextNodes: ["nodes"],
        translateTranslation: ["elements"],
        sliceBySize: ["items", "maxSize"],
        translateDual: ["elements"],
        splitLongText: ["text", "maxLength"],
        translateWithEngine: ["payload"],
        reload: ["mode"],
      },
    },
    {
      filename: "fulltext/FulltextRuleResolver.js",
      originalName: "Ex",
      className: "FulltextRuleResolver",
      factoryName: "recoverFulltextRuleResolverClass",
      requiredMethods: [
        "syncRules",
        "fetchRulesFromServer",
        "getStylesheetSrc",
      ],
      instantiate: false,
      postClassCode: "FulltextRuleResolver.RULES_FORMAT_VERSION = 6;",
    },
    {
      filename: "fulltext/DisplayModeDetector.js",
      originalName: "Ox",
      className: "DisplayModeDetector",
      factoryName: "recoverDisplayModeDetectorClass",
      requiredMethods: [
        "isCJKDominant",
        "isLongEnoughForBlock",
        "classifyDisplayMode",
      ],
      instantiate: false,
      postClassCode:
        'DisplayModeDetector.HEADING_TAGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);\nDisplayModeDetector.MINOR_HEADING_TAGS = new Set(["H4", "H5", "H6"]);',
    },
    {
      filename: "fulltext/TranslationRenderer.js",
      originalName: "Dx",
      className: "TranslationRenderer",
      factoryName: "recoverTranslationRendererClass",
      requiredMethods: [
        "createDualElement",
        "sanitizeTranslatedHTML",
        "clearDualElementStorage",
      ],
      instantiate: false,
      postClassCode:
        "TranslationRenderer.TAG_REGEX = /<\\/?([a-zA-Z][a-zA-Z0-9-]*)[^>]*>/g;",
    },
    {
      filename: "fulltext/TranslationUnitExtractor.js",
      originalName: "aw",
      className: "TranslationUnitExtractor",
      factoryName: "recoverTranslationUnitExtractorClass",
      requiredMethods: [
        "buildExtractPayload",
        "buildSegments",
        "queryTranslationElements",
      ],
      instantiate: false,
      postClassCode:
        "TranslationUnitExtractor.SKIP_PATTERN = /^[\\d\\s.,:%+\\-\\xb7\\/\\\\:\\uff1a()\\uff08\\uff09kKmMbB\\u4e07\\u4ebf]+$/;\n" +
        'TranslationUnitExtractor.PRESERVE_INLINE_EXCLUDED = new Set(["CODE", "KBD", "SAMP", "VAR"]);\n' +
        'TranslationUnitExtractor.CLEAN_TEXT_SKIP_TAGS = new Set(["STYLE", "SCRIPT", "SVG", "PRE", "CODE", "KBD", "SAMP", "TEXTAREA", "INPUT", "SELECT", "HEAD", "MATH-RENDERER", "RUBY", "RP", "RT", "XT-CONTENT"]);\n' +
        "TranslationUnitExtractor.splitOrigin = new WeakMap();\n" +
        "TranslationUnitExtractor.splitResidue = new WeakMap();\n" +
        'TranslationUnitExtractor.TECHNICAL_EXCLUDE_SELECTORS = new Set(["input", "select", "textarea", "form", "svg", "pre", "script", "style", "head", "i", "code", "math-renderer", "rp", "rt", "kbd", "ruby", "trancy-app", "trancy-caption-window", "font.xt-dual", "xt-dual", "x-p", "relin-hc", "#trancy-root", ".xt-ignore", ".rd-slider-inside"]);',
    },
    {
      filename: "highlight/EnglishPosTokenizer.js",
      originalName: "n_",
      className: "EnglishPosTokenizer",
      factoryName: "recoverEnglishPosTokenizerClass",
      requiredMethods: ["tokenize"],
      instantiate: false,
      methodParameters: { tokenize: ["text"] },
    },
    {
      filename: "highlight/GenericWordTokenizer.js",
      originalName: "r_",
      className: "GenericWordTokenizer",
      factoryName: "recoverGenericWordTokenizerClass",
      requiredMethods: ["tokenize"],
      instantiate: false,
      methodParameters: { tokenize: ["text"] },
    },
    {
      filename: "highlight/DictionaryWordTokenizer.js",
      originalName: "i_",
      className: "DictionaryWordTokenizer",
      factoryName: "recoverDictionaryWordTokenizerClass",
      requiredMethods: ["tokenize", "updateWordSet"],
      instantiate: false,
      methodParameters: {
        constructor: ["wordMap"],
        tokenize: ["text"],
        updateWordSet: ["wordMap"],
      },
    },
    {
      filename: "highlight/VocabularyHighlighter.js",
      originalName: "d_",
      className: "VocabularyHighlighter",
      factoryName: "createVocabularyHighlighter",
      requiredMethods: [
        "bootstrap",
        "highlightWord",
        "unhighlightWord",
        "highlightNodes",
      ],
      methodParameters: {
        onChangeNode: ["nodes"],
        intersectionListener: ["entries"],
        highlightWord: ["word"],
        unhighlightWord: ["text"],
        markHTML: ["html", "pattern", "replacement"],
        getStyle: ["state"],
        highlightNodes: ["nodes"],
      },
    },
    {
      filename: "control/ControlCenterManager.js",
      originalName: "gk",
      className: "ControlCenterManager",
      factoryName: "createControlCenterManager",
      requiredMethods: [
        "mount",
        "unmount",
        "reRenderControlCenter",
        "renderControlCenter",
      ],
      methodParameters: { mount: ["tagName"], unmount: ["tagName"] },
    },
    {
      filename: "hotkeys/HotkeyManager.js",
      originalName: "wk",
      className: "HotkeyManager",
      factoryName: "createHotkeyManager",
      requiredMethods: ["updateShortcuts", "initHotkey"],
    },
    {
      filename: "selection/SelectionTranslator.js",
      originalName: "hC",
      className: "SelectionTranslator",
      factoryName: "createSelectionTranslator",
      requiredMethods: [
        "bootstrap",
        "getSelection",
        "onPopup",
        "renderCard",
        "unmount",
      ],
      methodParameters: {
        loading: ["box", "runtime", "selectionType"],
        getParentInnerText: ["element", "minimumLength"],
        getRangeBox: ["range", "mouseEvent"],
        getContextElementByAnchorNode: ["node"],
        getSentenceByWord: ["context", "word", "selection"],
        getSectionType: ["text", "language"],
        onPopup: ["options"],
        renderCard: ["options"],
      },
    },
    {
      filename: "slider/SliderController.js",
      originalName: "EC",
      className: "SliderController",
      factoryName: "recoverSliderControllerClass",
      requiredMethods: ["mountSlider", "mount", "unmountNow", "unmount"],
      instantiate: false,
      methodParameters: { mount: ["path"] },
      postClassCode:
        'SliderController.CLOSE_FALLBACK_MS = 320;\nSliderController.CLOSE_ANIMATION = "slider-right";',
    },
    {
      filename: "quick/QuickTranslatorController.js",
      originalName: "RC",
      className: "QuickTranslatorController",
      factoryName: "createQuickTranslatorController",
      requiredMethods: [
        "mount",
        "fillBack",
        "isFillableElement",
        "getSelectedText",
      ],
      methodParameters: {
        mount: ["path"],
        fillBack: ["text"],
        isFillableElement: ["element"],
        setNativeValue: ["element", "value"],
        emitInputEvents: ["element"],
      },
    },
    {
      kind: "function",
      filename: "quick/QuickTranslatorPanel.js",
      originalName: "MC",
      functionName: "QuickTranslatorPanel",
      factoryName: "recoverQuickTranslatorPanel",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "control/ControlCenterWidget.js",
      originalName: "_k",
      functionName: "ControlCenterWidget",
      factoryName: "recoverControlCenterWidget",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "control/ControlCenterSettingsPanel.js",
      originalName: "fk",
      functionName: "ControlCenterSettingsPanel",
      factoryName: "recoverControlCenterSettingsPanel",
      parameters: ["props"],
    },
    {
      kind: "expression",
      filename: "hooks/useAppSelector.js",
      originalName: "is",
      valueName: "useAppSelector",
      factoryName: "recoverUseAppSelector",
    },
    {
      kind: "function",
      filename: "hooks/useApiClient.js",
      originalName: "Yc",
      functionName: "useApiClient",
      factoryName: "recoverUseApiClient",
      parameters: ["useExtensionContext"],
    },
    {
      kind: "function",
      filename: "hooks/useDictionary.js",
      originalName: "wu",
      functionName: "useDictionary",
      factoryName: "recoverUseDictionary",
      parameters: ["useExtensionContext", "dispatch"],
    },
    {
      kind: "function",
      filename: "hooks/useSseClient.js",
      originalName: "Gd",
      functionName: "useSseClient",
      factoryName: "recoverUseSseClient",
      parameters: ["options"],
    },
    {
      kind: "function",
      filename: "hooks/useSpeech.js",
      originalName: "yp",
      functionName: "useSpeech",
      factoryName: "recoverUseSpeech",
    },
    {
      kind: "function",
      filename: "hooks/useWordSync.js",
      originalName: "Qf",
      functionName: "useWordSync",
      factoryName: "recoverUseWordSync",
    },
    {
      kind: "function",
      filename: "hooks/useDispatchBridge.js",
      originalName: "qk",
      functionName: "useDispatchBridge",
      factoryName: "recoverUseDispatchBridge",
    },
    {
      kind: "function",
      filename: "hooks/useSliderNavigation.js",
      originalName: "Mk",
      functionName: "useSliderNavigation",
      factoryName: "recoverUseSliderNavigation",
    },
    {
      kind: "function",
      filename: "hooks/useLocale.js",
      originalName: "Ok",
      functionName: "useLocale",
      factoryName: "recoverUseLocale",
    },
    {
      kind: "function",
      filename: "hooks/useToast.js",
      originalName: "Ik",
      functionName: "useToast",
      factoryName: "recoverUseToast",
    },
    {
      kind: "function",
      filename: "pages/DictionaryPage.js",
      originalName: "Hy",
      functionName: "DictionaryPage",
      factoryName: "recoverDictionaryPage",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "pages/ImmersiveTranslationSettings.js",
      originalName: "yx",
      functionName: "ImmersiveTranslationSettings",
      factoryName: "recoverImmersiveTranslationSettings",
    },
    {
      kind: "function",
      filename: "pages/SettingsHome.js",
      originalName: "kv",
      functionName: "SettingsHome",
      factoryName: "recoverSettingsHome",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "pages/TranslationEngineSettings.js",
      originalName: "gw",
      functionName: "TranslationEngineSettings",
      factoryName: "recoverTranslationEngineSettings",
    },
    {
      kind: "function",
      filename: "pages/AccountPage.js",
      originalName: "ww",
      functionName: "AccountPage",
      factoryName: "recoverAccountPage",
    },
    {
      kind: "function",
      filename: "pages/BrowserShortcutSettings.js",
      originalName: "Cw",
      functionName: "BrowserShortcutSettings",
      factoryName: "recoverBrowserShortcutSettings",
    },
    {
      kind: "function",
      filename: "pages/CustomHotkeySettings.js",
      originalName: "Tk",
      functionName: "CustomHotkeySettings",
      factoryName: "recoverCustomHotkeySettings",
    },
    {
      kind: "function",
      filename: "pages/DualSubtitleSettings.js",
      originalName: "vk",
      functionName: "DualSubtitleSettings",
      factoryName: "recoverDualSubtitleSettings",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "pages/WordbookPage.js",
      originalName: "Hw",
      functionName: "WordbookPage",
      factoryName: "recoverWordbookPage",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "pages/VocabularyPage.js",
      originalName: "lk",
      functionName: "VocabularyPage",
      factoryName: "recoverVocabularyPage",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "pages/FulltextWhitelistPage.js",
      originalName: "xx",
      functionName: "FulltextWhitelistPage",
      factoryName: "recoverFulltextWhitelistPage",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "pages/InterfaceLanguageSettings.js",
      originalName: "Vy",
      functionName: "InterfaceLanguageSettings",
      factoryName: "recoverInterfaceLanguageSettings",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "pages/LearningLanguageSettings.js",
      originalName: "Qy",
      functionName: "LearningLanguageSettings",
      factoryName: "recoverLearningLanguageSettings",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "pages/TranslationLanguageSettings.js",
      originalName: "ex",
      functionName: "TranslationLanguageSettings",
      factoryName: "recoverTranslationLanguageSettings",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "pages/VoiceSettings.js",
      originalName: "nx",
      functionName: "VoiceSettings",
      factoryName: "recoverVoiceSettings",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "pages/SelectionTranslationSettings.js",
      originalName: "ax",
      functionName: "SelectionTranslationSettings",
      factoryName: "recoverSelectionTranslationSettings",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "pages/WordHighlightStyleSettings.js",
      originalName: "hx",
      functionName: "WordHighlightStyleSettings",
      factoryName: "recoverWordHighlightStyleSettings",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "pages/HighlightSiteRulesSettings.js",
      originalName: "vx",
      functionName: "HighlightSiteRulesSettings",
      factoryName: "recoverHighlightSiteRulesSettings",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "pages/ThemeSettings.js",
      originalName: "vw",
      functionName: "ThemeSettings",
      factoryName: "recoverThemeSettings",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "pages/PremiumVoiceSettings.js",
      originalName: "kw",
      functionName: "PremiumVoiceSettings",
      factoryName: "recoverPremiumVoiceSettings",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "pages/LoginPage.js",
      originalName: "Sw",
      functionName: "LoginPage",
      factoryName: "recoverLoginPage",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "pages/SignupPage.js",
      originalName: "jw",
      functionName: "SignupPage",
      factoryName: "recoverSignupPage",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "pages/LanguageOnboardingPage.js",
      originalName: "Dw",
      functionName: "LanguageOnboardingPage",
      factoryName: "recoverLanguageOnboardingPage",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "pages/WordDetailPanel.js",
      originalName: "Yw",
      functionName: "WordDetailPanel",
      factoryName: "recoverWordDetailPanel",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "components/WordActionButtons.js",
      originalName: "Yf",
      functionName: "WordActionButtons",
      factoryName: "recoverWordActionButtons",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "components/SideNavigation.js",
      originalName: "mv",
      functionName: "SideNavigation",
      factoryName: "recoverSideNavigation",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "cards/WordLookupCard.js",
      originalName: "OT",
      functionName: "WordLookupCard",
      factoryName: "recoverWordLookupCard",
      parameters: ["props"],
    },
    {
      kind: "function",
      filename: "cards/SentenceTranslationCard.js",
      originalName: "ZT",
      functionName: "SentenceTranslationCard",
      factoryName: "recoverSentenceTranslationCard",
      parameters: ["props"],
    },
  ],
});

const background = recoverBundleSemantics("background", {
  outputDir: "background",
  artifacts: [
    {
      filename: "BrowserApi.js",
      originalName: "Ka",
      className: "BrowserApi",
      factoryName: "createBrowserApi",
      requiredMethods: [
        "runtime",
        "contextMenus",
        "sendNativeMessage",
        "onPopup",
      ],
      methodParameters: {
        sendNativeMessage: ["message"],
        onPopup: ["handler"],
      },
    },
    {
      filename: "BackgroundMessageBus.js",
      originalName: "Qa",
      className: "BackgroundMessageBus",
      factoryName: "createBackgroundMessageBus",
      requiredMethods: ["emit", "on", "response"],
      instantiateArgs: ['"background"'],
      methodParameters: {
        constructor: ["clientName"],
        emit: ["name", "targets", "body"],
        on: ["name", "handler"],
        response: ["event"],
      },
    },
    {
      kind: "message-handlers",
      filename: "messages/registerBackgroundMessageHandlers.js",
    },
    {
      kind: "actions",
      filename: "state/actionCreators.js",
    },
    {
      kind: "expression",
      filename: "state/initialState.js",
      originalName: "sn",
      valueName: "initialState",
      factoryName: "recoverBackgroundInitialState",
    },
    {
      kind: "expression",
      filename: "state/rootReducer.js",
      originalName: "La",
      valueName: "rootReducer",
      factoryName: "recoverBackgroundRootReducer",
    },
    {
      kind: "expression",
      filename: "state/guardedStorage.js",
      originalName: "Ft",
      valueName: "guardedStorage",
      factoryName: "recoverGuardedStorage",
    },
    {
      kind: "expression",
      filename: "state/persistConfig.js",
      originalName: "ja",
      valueName: "persistConfig",
      factoryName: "recoverPersistConfig",
    },
    {
      kind: "expression",
      filename: "state/persistedReducer.js",
      originalName: "Ha",
      valueName: "persistedReducer",
      factoryName: "recoverPersistedReducer",
    },
    {
      kind: "expression",
      filename: "state/store.js",
      originalName: "Da",
      valueName: "store",
      factoryName: "recoverBackgroundStore",
    },
    {
      filename: "translation/LruCache.js",
      originalName: "hi",
      className: "LruCache",
      factoryName: "recoverLruCacheClass",
      requiredMethods: ["get", "set", "clearScope"],
      instantiate: false,
      methodParameters: {
        constructor: ["capacity"],
        get: ["key"],
        set: ["key", "value"],
        addToHead: ["node"],
        moveToHead: ["node"],
        delete: ["key"],
        clearScope: ["scope"],
      },
    },
    {
      filename: "translation/LegacyTranslationService.js",
      originalName: "Ii",
      className: "LegacyTranslationService",
      factoryName: "recoverLegacyTranslationServiceClass",
      requiredMethods: [
        "translate",
        "translateWithAI",
        "translateWithGoogle",
        "translateWithDeepL",
      ],
      instantiate: false,
      methodParameters: {
        constructor: ["options"],
        translate: ["request"],
        translateWithAI: ["request"],
        translateWithSingle: ["request"],
        createMessages: ["request"],
        createSingleMessages: ["request"],
        makeRequest: ["request", "messages"],
        translateWithLegacyCloud: ["request"],
        preserveNewlines: ["text"],
        restoreNewlines: ["text"],
        translateWithGoogle: ["texts", "from", "to"],
        translateWithGoogleChunk: ["texts", "from", "to"],
        translateWithDeepL: ["request"],
      },
    },
    {
      filename: "translation/RequestQueue.js",
      originalName: "Si",
      className: "RequestQueue",
      factoryName: "recoverRequestQueueClass",
      requiredMethods: ["enqueue", "pump", "execute"],
      instantiate: false,
      methodParameters: {
        constructor: ["maxConcurrent"],
        enqueue: ["task"],
        execute: ["entry"],
      },
    },
    {
      filename: "translation/AuthResolver.js",
      originalName: "ji",
      className: "AuthResolver",
      factoryName: "recoverAuthResolverClass",
      requiredMethods: ["resolve", "getCachedToken"],
      instantiate: false,
      methodParameters: {
        resolve: ["request"],
        getCachedToken: ["cacheKey", "loader"],
      },
    },
    {
      filename: "translation/adapters/OpenAiChatAdapter.js",
      originalName: "Ls",
      className: "OpenAiChatAdapter",
      factoryName: "recoverOpenAiChatAdapterClass",
      requiredMethods: ["execute"],
      instantiate: false,
      methodParameters: {
        constructor: ["authResolver"],
        execute: ["resolvedEngine", "request"],
      },
    },
    {
      filename: "translation/adapters/AnthropicAdapter.js",
      originalName: "zs",
      className: "AnthropicAdapter",
      factoryName: "recoverAnthropicAdapterClass",
      requiredMethods: ["execute"],
      instantiate: false,
      methodParameters: {
        constructor: ["authResolver"],
        execute: ["resolvedEngine", "request"],
      },
    },
    {
      filename: "translation/adapters/GeminiAdapter.js",
      originalName: "Qs",
      className: "GeminiAdapter",
      factoryName: "recoverGeminiAdapterClass",
      requiredMethods: ["execute"],
      instantiate: false,
      methodParameters: {
        constructor: ["authResolver"],
        execute: ["resolvedEngine", "request"],
      },
    },
    {
      filename: "translation/adapters/DeepLAdapter.js",
      originalName: "nl",
      className: "DeepLAdapter",
      factoryName: "recoverDeepLAdapterClass",
      requiredMethods: ["execute"],
      instantiate: false,
      methodParameters: {
        constructor: ["authResolver"],
        execute: ["resolvedEngine", "request"],
      },
    },
    {
      filename: "translation/adapters/LegacyMachineTranslationAdapter.js",
      originalName: "hl",
      className: "LegacyMachineTranslationAdapter",
      factoryName: "recoverLegacyMachineTranslationAdapterClass",
      requiredMethods: ["execute", "google", "microsoft"],
      instantiate: false,
      methodParameters: {
        constructor: ["authResolver"],
        execute: ["resolvedEngine", "request"],
        google: ["resolvedEngine", "request"],
        microsoft: ["resolvedEngine", "request"],
      },
    },
    {
      filename: "translation/TranslationEngineExecutor.js",
      originalName: "Cl",
      className: "TranslationEngineExecutor",
      factoryName: "recoverTranslationEngineExecutorClass",
      requiredMethods: [
        "translate",
        "runTranslation",
        "translateWithAi",
        "recoverSegments",
      ],
      instantiate: false,
      methodParameters: {
        constructor: ["dependencies"],
        translate: ["request"],
        runTranslation: ["request"],
        translateWithLegacy: ["request"],
        buildDirectRequest: ["request"],
        microsoftFallbackViaGoogle: ["request", "catalog", "useProxy"],
        translateWithAi: ["adapter", "request", "resolvedEngine"],
        recoverSegments: [
          "adapter",
          "request",
          "resolvedEngine",
          "promptPack",
          "indexes",
        ],
        translateOne: [
          "adapter",
          "request",
          "resolvedEngine",
          "promptPack",
          "index",
        ],
        buildAiRequest: ["request", "resolvedEngine", "promptPack", "scenario"],
        coalesce: ["result", "texts"],
      },
    },
    {
      filename: "cache/IndexedDbCache.js",
      originalName: "uu",
      className: "IndexedDbCache",
      factoryName: "recoverIndexedDbCacheClass",
      requiredMethods: ["init", "set", "get", "cleanExpired", "clearAll"],
      instantiate: false,
      methodParameters: {
        constructor: ["dbName", "storeName"],
        set: ["key", "value", "ttlSeconds"],
        get: ["key"],
        delete: ["key"],
      },
    },
    {
      filename: "analytics/AnalyticsClient.js",
      originalName: "bu",
      className: "AnalyticsClient",
      factoryName: "createAnalyticsClient",
      requiredMethods: [
        "updateMetadata",
        "getSessionId",
        "findAndUpsertUUID",
        "track",
      ],
    },
    {
      kind: "function",
      filename: "contextMenus/rebuildContextMenus.js",
      originalName: "eu",
      functionName: "rebuildContextMenus",
      factoryName: "recoverRebuildContextMenus",
      parameters: ["fulltextEnabled"],
    },
    {
      kind: "function",
      filename: "contextMenus/toggleImmersiveSiteRule.js",
      originalName: "rc",
      functionName: "toggleImmersiveSiteRule",
      factoryName: "recoverToggleImmersiveSiteRule",
      parameters: ["url", "action"],
    },
    {
      kind: "function",
      filename: "popup/configurePopupForTab.js",
      originalName: "au",
      functionName: "configurePopupForTab",
      factoryName: "recoverConfigurePopupForTab",
      parameters: ["tab"],
    },
    {
      kind: "function",
      filename: "popup/getPopupContext.js",
      originalName: "ou",
      functionName: "getPopupContext",
      factoryName: "recoverGetPopupContext",
    },
    {
      kind: "function",
      filename: "state/getHydratedState.js",
      originalName: "Ya",
      functionName: "getHydratedState",
      factoryName: "recoverGetHydratedState",
    },
    {
      kind: "function",
      filename: "translation/preloadTranslationConfiguration.js",
      originalName: "Al",
      functionName: "preloadTranslationConfiguration",
      factoryName: "recoverPreloadTranslationConfiguration",
    },
  ],
});

const popup = recoverBundleSemantics("popup", {
  outputDir: "popup",
  artifacts: [
    {
      kind: "function",
      filename: "PopupApp.js",
      originalName: "w",
      functionName: "PopupApp",
      factoryName: "recoverPopupApp",
    },
    {
      kind: "function",
      filename: "detectUiLanguage.js",
      originalName: "k",
      functionName: "detectUiLanguage",
      factoryName: "recoverDetectUiLanguage",
    },
    {
      kind: "function",
      filename: "openExtensionPage.js",
      originalName: "S",
      functionName: "openExtensionPage",
      factoryName: "recoverOpenExtensionPage",
      parameters: ["url"],
    },
    {
      kind: "expression",
      filename: "restrictedUrlPatterns.js",
      originalName: "T",
      valueName: "RESTRICTED_URL_PATTERNS",
      factoryName: "recoverRestrictedUrlPatterns",
    },
  ],
});

const languageArtifacts = [
  recoverGlobalAssignment("ld-main", "detectLanguage", {
    filename: "language/detectLanguage.js",
    functionName: "detectLanguage",
    factoryName: "recoverDetectLanguage",
    parameters: ["text"],
  }),
  recoverGlobalAssignment("romanize-main", "romanize", {
    filename: "language/romanize.js",
    valueName: "romanize",
    factoryName: "recoverRomanize",
    semanticMap: {
      Ri: "romanizeKorean",
      gn: "isKanji",
      on: "toHiragana",
      qn: "toRomaji",
      Zi: "romanizeChinese",
    },
  }),
  recoverGlobalAssignment("tagger-main", "posTagger", {
    filename: "language/posTagger.js",
    valueName: "posTagger",
    factoryName: "recoverPosTagger",
  }),
];

const cssInputs = [
  "byok.css",
  "edreader.css",
  "eduser.css",
  "edvideo.css",
  "popup-style.css",
  "site-rules.css",
  "subtitle-ai.css",
];
const styleArtifacts = cssInputs.map((filename) => {
  const output = path.join(outputRoot, "styles", filename);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.copyFileSync(path.join(root, "assets", filename), output);
  return `styles/${filename}`;
});

const lifecycleArtifact = "background/lifecycle/registerBackgroundLifecycle.js";
const lifecyclePath = path.join(outputRoot, lifecycleArtifact);
fs.mkdirSync(path.dirname(lifecyclePath), { recursive: true });
fs.writeFileSync(
  lifecyclePath,
  `/**\n * Semantically recovered extension lifecycle and command registration.\n */\nexport function registerBackgroundLifecycle(dependencies) {\n  const {\n    analyticsClient,\n    browserApi,\n    backgroundMessageBus,\n    preloadTranslationConfiguration,\n    rebuildContextMenus,\n    rehydrationPromise,\n    setStatsValueAction,\n    store,\n  } = dependencies;\n\n  async function handleShortcutCommand(command) {\n    switch (command) {\n      case "toggle":\n        await backgroundMessageBus.emit("toggle", ["content"]);\n        return analyticsClient.track("shortcut_toggle");\n      case "fulltext-translate":\n        await backgroundMessageBus.emit("fulltext-translation", ["content"]);\n        return analyticsClient.track("shortcut_fulltext_translate");\n      case "quick-translator":\n        await backgroundMessageBus.emit("quick-translator", ["content"]);\n        return analyticsClient.track("shortcut_quick_translator");\n      case "ai-transcribe":\n        await backgroundMessageBus.emit("ai-transcribe", ["content"]);\n        return analyticsClient.track("shortcut_ai_transcribe");\n      case "caption-toggle":\n        await backgroundMessageBus.emit("caption-toggle", ["content"]);\n        return analyticsClient.track("shortcut_caption_toggle");\n    }\n  }\n\n  if (browserApi.platform !== "safari") {\n    browserApi.commands.onCommand.addListener(handleShortcutCommand);\n  } else {\n    backgroundMessageBus.on("shortcut", ({ body }) =>\n      handleShortcutCommand(body.command),\n    );\n  }\n\n  browserApi.onPopup(() => {\n    backgroundMessageBus.emit("toggleSlider", ["content"], { path: "/" });\n    analyticsClient.track("popup_open");\n  });\n\n  browserApi.runtime.onInstalled.addListener(async ({ reason }) => {\n    if (reason === "install") {\n      await preloadTranslationConfiguration();\n      store.dispatch(setStatsValueAction({ key: "installAt", value: Date.now() }));\n      analyticsClient.track("extension_install");\n    } else if (reason === "update") {\n      await chrome.storage.local.set({ ga_activation_complete: true });\n      await preloadTranslationConfiguration();\n    }\n  });\n\n  const initialized = (async () => {\n    await rebuildContextMenus(true);\n    await rehydrationPromise;\n    analyticsClient.updateMetadata(store.getState());\n  })();\n\n  return { handleShortcutCommand, initialized };\n}\n`,
);

fs.mkdirSync(path.join(outputRoot, "shared"), { recursive: true });
fs.writeFileSync(
  path.join(outputRoot, "shared", "clearScopedCache.js"),
  `const VALID_CACHE_SCOPES = new Set([\n  "ai-subtitle",\n  "subtitle",\n  "immersive",\n  "selection",\n  "quick",\n]);\n\nfunction setCacheButtonsBusy(scope, busyText) {\n  const buttons = Array.from(\n    document.querySelectorAll(\`[data-lexihalo-cache-scope="\${scope}"]\`),\n  );\n  const labels = buttons.map((button) => button.querySelector("span") || button);\n\n  buttons.forEach((button) => {\n    button.style.pointerEvents = "none";\n    button.setAttribute("aria-disabled", "true");\n  });\n  labels.forEach((label) => {\n    label.textContent = busyText;\n  });\n\n  return { buttons, labels };\n}\n\nfunction restoreCacheButtons({ buttons, labels }, text, delay) {\n  window.setTimeout(() => {\n    labels.forEach((label) => {\n      label.textContent = text;\n    });\n    buttons.forEach((button) => {\n      button.style.pointerEvents = "";\n      button.removeAttribute("aria-disabled");\n    });\n  }, delay);\n}\n\nfunction requestCacheClear(scope) {\n  return new Promise((resolve, reject) => {\n    const requestId = crypto.randomUUID();\n    let settled = false;\n    let port;\n\n    const settle = (error, value) => {\n      if (settled) return;\n      settled = true;\n      try {\n        port?.disconnect();\n      } catch {}\n      error ? reject(error) : resolve(value);\n    };\n\n    try {\n      port = chrome.runtime.connect({ name: "lexihalo-subtitle-ai" });\n      port.onMessage.addListener((message) => {\n        if (!message || message.requestId !== requestId) return;\n        message.response?.ok\n          ? settle(null, message.response.data)\n          : settle(new Error(message.response?.error || "清理失败"));\n      });\n      port.onDisconnect.addListener(() => {\n        if (!settled) {\n          settle(\n            new Error(chrome.runtime.lastError?.message || "缓存服务未连接"),\n          );\n        }\n      });\n      port.postMessage({\n        requestId,\n        type: "lexihalo:subtitle-ai:clear-cache",\n        scope,\n      });\n    } catch (error) {\n      settle(error);\n    }\n  });\n}\n\nfunction reloadCaptions(scope) {\n  if (scope !== "ai-subtitle" && scope !== "subtitle") return;\n  window.postMessage(\n    { eventName: "edvideo:caption.purgeAndReload", scope },\n    "*",\n  );\n  window.dispatchEvent(new CustomEvent("edvideo:caption.purgeAndReload"));\n  window.dispatchEvent(\n    new CustomEvent("edvideo:caption.reload", {\n      detail: { body: { status: "on" } },\n    }),\n  );\n}\n\nexport async function clearScopedCache(scope) {\n  if (!VALID_CACHE_SCOPES.has(scope)) {\n    throw new Error("未知的缓存类型");\n  }\n\n  const controls = setCacheButtonsBusy(scope, "清理中…");\n  try {\n    const result = await requestCacheClear(scope);\n    controls.labels.forEach((label) => {\n      label.textContent = "已清理";\n    });\n    reloadCaptions(scope);\n    restoreCacheButtons(controls, "清理", 1600);\n    return result;\n  } catch (error) {\n    controls.labels.forEach((label) => {\n      label.textContent = "清理失败";\n      label.title = error?.message || String(error);\n    });\n    restoreCacheButtons(controls, "清理", 2400);\n    return null;\n  }\n}\n\nif (!window.lexihaloClearScopedCache) {\n  window.lexihaloClearScopedCache = clearScopedCache;\n}\n`,
);

writeJson(path.join(outputRoot, "semantic-summary.json"), {
  bundles: [
    video.bundleName,
    reader.bundleName,
    background.bundleName,
    popup.bundleName,
    "ld-main",
    "romanize-main",
    "tagger-main",
  ],
  indexedSymbols:
    video.symbolCount +
    reader.symbolCount +
    background.symbolCount +
    popup.symbolCount,
  highConfidenceRenames:
    Object.keys(video.semanticMap).length +
    Object.keys(reader.semanticMap).length +
    Object.keys(background.semanticMap).length +
    Object.keys(popup.semanticMap).length,
  extractedArtifacts: [
    ...video.artifacts,
    ...reader.artifacts,
    ...background.artifacts,
    ...popup.artifacts,
    ...languageArtifacts,
    ...styleArtifacts,
    lifecycleArtifact,
    "shared/clearScopedCache.js",
  ],
});

fs.writeFileSync(
  path.join(outputRoot, "README.md"),
  `# Semantically recovered source\n\n` +
    `这一目录是在 \`recovered/\` 机械拆包结果之上进行的语义恢复。它不会覆盖浏览器当前加载的 \`assets/\`。\n\n` +
    `## 当前成果\n\n` +
    `- \`video/VideoIntegrationController.js\`：视频站点接入、按钮注入、字幕挂载和播放器入口；\n` +
    `- \`video/VideoExtensionClient.js\`：视频内容脚本消息、状态和后台请求客户端；\n` +
    `- \`video/CaptionProvider.js\`：字幕来源、语言判定、预翻译、分词和流式字幕状态；\n` +
    `- \`video/loaders/\`：字幕上传器及 10 个视频平台字幕加载器；\n` +
    `- \`video/players/\`：通用播放器抽象、平台播放器适配器及播放器解析工厂；\n` +
    `- \`video/state/\`：独立版初始状态、133 个 action creator、105 个语义化 reducer 分支和 Store 创建逻辑；\n` +
    `- \`video/translation/\`：平台字幕加载基类及字幕对齐、翻译、分词处理器；\n` +
    `- \`video/ui/\`：视频学习根组件、双语字幕组件、入口按钮和路由初始化；\n` +
    `- \`reader/ReaderIntegrationController.js\`：网页监听、沉浸翻译、划词翻译、侧边栏和消息路由；\n` +
    `- \`reader/ReaderExtensionClient.js\`：网页内容脚本与后台/同页内容脚本通信；\n` +
    `- \`reader/BaseImmersiveTranslator.js\` 与 \`ImmersiveTranslationService.js\`：全文翻译抽取、渲染和生命周期；\n` +
    `- \`reader/fulltext/\`：规则解析、显示模式判定、翻译渲染和文本单元抽取；\n` +
    `- \`reader/highlight/\` 与 \`selection/\`：词汇高亮、三种分词器及划词翻译控制器；\n` +
    `- \`reader/control/\`、\`slider/\`、\`quick/\`、\`hotkeys/\`：控制中心、设置侧栏、快速翻译和快捷键；\n` +
    `- \`reader/pages/\`、\`cards/\` 与 \`hooks/\`：设置、语言、语音、高亮、账号、词书、词汇、AI 词典、翻译卡片及状态/API hooks；\n` +
    `- \`background/translation/\`：统一翻译执行器、旧版兼容服务、认证解析、请求队列及五种协议适配器；\n` +
    `- \`background/state/\`：133 个 action creator、根 reducer、持久化配置、防损坏存储适配器和 Store；\n` +
    `- \`background/messages/\`：19 个后台消息处理器的完整注册逻辑；\n` +
    `- \`background/contextMenus/\`、\`popup/\`、\`cache/\`、\`analytics/\`：后台菜单、弹窗上下文、IndexedDB 缓存和统计边界；\n` +
    `- \`popup/\`：扩展弹窗组件、语言检测、受限 URL 判定和选项页跳转；\n` +
    `- \`language/\`：语言检测、罗马字转换和英文词性标注公开 API；\n` +
    `- \`styles/\`：7 份原压缩 CSS 的格式化版本；\n` +
    `- \`shared/clearScopedCache.js\`：已完全语义化的分范围缓存清理逻辑；\n` +
    `- 四份 \`symbol-index.json\`：顶层符号、引用次数、职责分类、Webpack 来源和高置信度重命名。\n\n` +
    `本目录保留拆分后的语义源码作为分析和命名依据；浏览器实际运行的是 \`assets/\` 下由 ` +
    `\`tools/build-readable-bundles.mjs\` 生成的格式化单 Bundle。未完成的 ESM materialization/runtime graph 不再是活动路径。` +
    `完整性结论见 \`COMPLETENESS.md\`，保留原名的分类统计见 \`residual-summary.json\`。\n\n` +
    `## 重新生成\n\n` +
    "```bash\n" +
    `node tools/recover-webpack.cjs\n` +
    `node tools/recover-semantics.cjs\n` +
    `npx --yes prettier@3.5.3 --write "recovered/**/*.{js,json,md}" "src-recovered/**/*.{js,css,json,md}"\n` +
    `node tools/check-recovered.cjs\n` +
    "```\n\n" +
    `## 限制\n\n` +
    `语义名称来自行为、调用关系、DOM 选择器、事件名和 API 使用方式，不能证明它们与原作者命名完全一致。` +
    `恢复目标是行为等价和可维护，而不是逐字还原。\n`,
);

fs.writeFileSync(
  path.join(outputRoot, "ARCHITECTURE.md"),
  `# Recovered architecture\n\n` +
    `## 视频字幕入口\n\n` +
    `\`VideoIntegrationController\` 负责检测站点和视频变化、注入快捷按钮、创建 React/Redux 根节点，并控制字幕窗口和学习模式应用。` +
    `它通过 \`VideoExtensionClient\` 与后台通信，通过 \`CaptionProvider\` 维护字幕语料。\n\n` +
    `\`CaptionProvider\` 的主要数据路径为：平台字幕加载器或流式拦截器 → 标准化字幕行 → 语言判定 → 同语言检查 → ` +
    `预翻译/分词 → 当前字幕查询和 UI 事件。已识别 YouTube、Netflix、Coursera、Udemy、TED、Max、Disney+、edX、` +
    `Prime Video、DeepLearning.AI 和 Bilibili 加载器边界。\n\n` +
    `播放器层由 \`BaseVideoPlayer\` 统一毫秒时间轴、循环、自动暂停和事件接口，再由各平台子类适配站点播放器 API。` +
    `\`resolvePlatformPlayer\` 根据站点创建对应适配器。\n\n` +
    `视频 UI 使用恢复出的 \`initialState\`、\`rootReducer\` 和 \`createAppStore\`。` +
    `\`VideoLearningApp\` 是学习模式根组件，\`DualCaptionApp\` 管理字幕呈现，\`VideoToggleButton\` 管理平台入口。\n\n` +
    `## 网页翻译入口\n\n` +
    `\`ReaderIntegrationController\` 负责监听页面及 Shadow DOM 变化、初始化消息客户端、切换沉浸翻译/划词翻译/侧边栏，` +
    `并协调视频模式开启和关闭。\n\n` +
    `\`BaseImmersiveTranslator\` 封装规则解析、块级判断、翻译节点复制和样式处理；` +
    `\`ImmersiveTranslationService\` 负责 IntersectionObserver 调度、批量翻译、双语/仅译文模式、悬停翻译和清理恢复。\n\n` +
    `网页交互层进一步拆分为 \`VocabularyHighlighter\`、\`SelectionTranslator\`、\`QuickTranslatorController\`、` +
    `\`SliderController\`、\`ControlCenterManager\` 和 \`HotkeyManager\`。已恢复设置首页、沉浸翻译设置、` +
    `翻译引擎、账号、词书、词汇、白名单、快捷键、AI 词典、单词卡、句子翻译卡及对应的主要 React 面板。\n\n` +
    `## 后台与翻译引擎\n\n` +
    `\`BackgroundMessageBus\` 负责后台与活动标签页通信，\`BrowserApi\` 统一 Chrome/Firefox/Safari API。` +
    `\`TranslationEngineExecutor\` 根据 provider schema 选择 OpenAI Chat、Anthropic、Gemini、DeepL 或传统机器翻译适配器，` +
    `并统一处理认证、限流、缓存、分段恢复和降级。\n\n` +
    `后台还恢复了 Redux 持久化防护、19 个消息处理器、右键菜单重建、沉浸翻译站点规则、` +
    `弹窗上下文、IndexedDB 缓存与统计客户端边界。独立 Popup 入口也已拆出页面判定、语言检测和跳转逻辑。\n\n` +
    `## 通信边界\n\n` +
    `- 视频内容脚本主要使用 \`window.postMessage\` 桥接消息；\n` +
    `- 网页内容脚本主要使用 \`chrome.runtime.sendMessage\` 与后台通信；\n` +
    `- 两个客户端都缓存扩展状态和用户 token，并统一封装翻译、遥测、窗口及设置操作；\n` +
    `- 字幕缓存清理由命名端口 \`lexihalo-subtitle-ai\` 处理。\n\n` +
    `## 残留说明\n\n` +
    `所有构建产物均已有可读版本、模块索引或语义入口。未单独命名的内容主要是第三方运行库、国际化字典、图标组件、` +
    `词典/模型数据和匿名局部辅助函数。它们保留在格式化单 Bundle 与 \`recovered/\` 中，避免低置信度重命名破坏语义。` +
    `活动运行架构刻意保留 Webpack runtime/module cache，不再执行完整 ESM 拆分。\n`,
);

const residualByBundle = {};
let residualSymbolTotal = 0;
for (const bundleName of ["video", "reader", "background", "popup"]) {
  const index = JSON.parse(
    fs.readFileSync(
      path.join(outputRoot, bundleName, "symbol-index.json"),
      "utf8",
    ),
  );
  const unresolved = index.symbols.filter((symbol) => !symbol.suggestedName);
  const domains = {};
  for (const symbol of unresolved) {
    domains[symbol.domain] = (domains[symbol.domain] || 0) + 1;
  }
  residualSymbolTotal += unresolved.length;
  residualByBundle[bundleName] = {
    indexed: index.symbolCount,
    semanticallyNamed: index.symbolCount - unresolved.length,
    retainedOriginalName: unresolved.length,
    domains,
  };
}
writeJson(path.join(outputRoot, "residual-summary.json"), {
  status: "recoverable-complete",
  retainedOriginalNameCount: residualSymbolTotal,
  reason:
    "Remaining names are predominantly vendor runtime, generated helpers, localization, icons, datasets, or low-confidence anonymous UI internals.",
  bundles: residualByBundle,
});

const completionSummary = JSON.parse(
  fs.readFileSync(path.join(outputRoot, "semantic-summary.json"), "utf8"),
);
fs.writeFileSync(
  path.join(outputRoot, "COMPLETENESS.md"),
  `# Recovery completeness\n\n` +
    `状态：**可恢复范围已完成**。\n\n` +
    `- 已覆盖 ${completionSummary.bundles.length} 个运行 bundle；\n` +
    `- 已生成 ${completionSummary.extractedArtifacts.length} 个语义/样式资产；\n` +
    `- 已索引 ${completionSummary.indexedSymbols} 个 scope-hoisted 顶层符号；\n` +
    `- 已完成 ${completionSummary.highConfidenceRenames} 个高置信度语义命名；\n` +
    `- 所有大型 JavaScript 和 CSS 均有格式化可读版本；\n` +
    `- 所有公开语言 API、业务入口、状态层、后台消息、翻译器、播放器和主要页面均已单独恢复。\n\n` +
    `## 保留原名的内容\n\n` +
    `仍保留压缩符号名的 ${residualSymbolTotal} 个索引项并非遗漏：其中主要是第三方库内部、Babel/Webpack 生成辅助函数、` +
    `国际化字典、SVG 图标、语言模型/词典数据以及无法可靠推断原名的匿名局部逻辑。` +
    `这些代码完整保留在 \`recovered/\` 中，并可通过各 bundle 的 \`symbol-index.json\` 定位。\n\n` +
    `## 无法无损恢复\n\n` +
    `由于上游没有 source map，原文件路径、原变量名、注释、TypeScript 类型和构建前模块边界无法证明性恢复。` +
    `活动扩展使用格式化单 Bundle；\`src-recovered/\` 仅保留可追溯的反编译与命名参考。\n`,
);

console.log(`Semantic source written to ${path.relative(root, outputRoot)}/`);
