# Apps 软件市场

`neonstack.net/apps/` 的源码。纯静态，无框架，无 node_modules 依赖。

## 数据源（就这三个文件，都在 `data/`）

| 文件 | 内容 |
| --- | --- |
| `data/apps.csv` | 一行一个软件 |
| `data/apps-details.csv` | 可选明细：Features / Changelog / Requirements / FAQ，一行一条 |
| `data/authors.json` | 作者字典（可以有多个），每个 app 指定自己的作者 |

改完后：

```
pnpm dev      # = node generate-apps.js && node generate-index.js
```

`generate-apps.js` 生成 `apps/index.html`、每个 `apps/<slug>/index.html` 和 `meta.json`。
新增一个 app = `data/apps.csv` 加一行 → `pnpm dev`，目录自动创建。

**不要手改生成物**（`apps/index.html`、`apps/<slug>/*`）。

## 更省事：本地管理后台

```
pnpm admin    →  http://localhost:5173
```

表格化编辑作者和所有 app；**Save** 写回 CSV，**Save & Build** 保存并自动重新生成全站。
只绑定 127.0.0.1，本地工具，不要暴露到公网。

## apps.csv

```
slug,name,author,price,tagline,description,icon,tint,type,platforms,version,updated,tags,image,tiers,status
```

**必填只有 5 个**：`slug` `name` `price` `tagline` `description`。其余留空规则：

| 列 | 留空时的效果 |
| --- | --- |
| author | 用 `authors.json` 里的第一个作者 |
| price | 不公开价格，页面显示 **Contact for pricing**（注意：留空 ≠ 免费） |
| icon | 取名称首字母 |
| tint | 默认蓝紫渐变 |
| type | 不显示 badge（由 type 自动推导为 Script / Desktop / Web app / Template） |
| version / updated / platforms | 对应的小标签整组不显示 |
| tags | 不出标签，但仍可被搜索过滤 |
| image | 自动找 `apps/<slug>/shot.png`，没有就是占位框（见下方「图片路径」） |
| tiers | 单一价格，不生成三档对比表 |
| status | published（填 `draft` 不生成页面） |

### slug 是什么

出现在网址里的那段英文短名：`/apps/war3-hotkey-editor/` 里的 `war3-hotkey-editor` 就是 slug。
只能用小写字母、数字和连字符（不要用空格和中文），一旦上线就别改，改了原来的链接会失效。

### price

- `0` → 免费，购买区变成 "Free to use" + "Open the app"
- 留空 → 价格不公开，卡片显示 `Contact for pricing`，按钮走 buy_mode
- 填数字 → `$X one-time`

### 购买方式（固定，不用配置）

**付费 app 的购买按钮一律是 "Contact to buy"，点击直接打开邮件客户端**，收件人是该 app 作者的 email，主题自动带上 app 名。价格怎么谈、用什么渠道收款（Stripe / 淘宝 / 爱发电 / PayPal），都在邮件里私下解决。
免费 app（price=0）则是 "Open the app" 按钮直接打开页面。
以后如果真要接在线支付，再加一列就行，页面模板改动很小。

## 图片路径（重要）

**必须是相对路径，绝对不能写 `C:\...` 这类硬盘路径** —— 本地能打开，一上传服务器就全挂。

两种写法都支持：

| 写法 | 存放位置 | 什么时候用 |
| --- | --- | --- |
| `shot.png` | `apps/<slug>/shot.png` | 推荐，跟页面放一起最省事 |
| `assets/img/foo.png` | 项目根目录的 `assets/img/` | 多个 app 共用一张图时 |

后台里可以直接上传：app 面板上传产品图（自动存成 `apps/<slug>/shot.png`），作者面板上传头像（自动存成 `assets/img/authors/<slug>.png`）。
代码里加了保护：如果检测到绝对路径（`C:\`、`/xxx`），生成时会打印警告并跳过这张图，不会把坏链接写进页面。

## authors.json

```json
{
  "louis": {
    "slug": "louis", "name": "Louis", "role": "Independent developer",
    "bio": "一句自我介绍", "avatar": "assets/img/authors/louis.png",
    "email": "hello@neonstack.net", "website": "", "x": "", "telegram": "", "github": ""
  }
}
```

- **联系方式、bio、avatar 全都可以留空**，页面上就自动不显示那一块（没有头像时显示名字首字母的渐变圆）
- 可以在后台点 "+ Add author" 加第二个作者，然后在某个 app 里选他

## 预设（不用填）

- **FAQ**：app 在 details 里没有 faq 行时，页面自动用 3 条通用预设（安全吗 / 怎么装 / 怎么更新，指向包内 README）
- **信任标**：购买按钮下的小勾列表按 buy_mode 自动匹配

## 上线前要替换的占位符

| 占位 | 位置 |
| --- | --- |
| `hello@neonstack.net` | `data/authors.json`（购买按钮直接发邮件到这个地址） |
| `https://x.com/REPLACE_HANDLE`、`https://t.me/REPLACE_HANDLE` | `data/authors.json`（含 REPLACE 的会被自动隐藏） |

## 文件清单

| 文件 | 角色 | 是否手改 |
| --- | --- | --- |
| `data/apps.csv` | 商品数据源 | 是（或用后台） |
| `data/apps-details.csv` | 可选明细数据源 | 是（或用后台） |
| `data/authors.json` | 作者数据源 | 是（或用后台） |
| `lib/csv.js` | 零依赖 CSV 解析/序列化 | 否 |
| `lib/appdata.js` | 数据层（CSV 读取，apps.md 回退） | 否 |
| `generate-apps.js` | 生成市场页 + 详情页 + meta.json | 否 |
| `generate-index.js` | 全站 manifest / sitemap / robots / SEO | 否 |
| `admin/serve.js` | 本地管理后台（零依赖） | 本地运行 |
| `apps/*` | 生成物 | 否 |

旧的 `apps/apps.md` 保留作回退：`data/apps.csv` 不存在时才会读它。

## 部署

随 Niche 主站部署到 `neonstack.net`（Vercel 项目 `niche`）。`admin/` 和 `data/` 会被 robots.txt Disallow。
