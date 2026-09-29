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

function findPrimaryFunction(ast, name = null) {
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
  if (name === "popup") {
    candidates.sort((a, b) => b.size - a.size);
    return candidates[0]?.path;
  }
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
  const appPath = findPrimaryFunction(ast, name);
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

  traverse(ast, {
    Class(classPath) {
      const methods = classPath.node.body.body.map((m) => m.key?.name).filter(Boolean);
      if (methods.includes("response") && methods.includes("emit")) {
        classPath.traverse({
          CallExpression(callPath) {
            if (
              callPath.node.callee?.property?.name === "addListener" &&
              generate(callPath.node.callee.object).code.includes("browserApi.runtime.onMessage")
            ) {
              const listener = callPath.node.arguments[0];
              if (listener && (t.isArrowFunctionExpression(listener) || t.isFunctionExpression(listener))) {
                const body = listener.body;
                if (t.isBlockStatement(body)) {
                  // Prepend e.frameId = t.frameId; e.tabid = t.tab?.id;
                  body.body.unshift(
                    ...parseStatements(`
                      if (t) {
                        e.frameId = t.frameId;
                        if (t.tab?.id) e.tabid = t.tab.id;
                      }
                    `),
                  );
                }
              }
            }
          },
        });
      }
    },
  });
  let adapterSignals = 0;
  let responseRecoveries = 0;
  traverse(ast, {
    ClassMethod(methodPath) {
      if (methodPath.node.key?.name === "makeRequest") {
        methodPath.traverse({
          VariableDeclarator(declPath) {
            if (
              t.isIdentifier(declPath.node.id, { name: "v" }) &&
              t.isNumericLiteral(declPath.node.init, { value: 3e4 })
            ) {
              declPath.node.init = parser.parseExpression("12e4");
            }
          },
        });
      }
    },
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
        ConditionalExpression(condPath) {
          // Find `P = null != (s = p.endpoint.timeoutMs) ? s : 3e4` or similar
          // and allow engine.timeoutMs or engine.requestTimeoutMs or extend default timeout
          const test = condPath.node.test;
          if (
            t.isBinaryExpression(test, { operator: "!=" }) &&
            t.isNullLiteral(test.left) &&
            t.isAssignmentExpression(test.right) &&
            t.isMemberExpression(test.right.right) &&
            test.right.right.property?.name === "timeoutMs"
          ) {
            const assign = test.right;
            if (t.isNumericLiteral(condPath.node.alternate, { value: 3e4 })) {
              condPath.replaceWith(
                parser.parseExpression(`
                  (null != (${generate(assign).code}) ? ${generate(assign.left).code} : (e.engine?.timeoutMs || 12e4))
                `)
              );
            }
          }
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

  traverse(ast, {
    CallExpression(callPath) {
      if (
        callPath.node.callee?.property?.name === "on" &&
        callPath.node.arguments[0]?.value === "translateWithEngine"
      ) {
        callPath.traverse({
          ObjectProperty(propPath) {
            if (propPath.node.key?.name === "engine") {
              const val = propPath.node.value;
              if (
                t.isCallExpression(val) &&
                t.isIdentifier(val.arguments[1], { name: "l" }) &&
                t.isCallExpression(val.arguments[0]) &&
                t.isIdentifier(val.arguments[0].arguments[1], { name: "o" })
              ) {
                // Swap so stored engine `l` is base and caller engine `o` overrides:
                // gu(gu({}, l), o)
                val.arguments[0].arguments[1] = t.identifier("l");
                val.arguments[1] = t.identifier("o");
              }
            }
          },
        });
      }
    },
  });

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

function patchReaderBrandIcons(ast) {
  const brandClasses = new Set([
    "icon-trancy-brand",
    "trancy-svg-brand",
    "outline-trancy",
  ]);
  const replacements = new Map(
    [...brandClasses].map((className) => [className, 0]),
  );
  const iconUrl = parser.parseExpression(`
    globalThis.chrome?.runtime?.getURL?.("assets/icons/ic48.png") ||
    globalThis.browser?.runtime?.getURL?.("assets/icons/ic48.png") ||
    "assets/icons/ic48.png"
  `);

  traverse(ast, {
    CallExpression(callPath) {
      const [element, props] = callPath.node.arguments;
      if (!t.isStringLiteral(element, { value: "svg" }) || !t.isObjectExpression(props))
        return;
      const classProperty = props.properties.find(
        (property) =>
          t.isObjectProperty(property) &&
          !property.computed &&
          t.isIdentifier(property.key, { name: "className" }) &&
          t.isStringLiteral(property.value) &&
          brandClasses.has(property.value.value),
      );
      if (!classProperty) return;

      const originalClass = classProperty.value.value;
      callPath.node.arguments = [
        t.stringLiteral("img"),
        t.objectExpression([
          t.objectProperty(
            t.identifier("className"),
            t.stringLiteral(`${originalClass} lexihalo-brand-icon`),
          ),
          t.objectProperty(t.identifier("src"), t.cloneNode(iconUrl, true)),
          t.objectProperty(t.identifier("alt"), t.stringLiteral("LexiHalo")),
          t.objectProperty(t.identifier("width"), t.stringLiteral("20")),
          t.objectProperty(t.identifier("height"), t.stringLiteral("20")),
          t.objectProperty(t.identifier("draggable"), t.booleanLiteral(false)),
        ]),
      ];
      replacements.set(originalClass, replacements.get(originalClass) + 1);
      callPath.skip();
    },
  });

  const expected = {
    "icon-trancy-brand": 1,
    "trancy-svg-brand": 2,
    "outline-trancy": 1,
  };
  for (const [className, count] of Object.entries(expected)) {
    if (replacements.get(className) !== count) {
      throw new Error(
        `reader: expected ${count} ${className} brand icon replacement(s), got ${replacements.get(className)}`,
      );
    }
  }
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
  const appPath = findPrimaryFunction(ast, area);
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

function patchExtensionClientEmit(ast, area) {
  let patched = 0;
  traverse(ast, {
    StringLiteral(path) {
      if (path.node.value === "Extension context invalidated.") {
        const method = path.findParent((p) => p.isClassMethod());
        if (method && t.isIdentifier(method.node.key, { name: "emit" })) {
          method.traverse({
            IfStatement(ifPath) {
              const test = ifPath.node.test;
              // Check if test is !(chrome.runtime?.id)
              if (
                t.isUnaryExpression(test, { operator: "!" }) &&
                ifPath.node.consequent
              ) {
                // Return safe empty object with data: {} so destructuring `const { data }` never throws
                ifPath.get("consequent").replaceWith(
                  t.returnStatement(
                    t.callExpression(t.identifier("e"), [
                      t.objectExpression([
                        t.objectProperty(t.identifier("message"), t.stringLiteral("invalidated")),
                        t.objectProperty(t.identifier("data"), t.objectExpression([])),
                      ]),
                    ]),
                  ),
                );
                patched += 1;
              }
            },
            CatchClause(catchPath) {
              // When chrome.runtime.sendMessage catch or error occurs
              const paramName = catchPath.node.param?.name;
              if (paramName) {
                catchPath.get("body").unshiftContainer(
                  "body",
                  parseStatements(`
                    if (!chrome.runtime?.id) {
                      e({ message: "invalidated", data: {} });
                      return;
                    }
                  `),
                );
                patched += 1;
              }
            },
            CallExpression(callPath) {
              // Intercept the .catch on sendMessage
              if (
                t.isMemberExpression(callPath.node.callee) &&
                t.isIdentifier(callPath.node.callee.property, { name: "catch" })
              ) {
                const catchFn = callPath.node.arguments[0];
                if (catchFn && (t.isArrowFunctionExpression(catchFn) || t.isFunctionExpression(catchFn))) {
                  const body = catchFn.body;
                  if (t.isBlockStatement(body)) {
                    body.body.unshift(
                      ...parseStatements(`
                        if (!chrome.runtime?.id || (e && String(e.message || e).includes("Extension context invalidated"))) {
                          e({ message: "invalidated", data: {} });
                          return;
                        }
                      `),
                    );
                    patched += 1;
                  }
                }
              }
            },
          });
        }
      }
    },
    ClassMethod(path) {
      if (path.node.key?.name === "getToken") {
        path.traverse({
          VariableDeclarator(varPath) {
            if (
              t.isObjectPattern(varPath.node.id) &&
              varPath.node.id.properties.some((p) => p.key?.name === "data") &&
              t.isYieldExpression(varPath.node.init)
            ) {
              varPath.node.init = t.logicalExpression(
                "||",
                varPath.node.init,
                t.objectExpression([
                  t.objectProperty(t.identifier("data"), t.objectExpression([])),
                ]),
              );
            }
          },
        });
      }
      if (path.node.key?.name === "getStateChunks") {
        path.traverse({
          VariableDeclarator(varPath) {
            if (
              t.isObjectPattern(varPath.node.id) &&
              varPath.node.id.properties.some((p) => p.key?.name === "data") &&
              t.isYieldExpression(varPath.node.init)
            ) {
              // (yield this.emit(...)) || {}
              varPath.node.init = t.logicalExpression(
                "||",
                varPath.node.init,
                t.objectExpression([
                  t.objectProperty(t.identifier("data"), t.objectExpression([])),
                ]),
              );
            }
          },
        });
      }
      if (path.node.key?.name === "getState") {
        path.traverse({
          VariableDeclarator(varPath) {
            if (
              t.isObjectPattern(varPath.node.id) &&
              varPath.node.id.properties.some((p) => p.key?.name === "data") &&
              t.isYieldExpression(varPath.node.init)
            ) {
              // (yield this.emit(...)) || {}
              varPath.node.init = t.logicalExpression(
                "||",
                varPath.node.init,
                t.objectExpression([
                  t.objectProperty(t.identifier("data"), t.objectExpression([])),
                ]),
              );
            }
          },
        });
      }
      if (path.node.key?.name === "getRuntime") {
        // Wrap getRuntime to fallback to local chrome.runtime when emit returns undefined or fails
        const block = path.get("body");
        if (block?.isBlockStatement()) {
          const areaHelper = area === "video" ? "Is" : "To";
          path.node.body = parser.parse(`
            function dummy() {
              return ${areaHelper}(this, null, function* () {
                try {
                  const res = yield this.emit("runtime", ["background"]);
                  if (res && res.data && res.data.version) return res;
                } catch (_) {}
                const ver = (typeof chrome !== "undefined" && chrome.runtime?.getManifest?.()?.version) || "8.3.0";
                const sc = (typeof chrome !== "undefined" && chrome.runtime?.getURL?.("").slice(0, -1)) || "";
                const rid = (typeof chrome !== "undefined" && chrome.runtime?.id) || "";
                return { message: "ok", data: { version: ver, scheme: sc, id: rid } };
              });
            }
          `).program.body[0].body;
        }
      }
    },
  });
  return patched;
}

function patchChineseSubtitleVariants(ast) {
  let patched = 0;
  let lookupPatched = 0;
  traverse(ast, {
    VariableDeclarator(declaratorPath) {
      if (
        !t.isIdentifier(declaratorPath.node.id, { name: "xf" }) ||
        !t.isArrowFunctionExpression(declaratorPath.node.init)
      )
        return;
      const left = t.identifier("left");
      const right = t.identifier("right");
      const leftFamily = t.identifier("leftFamily");
      const rightFamily = t.identifier("rightFamily");
      const replacement = t.arrowFunctionExpression(
        [left, right],
        t.blockStatement([
          t.variableDeclaration("const", [
            t.variableDeclarator(
              leftFamily,
              t.callExpression(t.identifier("wf"), [left]),
            ),
            t.variableDeclarator(
              rightFamily,
              t.callExpression(t.identifier("wf"), [right]),
            ),
          ]),
          t.ifStatement(
            t.logicalExpression(
              "||",
              t.unaryExpression("!", leftFamily),
              t.binaryExpression("!==", leftFamily, rightFamily),
            ),
            t.returnStatement(t.booleanLiteral(false)),
          ),
          t.ifStatement(
            t.binaryExpression("!==", leftFamily, t.stringLiteral("zh")),
            t.returnStatement(t.booleanLiteral(true)),
          ),
          t.returnStatement(
            t.binaryExpression(
              "===",
              t.callExpression(t.identifier("Pn"), [left]),
              t.callExpression(t.identifier("Pn"), [right]),
            ),
          ),
        ]),
      );
      t.addComment(
        replacement,
        "leading",
        " LexiHalo: distinguish Simplified and Traditional Chinese subtitles. ",
      );
      declaratorPath.get("init").replaceWith(replacement);
      patched += 1;
    },
    ClassMethod(methodPath) {
      if (!t.isIdentifier(methodPath.node.key, { name: "evalLookupAllowed" }))
        return;
      methodPath.node.body = t.blockStatement(
        parseStatements(`
          const source = this.sourceLang();
          const learningFamily = wf(this.learningLang);
          this.setLookupAllowed(
            !source || !learningFamily || wf(source) === learningFamily,
          );
        `),
      );
      lookupPatched += 1;
    },
  });
  if (patched !== 1 || lookupPatched !== 1)
    throw new Error(
      `video: expected one Chinese subtitle comparison and one lookup-family guard, patched ${patched}/${lookupPatched}`,
    );
}

function patchYouTubeCaptionStartup(ast) {
  let selfFetchPatches = 0;
  let trackWaitPatches = 0;
  traverse(ast, {
    ClassMethod(methodPath) {
      if (t.isIdentifier(methodPath.node.key, { name: "downloadJSON3Caption" })) {
        methodPath.traverse({
          ObjectProperty(propertyPath) {
            if (!t.isIdentifier(propertyPath.node.key, { name: "allowSelfFetch" }))
              return;
            const enabled = t.booleanLiteral(true);
            t.addComment(
              enabled,
              "leading",
              " LexiHalo: try the signed YouTube caption URL before waiting for interception. ",
            );
            propertyPath.get("value").replaceWith(enabled);
            selfFetchPatches += 1;
          },
        });
      }
      if (t.isIdentifier(methodPath.node.key, { name: "drivePlayerTrack" })) {
        methodPath.traverse({
          BinaryExpression(binaryPath) {
            if (
              binaryPath.node.operator !== "<" ||
              !t.isNumericLiteral(binaryPath.node.right, { value: 50 })
            )
              return;
            binaryPath.node.right = t.numericLiteral(10);
            trackWaitPatches += 1;
          },
        });
      }
    },
  });
  if (selfFetchPatches !== 1 || trackWaitPatches !== 1)
    throw new Error(
      `video: expected one YouTube self-fetch and track-wait patch, got ${selfFetchPatches}/${trackWaitPatches}`,
    );
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
    TryStatement(path) {
      const block = path.get("block");
      const statements = block.node.body;
      const findEngineStmt = statements.find((s) => {
        const code = generate(s).code;
        return code.includes('only: ["translatorService"]') && code.includes("byok-");
      });
      if (findEngineStmt) {
        const index = statements.indexOf(findEngineStmt);
        const engineFunction = parser.parse(`
          function* dummy() {
            const { translatorService: r } = yield qs.getStateChunks({
              only: ["translatorService"],
            });
            const isAiEngine = (e) =>
              Boolean(e) &&
              ("user" === e.type ||
                String(e._id || "").startsWith("byok-") ||
                "built-in" !== e.type);
            const preferredEngine =
              [r?.sentence, r?.subtitle, r?.fulltext].find(
                (e) => isAiEngine(e) && r.engines?.some((x) => x._id === e._id),
              ) ||
              r.engines?.find(isAiEngine);
            const i =
              preferredEngine &&
              (r.engines?.find((e) => e._id === preferredEngine._id) || preferredEngine);
          }
        `, { sourceType: "module" });
        const engineNodes = engineFunction.program.body[0].body.body;
        block.node.body.splice(index, 1, ...engineNodes);
      }
      const parseStmt = statements.find((s) => {
        const code = generate(s).code;
        return code.includes("JSON.parse(c)") && code.includes("AI 返回格式无效");
      });
      if (parseStmt) {
        // Replace parsing logic with resilient json parsing and fallback
        const index = statements.indexOf(parseStmt);
        const setStmt = statements[index + 1]; // F(p)
        const setIdentifier =
          t.isExpressionStatement(setStmt) &&
          t.isCallExpression(setStmt.expression) &&
          t.isIdentifier(setStmt.expression.callee)
            ? setStmt.expression.callee.name
            : "F";
        const newNodes = parseStatements(`
          let p = null;
          if (u >= 0 && d > u) {
            try {
              p = JSON.parse(c.slice(u, d + 1));
            } catch (_) {}
          }
          if (!p) {
            try {
              p = JSON.parse(c);
            } catch (_) {}
          }
          if (!p || !Array.isArray(p.senses) || p.senses.length === 0) {
            const plain = c.replace(/[{}\\[\\]"]/g, "").trim();
            p = {
              syllables: [],
              pronunciations: [],
              senses: [
                {
                  pos: "",
                  definition: [
                    {
                      translations: [plain || l],
                      targetTranslation: "",
                      examples: [],
                    },
                  ],
                },
              ],
              inflections: [],
              etymology: "",
              examples: [],
              phrases: [],
              synonyms: [],
              relatedWords: [],
            };
          }
          ${setIdentifier}(p);
        `);
        block.node.body.splice(index, 2, ...newNodes);
      }
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

function patchSchemesDefault(ast, area) {
  const defaultSchemesAst = parser.parseExpression(`
    [
      {
        name: "Oxford",
        scheme: "https://www.oxfordlearnersdictionaries.com/definition/english/$TEXT",
        from: ["*"],
        to: ["*"],
        codes: { en: "english" },
        options: { width: 450, height: 750, type: "popup" }
      },
      {
        name: "Collins",
        scheme: "https://www.collinsdictionary.com/dictionary/english/$TEXT",
        from: ["*"],
        to: ["*"],
        codes: { en: "english" },
        options: { width: 450, height: 750, type: "popup" }
      },
      {
        name: "Longman",
        scheme: "https://www.ldoceonline.com/dictionary/$TEXT",
        from: ["*"],
        to: ["*"],
        codes: { en: "english" },
        options: { width: 450, height: 750, type: "popup" }
      },
      {
        name: "Youdao",
        scheme: "https://dict.youdao.com/w/$TEXT",
        from: ["*"],
        to: ["*"],
        codes: {},
        options: { width: 450, height: 750, type: "popup" }
      }
    ]
  `);

  traverse(ast, {
    ObjectProperty(path) {
      if (
        path.node.key?.name === "schemes" &&
        t.isArrayExpression(path.node.value) &&
        path.node.value.elements.length === 0 &&
        path.parentPath.isObjectExpression()
      ) {
        const propNames = path.parentPath.node.properties.map((p) => p.key?.name);
        if (propNames.includes("partOfSpeech") && propNames.includes("PRACTICE_LIMIT")) {
          path.node.value = t.cloneNode(defaultSchemesAst);
        }
      }
    },
  });

  if (area === "video") {
    traverse(ast, {
      MemberExpression(path) {
        if (
          path.node.property?.name === "schemes" &&
          path.node.object?.name === "f" &&
          path.parentPath.isMemberExpression() &&
          path.parentPath.node.property?.name === "map"
        ) {
          // Replace f.schemes with (f.schemes && f.schemes.length > 0 ? f.schemes : defaultSchemes)
          path.replaceWith(
            t.conditionalExpression(
              t.logicalExpression(
                "&&",
                t.memberExpression(t.identifier("f"), t.identifier("schemes")),
                t.binaryExpression(
                  ">",
                  t.memberExpression(
                    t.memberExpression(t.identifier("f"), t.identifier("schemes")),
                    t.identifier("length"),
                  ),
                  t.numericLiteral(0),
                ),
              ),
              t.memberExpression(t.identifier("f"), t.identifier("schemes")),
              t.cloneNode(defaultSchemesAst),
            ),
          );
        }
      },
    });
  }
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
  if (name === "background" || name === "reader" || name === "video") {
    patchSchemesDefault(ast, name);
  }
  let sourceComponents = [];
  if (name === "background") installBackgroundStructuredAiBridge(ast);
  if (name === "reader") {
    patchExtensionClientEmit(ast, "reader");
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
    patchReaderBrandIcons(ast);
  }
  if (name === "video") {
    patchExtensionClientEmit(ast, "video");
    patchChineseSubtitleVariants(ast);
    patchYouTubeCaptionStartup(ast);
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

// Assemble clean, standalone dist/ distribution directory
const distDir = path.join(root, "dist");
fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

// 1. Copy manifest.json
fs.copyFileSync(path.join(root, "manifest.json"), path.join(distDir, "manifest.json"));

// 2. Copy HTML pages
for (const filename of ["index.html", "popup.html", "byok.html", "site-rules.html"]) {
  fs.copyFileSync(path.join(root, filename), path.join(distDir, filename));
}

// 3. Copy _locales
fs.cpSync(path.join(root, "_locales"), path.join(distDir, "_locales"), {
  recursive: true,
  force: true,
});

// 4. Copy assets directory
fs.cpSync(path.join(root, "assets"), path.join(distDir, "assets"), {
  recursive: true,
  force: true,
});

const reportsDir = path.join(root, "artifacts", "reports");
fs.mkdirSync(reportsDir, { recursive: true });
fs.writeFileSync(
  path.join(reportsDir, "bundle-renames.json"),
  `${JSON.stringify(renameReport, null, 2)}\n`,
);
console.log(
  `Built ${Object.keys(baseline.entries).length} readable single bundles with ${Object.values(renameReport).reduce((sum, item) => sum + item.count, 0)} high-confidence renames.`,
);
