# AI 双语字幕处理

## 运行流程

选择 BYOK AI 引擎后，正常路径中的字幕修复和翻译由同一次模型请求完成。模型返回一个 JSON 对象：

```json
{
  "items": [
    {
      "id": 1,
      "repaired": "修复后的原字幕",
      "translation": "目标语言译文"
    }
  ]
}
```

Video 运行时将 `repaired` 写入主字幕，将 `translation` 写入副字幕，同时保留 `originalText`，以便清理页面结果时无需重新下载字幕轨道。

## 无字幕视频的音频识别

BYOK 的 OpenAI / OpenAI 兼容引擎可以额外配置音频识别模型和 Endpoint。在所有受支持的视频平台，可从播放器的 LexiHalo 菜单中点击“AI 字幕（音频转写）”生成字幕：

1. 优先从平台播放信息中选择体积最小的独立音频流；若平台没有独立音频元数据，则尝试播放器公开的 HTTP(S) 直连媒体文件；
2. Background 校验请求来自受支持的视频网站，获取媒体并检查 24 MB 上限；
3. 使用 `multipart/form-data` 将音频直接发送到配置的 `/v1/audio/transcriptions`；表单字段为 `file`、`model`、`language`、`prompt`、`response_format=verbose_json` 和 `temperature=0`，`Content-Type` 及 boundary 由浏览器的 `FormData` 自动生成；localhost/127.0.0.1 接口使用浏览器 Cookie 凭据且不自动添加 Bearer Header，其他接口使用配置的 API Key；
4. 从 `verbose_json` 的 `segments` 时间戳将识别结果转换为本地字幕轨道；同时兼容代理常见的 `data.segments`、`result.segments`、`chunks`、`utterances`、`words`、`HH:MM:SS` 时间以及显式的 `start_ms/end_ms`。解析器会结合响应 `duration` 自动判断普通 `start/end` 使用秒还是毫秒；若接口只返回一个全文分段，则必须提供 word 时间戳才能重新分组，不再按字符比例伪造时间轴；
5. 生成的原字幕继续进入既有的 AI 修复、翻译、预取和双语显示流程。

默认模型为 `whisper-1`。BYOK 页面可覆盖音频识别语言（兼容 `zh`、`zh-CN` 或自定义接口使用的“中文”等值）及提示词。其他模型只有在返回 `segments[].start/end/text` 时才能用于视频字幕。识别结果按视频、引擎、模型和语言缓存在 `chrome.storage.local`；“彻底清除 AI 字幕缓存”也会删除音频识别缓存。API Key 与音频均直接发送到用户配置的服务商，不经过 LexiHalo 中间服务器。

入口在所有平台都会显示。普通 MP4/WebM、平台公开的独立音频流等可以直接处理；DRM、加密分片或仅暴露 `blob:` MediaSource 的播放器无法安全提取完整音频，此时菜单会显示具体错误，而不会误报已经开始转写。

## 触发时机

字幕提供器激活并加载到字幕轨道后，会启动 250ms 调度循环。只有同时满足以下条件才会发起 AI 请求：

1. 双语字幕窗口已挂载，`captionProvider.freezed === false`；
2. 已选择可用 AI 引擎并设置目标语言；
3. 当前字幕轨道已有行数据；
4. 当前行不是同语言无需翻译的行；
5. 同时运行的 AI 请求少于 2 个；
6. 不处于失败退避期；
7. 当前行尚无当前引擎的成功译文。

首次定位当前行后立即取当前及后续 3 行。之后每 250ms 检查当前行到未来 18 行，并按稳定 6 行窗口补齐。跳转超过 3 秒会立即取消旧代次并在新位置毫秒级同时发起基线机翻与 AI 翻译请求，实现即拖即看、AI 自动升级。全批失败后的退避时间为 2 秒，而不是此前的 10 秒；播放器暂停不会停止字幕预翻译调度。

界面只有当当前行的 `idx` 确实存在于 `translatingIdx` 时才显示“AI 翻译中”；尚未获得请求槽位时显示“等待 AI 翻译”，失败时显示明确错误，避免把排队、退避和真实网络请求混为一谈。

## 性能策略

- 当前播放位置向后预取 18 行。
- 首批只处理 3 行，优先缩短当前字幕等待时间。
- 后续使用稳定的 6 行窗口，在上下文质量、响应完整性和请求次数之间取得平衡。
- 同时最多运行 2 个 AI 请求。
- 跳转超过 3 秒会提升请求代次，并取消旧代次的网络请求。
- AI 引擎不再预先对当前字幕运行 Google 临时回填；只有组合请求及同模型翻译都失败时，才对缺失行执行机器翻译兜底。

## 模型请求

AI 字幕请求复用 Background 的供应商适配层，而不是单独拼装 `fetch`：

- 请求超时继承适配层的 30 秒默认值；
- 输出额度根据字幕数量和总字符数动态控制在 2048–8192 tokens，避免推理模型耗尽预算后没有最终正文；
- OpenAI、OpenRouter、DeepSeek 使用 JSON object 输出模式；
- OpenRouter 排除 reasoning 输出；
- GPT-5 使用低 reasoning effort 和 `max_completion_tokens`；
- Qwen/GLM 尽可能关闭 thinking；
- Gemini 使用 JSON MIME 类型，支持的版本关闭 thinking budget；
- 保留用户配置的 Endpoint、Headers 和 Body。

响应解析兼容标准 Chat Completions、文本内容数组、OpenAI Responses 风格 `output[].content[].text` 和常见代理 `data` 包装。批量响应缺少部分条目或组合 JSON 无法解析时，成功行立即显示，缺失行最多由两个并发 worker 逐行调用同一 AI 的成熟普通翻译流程；仍失败时再使用 Google 机器翻译。兜底结果保留原字幕、不伪造修复内容，也不写入 AI 修复缓存。播放位置取代的旧请求不会进入兜底链。

## 缓存管理

双语字幕设置提供两个操作：

- **重新载入当前字幕**：清除页面和普通翻译内存结果，恢复 `originalText`，保留持久 AI 缓存；已处理字幕可以立即恢复。
- **彻底清除 AI 字幕缓存**：同时删除持久 AI 修复/翻译缓存；下次播放会重新调用模型。

BYOK 页面提供“AI 字幕诊断”，记录组合请求、同模型兜底、机器翻译兜底和音频识别的服务商、模型、Endpoint、音频字节数、分段数、批次、字符数、token 预算、耗时及错误；不记录字幕正文、音频内容或 API Key。

构建后的缓存 UI 和运行代码分别位于 `assets/edreader-main.js`、`assets/edvideo-main.js` 和 `assets/background.js`；可维护源码位于 `src/`，相关构建补丁位于 `tools/build-readable-bundles.mjs`。
