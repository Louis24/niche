# NeonStack - 浏览器工具与游戏助手

一个不断增长的轻量级浏览器工具、实用购买指南和游戏助手合集。

## 🚀 快速开始

1. 在 `tools/`、`reviews/`、`games/` 或 `fun/` 下新建文件夹
2. 放入 `index.html`
3. 运行 `npm run build`
4. 完成！新内容自动出现在首页。

## 📁 项目结构

```
Niche/
├── index.html              # 首页
├── tools/                  # 实用工具
├── reviews/                # 产品购买指南
├── games/                  # 游戏助手
├── fun/                    # 趣味/副业项目
├── about/                  # 关于页面
├── contact/                # 联系页面
├── privacy-policy/         # 隐私政策
├── disclaimer/             # 免责声明
├── assets/
│   ├── site.css           # 全局样式
│   ├── auto-loader.js     # 动态内容加载器
│   └── content-manifest.js # 构建生成的 JS 清单
├── generate-index.js       # 自动扫描脚本
└── package.json
```

## ⚙️ 工作原理

1. **generate-index.js** 扫描 `tools/`、`reviews/`、`games/` 和 `fun/` 下的所有文件夹
2. 生成 **assets/content-manifest.js**，包含每个条目的元数据
3. **auto-loader.js** 读取清单并在首页渲染卡片
4. 自动生成 `sitemap.xml` 和 `robots.txt` 用于 SEO

### 智能特性

- 从 HTML `<meta>` 标签提取描述
- 根据文件夹名推断工具分类
- 根据文件夹名自动生成标题（如 `word-counter` → "Word Counter"）
- 为不同分类使用合适的行动按钮文案

## ✨ 特性

- 零配置自动发现
- 无需复杂构建（一条命令即可）
- 完全响应式设计
- 隐私优先（所有工具在浏览器本地运行）
- 加载速度快
- 风格统一
- 自动生成 SEO 文件（sitemap、robots、结构化数据）

## 🏷️ 分类与统计

- **Tools**：29
- **Games**：20
- **Reviews**：26
- **Fun**：20
- **Total**：95+ 项

### Badge 类型

**Tools：** `Calculator`, `Developer`, `Writing`, `Design`, `Productivity`, `Security`, `Utility`, `Health`, `Finance`, `Network`, `Accessibility`, `Event`, `Fun`

**Games：** `Calculator`, `Lookup`, `Tracker`, `Reference`, `Comparison`, `Game Helper`

**Reviews：** `Buying guide`

## 🛠️ 开发指南

### 添加新工具

```bash
# 1. 创建文件夹
mkdir tools/my-new-tool

# 2. 创建带 meta description 的 index.html
cat > tools/my-new-tool/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta name="description" content="My awesome tool description">
    <title>My Tool</title>
</head>
<body>
    <h1>My Tool</h1>
</body>
</html>
EOF

# 3. 重新生成索引
npm run build

# 4. 完成！
```

### 自定义元数据（可选）

在任意文件夹中创建 `meta.json` 以完全控制展示信息：

```json
{
  "title": "My Cool Tool",
  "badge": "Calculator",
  "description": "A short description of what it does",
  "link": "tools/my-cool-tool/",
  "cta": "Open tool"
}
```

### 需要提交的文件

- 所有 tool/review/game/fun 文件夹
- `index.html`、`assets/`、`generate-index.js`
- `vercel.json`、`package.json`
- `content-manifest.json` 和 `assets/content-manifest.js`（构建生成）
- `sitemap.xml` 和 `robots.txt`（构建生成）
- 不要提交：`node_modules/`

## 📦 部署

### Vercel（推荐）

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 进入项目目录
cd C:\Zero\JavaScript\Niche

# 3. 登录（会打开浏览器）
vercel login

# 4. 部署
vercel --prod

# ✅ 完成！你会得到一个网址，如：
# https://your-site.vercel.app
```

**其他部署选项：**
- Netlify: `netlify deploy --prod`

### GitHub Pages

```bash
npm run build
git add .
git commit -m "Update content"
git push
```

然后在 GitHub 仓库的 **Settings → Pages** 中启用。

### 本地测试

请使用本地服务器（不要直接用 `file://` 打开）：

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve
```

然后访问：`http://localhost:8000`

## 🔍 SEO 与搜索引擎提交

### Google Search Console

1. 访问：https://search.google.com/search-console
2. 添加资源（网站）
3. 验证所有权（推荐 HTML 文件验证）
4. 提交 sitemap：`https://你的网站/sitemap.xml`

### Bing Webmaster Tools

1. 访问：https://www.bing.com/webmasters
2. 导入 Google Search Console 数据或手动添加
3. 提交 sitemap

### 百度站长平台（可选）

1. 访问：https://ziyuan.baidu.com/
2. 添加网站并验证
3. 提交 sitemap

## 💰 变现指南

### Google AdSense

**优势：** 个人即可申请，无需公司，直接银行转账，没有退款纠纷。

**申请步骤：**
1. 访问 https://www.google.com/adsense/start/ 注册
2. 填写网站 URL 和个人信息
3. 将 AdSense 审核代码添加到每个页面的 `<head>`：
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-你的ID"
        crossorigin="anonymous"></script>
   ```
4. 在网站根目录添加 `ads.txt`：
   ```txt
   google.com, pub-你的ID, DIRECT, f08c47fec0942fa0
   ```
5. 部署上线后确认 `https://你的域名/ads.txt` 可以打开
6. 回到 AdSense 后台点击检查/提交审核

### AdSense 代码自动添加

本项目已经把当前 AdSense 发布商 ID 写入 `generate-index.js`：

```js
const ADSENSE_CLIENT_ID = 'ca-pub-9797460743497525';
```

以后新增页面后，不需要手动给每个 HTML 粘贴代码，只要运行：

```bash
pnpm run build
```

或：

```bash
npm run build
```

原因是 `package.json` 里的 `build` 脚本会执行：

```bash
node generate-index.js
```

`generate-index.js` 会扫描 `tools/`、`reviews/`、`games/`、`fun/` 下的所有 `index.html`，同时处理首页、About、Contact、Privacy Policy、Disclaimer、Policy 等静态页面，并自动把 AdSense `<script>` 插入到每个页面的 `</head>` 前。如果页面里已经有这段代码，脚本会跳过，不会重复添加。

注意：`ads.txt` 是授权声明文件，必须放在网站根目录；它不能替代 `<script>`。AdSense 审核和自动广告需要页面里的 `<script>`，广告买家验证授权发布商需要 `ads.txt`。两个都建议保留。

审核通常需要几天，有时可能更久。审核通过后推荐开启**自动广告**，或手动添加广告位代码。

**常见要求：**
- ✅ 原创内容（95+ 页面）
- ✅ 足够页面（至少 20 页）
- ✅ 符合政策

### 设置收款方式

1. AdSense 后台 → "付款" → "管理付款方式"
2. 选择"电汇转账至银行账户"
3. 填写姓名、银行名称、账号、SWIFT 代码
4. 收到小额验证款后输入金额验证

**收款时间：** 余额 ≥ $100 时，次月 21-26 号付款，3-5 个工作日到账。

### Amazon Affiliate（额外收入）

适用于 26 个 Reviews 页面。

1. 访问 https://affiliate-program.amazon.com/ 或 https://associates.amazon.cn/
2. 注册并填写网站信息
3. 等待审核（24-48 小时）
4. 在页面中添加联盟链接：
   ```html
   <a href="https://www.amazon.com/dp/产品ID/?tag=你的ID" target="_blank" rel="nofollow noopener">查看价格 →</a>
   ```

**佣金率：** 电子产品 2-4%，家居 4-8%，时尚 10%+。

## � 推广与增长

### 预期收入时间表

| 时间 | 月访问量 | 月收入 | 主要工作 |
|---|---|---|---|
| **第 1 个月** | 500-1,000 | $5-20 | 审核、冷启动、提交搜索引擎 |
| **第 2 个月** | 5,000-10,000 | $50-200 | SEO 开始生效 |
| **第 3 个月** | 10,000-20,000 | $100-400 | 达到提现门槛 $100 |
| **第 6 个月** | 30,000-100,000 | $300-2,000 | 稳定被动收入 |

### 社交媒体

- **Reddit:** r/InternetIsBeautiful, r/webdev, r/SideProject
- **ProductHunt:** 以"95 个免费在线工具"为标题发布
- **Twitter/X:** 每天分享 1 个工具，标签 #webtools
- **小红书/知乎:** 写真实使用体验

### 外链建设

提交到免费工具目录：TryDevTools、Toolforge、Axelary、Dev Resources。
不要买垃圾外链或硬发广告。

## � 监控与优化

### 必装工具

**Google Analytics（可选）:**
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-你的ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-你的ID');
</script>
```

**监控指标：** 每日访问量、热门页面、跳出率、平均停留时间。

### 优化策略

- **高流量页面：** 增加内链、丰富内容、优化广告位
- **低流量页面：** 检查 title/description、改进质量、添加图片

## 💡 项目背景

做工具站 vs 电商独立站：

| 维度 | 工具站/内容站 | 电商独立站 |
|---|---|---|
| **收款方式** | ✅ Google AdSense 直接银行转账 | ❌ Stripe（复杂） |
| **货源** | ✅ 不需要！纯代码 | ❌ 需要找供应商/备货 |
| **物流** | ✅ 不需要！ | ❌ 需要处理发货/退货 |
| **客服** | ✅ 几乎不需要 | ❌ 需要 24/7 客服 |
| **库存** | ✅ 不存在库存 | ❌ 库存管理、压货风险 |
| **退款** | ✅ 不存在退款 | ❌ 频繁处理退款纠纷 |
| **启动成本** | ✅ $0-12（仅域名） | ❌ $5,000-50,000+ |
| **技术难度** | ✅ 纯前端，复制粘贴 | ❌ 支付、订单、库存系统 |
| **时间成本** | ✅ 1-2 周完成 100 页 | ❌ 3-6 个月才能上线 |
| **风险** | ✅ 几乎零风险 | ❌ 高风险（库存、欺诈） |

**成本对比：**

电商独立站第一年成本 $30,000-60,000，通常亏损。
工具站第一年成本 $0-12，95 页内容可带来 $1,080-3,600 被动收入。

## ❓ 常见问题

**Q: 必须有公司才能申请 AdSense 吗？**
A: 不需要！个人即可申请。

**Q: AdSense 收款需要 Stripe 吗？**
A: 不需要！直接银行转账。

**Q: 需要多少流量才能盈利？**
A: 1,000 访问/月 ≈ $5-20；10,000 访问/月 ≈ $50-200。95 页很容易达到 10,000+/月。

**Q: 多久能赚到第一笔钱？**
A: 审核 1-7 天，流量 2-4 周，达到 $100 提现约 2-3 个月。

**Q: 域名是必须的吗？**
A: 不必须！Vercel 免费域名可申请 AdSense，但自定义域名更专业。

**Q: 网站会被 AdSense 拒绝吗？**
A: 95+ 原创页面基本不会被拒。常见原因：内容不足、违规内容、流量造假。

**Q: 需要每天维护吗？**
A: 不需要！代码写完自动运行，偶尔看看数据即可。

**Q: 可以同时做多个网站吗？**
A: 可以！一个 AdSense 账号可添加多个网站，收入合并计算。

## 🐛 故障排除

**主页空白，没有卡片**
- 原因：`content-manifest.json` 未上传
- 解决：`npm run build` 后提交并推送

**AdSense 显示"网站无法访问"**
- 原因：部署或 DNS 未生效
- 解决：等待 5-10 分钟后重试

**搜索引擎不收录**
- 原因：需要时间
- 解决：等待 1-2 周，确认 sitemap 已提交，手动提交重要页面

**流量很低**
- 原因：SEO 需要时间积累
- 解决：耐心等待 2-3 个月，社交媒体推广，改进页面质量

**本地链接打不开？**
- 使用本地服务器，不要直接用 `file://` 打开文件。

**新内容没有显示？**
- 运行 `npm run build` 重新生成清单。

**想自定义某个条目的展示？**
- 在该文件夹中添加 `meta.json`。

## ✅ 检查清单与行动指南

### 上线前
- [ ] 运行 `npm run build` 生成最新索引
- [ ] 本地测试所有链接正常
- [ ] 确认 sitemap.xml 和 robots.txt 存在
- [ ] 所有页面有 meta description

### 上线时
- [ ] 部署到 Vercel/Netlify
- [ ] 绑定自定义域名（可选）
- [ ] 测试线上网站正常访问

### 上线后
- [ ] 申请 Google AdSense
- [ ] 提交 Google Search Console / Bing Webmaster
- [ ] 添加 Google Analytics（可选）
- [ ] 申请 Amazon Affiliate
- [ ] 社交媒体推广 3-5 次

### 持续优化
- [ ] 每周查看 AdSense 报表
- [ ] 每月添加 1-2 个新工具
- [ ] 优化高流量页面，改进低流量页面

## 🤝 贡献

1. 创建你的 tool/review/game 文件夹
2. 运行 `npm run build`
3. 本地测试
4. 提交 PR

## 📄 许可

MIT
