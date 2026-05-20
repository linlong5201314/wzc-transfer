# 文字传 · 电脑手机互传

一个**异地无线**互传文字的 PWA 应用。电脑和手机打开同一个网址,即可实时同步剪贴板内容。

- ✅ **一键复制 / 一键粘贴**
- ✅ **跨网络**(不限同一 WiFi)
- ✅ **手机可"添加到主屏幕"**,图标像原生 App
- ✅ **零配置**:GitHub + Vercel + Upstash Redis,全部免费
- ✅ **无需注册账号**(自动用浏览器 ID 识别设备)
- ✅ 自带消息历史(最近 20 条)

---

## 一键部署到 Vercel

### 第 1 步:把代码推到 GitHub

```bash
git init
git add .
git commit -m "init: 文字传"
git branch -M main
# 把下面的 URL 换成你新建的 GitHub 仓库地址
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

> 没有仓库?去 https://github.com/new 新建一个空仓库(不勾选 README、.gitignore、license),然后回来执行 `git push`。

### 第 2 步:在 Vercel 导入仓库

1. 打开 https://vercel.com,用 GitHub 账号登录
2. 点 **"Add New" → "Project"**
3. 找到你刚才的仓库,点 **"Import"**
4. 框架预设(Framework Preset)**保持默认 (Other)**,其他都不用改
5. 点 **"Deploy"** —— 第一次会失败或显示"未连接 Redis",**这是正常的**,继续下一步

### 第 3 步:加上 Upstash Redis(免费)

1. 在 Vercel 项目页 → 顶部菜单 **"Storage"** → **"Create Database"**
2. 选 **"Marketplace"** → 找 **"Upstash"** → 选 **"Redis"** → **"Continue"**
3. 数据库名随便填,Region 选 **离你最近的**(国内推荐 `ap-northeast-1` 东京 / `ap-southeast-1` 新加坡)
4. Plan 选 **"Free"** → **"Create"**
5. 创建后会提示"Connect to Project" → 选你的项目 → **"Connect"**
6. Vercel 会自动把 `UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN` 注入环境变量

### 第 4 步:重新部署

1. 回到项目页 → **"Deployments"** 标签
2. 点最新一次部署右边的 **"⋯"** → **"Redeploy"** → **"Redeploy"**
3. 等 30 秒,部署成功!

打开 Vercel 给你的网址(类似 `https://your-project.vercel.app`),电脑、手机都用浏览器打开,就能互传文字了。

---

## 把应用"装"到手机/电脑

### 📱 安卓 (Chrome / Edge)

1. 用 Chrome 打开你的网址
2. 浏览器会弹出**"添加到主屏幕"**提示(或菜单里手动选)
3. 点击安装,桌面就有一个图标,**点开就是 App**(全屏、无浏览器栏)

### 📱 iPhone / iPad (Safari)

1. **必须用 Safari** 打开(Chrome 不行)
2. 点底部"**分享**"按钮 → 拉下来找 **"添加到主屏幕"**
3. 给它起个名字 → 完成

### 💻 Windows / Mac (Chrome / Edge)

1. 用 Chrome 或 Edge 打开网址
2. 地址栏右侧会出现一个**"安装"图标**(屏幕里有个 ⬇️)
3. 点击安装,会出现在开始菜单/启动台,**双击像 exe 一样打开**

---

## 本地开发(可选)

```bash
# 安装 Vercel CLI
npm i -g vercel

# 安装依赖
npm install

# 本地运行(会要求登录 Vercel 并拉取环境变量)
vercel dev
```

打开 http://localhost:3000

> 注意:需要先在 Vercel 后台配好 Upstash 才能本地跑通(因为要连 Redis)。

---

## 项目结构

```
.
├── api/
│   ├── send.js         # POST /api/send     发送文字
│   ├── latest.js       # GET  /api/latest   获取最新消息
│   ├── history.js      # GET  /api/history  获取历史
│   └── clear.js        # POST /api/clear    清空
├── index.html          # 前端主页 (响应式 + 一键复制粘贴)
├── manifest.json       # PWA 清单
├── sw.js               # Service Worker (离线缓存)
├── icon.svg            # 矢量图标
├── icon-192.png        # PWA 图标 (Android)
├── icon-512.png        # PWA 图标 (大图)
├── apple-touch-icon.png# iOS 主屏幕图标
├── scripts/
│   └── gen-icons.ps1   # PowerShell 生成 PNG 图标
├── vercel.json
├── package.json
└── README.md
```

---

## 工作原理

```
[手机浏览器] ─POST /api/send─► [Vercel Serverless] ─► [Upstash Redis]
                                                          │
[电脑浏览器] ◄─轮询 /api/latest─ [Vercel Serverless] ◄────┘
```

- 任一设备发送 → 写入 Redis 的 `transfer:latest` 键
- 所有设备每 **2.5 秒**轮询一次 `/api/latest?since=<上次时间戳>`,只在有新消息时返回
- 标签页隐藏时降到 **30 秒**一次,省流量、省 Upstash 调用额度
- 切回标签页立即拉一次

### 免费额度够用吗?

Upstash Redis 免费档:**10,000 命令/天**

- 每次轮询消耗 1 条命令,2.5 秒一次 ≈ 1440 次/小时/设备
- 但**标签页隐藏后会自动降频到 30s**,实际日常使用每天 < 5000 命令
- 个人 2 台设备日常用够用,不够再升级到 Pay-as-you-go(也很便宜)

---

## 安全说明

⚠️ 当前是**最简版**,**没有认证**,任何知道你网址的人都能收发消息。

如果你担心,可以:

1. 在 Vercel 项目设置里开启 **Password Protection**(付费)
2. 或在 `api/send.js` 和 `api/latest.js` 里加一个简单的密钥校验(读取请求头里的 token)
3. 或加上简单的房间码逻辑

把代码改一下就行,我之后可以帮你加。

---

## 常见问题

**Q: 部署后访问 404?**
A: 检查 Vercel 项目的 Root Directory 是否是项目根目录。

**Q: 收到消息但"一键复制"不生效?**
A: 浏览器剪贴板 API 要求 HTTPS,Vercel 默认是 HTTPS 所以没问题。如果是本地开发用 http://localhost 也 OK,但其他 http:// 地址会失败。

**Q: iPhone 上"粘贴并发送"按钮无反应?**
A: iOS Safari 第一次会请求剪贴板权限,允许后即可。

**Q: 想做成原生 APK 装到安卓上?**
A: 现在的 PWA 已经能"添加到主屏幕"了,体验和 APK 一样。若一定要 APK,可以用 [PWA Builder](https://www.pwabuilder.com/) 直接把网址转成 APK,免费 5 分钟搞定。
