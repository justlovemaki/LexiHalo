# LexiHalo 外部链接与网络请求审计

版本：8.1.1

> LexiHalo 独立版状态：文中出现的 `*.trancy.org` 仅作为原上游域名审计记录，不再代表当前产品名称。相关推广、帮助、遥测和回访地址可能仍以不可达遗留字符串存在于压缩包中，但运行时已统一阻断；Google Analytics 已停用，安装/卸载回访已删除，弹窗和扩展 UI 不再打开这些地址。保留的网络能力仅用于 BYOK/第三方翻译服务以及视频站自身的字幕和媒体请求。

静态扫描共识别出约 70 个 host-like 字符串，但其中包含已阻断的遗留代码、Manifest 匹配规则、W3C XML 命名空间、React/Redux 错误文档和示例地址，不能全部视为实际网络调用。项目仍允许自定义 BYOK Endpoint，并会请求视频站返回的动态字幕 URL，因此实际目标域名数量不是固定值。

## 1. 原上游服务

### API 与静态资源

- `https://api.trancy.org`
  - 用户、配置、词典、释义、TTS、语法、总结、AI 字幕、规则及引擎目录。
  - 主要位于 `assets/background.js`、`assets/edreader-main.js`、`assets/edvideo-main.js`。
- `https://static.trancy.org`
  - AI/翻译引擎图标，位于 `assets/background.js` 内置目录。

### 页面跳转

- `https://learn.trancy.org/`
- `https://learn.trancy.org/home`
- `https://learn.trancy.org/pdf`
- `https://learn.trancy.org/practice/...`
- `https://learn.trancy.org/reset-password`
- `https://learn.trancy.org/settings`
- `https://learn.trancy.org/verify-email`
- `https://learn.trancy.org/wordbook-import`
- `https://www.trancy.org/user-guide`
- `https://www.trancy.org/chat`
- `https://www.trancy.org/mobile`
- `https://www.trancy.org/trancy-air`
- `https://www.trancy.org/ai-subtitle`
- `https://trancy.org/ai-subtitle`
- `https://r.trancy.org/u/all-tutorial`
- `https://r.trancy.org/u/updated`
- `https://r.trancy.org/u/review*`
- `https://r.trancy.org/u/firefox-shortcuts`
- `http://r.trancy.org/u/add-platform`
- `https://manual.trancy.org/en/legal/terms-of-service`
- `https://manual.trancy.org/en/legal/pravacy-policy`

主要位于 `assets/edreader-main.js`、`assets/edvideo-main.js`、`assets/popup.js`。

### 自动行为

- 安装时打开 `https://www.trancy.org/user-guide`：`assets/background.js`。
- 设置卸载回访 URL `https://r.trancy.org/u/uninstalled?...`：`assets/background.js`。
- 原付费方法中仍保留不可达的 pricing 字符串，但当前没有 `openPremium(...)` 调用，也没有 Premium 路由。

## 2. 遥测和浏览器更新

- `https://www.google-analytics.com/mp/collect`：使用情况埋点，`assets/background.js`。
- `https://clients2.google.com/service/update2/crx`：Chrome 扩展更新地址，`manifest.json`。

## 3. BYOK 与翻译服务商

后台翻译运行时包含以下固定目标：

- OpenAI：`api.openai.com`
- OpenRouter：`openrouter.ai`
- Anthropic：`api.anthropic.com`
- Gemini：`generativelanguage.googleapis.com`
- DeepSeek：`api.deepseek.com`
- xAI：`api.x.ai`
- SiliconFlow：`api.siliconflow.cn`
- 智谱 GLM：`open.bigmodel.cn`
- 腾讯混元：`api.hunyuan.cloud.tencent.com`
- 百度千帆：`qianfan.baidubce.com`
- 阿里 DashScope：`dashscope.aliyuncs.com`
- 火山方舟：`ark.cn-beijing.volces.com`
- DeepL：`api.deepl.com`、`api-free.deepl.com`
- Google Translate：`translate.googleapis.com`
- Microsoft Translator：`api-edge.cognitive.microsofttranslator.com`
- Microsoft Token：`edge.microsoft.com`

本地 BYOK 还允许用户填写任意自定义 Endpoint，所以该列表不是封闭白名单。

## 4. 字典、语音和字体

- `dict.youdao.com`：有道发音。
- `ssl.gstatic.com/dictionary/...`：Oxford/Google 静态发音。
- `fonts.googleapis.com`：Material Symbols 字体样式。
- 原上游词典语音仍调用 `api.trancy.org/1/dictvoice` 或 `/1/voice`。

## 5. 视频站和字幕请求

`assets/edvideo-main.js` 会读取当前视频站页面、字幕和媒体清单，目标包括：

- YouTube 与动态 caption URL；
- Udemy API：`www.udemy.com/api-2.0/...`；
- TED 页面及字幕元数据；
- Coursera 字幕 URL；
- HBO/Max VTT；
- Disney HLS/VTT；
- Prime Video TTML；
- edX transcript；
- Bilibili 字幕；
- Vimeo 等当前页面返回的字幕 URL。

很多地址来自页面响应或播放器数据，无法通过静态扫描完整枚举。

## 6. 用户主动打开的其他网站

- `https://tally.so/r/n9X0Z5`
- `https://tally.so/r/nrbVNM`
- `https://apps.apple.com/app/id6475022743`
- YouTube、Netflix、HBO、Disney+、Prime Video、Coursera、Udemy、edX、DeepLearning.AI 等平台首页。

## 7. 不是实际业务请求的 URL 字符串

以下大多来自第三方库错误信息或 XML/SVG 命名空间：

- `www.w3.org/*`
- `reactjs.org/docs/error-decoder.html`
- `redux.js.org/Errors`
- `github.com/markedjs/marked`
- `npms.io/search?q=ponyfill`
- `mui.com/production-error`
- `bit.ly/3cXEKWf`（Immer 错误说明）
- `example.com/*`

这些字符串通常不会在正常业务流程中请求。
