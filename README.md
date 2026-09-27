# LexiHalo

LexiHalo 是一个以本地独立运行和 BYOK 为核心的 AI 翻译、网页沉浸翻译与视频双语字幕浏览器扩展。

## 主要功能

- 视频双语字幕与字幕样式控制
- 点击字幕单词打开 AI 详解
- Web Dictionary 与美式/英式发音切换
- 网页划词翻译、快速翻译和沉浸式全文翻译
- 支持 OpenAI、OpenRouter、DeepSeek、Gemini、Claude 及 OpenAI 兼容接口
- API Key 仅保存在 `chrome.storage.local`
- 不依赖原上游账号、会员系统或云端额度

## 安装

1. 下载或克隆本仓库。
2. 打开 Chromium 浏览器的扩展管理页面。
3. 开启“开发者模式”。
4. 选择“加载已解压的扩展程序”，并选择仓库根目录。
5. 建议停用其他同源版本，避免内容脚本冲突。

## 配置 BYOK

在扩展管理页面打开 LexiHalo 的“扩展程序选项”，添加模型服务商、Endpoint、模型名称和 API Key。保存后刷新正在使用扩展的网页。

## 支持范围

视频字幕脚本覆盖 YouTube、Netflix、Coursera、Udemy、TED、Max、Disney+、edX、Prime Video、Bilibili、Vimeo 等 Manifest 中声明的网站。实际可用性会受到站点页面结构和字幕权限变化影响。

## 独立版说明

本项目基于压缩后的浏览器扩展构建产物改造，不包含原始前端或后端源码。原上游账号、云端收藏、托管 AI 字幕、托管 AI 总结、托管高级引擎和云端 TTS 等功能已停用或从界面移除。

详细改造记录见 [`FREE_ACCESS.md`](FREE_ACCESS.md)，网络与历史域名审计见 [`EXTERNAL_LINKS.md`](EXTERNAL_LINKS.md)。
