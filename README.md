# LexiHalo

LexiHalo 是一个以本地独立运行和 BYOK 为核心的 AI 翻译、网页沉浸翻译与视频双语字幕浏览器扩展。

## 主要功能

- 视频双语字幕与字幕样式控制
- 使用本地 BYOK AI 对原字幕进行智能分段，并自动修复 ASR 错词、标点、大小写和重复词
- 无字幕视频可将浏览器可读取的音频直接上传到 OpenAI 音频识别接口，先生成带时间轴的字幕，再进行修复和翻译
- 点击字幕单词打开 AI 详解
- Web Dictionary 与美式/英式发音切换
- 网页划词翻译、快速翻译和沉浸式全文翻译
- 沉浸式翻译可按网站自动开启
- 支持 Google 翻译、Microsoft Translator（Azure）、DeepL，以及 OpenAI、OpenRouter、DeepSeek、Gemini、Claude 和 OpenAI 兼容接口
- API Key 仅保存在 `chrome.storage.local`
- 不依赖原上游账号、会员系统或云端额度

## 安装

1. 下载或克隆本仓库。
2. 运行构建命令：
   ```bash
   npm install
   npm run build
   ```
3. 打开 Chromium 浏览器的扩展管理页面（如 `chrome://extensions/`）。
4. 开启“开发者模式”。
5. 选择“加载已解压的扩展程序”，并选择生成的 **`dist`** 目录。
6. 建议停用其他同源版本，避免内容脚本冲突。

## 配置 BYOK

在扩展管理页面打开 LexiHalo 的“扩展程序选项”，可添加 AI 模型、Microsoft Translator（Azure）或 DeepL。Microsoft 使用官方 Azure Translator API Key，并可选填 Region；DeepL 支持 Free/Pro API Endpoint。未配置时，两者也会显示在侧边栏和视频字幕的翻译引擎列表中，点击即可进入对应配置；API Key 仅保存在本机。

## 配置 AI 字幕翻译与修复

在 BYOK 页面配置 OpenAI、OpenRouter、DeepSeek、Gemini、Claude 或 OpenAI 兼容接口。在视频字幕中选择该 AI 引擎作为字幕翻译引擎时，系统会用一次模型请求同时完成上下文消歧、ASR 保守修复和翻译，主副字幕同步呈现。首批优先处理当前 3 行，后续使用稳定 6 行窗口并最多并发 2 个请求；跳转播放位置会取消旧请求。组合响应缺行时仅对缺失行执行同模型普通翻译，必要时再使用机器翻译兜底，避免整批字幕失败。选择 Google / 微软等机器翻译引擎时，保持原始字幕不修改。

OpenAI 和 OpenAI 兼容引擎还可在 BYOK 页面配置“音频识别模型”与“音频识别 Endpoint”。在任一受支持视频平台可从播放器菜单选择“AI 字幕（音频转写）”：扩展优先获取独立音频流，也可使用播放器公开的直连媒体文件，以 `multipart/form-data` 直接调用 `/v1/audio/transcriptions`，将返回的分段时间戳安装为原字幕，然后进入现有 AI 修复与翻译流程。默认推荐 `whisper-1` 和 `verbose_json`，还可配置识别语言和提示词；请求使用 `file`、`model`、`language`、`prompt`、`response_format`、`temperature` 等标准 multipart 字段。单个媒体流需小于 24 MB。识别结果会保存在本机缓存中。使用 DRM、MediaSource Blob 或加密分片且不公开媒体地址的平台，浏览器扩展无法提取完整音频，会显示明确提示。

“双语字幕”页提供“重新载入当前字幕”和“彻底清除 AI 字幕缓存”：前者保留持久 AI 结果并恢复原字幕，不重新下载字幕轨道；后者会强制下次重新调用模型。沉浸式翻译、划词翻译和快速翻译继续使用各自独立缓存。完整流程见 [`docs/AI_SUBTITLES.md`](docs/AI_SUBTITLES.md)。

## 配置沉浸式翻译常开网站

在任意网页点击右键，可直接选择“将当前网站加入沉浸翻译常开”或“将当前网站移出沉浸翻译常开”。也可以打开 LexiHalo 设置，进入“沉浸翻译常开”管理规则；页面支持一键添加/移除当前网站、回车快速添加规则和单条删除；批量编辑中还可维护域名（`example.com`）、子域通配符（`*.example.com`）、路径通配符（`*.example.com/video/*`）及完整 URL。修改会立即应用到已打开的网页，并在单页应用切换地址时重新匹配。双语字幕继续使用 LexiHalo 原有的常开设置。

## 支持范围

视频字幕脚本覆盖 YouTube、Netflix、Coursera、Udemy、TED、Max、Disney+、edX、Prime Video、Bilibili、Vimeo 等 Manifest 中声明的网站。实际可用性会受到站点页面结构和字幕权限变化影响。

## 独立版说明

本项目基于压缩后的浏览器扩展构建产物改造，不包含原始前端或后端源码。原上游账号、云端收藏、托管 AI 字幕、托管 AI 总结、托管高级引擎和云端 TTS 等功能已停用或从界面移除。

详细改造记录见 [`docs/FREE_ACCESS.md`](docs/FREE_ACCESS.md)，网络与历史域名审计见 [`docs/EXTERNAL_LINKS.md`](docs/EXTERNAL_LINKS.md)。

## 项目结构

- `dist/`：构建生成的干净扩展产物目录（包含 `manifest.json`、页面 HTML、`_locales/` 和 `assets/`），Chrome 扩展直接加载此目录即可。
- `src/`：主要可维护源码和样式；Reader 页面/卡片/设置位于 `src/reader/`，Video UI 位于 `src/video/ui/`，Popup UI 位于 `src/popup/ui/`，HTML 模板位于 `src/pages/`，界面文案位于 `src/locales/`。
- `config/`：构建基线及高置信度符号配置。
- `vendor/legacy/`：从原扩展保留的稳定 Bundle 基线。
- `assets/`：静态资源和基础 Bundle。
- `tools/`：恢复、构建、检查和浏览器回归脚本。
- `docs/`：架构、改造与审计文档。
- `artifacts/`、`recovered/`、`src-recovered/`：可再生报告和恢复分析结果，不纳入 Git。

## 构建与恢复

扩展现在直接运行格式化后的单 Bundle：`assets/background.js`、`assets/edreader-main.js`、`assets/edvideo-main.js`、`assets/popup.js` 及三个语言工具 Bundle。构建器以 `vendor/legacy/` 和 `src/` 为输入，使用 AST 作用域绑定进行高置信度语义命名；第三方库、Webpack/Babel 辅助函数、国际化文本、SVG 与词典数据保持原名。

执行 `npm run build` 可重复生成运行文件，`npm run test:browser` 运行 Chromium 回归，`npm run check` 验证语法、行为标记、重命名映射及构建确定性。恢复分析结果可通过 `npm run recover` 重新生成。构建和测试报告写入被忽略的 `artifacts/reports/`。完整说明见 [`docs/READABLE_BUNDLES.md`](docs/READABLE_BUNDLES.md)。由于上游没有 source map，无法证明性恢复原文件名、注释、类型或全部局部变量名。
