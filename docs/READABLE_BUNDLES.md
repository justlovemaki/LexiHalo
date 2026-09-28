# Readable single-bundle runtime

LexiHalo 直接运行格式化后的单 Bundle。本方案刻意保留 Webpack runtime 和 module cache，不再执行完整 ESM 拆分。

## 活动入口

| 功能               | 稳定源                                                                                  | 浏览器实际加载            |
| ------------------ | --------------------------------------------------------------------------------------- | ------------------------- |
| Background         | `vendor/legacy/background.js` + `src/background/`                                       | `assets/background.js`    |
| Reader             | `vendor/legacy/edreader-main.js` + `src/reader/` + `src/shared/clearScopedCache.js`          | `assets/edreader-main.js` |
| Video              | `vendor/legacy/edvideo-main.js` + `src/video/`                                           | `assets/edvideo-main.js`  |
| Popup              | `vendor/legacy/popup.js` + `src/popup/ui/`                                                   | `assets/popup.js`         |
| Language detection | `vendor/legacy/ld-main.js`                                              | `assets/ld-main.js`       |
| POS tagger         | `vendor/legacy/tagger-main.js`                                          | `assets/tagger-main.js`   |
| Romanization       | `vendor/legacy/romanize-main.js`                                        | `assets/romanize-main.js` |

`manifest.json` 与三个 HTML 页面均直接引用上述格式化 Bundle；未完成的 ESM materialization/runtime graph 已从活动路径和仓库中移除。

## 语义命名规则

`tools/build-readable-bundles.mjs` 使用 Babel AST binding rename，只处理高置信度第一方符号：

- 第一方控制器、服务、状态仓库与 action creator；
- Reader/Video 页面组件、字幕提供器、播放器和翻译器；
- Background 消息总线、缓存、翻译执行器和浏览器 API；
- Popup 页面及导航函数。

以下内容默认不改名：

- 第三方库内部实现；
- Webpack/Babel runtime 和辅助函数；
- 国际化文本、SVG、词典、语言模型及大规模数据；
- 无法高置信度判断职责的短变量。

构建后完整映射写入 `artifacts/reports/bundle-renames.json`。当前活动 Bundle 应用了 372 个作用域安全重命名，三个语言/数据 Bundle 的内部符号保持不变。

## 界面源码

第一方界面不再以 Bundle 内函数作为维护入口。源码工厂会在构建时解析依赖并替换对应组件：

- `src/reader/`：33 个 Reader 页面、设置、卡片、导航、快速翻译、控制中心和 Slider 根组件；
- `src/video/ui/`：4 个 Video 双语字幕与学习界面组件；
- `src/popup/ui/`：Popup 主组件及其界面行为；
- `src/pages/`：4 个扩展 HTML 入口模板；
- `src/locales/`：17 组扩展界面文案，构建时同步到 `_locales/`。

组件采用延迟初始化，避免旧 Bundle 中后置依赖的 TDZ 问题。任何源码工厂、依赖或替换目标缺失都会使构建失败，安装清单记录在 `artifacts/reports/bundle-renames.json`。

## 构建与校验

```bash
npm install
npm run build
npm run test:browser
npm run check
```

- `npm run build` 从 `config/`、`vendor/legacy/` 和 `src/` 重复生成全部格式化 Bundle；
- `npm run test:browser` 使用 Chromium 加载扩展，覆盖 Background、Popup、Options、Reader、Video、翻译、缓存、站点规则和语言 API，并将报告写入 `artifacts/reports/`；
- `npm run check` 先构建，再执行语法检查、必需补丁检查、活动入口检查、重命名边界检查，并连续重建后比较 SHA-256，验证构建确定性。

## 恢复边界

上游产物没有 source map，因此无法证明恢复原作者的精确文件名、局部变量名、注释、TypeScript 类型或构建前目录结构。这里的完成标准是：

1. 行为与当前独立版/BYOK 基线保持一致；
2. 实际运行代码已格式化；
3. 关键第一方语义明确；
4. 不进行低置信度猜测。

机械拆包和语义恢复目录 `recovered/`、`src-recovered/` 只用于追溯，可通过 `npm run recover` 重建，因此不属于主要源码，也不纳入 Git。
