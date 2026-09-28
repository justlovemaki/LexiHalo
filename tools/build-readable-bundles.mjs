import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import prettier from "prettier";

const require = createRequire(import.meta.url);
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const t = require("@babel/types");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baseline = JSON.parse(
  fs.readFileSync(path.join(root, "config", "bundle-baseline.json"), "utf8"),
);
const renameReport = {};

const symbolIndexes = {
  background: "config/symbols/background.json",
  reader: "config/symbols/reader.json",
  video: "config/symbols/video.json",
  popup: "config/symbols/popup.json",
};
const curated = {
  background: new Set([
    "Ka",
    "Qa",
    "hi",
    "Ii",
    "Si",
    "ji",
    "Ls",
    "zs",
    "Qs",
    "nl",
    "hl",
    "Cl",
    "uu",
    "bu",
    "Da",
    "La",
    "sn",
    "Ft",
    "Ya",
    "eu",
    "rc",
    "ou",
    "au",
  ]),
  reader: new Set([
    "Co",
    "So",
    "d_",
    "__",
    "Ex",
    "Ox",
    "Dx",
    "aw",
    "uw",
    "hw",
    "mw",
    "gk",
    "wk",
    "kk",
    "hC",
    "mC",
    "EC",
    "LC",
    "RC",
    "BC",
    "MC",
    "Hy",
    "yx",
    "kv",
    "gw",
    "ww",
    "Cw",
    "Tk",
    "vk",
    "Hw",
    "lk",
    "xx",
    "OT",
    "ZT",
    "Yc",
    "wu",
    "Gd",
    "yp",
    "Qf",
    "qk",
    "Mk",
    "Ok",
    "Ik",
    "KC",
  ]),
  video: new Set([
    "Os",
    "qs",
    "P_",
    "Hf",
    "Vf",
    "V_",
    "nh",
    "hh",
    "xh",
    "Nh",
    "Dh",
    "Yh",
    "am",
    "hm",
    "gm",
    "Am",
    "Pm",
    "Mm",
    "Hm",
    "Vm",
    "Um",
    "Km",
    "Zm",
    "Jm",
    "Xm",
    "Qm",
    "rg",
    "ig",
    "ag",
    "og",
    "sC",
    "mA",
    "HA",
    "aj",
  ]),
  popup: new Set(["T", "k", "S", "w", "C"]),
};

function findPrimaryFunction(ast) {
  const candidates = [];
  traverse(ast, {
    CallExpression(callPath) {
      const callee = callPath.get("callee");
      if (
        (callee.isArrowFunctionExpression() || callee.isFunctionExpression()) &&
        callee.get("body").isBlockStatement()
      ) {
        candidates.push({
          path: callee,
          statements: callee.node.body.body.length,
          size: callee.node.end - callee.node.start,
        });
      }
    },
  });
  candidates.sort((a, b) => b.statements - a.statements || b.size - a.size);
  return candidates[0]?.path;
}

function pascalCase(value) {
  return value.replace(/(^|[^A-Za-z0-9]+)([A-Za-z0-9])/g, (_, __, c) =>
    c.toUpperCase(),
  );
}

function applySemanticRenames(name, ast) {
  const indexPath = symbolIndexes[name];
  if (!indexPath) return [];
  const index = JSON.parse(fs.readFileSync(path.join(root, indexPath), "utf8"));
  const appPath = findPrimaryFunction(ast);
  if (!appPath) return [];
  const counts = new Map();
  for (const [original, suggested] of Object.entries(
    index.highConfidenceRenames || {},
  )) {
    if (curated[name]?.has(original) || suggested?.endsWith("Action")) {
      counts.set(suggested, (counts.get(suggested) || 0) + 1);
    }
  }
  const applied = [];
  const candidates = Object.entries(index.highConfidenceRenames || {})
    .filter(
      ([original, suggested]) =>
        Boolean(suggested) &&
        t.isValidIdentifier(suggested, false) &&
        (curated[name]?.has(original) || suggested.endsWith("Action")) &&
        counts.get(suggested) === 1,
    )
    .sort(([left], [right]) => left.localeCompare(right));
  for (const [original, suggested] of candidates) {
    const binding = appPath.scope.getBinding(original);
    if (
      !binding ||
      original === suggested ||
      appPath.scope.hasBinding(suggested)
    )
      continue;
    const line = binding.path.node.loc?.start.line || null;
    appPath.scope.rename(original, suggested);
    const currentBinding = appPath.scope.getBinding(suggested);
    if (currentBinding?.path?.isVariableDeclarator()) {
      const init = currentBinding.path.get("init");
      const className = pascalCase(suggested);
      if (init.isClassExpression() && !init.node.id && /^[A-Z]/.test(className))
        init.node.id = t.identifier(className);
      if (
        init.isNewExpression() &&
        init.get("callee").isClassExpression() &&
        !init.node.callee.id &&
        /^[A-Z]/.test(className)
      )
        init.node.callee.id = t.identifier(className);
    }
    applied.push({ original, name: suggested, line });
  }
  return applied;
}

function parseStatements(source) {
  return parser.parse(source, {
    sourceType: "script",
    allowReturnOutsideFunction: true,
  }).program.body;
}

function installBackgroundStructuredAiBridge(ast) {
  const appPath = findPrimaryFunction(ast);
  if (!appPath) throw new Error("background: primary application scope not found");
  for (const binding of [
    "TranslationEngineExecutor",
    "ii",
    "Lo",
    "es",
    "di",
  ]) {
    if (!appPath.scope.hasBinding(binding)) {
      throw new Error(`background: structured AI dependency ${binding} not found`);
    }
  }

  let adapterSignals = 0;
  let responseRecoveries = 0;
  traverse(ast, {
    ClassDeclaration(classPath) {
      if (
        ![
          "OpenAiChatAdapter",
          "AnthropicAdapter",
          "GeminiAdapter",
        ].includes(classPath.node.id?.name)
      )
        return;
      const execute = classPath
        .get("body.body")
        .find(
          (methodPath) =>
            methodPath.isClassMethod() &&
            t.isIdentifier(methodPath.node.key, { name: "execute" }),
        );
      const requestParam = execute?.node.params?.[1];
      if (!execute || !t.isIdentifier(requestParam)) {
        throw new Error(
          `background: ${classPath.node.id.name}.execute request parameter not found`,
        );
      }
      execute.traverse({
        CallExpression(callPath) {
          if (!t.isIdentifier(callPath.node.callee, { name: "ds" })) return;
          const options = callPath.node.arguments[1];
          if (!t.isObjectExpression(options)) return;
          if (
            options.properties.some(
              (property) =>
                t.isObjectProperty(property) &&
                t.isIdentifier(property.key, { name: "signal" }),
            )
          )
            return;
          options.properties.push(
            t.objectProperty(
              t.identifier("signal"),
              t.memberExpression(
                t.identifier(requestParam.name),
                t.identifier("signal"),
              ),
            ),
          );
          adapterSignals += 1;
        },
        StringLiteral(literalPath) {
          if (literalPath.node.value !== "empty response text") return;
          const returnPath = literalPath.findParent((candidate) =>
            candidate.isReturnStatement(),
          );
          const ifPath = returnPath?.findParent((candidate) =>
            candidate.isIfStatement(),
          );
          const output =
            t.isUnaryExpression(ifPath?.node.test, { operator: "!" }) &&
            t.isIdentifier(ifPath.node.test.argument)
              ? ifPath.node.test.argument
              : null;
          const binding = output
            ? literalPath.scope.getBinding(output.name)
            : null;
          const initializer = binding?.path?.node?.init;
          const payload =
            t.isCallExpression(initializer) &&
            t.isIdentifier(initializer.arguments[0])
              ? initializer.arguments[0]
              : null;
          const consequent = ifPath?.get("consequent");
          if (!payload || !consequent?.isBlockStatement()) {
            throw new Error(
              `background: ${classPath.node.id.name} response recovery shape changed`,
            );
          }
          consequent.unshiftContainer(
            "body",
            parseStatements(`
              const lexihaloRecoveredText =
                globalThis.lexihaloExtractAiResponseText?.(${payload.name});
              if (lexihaloRecoveredText) {
                return { ok: true, rawText: lexihaloRecoveredText };
              }
            `),
          );
          responseRecoveries += 1;
        },
      });
    },
  });
  if (adapterSignals !== 3) {
    throw new Error(
      `background: expected 3 adapter abort-signal patches, got ${adapterSignals}`,
    );
  }
  if (responseRecoveries !== 3) {
    throw new Error(
      `background: expected 3 response recovery patches, got ${responseRecoveries}`,
    );
  }

  let fetchAbortPatched = false;
  traverse(ast, {
    FunctionDeclaration(functionPath) {
      if (!t.isIdentifier(functionPath.node.id, { name: "ds" })) return;
      functionPath.traverse({
        NewExpression(newPath) {
          if (
            fetchAbortPatched ||
            !t.isIdentifier(newPath.node.callee, { name: "AbortController" })
          )
            return;
          const declaration = newPath.findParent((candidate) =>
            candidate.isVariableDeclaration(),
          );
          const innerFunction = newPath.getFunctionParent();
          const controller = newPath.parentPath.node.id;
          const optionsParam = innerFunction?.node.params?.[1];
          const options = t.isAssignmentPattern(optionsParam)
            ? optionsParam.left
            : optionsParam;
          if (
            !declaration ||
            !t.isIdentifier(controller) ||
            !t.isIdentifier(options)
          )
            throw new Error("background: fetch abort controller shape changed");
          declaration.insertAfter(
            parseStatements(`
              const externalSignal = ${options.name}.signal;
              if (externalSignal) {
                if (externalSignal.aborted) ${controller.name}.abort();
                else externalSignal.addEventListener(
                  "abort",
                  () => ${controller.name}.abort(),
                  { once: true },
                );
              }
            `),
          );
          fetchAbortPatched = true;
        },
      });
    },
  });
  if (!fetchAbortPatched)
    throw new Error("background: fetch abort propagation was not installed");

  const bridgeSource = fs.readFileSync(
    path.join(root, "src", "background", "structured-ai-bridge.js"),
    "utf8",
  );
  const bridgeModule = parser.parse(bridgeSource, {
    sourceType: "module",
    plugins: ["jsx"],
  });
  const exported = bridgeModule.program.body.find(
    (node) =>
      t.isExportNamedDeclaration(node) &&
      t.isFunctionDeclaration(node.declaration),
  );
  const factory = exported?.declaration;
  if (!factory)
    throw new Error("background: structured-ai-bridge has no recover factory export");

  appPath.get("body").pushContainer("body", t.cloneNode(factory, true));
  appPath.get("body").pushContainer(
    "body",
    parseStatements(`
      ${factory.id.name}({
        TranslationEngineExecutor: TranslationEngineExecutor,
        ii: ii,
        Lo: Lo,
        es: es,
        di: di,
      });
    `),
  );
}

function installUiSourceFactories(
  ast,
  {
    area,
    sourceRoot,
    manualAliases = [],
    minimumComponents = 1,
    globals = [],
  },
) {
  const appPath = findPrimaryFunction(ast);
  if (!appPath)
    throw new Error(`${area}: primary application scope not found`);
  const collectFiles = (directory) =>
    fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const absolute = path.join(directory, entry.name);
      return entry.isDirectory()
        ? collectFiles(absolute)
        : entry.isFile() && entry.name.endsWith(".js")
          ? [absolute]
          : [];
    });
  const files = collectFiles(sourceRoot)
    .filter((filename) =>
      fs.readFileSync(filename, "utf8").includes("export function recover"),
    )
    .sort();
  const renameCandidates = JSON.parse(
    fs.readFileSync(path.join(root, "config", "symbols", `${area}.json`), "utf8"),
  ).highConfidenceRenames;
  const reverseRenames = new Map([
    ...Object.entries(renameCandidates).map(([original, semantic]) => [
      semantic,
      original,
    ]),
    ...manualAliases,
  ]);
  const resolveBinding = (semanticName, sourceFile) => {
    if (appPath.scope.hasBinding(semanticName)) return semanticName;
    const original = reverseRenames.get(semanticName);
    if (original && appPath.scope.hasBinding(original)) return original;
    throw new Error(
      `${area}: ${sourceFile} dependency/component ${semanticName} is not available in the bundle`,
    );
  };
  const browserGlobals = new Set(globals);
  const resolveDependencyExpression = (name, sourceFile) => {
    if (browserGlobals.has(name)) {
      return t.memberExpression(t.identifier("globalThis"), t.identifier(name));
    }
    return t.identifier(resolveBinding(name, sourceFile));
  };

  const installed = [];
  for (const absoluteFilename of files) {
    const filename = path.relative(sourceRoot, absoluteFilename);
    const source = fs.readFileSync(absoluteFilename, "utf8");
    const moduleAst = parser.parse(source, {
      sourceType: "module",
      plugins: ["jsx"],
    });
    const exported = moduleAst.program.body.find(
      (node) =>
        t.isExportNamedDeclaration(node) &&
        t.isFunctionDeclaration(node.declaration),
    );
    const factory = exported?.declaration;
    if (!factory?.id || !t.isIdentifier(factory.params[0])) {
      throw new Error(`${area}: ${filename} has no recover factory export`);
    }
    const dependenciesParameter = factory.params[0].name;
    const returnStatement = factory.body.body.find((node) =>
      t.isReturnStatement(node),
    );
    const component = returnStatement?.argument;
    if (!t.isIdentifier(component)) {
      throw new Error(`${area}: ${filename} factory does not return a component`);
    }

    const dependencies = new Set();
    t.traverseFast(factory, (node) => {
      if (
        t.isMemberExpression(node) &&
        !node.computed &&
        t.isIdentifier(node.object, { name: dependenciesParameter }) &&
        t.isIdentifier(node.property)
      ) {
        dependencies.add(node.property.name);
      }
    });
    const componentBinding = resolveBinding(component.name, filename);
    const binding = appPath.scope.getBinding(componentBinding);
    if (!binding?.path?.isVariableDeclarator()) {
      throw new Error(
        `${area}: ${filename} component ${component.name} is not a replaceable variable`,
      );
    }
    const dependencyProperties = [...dependencies].sort().map((name) =>
      t.objectProperty(
        t.identifier(name),
        resolveDependencyExpression(name, filename),
      ),
    );
    const cachedComponent = t.identifier(
      `lexihalo${component.name}Source`,
    );
    const componentArgs = t.identifier("componentArgs");
    binding.path.get("init").replaceWith(
      t.callExpression(
        t.arrowFunctionExpression(
          [],
          t.blockStatement([
            t.variableDeclaration("let", [
              t.variableDeclarator(cachedComponent),
            ]),
            t.returnStatement(
              t.arrowFunctionExpression(
                [t.restElement(componentArgs)],
                t.blockStatement([
                  t.expressionStatement(
                    t.assignmentExpression(
                      "=",
                      cachedComponent,
                      t.logicalExpression(
                        "||",
                        cachedComponent,
                        t.callExpression(t.identifier(factory.id.name), [
                          t.objectExpression(dependencyProperties),
                        ]),
                      ),
                    ),
                  ),
                  t.returnStatement(
                    t.callExpression(cachedComponent, [
                      t.spreadElement(componentArgs),
                    ]),
                  ),
                ]),
              ),
            ),
          ]),
        ),
        [],
      ),
    );
    appPath.get("body").pushContainer("body", t.cloneNode(factory, true));
    installed.push(component.name);
  }

  if (
    installed.length !== files.length ||
    installed.length < minimumComponents
  ) {
    throw new Error(
      `${area}: expected every UI source to be installed (${files.length}), got ${installed.length}`,
    );
  }
  return installed;
}

function patchVideoAiRequests(ast) {
  let requestMetadataPatches = 0;
  let originalTextPatches = 0;
  let playerStateGuards = 0;
  let streamBucketPatches = 0;
  traverse(ast, {
    ClassMethod(methodPath) {
      if (t.isIdentifier(methodPath.node.key, { name: "renderActiveBucket" })) {
        methodPath.traverse({
          BinaryExpression(binPath) {
            if (
              binPath.node.operator === "===" &&
              t.isMemberExpression(binPath.node.left) &&
              t.isIdentifier(binPath.node.left.property, { name: "text" }) &&
              t.isMemberExpression(binPath.node.right) &&
              t.isIdentifier(binPath.node.right.property, { name: "text" })
            ) {
              const sObj = binPath.node.left.object;
              binPath.replaceWith(
                t.logicalExpression(
                  "||",
                  binPath.node,
                  t.logicalExpression(
                    "||",
                    t.binaryExpression(
                      "===",
                      t.memberExpression(sObj, t.identifier("originalText")),
                      binPath.node.right,
                    ),
                    t.unaryExpression(
                      "!",
                      t.unaryExpression(
                        "!",
                        t.memberExpression(sObj, t.identifier("AITranslation")),
                      ),
                    ),
                  ),
                ),
              );
              streamBucketPatches += 1;
              binPath.skip();
            }
          },
        });
      }
    },
  });
  traverse(ast, {
    ClassMethod(methodPath) {
      if (!t.isIdentifier(methodPath.node.key, { name: "dispatchTranslate" }))
        return;
      methodPath.traverse({
        CallExpression(callPath) {
          const callee = callPath.node.callee;
          if (
            !t.isMemberExpression(callee) ||
            !t.isIdentifier(callee.property, { name: "translateWithEngine" })
          )
            return;
          const request = callPath.node.arguments[0];
          if (!t.isObjectExpression(request)) return;
          request.properties.push(
            t.objectProperty(
              t.identifier("requestGroup"),
              t.memberExpression(t.thisExpression(), t.identifier("id")),
            ),
            t.objectProperty(
              t.identifier("requestGeneration"),
              t.logicalExpression(
                "||",
                t.memberExpression(
                  t.thisExpression(),
                  t.identifier("translationGeneration"),
                ),
                t.numericLiteral(0),
              ),
            ),
          );
          requestMetadataPatches += 1;
        },
        ObjectExpression(objectPath) {
          const properties = objectPath.node.properties;
          const textProperty = properties.find(
            (property) =>
              t.isObjectProperty(property) &&
              t.isIdentifier(property.key, { name: "text" }),
          );
          if (
            !textProperty ||
            !properties.some(
              (property) =>
                t.isObjectProperty(property) &&
                t.isIdentifier(property.key, { name: "AITranslation" }),
            )
          )
            return;
          const fallback = textProperty.value;
          const lineText =
            t.isLogicalExpression(fallback) &&
            t.isMemberExpression(fallback.right) &&
            t.isIdentifier(fallback.right.property, { name: "text" })
              ? fallback.right
              : null;
          if (!lineText || !t.isIdentifier(lineText.object)) return;
          const line = lineText.object.name;
          properties.push(
            t.objectProperty(
              t.identifier("originalText"),
              t.logicalExpression(
                "||",
                t.memberExpression(
                  t.identifier(line),
                  t.identifier("originalText"),
                ),
                t.memberExpression(t.identifier(line), t.identifier("text")),
              ),
            ),
            t.objectProperty(
              t.identifier("translationGeneration"),
              t.logicalExpression(
                "||",
                t.memberExpression(
                  t.thisExpression(),
                  t.identifier("translationGeneration"),
                ),
                t.numericLiteral(0),
              ),
            ),
          );
          originalTextPatches += 1;
        },
      });
    },
  });
  traverse(ast, {
    CallExpression(callPath) {
      const callee = callPath.node.callee;
      if (
        !t.isMemberExpression(callee) ||
        !t.isIdentifier(callee.property, { name: "addCase" }) ||
        !t.isIdentifier(callPath.node.arguments[0], {
          name: "setPlayerLinesAction",
        })
      )
        return;
      const reducer = callPath.get("arguments.1");
      const state = reducer.node?.params?.[0];
      const body = reducer.get("body");
      if (
        !reducer.isArrowFunctionExpression() ||
        !t.isIdentifier(state) ||
        !body.isBlockStatement()
      )
        throw new Error("video: setPlayerLines reducer shape changed");
      body.unshiftContainer(
        "body",
        parseStatements(`
          ${state.name}.player = ${state.name}.player || { lines: [] };
        `),
      );
      playerStateGuards += 1;
    },
  });
  if (playerStateGuards !== 1)
    throw new Error(
      `video: expected one player state guard, got ${playerStateGuards}`,
    );
  if (requestMetadataPatches !== 1)
    throw new Error(
      `video: expected one AI request metadata patch, got ${requestMetadataPatches}`,
    );
  if (originalTextPatches < 1)
    throw new Error("video: repaired subtitle originalText was not preserved");
}

const marker = (name) =>
  `\n;(() => {\n  globalThis.__lexihaloReadable${name} = true;\n  if (typeof document !== "undefined" && document.documentElement) document.documentElement.setAttribute("data-lexihalo-${name.toLowerCase()}-runtime", "readable");\n})();\n`;
const getCaptionSchedulerSource = () =>
  "\n" +
  fs.readFileSync(
    path.join(root, "src", "video", "caption-scheduler.js"),
    "utf8",
  );
;

async function formatJs(source) {
  return prettier.format(source, {
    parser: "babel",
    printWidth: 100,
    semi: true,
    singleQuote: false,
  });
}

async function buildMain(name, config) {
  const sourcePath = path.join(root, config.source);
  const source = fs.readFileSync(sourcePath, "utf8");
  for (const required of config.requiredMarkers || [])
    if (!source.includes(required))
      throw new Error(`${name}: baseline marker missing: ${required}`);
  const ast = parser.parse(source, {
    sourceType: "script",
    plugins: ["jsx"],
    errorRecovery: false,
  });
  if (name === "background") {
    traverse(ast, {
      ExpressionStatement(statementPath) {
        const expression = statementPath.node.expression;
        if (
          t.isCallExpression(expression) &&
          t.isIdentifier(expression.callee, { name: "importScripts" }) &&
          t.isStringLiteral(expression.arguments[0], {
            value: "subtitle-ai-background.js",
          })
        )
          statementPath.remove();
      },
    });
  }
  const applied = applySemanticRenames(name, ast);
  let sourceComponents = [];
  if (name === "background") installBackgroundStructuredAiBridge(ast);
  if (name === "reader") {
    sourceComponents = installUiSourceFactories(ast, {
      area: "reader",
      sourceRoot: path.join(root, "src", "reader"),
      manualAliases: [
        ["WriterSettings", "rx"],
        ["SliderRoot", "jC"],
      ],
      minimumComponents: 33,
      globals: ["SpeechSynthesisUtterance"],
    });
  }
  if (name === "video") {
    sourceComponents = installUiSourceFactories(ast, {
      area: "video",
      sourceRoot: path.join(root, "src", "video", "ui"),
      minimumComponents: 4,
    });
    patchVideoAiRequests(ast);
  }
  if (name === "popup") {
    sourceComponents = installUiSourceFactories(ast, {
      area: "popup",
      sourceRoot: path.join(root, "src", "popup", "ui"),
      minimumComponents: 1,
    });
  }
  renameReport[name] = {
    source: config.source,
    output: config.output,
    applied,
    count: applied.length,
    ...(sourceComponents.length ? { sourceComponents } : {}),
  };
  let output = `/* LexiHalo readable single bundle: ${name}. */\n${generate(ast, { comments: true, compact: false }).code}\n`;
  if (name === "background")
    output +=
      fs.readFileSync(
        path.join(root, "src/background/subtitle-ai.js"),
        "utf8",
      ) + marker("Background");
  else if (name === "reader")
    output +=
      fs
        .readFileSync(
          path.join(root, "src/shared/clearScopedCache.js"),
          "utf8",
        )
        .replace(
          "export async function clearScopedCache",
          "async function clearScopedCache",
        ) + marker("Reader");
  else if (name === "video") output += getCaptionSchedulerSource() + marker("Video");
  else {
    const markerName =
      {
        popup: "Popup",
        languageDetector: "Language",
        posTagger: "Pos",
        romanize: "Romanize",
      }[name] || name;
    output += marker(markerName);
  }
  output = await formatJs(output);
  fs.writeFileSync(path.join(root, config.output), output);
}

for (const [name, config] of Object.entries(baseline.entries))
  await buildMain(name, config);

const directSources = {
  "src/video/onload.js": "assets/edvideo-onload.js",
  "src/content/site-rules-loader.js": "assets/site-rules-loader.js",
  "src/content/subtitle-ai-sidebar.js": "assets/subtitle-ai-sidebar.js",
  "src/options/byok.js": "assets/byok.js",
  "src/options/site-rules.js": "assets/site-rules.js",
};
for (const [input, output] of Object.entries(directSources)) {
  let source = fs
    .readFileSync(path.join(root, input), "utf8")
    .replaceAll("assets/semantic-video.js", "assets/edvideo-main.js")
    .replaceAll("assets/semantic-romanize.js", "assets/romanize-main.js")
    .replaceAll("assets/semantic-language-detector.js", "assets/ld-main.js")
    .replaceAll("assets/semantic-pos-tagger.js", "assets/tagger-main.js")
    .replaceAll('"semantic"', '"readable"');
  fs.writeFileSync(path.join(root, output), await formatJs(source));
}
for (const filename of [
  "index.html",
  "popup.html",
  "byok.html",
  "site-rules.html",
]) {
  fs.copyFileSync(
    path.join(root, "src", "pages", filename),
    path.join(root, filename),
  );
}
fs.cpSync(path.join(root, "src", "locales"), path.join(root, "_locales"), {
  recursive: true,
  force: true,
});
for (const filename of [
  "byok.css",
  "edreader.css",
  "eduser.css",
  "edvideo.css",
  "popup-style.css",
  "site-rules.css",
  "subtitle-ai.css",
]) {
  fs.copyFileSync(
    path.join(root, "src", "styles", filename),
    path.join(root, "assets", filename),
  );
}
const reportsDir = path.join(root, "artifacts", "reports");
fs.mkdirSync(reportsDir, { recursive: true });
fs.writeFileSync(
  path.join(reportsDir, "bundle-renames.json"),
  `${JSON.stringify(renameReport, null, 2)}\n`,
);
console.log(
  `Built ${Object.keys(baseline.entries).length} readable single bundles with ${Object.values(renameReport).reduce((sum, item) => sum + item.count, 0)} high-confidence renames.`,
);
