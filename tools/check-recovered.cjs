#!/usr/bin/env node
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
const t = require(path.join(dependencyRoot, "@babel/types"));

const expectations = [
  {
    file: "src-recovered/video/VideoIntegrationController.js",
    className: "VideoIntegrationController",
    methods: ["bootstrap", "renderCaption", "renderCaptionInner", "renderApp"],
  },
  {
    file: "src-recovered/video/VideoExtensionClient.js",
    className: "VideoExtensionClient",
    methodCount: 27,
    methods: ["emit", "dispatch", "request", "translateWithEngine"],
  },
  {
    file: "src-recovered/video/CaptionProvider.js",
    className: "CaptionProvider",
    methodCount: 59,
    methods: [
      "onCaptionStreaming",
      "drivePretranslate",
      "appendStreamingLines",
      "evalSameLanguage",
      "load",
    ],
  },
  {
    file: "src-recovered/reader/ReaderIntegrationController.js",
    className: "ReaderIntegrationController",
    methods: ["bootstrap", "injectDevReloadButton"],
  },
  {
    file: "src-recovered/reader/ReaderExtensionClient.js",
    className: "ReaderExtensionClient",
    methodCount: 25,
    methods: ["emit", "handle", "rebuildContextMenus", "translateWithEngine"],
  },
  {
    file: "src-recovered/reader/BaseImmersiveTranslator.js",
    className: "BaseImmersiveTranslator",
    methodCount: 54,
    methods: ["initFulltextState", "duplicateUnit", "queryTranslationElements"],
  },
  {
    file: "src-recovered/reader/ImmersiveTranslationService.js",
    className: "ImmersiveTranslationService",
    methodCount: 31,
    methods: ["translateIntersection", "translateDual", "enable", "disable"],
  },
  {
    file: "src-recovered/video/loaders/CaptionUploader.js",
    className: "CaptionUploader",
    methodCount: 23,
    methods: ["uploadOnly", "acquireJSON3", "downloadJSON3Caption"],
  },
  {
    file: "src-recovered/reader/fulltext/FulltextRuleResolver.js",
    className: "FulltextRuleResolver",
    methodCount: 24,
    methods: ["syncRules", "fetchRulesFromServer", "getStylesheetSrc"],
  },
  {
    file: "src-recovered/reader/fulltext/DisplayModeDetector.js",
    className: "DisplayModeDetector",
    methodCount: 9,
    methods: ["isCJKDominant", "classifyDisplayMode"],
  },
  {
    file: "src-recovered/reader/fulltext/TranslationRenderer.js",
    className: "TranslationRenderer",
    methodCount: 8,
    methods: ["createDualElement", "sanitizeTranslatedHTML"],
  },
  {
    file: "src-recovered/reader/fulltext/TranslationUnitExtractor.js",
    className: "TranslationUnitExtractor",
    methodCount: 19,
    methods: ["buildExtractPayload", "buildSegments"],
  },
  {
    file: "src-recovered/video/players/BaseVideoPlayer.js",
    className: "BaseVideoPlayer",
    methodCount: 27,
    methods: ["seek", "repeat", "emitChanged", "preview"],
  },
  {
    file: "src-recovered/video/players/YouTubePlayer.js",
    className: "YouTubePlayer",
    methodCount: 9,
    methods: ["skipAd", "preview"],
  },
  {
    file: "src-recovered/video/players/NetflixPlayer.js",
    className: "NetflixPlayer",
    methodCount: 29,
    methods: ["player", "movieId", "repeat", "preview"],
  },
  {
    file: "src-recovered/video/players/DisneyPlayer.js",
    className: "DisneyPlayer",
    methodCount: 32,
    methods: ["player", "playbackRate", "repeat", "preview"],
  },
  {
    file: "src-recovered/video/translation/BaseCaptionLoader.js",
    className: "BaseCaptionLoader",
    methodCount: 6,
    methods: ["cacheKeyOf", "preflight", "translate"],
  },
  {
    file: "src-recovered/video/translation/CaptionTrackProcessor.js",
    className: "CaptionTrackProcessor",
    methodCount: 12,
    methods: ["patchTranslation", "align", "tokenizeConcurrent"],
  },
  {
    file: "src-recovered/background/BrowserApi.js",
    className: "BrowserApi",
    methodCount: 13,
    methods: ["runtime", "contextMenus", "sendNativeMessage"],
  },
  {
    file: "src-recovered/background/BackgroundMessageBus.js",
    className: "BackgroundMessageBus",
    methodCount: 4,
    methods: ["emit", "on", "response"],
  },
  {
    file: "src-recovered/background/translation/LegacyTranslationService.js",
    className: "LegacyTranslationService",
    methodCount: 21,
    methods: ["translate", "translateWithAI", "translateWithGoogle"],
  },
  {
    file: "src-recovered/background/translation/TranslationEngineExecutor.js",
    className: "TranslationEngineExecutor",
    methodCount: 12,
    methods: ["translate", "runTranslation", "translateWithAi"],
  },
  {
    file: "src-recovered/background/cache/IndexedDbCache.js",
    className: "IndexedDbCache",
    methodCount: 7,
    methods: ["init", "set", "get", "cleanExpired"],
  },
  {
    file: "src-recovered/reader/highlight/VocabularyHighlighter.js",
    className: "VocabularyHighlighter",
    methodCount: 20,
    methods: ["bootstrap", "highlightWord", "highlightNodes"],
  },
  {
    file: "src-recovered/reader/highlight/DictionaryWordTokenizer.js",
    className: "DictionaryWordTokenizer",
    methodCount: 3,
    methods: ["tokenize", "updateWordSet"],
  },
  {
    file: "src-recovered/reader/control/ControlCenterManager.js",
    className: "ControlCenterManager",
    methodCount: 5,
    methods: ["mount", "renderControlCenter"],
  },
  {
    file: "src-recovered/reader/hotkeys/HotkeyManager.js",
    className: "HotkeyManager",
    methodCount: 3,
    methods: ["updateShortcuts", "initHotkey"],
  },
  {
    file: "src-recovered/reader/selection/SelectionTranslator.js",
    className: "SelectionTranslator",
    methodCount: 18,
    methods: ["getSelection", "onPopup", "renderCard"],
  },
  {
    file: "src-recovered/reader/slider/SliderController.js",
    className: "SliderController",
    methodCount: 5,
    methods: ["mount", "unmountNow", "unmount"],
  },
  {
    file: "src-recovered/reader/quick/QuickTranslatorController.js",
    className: "QuickTranslatorController",
    methodCount: 10,
    methods: ["mount", "fillBack", "getSelectedText"],
  },
];

function fail(message) {
  throw new Error(message);
}

for (const expectation of expectations) {
  const filename = path.join(root, expectation.file);
  const source = fs.readFileSync(filename, "utf8");
  const ast = parser.parse(source, { sourceType: "module", plugins: ["jsx"] });
  let recoveredClass = null;
  traverse(ast, {
    ClassDeclaration(classPath) {
      if (t.isIdentifier(classPath.node.id, { name: expectation.className })) {
        recoveredClass = classPath.node;
        classPath.stop();
      }
    },
  });
  if (!recoveredClass)
    fail(`${expectation.file}: ${expectation.className} not found`);

  const methods = recoveredClass.body.body
    .filter((member) => t.isClassMethod(member) && t.isIdentifier(member.key))
    .map((member) => member.key.name);
  if (expectation.methodCount && methods.length !== expectation.methodCount) {
    fail(
      `${expectation.file}: expected ${expectation.methodCount} methods, found ${methods.length}`,
    );
  }
  for (const method of expectation.methods) {
    if (!methods.includes(method))
      fail(`${expectation.file}: missing ${method}()`);
  }
  console.log(`OK ${expectation.file} (${methods.length} methods)`);
}

const immersiveSource = fs.readFileSync(
  path.join(root, "src-recovered/reader/ImmersiveTranslationService.js"),
  "utf8",
);
if (
  !/ImmersiveTranslationService\.ENGINE_WRAPPER_TAGS\s*=\s*new Set/.test(
    immersiveSource,
  )
) {
  fail("ImmersiveTranslationService: missing recovered static wrapper tag set");
}
if (/dependencies\.e\b/.test(immersiveSource)) {
  fail("ImmersiveTranslationService: stale minified self-reference detected");
}

const staticRecoveryChecks = [
  [
    "src-recovered/reader/fulltext/FulltextRuleResolver.js",
    /FulltextRuleResolver\.RULES_FORMAT_VERSION\s*=\s*6/,
  ],
  [
    "src-recovered/reader/fulltext/DisplayModeDetector.js",
    /DisplayModeDetector\.HEADING_TAGS\s*=\s*new Set/,
  ],
  [
    "src-recovered/reader/fulltext/TranslationRenderer.js",
    /TranslationRenderer\.TAG_REGEX\s*=/,
  ],
  [
    "src-recovered/reader/fulltext/TranslationUnitExtractor.js",
    /TranslationUnitExtractor\.TECHNICAL_EXCLUDE_SELECTORS\s*=\s*new Set/,
  ],
];
for (const [relativePath, pattern] of staticRecoveryChecks) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  if (!pattern.test(source))
    fail(`${relativePath}: missing recovered static data`);
}

const summary = JSON.parse(
  fs.readFileSync(
    path.join(root, "src-recovered/semantic-summary.json"),
    "utf8",
  ),
);
if (summary.indexedSymbols < 3600)
  fail("Semantic symbol index is unexpectedly incomplete");
if (summary.extractedArtifacts.length !== 138) {
  fail(
    `Expected 138 semantic artifacts, found ${summary.extractedArtifacts.length}`,
  );
}
const functionRecoveryChecks = [
  [
    "src-recovered/video/players/resolvePlatformPlayer.js",
    /const resolvePlatformPlayer = \(platform\)/,
  ],
  [
    "src-recovered/video/state/actionCreators.js",
    /export function createActionCreators\(createAction\)/,
  ],
  ["src-recovered/video/state/initialState.js", /const initialState = \{/],
  [
    "src-recovered/video/state/rootReducer.js",
    /const rootReducer = createReducer\(initialState/,
  ],
  [
    "src-recovered/video/ui/VideoLearningApp.js",
    /const VideoLearningApp = \(props\)/,
  ],
  [
    "src-recovered/video/ui/DualCaptionApp.js",
    /const DualCaptionApp = \(props\)/,
  ],
  [
    "src-recovered/video/ui/VideoToggleButton.js",
    /const VideoToggleButton = \(props\)/,
  ],
  [
    "src-recovered/background/BackgroundMessageBus.js",
    /return new BackgroundMessageBus\("background"\)/,
  ],
  [
    "src-recovered/background/contextMenus/rebuildContextMenus.js",
    /const rebuildContextMenus = \(fulltextEnabled\)/,
  ],
  [
    "src-recovered/background/state/rootReducer.js",
    /const rootReducer = createReducer\(initialState/,
  ],
  ["src-recovered/background/state/store.js", /const store = \(function/],
  [
    "src-recovered/background/messages/registerBackgroundMessageHandlers.js",
    /export function registerBackgroundMessageHandlers\(dependencies\)/,
  ],
  [
    "src-recovered/reader/quick/QuickTranslatorPanel.js",
    /const QuickTranslatorPanel = \(props\)/,
  ],
  [
    "src-recovered/reader/control/ControlCenterWidget.js",
    /const ControlCenterWidget = \(props\)/,
  ],
  [
    "src-recovered/reader/control/ControlCenterSettingsPanel.js",
    /const ControlCenterSettingsPanel = \(props\)/,
  ],
  ["src-recovered/popup/PopupApp.js", /const PopupApp = \(\)/],
  [
    "src-recovered/popup/openExtensionPage.js",
    /const openExtensionPage = \(url\)/,
  ],
  [
    "src-recovered/reader/pages/DictionaryPage.js",
    /const DictionaryPage = \(props\)/,
  ],
  [
    "src-recovered/reader/pages/ImmersiveTranslationSettings.js",
    /const ImmersiveTranslationSettings = \(\)/,
  ],
  [
    "src-recovered/reader/pages/SettingsHome.js",
    /const SettingsHome = \(props\)/,
  ],
  [
    "src-recovered/reader/cards/WordLookupCard.js",
    /const WordLookupCard = \(props\)/,
  ],
  [
    "src-recovered/reader/cards/SentenceTranslationCard.js",
    /const SentenceTranslationCard = \(props\)/,
  ],
  [
    "src-recovered/reader/pages/TranslationEngineSettings.js",
    /const TranslationEngineSettings = \(\)/,
  ],
  [
    "src-recovered/reader/pages/BrowserShortcutSettings.js",
    /const BrowserShortcutSettings = \(\)/,
  ],
  [
    "src-recovered/reader/pages/DualSubtitleSettings.js",
    /const DualSubtitleSettings = \(props\)/,
  ],
  [
    "src-recovered/reader/pages/FulltextWhitelistPage.js",
    /const FulltextWhitelistPage = \(\)/,
  ],
  [
    "src-recovered/reader/hooks/useApiClient.js",
    /const useApiClient = \(useExtensionContext\)/,
  ],
  [
    "src-recovered/reader/hooks/useDictionary.js",
    /const useDictionary = \(useExtensionContext, dispatch\)/,
  ],
  [
    "src-recovered/background/lifecycle/registerBackgroundLifecycle.js",
    /export function registerBackgroundLifecycle\(dependencies\)/,
  ],
  [
    "src-recovered/language/detectLanguage.js",
    /const detectLanguage = \(text\)/,
  ],
  ["src-recovered/language/romanize.js", /const romanize = \{/],
];
for (const [relativePath, pattern] of functionRecoveryChecks) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  if (!pattern.test(source))
    fail(`${relativePath}: semantic function not found`);
}
for (const relativePath of [
  "src-recovered/video/state/actionCreators.js",
  "src-recovered/background/state/actionCreators.js",
]) {
  const actionCreatorSource = fs.readFileSync(
    path.join(root, relativePath),
    "utf8",
  );
  const actionCreatorCount = (
    actionCreatorSource.match(/= createAction\(/g) || []
  ).length;
  if (actionCreatorCount !== 133) {
    fail(
      `${relativePath}: expected 133 action creators, found ${actionCreatorCount}`,
    );
  }
}
const handlerSource = fs.readFileSync(
  path.join(
    root,
    "src-recovered/background/messages/registerBackgroundMessageHandlers.js",
  ),
  "utf8",
);
const handlerCount = (handlerSource.match(/backgroundMessageBus\.on\(/g) || [])
  .length;
if (handlerCount !== 19) {
  fail(`Expected 19 background message handlers, found ${handlerCount}`);
}

const residualSummary = JSON.parse(
  fs.readFileSync(
    path.join(root, "src-recovered/residual-summary.json"),
    "utf8",
  ),
);
if (residualSummary.status !== "recoverable-complete") {
  fail("Recovery completeness status is not final");
}
if (!fs.existsSync(path.join(root, "src-recovered/COMPLETENESS.md"))) {
  fail("Missing recovery completeness report");
}
const styleFiles = fs
  .readdirSync(path.join(root, "src-recovered/styles"))
  .filter((filename) => filename.endsWith(".css"));
if (styleFiles.length !== 7) {
  fail(`Expected 7 recovered stylesheets, found ${styleFiles.length}`);
}

for (const relativeArtifact of summary.extractedArtifacts) {
  const filename = path.join(root, "src-recovered", relativeArtifact);
  if (!fs.existsSync(filename))
    fail(`Missing semantic artifact: ${relativeArtifact}`);
  if (filename.endsWith(".js")) {
    parser.parse(fs.readFileSync(filename, "utf8"), {
      sourceType: "module",
    });
  }
}

console.log(
  `Recovered source checks passed: ${summary.indexedSymbols} symbols, ` +
    `${summary.highConfidenceRenames} high-confidence renames.`,
);
