# LexiHalo

LexiHalo 是一个以本地独立运行和 BYOK 为核心的 AI 翻译、网页沉浸翻译与视频双语字幕浏览器扩展。

## 主要功能

- 视频双语字幕与字幕样式控制
- 使用本地 BYOK AI 对原字幕进行智能分段，并自动修复 ASR 错词、标点、大小写和重复词
- 点击字幕单词打开 AI 详解
- Web Dictionary 与美式/英式发音切换
- 网页划词翻译、快速翻译和沉浸式全文翻译
- 沉浸式翻译可按网站自动开启
- 支持 Google 翻译、Microsoft Translator（Azure）、DeepL，以及 OpenAI、OpenRouter、DeepSeek、Gemini、Claude 和 OpenAI 兼容接口
- API Key 仅保存在 `chrome.storage.local`
- 不依赖原上游账号、会员系统或云端额度

## 安装

1. 下载或克隆本仓库。
2. 打开 Chromium 浏览器的扩展管理页面。
3. 开启“开发者模式”。
4. 选择“加载已解压的扩展程序”，并选择仓库根目录。
5. 建议停用其他同源版本，避免内容脚本冲突。

## 配置 BYOK

在扩展管理页面打开 LexiHalo 的“扩展程序选项”，可添加 AI 模型、Microsoft Translator（Azure）或 DeepL。Microsoft 使用官方 Azure Translator API Key，并可选填 Region；DeepL 支持 Free/Pro API Endpoint。未配置时，两者也会显示在侧边栏和视频字幕的翻译引擎列表中，点击即可进入对应配置；API Key 仅保存在本机。

## 配置 AI 字幕处理

先在 BYOK 页面配置 OpenAI、OpenRouter、DeepSeek、Gemini、Claude 或 OpenAI 兼容接口。播放器字幕菜单中的“AI 分段与原字幕修复”开关下方提供独立的“AI 处理模型”选择器；也可在 LexiHalo 侧边栏的“设置 → 双语字幕”中选择同一处理模型。开启后 AI 分段和原字幕修复会作为一个完整流程同时执行，之后再交给当前字幕翻译引擎翻译。处理结果会重新进入双语翻译流程；相同字幕与模型的结果保存在本地缓存，避免重复调用 API。缓存按功能分别清理：在“双语字幕”页可独立清理“AI 字幕处理缓存”和“字幕翻译缓存”；“沉浸式翻译”页提供沉浸式翻译缓存清理；“划词翻译”页提供划词翻译缓存清理；“翻译引擎”页提供快速翻译缓存清理。清理字幕相关缓存会重新载入当前原字幕；已渲染的沉浸式翻译内容需刷新页面后重新获取。

## 配置沉浸式翻译常开网站

在任意网页点击右键，可直接选择“将当前网站加入沉浸翻译常开”或“将当前网站移出沉浸翻译常开”。也可以打开 LexiHalo 设置，进入“沉浸翻译常开”管理规则；页面支持一键添加/移除当前网站、回车快速添加规则和单条删除；批量编辑中还可维护域名（`example.com`）、子域通配符（`*.example.com`）、路径通配符（`*.example.com/video/*`）及完整 URL。修改会立即应用到已打开的网页，并在单页应用切换地址时重新匹配。双语字幕继续使用 LexiHalo 原有的常开设置。

## 支持范围

视频字幕脚本覆盖 YouTube、Netflix、Coursera、Udemy、TED、Max、Disney+、edX、Prime Video、Bilibili、Vimeo 等 Manifest 中声明的网站。实际可用性会受到站点页面结构和字幕权限变化影响。

## 独立版说明

本项目基于压缩后的浏览器扩展构建产物改造，不包含原始前端或后端源码。原上游账号、云端收藏、托管 AI 字幕、托管 AI 总结、托管高级引擎和云端 TTS 等功能已停用或从界面移除。

详细改造记录见 [`FREE_ACCESS.md`](FREE_ACCESS.md)，网络与历史域名审计见 [`EXTERNAL_LINKS.md`](EXTERNAL_LINKS.md)。
