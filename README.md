# 中国军力 · China Military Atlas

《中国军力》是一座基于公开资料的互动数字展馆。从战国到探月，它把历史、工业与科研放在同一个入口。读者不必按固定顺序参观：可以走进一个章节、查看资料出处，也可以在科研航天展页上直接标出希望作者修改的位置。

**English.** An open-source interactive atlas of Chinese history, disaster response, industry and spaceflight. The entry page offers 12 languages; language coverage varies by exhibit. This repository is the redistributable edition, not a mirror of every media asset on the hosted site.

## 从哪里开始

需要 **Node.js 22.12 或以上** 和 npm。

```sh
git clone https://github.com/weituo470/china-military-atlas.git
cd china-military-atlas
npm ci
npm run dev
```

打开 <http://127.0.0.1:5173/>。想直接试标注？打开 [科研航天 · 月背采样](http://127.0.0.1:5173/?journey=space&beat=4)。浏览不需要账号；提交私有建议需要自己配置收件箱。

| 展厅 | 本地入口参数 | 可以探索什么 |
|---|---|---|
| 古代战争 | `?journey=force` | 从战国看历史叙事与地理空间的关系 |
| 红军长征 | `?journey=longmarch` | 沿长征的时间线阅读行程和关键节点 |
| 抗美援朝 | `?journey=korea` | 结合地点与史料阅读战争历史 |
| 抗灾动员 | `?journey=mobilize` | 灾害应对中的组织、救援与协作 |
| 工业实力 | `?journey=industry` | 从造船、制造等产业理解工业基础 |
| 军力现状 | `?journey=baseline2026` | 按出处、统计口径和时间阅读公开资料 |
| 科研航天 | `?journey=space` | 从第一颗卫星走向空间站、月背采样与天文观测 |

## 标注建议：在要改的地方说明白

以「月背」一章为例：点击 **标注建议**，用部署者提供的口令解锁，在页面截图上画箭头、框选或加文字，例如「这里建议补一张月球位置示意图」。将图和说明一起交给作者。**这是修改建议，不会直接改动展页。** 用 Agent 整理反馈、生成修改和加快更新是后续设想，不是当前实现。

开发和本地预览已集成收件接口。未配置口令时，接口返回 `503 inbox_not_configured`；其余展馆仍可浏览。要在自己的环境里试用私有收件箱，请在**启动服务前**设置两个服务端变量。下面是 PowerShell 示例：

```powershell
$env:SPACE_SUGGESTIONS_PASSCODE = [guid]::NewGuid().ToString('N')
$env:SPACE_SUGGESTIONS_DIR = Join-Path $HOME '.china-military-inbox'
npm run dev
```

仅在自己的终端查看生成的口令，并私下发给体验者。不要用 `VITE_` 前缀，也不要把口令、留言或读者截图提交到 GitHub。作者在设置同一数据目录的终端运行 `node server/read-space-suggestions.mjs --limit 20` 即可查看最近的收件记录。没有公开列出读者建议的接口。

## 测试与部署

```sh
npm test
npm run build
npm run preview
```

静态站点在 `dist/`，本地预览默认 <http://127.0.0.1:5174/>。纯静态托管可以展示内容，但**不会接收建议**。正式启用收件箱时，使用 HTTPS，在服务端设置上述变量，运行 `node server/space-suggestions.mjs`（默认只监听 `127.0.0.1:4387`），将同源 `/api/space-suggestions` 及其 `/unlock` 路径转发给它；部署在 `/china-military/` 下时，使用 `npm run build -- --base=/china-military/` 构建，并转发对应的带前缀接口。反向代理需允许不小于 2 MiB 的请求体，避免带图建议被提前拒绝；不要把整个收件目录映射为静态资源。收件目录必须位于仓库及 Web 根目录之外，且只对维护者开放。开发服务器不应用作公网服务。

## 哪些内容可以复用

- 本项目原创程序代码采用 [MIT 许可证](LICENSE)。第三方软件、语言模型、图标和图片保留各自的条件，见 [第三方素材与署名](THIRD_PARTY_NOTICES.md)。
- 开源版不打包未经确认可再分发的新闻截图、配音和部分展陈素材；可用的原始资料链接仍供核对。线上展陈效果与本版不完全相同。
- 欢迎通过 [贡献指南](CONTRIBUTING.md) 提交勘误、译文或有明确授权的素材，不要把读者的私有反馈转发至公开 Issue。
