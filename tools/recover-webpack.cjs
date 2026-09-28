#!/usr/bin/env node
/**
 * Recover readable source views from minified Webpack-style browser bundles.
 *
 * This is intentionally a recovery/inspection tool, not a source-map replacement.
 * It preserves module factories, safely renames Webpack plumbing, extracts module
 * dependency metadata, and leaves the production assets untouched.
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

function fromRecoveryDependencies(packageName) {
  try {
    return require(path.join(dependencyRoot, packageName));
  } catch (error) {
    throw new Error(
      `Missing ${packageName}. Install the recovery dependencies with:\n` +
        "npm install --prefix .pi/recovery-tools --no-save --no-package-lock " +
        "@babel/parser@7.27.0 @babel/traverse@7.27.0 @babel/generator@7.27.0\n\n" +
        error.message,
    );
  }
}

const parser = fromRecoveryDependencies("@babel/parser");
const traverse = fromRecoveryDependencies("@babel/traverse").default;
const generate = fromRecoveryDependencies("@babel/generator").default;
const t = fromRecoveryDependencies("@babel/types");

const DEFAULT_INPUTS = [
  "vendor/legacy/background.js",
  "vendor/legacy/edreader-main.js",
  "vendor/legacy/edvideo-main.js",
  "vendor/legacy/ld-main.js",
  "vendor/legacy/popup.js",
  "vendor/legacy/romanize-main.js",
  "vendor/legacy/tagger-main.js",
];

const outputRoot = path.join(root, "recovered");
const inputs = process.argv.slice(2).length
  ? process.argv.slice(2)
  : DEFAULT_INPUTS;

function parseScript(source, filename) {
  return parser.parse(source, {
    sourceType: "script",
    sourceFilename: filename,
    allowReturnOutsideFunction: true,
    errorRecovery: true,
    plugins: ["jsx"],
  });
}

function propertyId(property) {
  const key = property.key;
  if (t.isNumericLiteral(key)) return String(key.value);
  if (t.isStringLiteral(key) && /^\d+$/.test(key.value)) return key.value;
  if (t.isIdentifier(key) && /^\d+$/.test(key.name)) return key.name;
  return null;
}

function propertyFactory(property) {
  if (t.isObjectMethod(property)) {
    return t.functionExpression(
      null,
      property.params,
      property.body,
      property.generator,
      property.async,
    );
  }
  if (
    t.isObjectProperty(property) &&
    (t.isFunctionExpression(property.value) ||
      t.isArrowFunctionExpression(property.value))
  ) {
    return property.value;
  }
  return null;
}

function registryScore(objectPath) {
  const properties = objectPath.node.properties;
  if (properties.length < 2) return null;

  let numericFactories = 0;
  for (const property of properties) {
    if (propertyId(property) !== null && propertyFactory(property))
      numericFactories += 1;
  }

  if (numericFactories < 2 || numericFactories / properties.length < 0.8)
    return null;
  return numericFactories;
}

function findRegistry(ast) {
  const candidates = [];
  traverse(ast, {
    ObjectExpression(objectPath) {
      const score = registryScore(objectPath);
      if (score !== null) candidates.push({ path: objectPath, score });
    },
  });
  candidates.sort((left, right) => right.score - left.score);
  return candidates[0] || null;
}

function functionBindingName(functionPath) {
  if (functionPath.isFunctionDeclaration() && functionPath.node.id) {
    return functionPath.node.id.name;
  }
  const parent = functionPath.parentPath;
  if (
    parent &&
    parent.isVariableDeclarator() &&
    t.isIdentifier(parent.node.id)
  ) {
    return parent.node.id.name;
  }
  if (
    parent &&
    parent.isAssignmentExpression() &&
    t.isIdentifier(parent.node.left)
  ) {
    return parent.node.left.name;
  }
  return null;
}

function safelyRenameWebpackRuntime(registryPath) {
  const declarator = registryPath.parentPath;
  if (
    !declarator ||
    !declarator.isVariableDeclarator() ||
    !t.isIdentifier(declarator.node.id)
  ) {
    return { registry: null, require: null };
  }

  const oldRegistryName = declarator.node.id.name;
  const binding = declarator.scope.getBinding(oldRegistryName);
  const requireFunctionPaths = new Set();
  if (binding) {
    for (const referencePath of binding.referencePaths) {
      const functionPath = referencePath.getFunctionParent();
      if (functionPath) requireFunctionPaths.add(functionPath);
    }
  }

  if (oldRegistryName !== "__webpack_modules__") {
    declarator.scope.rename(oldRegistryName, "__webpack_modules__");
  }

  let requireName = null;
  for (const functionPath of requireFunctionPaths) {
    if (functionPath.node.params.length !== 1) continue;
    const candidateName = functionBindingName(functionPath);
    if (!candidateName || candidateName === "__webpack_require__") {
      requireName = candidateName || requireName;
      continue;
    }

    const ownerScope = functionPath.scope.parent;
    if (!ownerScope || ownerScope.hasBinding("__webpack_require__")) continue;
    ownerScope.rename(candidateName, "__webpack_require__");
    requireName = "__webpack_require__";
    break;
  }

  return {
    registry: oldRegistryName,
    require: requireName,
  };
}

function normalizeFactory(factoryNode) {
  const factorySource = generate(factoryNode, {
    comments: true,
    compact: false,
  }).code;
  const wrapperAst = parser.parse(`const moduleFactory = ${factorySource};`, {
    sourceType: "module",
    plugins: ["jsx"],
  });

  let factoryPath = null;
  traverse(wrapperAst, {
    VariableDeclarator(variablePath) {
      if (
        t.isIdentifier(variablePath.node.id, { name: "moduleFactory" }) &&
        (variablePath.get("init").isFunctionExpression() ||
          variablePath.get("init").isArrowFunctionExpression())
      ) {
        factoryPath = variablePath.get("init");
        variablePath.stop();
      }
    },
  });

  if (!factoryPath) throw new Error("Unable to normalize a module factory");

  const semanticParameters = ["module", "exports", "__webpack_require__"];
  factoryPath.node.params.slice(0, 3).forEach((parameter, index) => {
    if (!t.isIdentifier(parameter)) return;
    const nextName = semanticParameters[index];
    if (
      parameter.name !== nextName &&
      !factoryPath.scope.hasOwnBinding(nextName)
    ) {
      factoryPath.scope.rename(parameter.name, nextName);
    }
  });

  return { ast: wrapperAst, factoryPath };
}

function inspectFactory(factoryPath) {
  const dependencies = new Set();
  const exportNames = new Set();
  const strings = [];

  factoryPath.traverse({
    CallExpression(callPath) {
      if (
        t.isIdentifier(callPath.node.callee, { name: "__webpack_require__" }) &&
        callPath.node.arguments.length > 0
      ) {
        const argument = callPath.node.arguments[0];
        if (t.isNumericLiteral(argument) || t.isStringLiteral(argument)) {
          dependencies.add(String(argument.value));
        }
      }
    },
    MemberExpression(memberPath) {
      if (!t.isIdentifier(memberPath.node.object, { name: "exports" })) return;
      if (
        !memberPath.node.computed &&
        t.isIdentifier(memberPath.node.property)
      ) {
        exportNames.add(memberPath.node.property.name);
      } else if (
        memberPath.node.computed &&
        t.isStringLiteral(memberPath.node.property)
      ) {
        exportNames.add(memberPath.node.property.value);
      }
    },
    StringLiteral(stringPath) {
      const value = stringPath.node.value.trim();
      if (
        value.length >= 4 &&
        value.length <= 80 &&
        /[A-Za-z]/.test(value) &&
        !/^[A-Za-z_$][\w$]*$/.test(value)
      ) {
        strings.push(value);
      }
    },
  });

  return {
    dependencies: [...dependencies].sort((a, b) => Number(a) - Number(b)),
    exports: [...exportNames].sort(),
    signals: [...new Set(strings)].slice(0, 12),
  };
}

const GLOBAL_ID_LABELS = {
  232: "dayjs",
  703: "get-intrinsic",
  2350: "react-draggable",
  2935: "lodash",
  3060: "js-md5",
  4429: "howler",
  4922: "html-entities",
  9784: "event-emitter",
};

const BUNDLE_ID_LABELS = {
  "tagger-main": {
    293: "pos-transformation-rules",
    1990: "pos-rule-operations",
    1411: "english-word-index",
    6508: "pos-tag-lexicon",
    9742: "pos-lexicon-data",
    9833: "pos-tagger-runtime",
  },
  "romanize-main": {
    1296: "korean-romanizer",
    6403: "korean-romanization-table",
  },
};

const LABEL_RULES = [
  ["redux-toolkit", /createSlice|redux-thunk|miniSerializeError/],
  ["material-ui", /Mui[A-Z]|muiName|material-ui/],
  ["emotion", /@emotion|EmotionCache|data-emotion/],
  ["lodash", /lodash|LodashWrapper|__wrapped__/],
  [
    "webextension-api",
    /chrome\.(storage|runtime|tabs)|browser\.(storage|runtime)/,
  ],
  ["subtitle", /subtitle|caption/i],
  ["translation", /translate|translator|translation/i],
  ["language-detection", /language.*confidence|detectLanguage/i],
  ["romanization", /romaniz|hiragana|katakana|pinyin/i],
  ["pos-tagger", /part.of.speech|posTagger|lexicon/i],
];

function inferLabel(bundleName, id, factoryCode, metadata) {
  const exports = new Set(metadata.exports);
  if (exports.has("createRoot") && exports.has("createPortal"))
    return "react-dom";
  if (exports.has("Children") && exports.has("createElement")) return "react";
  if (exports.has("jsx") && exports.has("jsxs")) return "react-jsx-runtime";
  if (exports.has("unstable_scheduleCallback")) return "react-scheduler";
  if (exports.has("isValidElementType") && exports.has("typeOf"))
    return "react-is";
  if ([...exports].some((name) => name.startsWith("renderTo")))
    return "react-dom-server";
  if (exports.has("Howl") && exports.has("Howler")) return "howler";

  const bundleOverrides = BUNDLE_ID_LABELS[bundleName] || {};
  if (bundleOverrides[id]) return bundleOverrides[id];
  if (GLOBAL_ID_LABELS[id]) return GLOBAL_ID_LABELS[id];

  for (const [label, pattern] of LABEL_RULES) {
    if (pattern.test(factoryCode)) return label;
  }
  return "module";
}

function moduleFilename(id, label) {
  const numericId = /^\d+$/.test(id)
    ? id.padStart(5, "0")
    : id.replace(/[^\w.-]/g, "_");
  return `${numericId}--${label}.js`;
}

function writeJson(filename, value) {
  fs.writeFileSync(filename, `${JSON.stringify(value, null, 2)}\n`);
}

function recoverBundle(relativeInput) {
  const inputPath = path.resolve(root, relativeInput);
  const source = fs.readFileSync(inputPath, "utf8");
  const bundleName = path.basename(relativeInput, path.extname(relativeInput));
  const bundleDir = path.join(outputRoot, bundleName);
  fs.rmSync(bundleDir, { recursive: true, force: true });
  fs.mkdirSync(bundleDir, { recursive: true });

  process.stdout.write(`Recovering ${relativeInput} ... `);
  const ast = parseScript(source, relativeInput);
  const registry = findRegistry(ast);

  if (!registry) {
    fs.writeFileSync(
      path.join(bundleDir, "bundle.readable.js"),
      `${generate(ast, { comments: true, compact: false }).code}\n`,
    );
    writeJson(path.join(bundleDir, "module-map.json"), {
      source: relativeInput,
      format: "standalone-bundle",
      moduleCount: 0,
      note: "No Webpack numeric module registry was detected; the readable bundle is the recovered source view.",
    });
    process.stdout.write("standalone bundle\n");
    return { source: relativeInput, bundle: bundleName, moduleCount: 0 };
  }

  const modulesDir = path.join(bundleDir, "modules");
  fs.mkdirSync(modulesDir, { recursive: true });
  const runtimeNames = safelyRenameWebpackRuntime(registry.path);
  const moduleMap = [];

  for (const property of registry.path.node.properties) {
    const id = propertyId(property);
    const factory = propertyFactory(property);
    if (id === null || !factory) continue;

    const normalized = normalizeFactory(t.cloneNode(factory, true));
    const metadata = inspectFactory(normalized.factoryPath);
    const factoryCode = generate(normalized.ast, {
      comments: true,
      compact: false,
    }).code;
    const label = inferLabel(bundleName, id, factoryCode, metadata);
    const filename = moduleFilename(id, label);
    const header = [
      "/**",
      ` * Recovered Webpack module ${id}.`,
      ` * Guessed role: ${label}.`,
      ` * Dependencies: ${metadata.dependencies.length ? metadata.dependencies.join(", ") : "none detected"}.`,
      " * Factory parameter names were restored; local minified names remain unchanged.",
      " */",
    ].join("\n");
    fs.writeFileSync(
      path.join(modulesDir, filename),
      `${header}\n${factoryCode}\nexport default moduleFactory;\n`,
    );

    moduleMap.push({ id, label, file: `modules/${filename}`, ...metadata });
  }

  moduleMap.sort((left, right) => Number(left.id) - Number(right.id));
  writeJson(path.join(bundleDir, "module-map.json"), {
    source: relativeInput,
    format: "webpack",
    moduleCount: moduleMap.length,
    originalRuntimeNames: runtimeNames,
    modules: moduleMap,
  });

  fs.writeFileSync(
    path.join(bundleDir, "bundle.readable.js"),
    `${generate(ast, { comments: true, compact: false }).code}\n`,
  );

  registry.path.node.properties = [];
  registry.path.addComment(
    "inner",
    ` ${moduleMap.length} module factories extracted to ./modules; see module-map.json. `,
  );
  fs.writeFileSync(
    path.join(bundleDir, "bootstrap.readable.js"),
    `${generate(ast, { comments: true, compact: false }).code}\n`,
  );

  fs.writeFileSync(
    path.join(bundleDir, "README.md"),
    `# ${bundleName}\n\n` +
      `Recovered from \`${relativeInput}\`. ${moduleMap.length} Webpack module factories were extracted.\n\n` +
      "- `bundle.readable.js`: complete behavior-preserving readable view.\n" +
      "- `bootstrap.readable.js`: runtime/application bootstrap with the registry removed for easier inspection.\n" +
      "- `modules/`: one factory per file with restored Webpack parameter names.\n" +
      "- `module-map.json`: IDs, guessed roles, dependencies, exports, and string signals.\n\n" +
      "The extracted module files are analysis views, not independently executable ES modules.\n",
  );

  process.stdout.write(`${moduleMap.length} modules\n`);
  return {
    source: relativeInput,
    bundle: bundleName,
    moduleCount: moduleMap.length,
  };
}

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });
const summary = inputs.map(recoverBundle);
writeJson(path.join(outputRoot, "recovery-summary.json"), summary);
const moduleTotal = summary.reduce(
  (total, item) => total + item.moduleCount,
  0,
);
fs.writeFileSync(
  path.join(outputRoot, "README.md"),
  `# Recovered source\n\n` +
    `这里是从压缩构建产物恢复出的可读源码视图，共处理 ${summary.length} 个 bundle、拆分 ${moduleTotal} 个 Webpack 模块。\n\n` +
    `## 目录说明\n\n` +
    `每个 bundle 目录通常包含：\n\n` +
    `- \`bundle.readable.js\`：完整、可读并保留行为的 bundle；\n` +
    `- \`bootstrap.readable.js\`：移除模块表后的 Webpack runtime 和入口应用代码；\n` +
    `- \`modules/\`：按模块 ID 拆分的工厂函数；\n` +
    `- \`module-map.json\`：模块依赖、导出、字符串特征与推断名称。\n\n` +
    `没有检测到 source map，因此原始文件名、注释和局部变量名无法无损恢复。` +
    `当前已安全恢复 \`module\`、\`exports\`、\`__webpack_require__\` 等运行时名称，` +
    `并为可可靠识别的 React、Lodash、Day.js、Howler、词典及词性标注模块添加语义名称。` +
    `其余 \`module\` 名称应结合调用关系逐步人工确认。\n\n` +
    `## 重新生成\n\n` +
    "```bash\n" +
    `npm install --prefix .pi/recovery-tools --no-save --no-package-lock ` +
    `@babel/parser@7.27.0 @babel/traverse@7.27.0 @babel/generator@7.27.0\n` +
    `node tools/recover-webpack.cjs\n` +
    `npx --yes prettier@3.5.3 --write "recovered/**/*.{js,json,md}"\n` +
    "```\n\n" +
    `恢复目录仅用于维护和分析；浏览器扩展仍从 \`assets/\` 加载。原有构建文件没有被覆盖。\n`,
);
console.log(`Recovered source written to ${path.relative(root, outputRoot)}/`);
