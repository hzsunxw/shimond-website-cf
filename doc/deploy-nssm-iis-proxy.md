# Nimbus Site CMS — 方案二：nssm + IIS 反向代理部署方案

> 适用环境：Windows Server 2016
> 部署方式：独立域名 + HTTPS + IIS 反向代理
> 进程管理：nssm（Non-Sucking Service Manager）
> 不修改任何现有代码

---

## 一、架构总览

```
                       客户端浏览器
                           │
                     HTTPS (443)
                           │
                       ┌───▼───┐
                       │  IIS   │  ← Windows Server 2016
                       │ (SSL终止)│
                       └───┬───┘
                           │ HTTP (localhost:3000)
                       ┌───▼───┐
                       │ nssm   │  ← 进程管理（Windows 服务）
                       │        │
                       │ next   │  ← Node.js 进程
                       │ start  │
                       └───┬───┘
                           │
                    ┌──────▼──────┐
                    │  PostgreSQL  │  ← 宿主机直接安装
                    │     15       │
                    └─────────────┘
                           │
                    ┌──────▼──────┐
                    │   Redis 7    │  ← 宿主机直接安装
                    └─────────────┘
```

---

## 二、环境准备

### 2.1 硬件与系统要求

| 项目 | 最低要求 | 推荐配置 |
|---|---|---|
| CPU | 2 核 | 4 核+ |
| 内存 | 4 GB | 8 GB+ |
| 磁盘 | 20 GB | 50 GB+ SSD |
| 操作系统 | Windows Server 2016 (≥ 14393) | Windows Server 2016/2019 |

### 2.2 安装 Node.js

1. 下载 **LTS 版本**（≥ 18.x）：[https://nodejs.org/dist/v18.20.4/node-v18.20.4-x64.msi](https://nodejs.org/dist/v18.20.4/node-v18.20.4-x64.msi)
2. 运行安装程序，一路下一步
3. 验证安装：

```powershell
node -v
npm -v
```

4. 确认 npm 全局路径已加入系统 PATH：

```powershell
# 查看 npm 全局路径
npm root -g
# 输出类似：C:\Users\<用户名>\AppData\Roaming\npm

# 如果未加入 PATH，手动添加：
# 控制面板 → 系统 → 高级系统设置 → 环境变量 → 系统变量 Path → 编辑 → 新建
# 添加：C:\Users\<用户名>\AppData\Roaming\npm
```

### 2.3 安装 PostgreSQL 15

1. 下载：[https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. 安装时记录：
   - **端口**：默认 5432
   - **超级用户名**：`postgres`
   - **密码**：设置强密码
   - **数据库名**：`nimbus_cms`
3. 验证：

```powershell
psql -U postgres -d nimbus_cms -c "SELECT version();"
```

### 2.4 安装 Redis 7

1. 下载 Windows 版 Redis：[https://github.com/microsoftarchive/redis/releases](https://github.com/microsoftarchive/redis/releases)
   或使用 WSL2 方式安装
2. 解压到 `C:\Redis`
3. 安装为 Windows 服务：

```powershell
cd C:\Redis
redis-server.exe --install-service
```

4. 启动服务：

```powershell
net start Redis
```

5. 验证：

```powershell
redis-cli ping
# 应返回 PONG
```

---

## 三、DNS 与 SSL 证书

### 3.1 DNS 解析

在域名管理面板添加 A 记录：

| 记录类型 | 主机记录 | 记录值 | TTL |
|---|---|---|---|
| A | nimbus | 你的服务器公网 IP | 自动 |

### 3.2 申请 Let's Encrypt 免费 SSL 证书

使用 **win-acme** 工具：

```powershell
# 1. 下载 win-acme: https://www.win-acme.com/
# 2. 以管理员身份运行
cd C:\tools\wacs
.\wacs.exe

# 按提示操作：
#   - 输入域名: nimbus.yourdomain.com
#   - 选择验证方式: 自托管 (self-hosting)
#   - 选择存储: Windows Certificate Store
#   - 选择安装目标: IIS 站点

# 3. 检查自动续期任务
schtasks /query /tn "\wacs-renew"
```

---

## 四、项目部署

### 4.1 复制项目到服务器

```powershell
# 创建部署目录
mkdir E:\www\nimbus-cms

# 复制项目文件（通过 Git、SCP、FTP 等方式）
# 确保包含：package.json, next.config.js, .env, src/, prisma/, public/ 等
```

### 4.2 配置 `.env` 文件

```powershell
cd E:\www\nimbus-cms
copy .env.example .env
```

编辑 `.env`：

```env
# ========== 数据库 ==========
DATABASE_URL="postgresql://postgres:你的强密码@localhost:5432/nimbus_cms?schema=public"

# ========== Next.js ==========
NEXTAUTH_URL=https://nimbus.yourdomain.com
NEXTAUTH_SECRET=生成长随机密钥（执行下方命令获取）

# ========== Redis ==========
REDIS_URL=redis://localhost:6379

# ========== Admin 路径安全 ==========
NEXT_PUBLIC_ADMIN_PATH=/你的随机管理路径

# ========== OSS（按需填写） ==========
OSS_ENDPOINT=
OSS_BUCKET=
OSS_ACCESS_KEY=
OSS_SECRET_KEY=

# ========== SMTP（按需填写） ==========
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# ========== Unsplash ==========
UNSPLASH_ACCESS_KEY=
```

> ⚠️ **安全提醒**：
> - `NEXTAUTH_SECRET` 使用以下命令生成随机值：
>   ```powershell
>   [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
>   ```
> - `NEXT_PUBLIC_ADMIN_PATH` 务必设置为随机路径，如 `/xK9m2pQ7`
> - 数据库密码不要使用默认值

### 4.3 安装依赖与构建

```powershell
cd E:\www\nimbus-cms

# 安装依赖（使用 ci 模式，精确安装 lockfile 中的版本）
npm ci

# 生成 Prisma Client
npx prisma generate

# 构建 Next.js 生产包
npm run build
```

### 4.4 数据库初始化

```powershell
# 执行数据库迁移
npx prisma migrate deploy

# 导入种子数据（首次部署）
npx tsx prisma/seed.ts
```

---

## 五、nssm 进程管理

### 5.1 下载与安装 nssm

1. 下载地址：[https://nssm.cc/download](https://nssm.cc/download)
2. 解压到 `C:\tools\nssm`
3. 根据系统选择 32 位或 64 位（64 位系统选 `win64` 版本）

### 5.2 安装 NimbusCMS 为 Windows 服务

```powershell
# 安装服务
C:\tools\nssm\nssm.exe install NimbusCMS

# 上面的命令会弹出 GUI 窗口，填写：
#   Path:       C:\Program Files\nodejs\node.exe
#   Startup directory: E:\www\nimbus-cms
#   Arguments:  node_modules\.bin\next start
```

**或者使用命令行方式（推荐，便于脚本化）：**

```powershell
C:\tools\nssm\nssm.exe install NimbusCMS ^
  "C:\Program Files\nodejs\node.exe" ^
  "E:\www\nimbus-cms\node_modules\.bin\next" ^
  "start"
```

### 5.3 配置服务参数

```powershell
# 设置工作目录
C:\tools\nssm\nssm.exe set NimbusCMS AppDirectory E:\www\nimbus-cms

# 设置环境变量（重要！）
C:\tools\nssm\nssm.exe set NimbusCMS AppEnvironmentExtra ^
  "NODE_ENV=production^^DATABASE_URL=postgresql://postgres:你的密码@localhost:5432/nimbus_cms?schema=public^^NEXTAUTH_URL=https://nimbus.yourdomain.com^^NEXTAUTH_SECRET=你的密钥^^REDIS_URL=redis://localhost:6379^^NEXT_PUBLIC_ADMIN_PATH=/你的随机路径"

# ↑ 注意：多个环境变量之间用 ^^ 分隔（nssm 的转义），或使用 AppEnvironmentFile（见下方说明）

# 设置启动类型为自动
C:\tools\nssm\nssm.exe set NimbusCMS Start SERVICE_AUTO_START

# 隐藏控制台窗口
C:\tools\nssm\nssm.exe set NimbusCMS AppNoConsole 1

# 优雅停止（发送 Ctrl+C 而非强制终止）
C:\tools\nssm\nssm.exe set NimbusCMS AppStopMethodConsole 30000

# 重启策略：进程退出时自动重启（延迟 1 秒）
C:\tools\nssm\nssm.exe set NimbusCMS AppRestartDelay 1000

# 日志输出配置
C:\tools\nssm\nssm.exe set NimbusCMS AppStdout E:\www\nimbus-cms\logs\stdout.log
C:\tools\nssm\nssm.exe set NimbusCMS AppStderr E:\www\nimbus-cms\logs\stderr.log
C:\tools\nssm\nssm.exe set NimbusCMS AppStdoutCreationDisposition 4
C:\tools\nssm\nssm.exe set NimbusCMS AppStderrCreationDisposition 4
```

> **更好的环境变量管理方式**：将环境变量写入文件，然后在 nssm 中引用：
> ```powershell
> # 创建环境变量文件 E:\www\nimbus-cms\.env.nssm
> # 每行一个 KEY=VALUE（不需要 export）
> # 然后引用：
> C:\tools\nssm\nssm.exe set NimbusNSSM AppEnvironmentFile E:\www\nimbus-cms\.env.nssm
> C:\tools\nssm\nssm.exe set NimbusCMS AppEnvironmentFile E:\www\nimbus-cms\.env.nssm
> ```

### 5.4 启动服务

```powershell
# 启动
C:\tools\nssm\nssm.exe start NimbusCMS

# 查看状态
C:\tools\nssm\nssm.exe status NimbusCMS

# 验证
curl http://127.0.0.1:3000
```

### 5.5 服务管理命令

```powershell
# 重启
C:\tools\nssm\nssm.exe restart NimbusCMS

# 停止
C:\tools\nssm\nssm.exe stop NimbusCMS

# 查看日志（实时）
Get-Content E:\www\nimbus-cms\logs\stdout.log -Tail 50 -Wait

# 编辑配置
C:\tools\nssm\nssm.exe edit NimbusCMS

# 卸载服务
C:\tools\nssm\nssm.exe remove NimbusCMS confirm
```

---

## 六、IIS 反向代理配置

### 6.1 安装必要模块

确保已安装：
- **URL Rewrite Module 2**：<https://www.iis.net/downloads/microsoft/url-rewrite>
- **Application Request Routing (ARR) 3.1**：<https://www.iis.net/downloads/microsoft/application-request-routing>

安装完成后可能需要重启 IIS：

```powershell
iisreset /restart
```

### 6.2 创建 IIS 站点

1. **IIS 管理器** → 右键"网站" → "添加网站"
2. 填写：
   - **站点名称**：`NimbusCMS`
   - **物理路径**：`E:\www\nimbus-cms\public`（或任意空目录）
   - **绑定**：
     - 类型：`https`
     - 端口：`443`
     - 主机名：`nimbus.yourdomain.com`
     - SSL 证书：选择 Let's Encrypt 申请的证书

### 6.3 启用 WebSocket 代理（ARR）

> 如果你的应用使用了 WebSocket（如实时通知），需要启用此功能。

1. IIS 管理器 → 选择**服务器节点** → **Application Request Routing Cache**
2. 点击 **Server Proxy Settings**（右侧面板）
3. 勾选 ✅ **Enable WebSocket protocol**
4. 点击 **Apply**

### 6.4 配置 web.config

在站点物理路径下创建（或编辑）`web.config`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>

    <!-- ============================
         URL 重写规则
         ============================ -->
    <rewrite>
      <rules>

        <!--
          规则1: 静态资源直接转发
          .next/static、public 目录下的文件
        -->
        <rule name="Static-Next-Assets" stopProcessing="true">
          <match url="^_next/static/(.*)" />
          <action type="Rewrite" url="http://127.0.0.1:3000/_next/static/{R:1}" />
        </rule>

        <rule name="Static-Public-Files" stopProcessing="true">
          <match url="^(.*\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot|webmanifest|json|txt|xml))(.*)?$" />
          <conditions logicalGrouping="MatchAll" trackAllCaptures="false">
            <add input="{REQUEST_URI}" pattern="^/_next/" negate="true" />
          </conditions>
          <action type="Rewrite" url="http://127.0.0.1:3000/{R:0}" />
        </rule>

        <!--
          规则2: API 请求转发
          包括 /api/* 所有后端路由
        -->
        <rule name="API-Routes" stopProcessing="true">
          <match url="^api/(.*)" />
          <action type="Rewrite" url="http://127.0.0.1:3000/api/{R:1}" />
        </rule>

        <!--
          规则3: Next.js 前端路由 (Catch-All)
          所有其他请求交给 Next.js 处理
        -->
        <rule name="NextJS-SPA-Routes" stopProcessing="true">
          <match url="(.*)" />
          <conditions logicalGrouping="MatchAll" trackAllCaptures="false">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="http://127.0.0.1:3000/{R:1}" />
        </rule>

      </rules>

      <!-- ============================
           出站规则（修正响应头）
           ============================ -->
      <outboundRules>

        <!-- 修正 301/302 跳转中的 Location 头 -->
        <rule name="Fix-Location-Header" preCondition="IsRedirection">
          <match serverVariable="RESPONSE_LOCATION" pattern="^http://127\.0\.0\.1:\d+/(.*)" />
          <action type="Rewrite" value="https://nimbus.yourdomain.com/{R:1}" />
        </rule>

        <!-- 修正 Set-Cookie：添加 SameSite=None; Secure -->
        <!-- 解决反向代理下 Cookie 跨域问题 -->
        <rule name="Add-SameSite-Cookie" preCondition="IsHtml">
          <match serverVariable="RESPONSE_Set_Cookie" pattern="(.*)" negate="false" />
          <conditions logicalGrouping="MatchAll">
            <add input="{R:0}" pattern="SameSite=" negate="true" />
          </conditions>
          <action type="Rewrite" value="{R:0}; SameSite=None; Secure" />
        </rule>

      </outboundRules>
      <conditions>
        <add input="{RESPONSE_STATUS}" pattern="3\d\d" />
      </conditions>

    </rewrite>

    <!-- ============================
         HTTP 安全响应头
         ============================ -->
    <httpProtocol>
      <customHeaders>
        <add name="X-Frame-Options" value="SAMEORIGIN" />
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-XSS-Protection" value="1; mode=block" />
        <add name="Referrer-Policy" value="strict-origin-when-cross-origin" />
        <add name="Permissions-Policy" value="camera=(), microphone=(), geolocation=()" />
        <!-- 确认 HTTPS 正常运行后再启用 HSTS -->
        <!-- <add name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains; preload" /> -->
      </customHeaders>
      <!-- 移除 Server 头（隐藏 IIS 信息） -->
      <remove name="X-Powered-By" />
    </httpProtocol>

    <!-- ============================
         静态文件缓存
         ============================ -->
    <staticContent>
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="30.00:00:00" />
    </staticContent>

    <!-- ============================
         请求大小限制
         ============================ -->
    <security>
      <requestFiltering>
        <requestLimits maxAllowedContentLength="1073741824" /> <!-- 1GB -->
      </requestFiltering>
    </security>

    <!-- ============================
         请求日志（可选）
         ============================ -->
    <httpLogging dontLog="false" />

  </system.webServer>
</configuration>
```

> ⚠️ **必做**：将所有 `nimbus.yourdomain.com` 替换为你的实际域名。

---

## 七、防火墙配置

```powershell
# 开放 HTTPS 端口（对外服务）
New-NetFirewallRule -DisplayName "NimbusCMS-HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow

# （可选）如果 PostgreSQL 需要远程访问
# New-NetFirewallRule -DisplayName "PostgreSQL" -Direction Inbound -Protocol TCP -LocalPort 5432 -Action Allow

# 确认 3000 端口不暴露到外网
# nssm 启动的 Next.js 默认绑定 127.0.0.1:3000 即可（通过 next.config.js 已配置）
```

---

## 八、日常运维

### 8.1 启动 / 停止 / 重启

```powershell
# 启动服务
C:\tools\nssm\nssm.exe start NimbusCMS

# 停止服务
C:\tools\nssm\nssm.exe stop NimbusCMS

# 重启服务
C:\tools\nssm\nssm.exe restart NimbusCMS
```

### 8.2 查看日志

```powershell
# 实时查看 stdout 日志
Get-Content E:\www\nimbus-cms\logs\stdout.log -Tail 100 -Wait

# 查看 stderr（错误日志）
Get-Content E:\www\nimbus-cms\logs\stderr.log -Tail 100 -Wait

# 查看 Windows 事件日志中的服务状态
Get-EventLog -LogName Application -Source NimbusCMS -Newest 20
```

### 8.3 代码更新

```powershell
# 1. 拉取/复制新代码到 E:\www\nimbus-cms

# 2. 停止服务
C:\tools\nssm\nssm.exe stop NimbusCMS

# 3. 重新安装依赖（如有 package.json 变更）
cd E:\www\nimbus-cms
npm ci

# 4. 重新构建
npm run build

# 5. 数据库迁移（如有 schema 变更）
npx prisma migrate deploy

# 6. 重启服务
C:\tools\nssm\nssm.exe start NimbusCMS

# 7. 验证
curl https://nimbus.yourdomain.com
```

### 8.4 数据库备份与恢复

```powershell
# ====== 备份 ======
$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
& "C:\Program Files\PostgreSQL\15\bin\pg_dump.exe" -h localhost -U postgres nimbus_cms | Out-File "E:\backup\nimbus_cms_${timestamp}.sql"

# ====== 恢复 ======
# 1. 停止应用服务
C:\tools\nssm\nssm.exe stop NimbusCMS

# 2. 删除并重建数据库
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -h localhost -U postgres -c "DROP DATABASE nimbus_cms;"
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -h localhost -U postgres -c "CREATE DATABASE nimbus_cms;"

# 3. 执行恢复
Get-Content "E:\backup\nimbus_cms_20260515.sql" | & "C:\Program Files\PostgreSQL\15\bin\psql.exe" -h localhost -U postgres nimbus_cms

# 4. 重启应用
C:\tools\nssm\nssm.exe start NimbusCMS
```

### 8.5 SSL 证书续期

```powershell
# win-acme 自动续期（默认每 60 天运行计划任务）
# 手动触发：
cd C:\tools\wacs
.\wacs.exe --renew --baseuri https://acme-v02.api.letsencrypt.org/

# 续期后重启 IIS
iisreset /restart
```

---

## 九、部署检查清单

| # | 检查项 | 命令/操作 | 预期结果 |
|---|-------|----------|---------|
| 1 | nssm 服务运行中 | `C:\tools\nssm\nssm.exe status NimbusCMS` | `SERVICE_RUNNING` |
| 2 | 应用正常响应 | `curl http://127.0.0.1:3000` | 返回 HTML |
| 3 | API 可用 | `curl http://127.0.0.1:3000/api/site/public` | 返回 JSON |
| 4 | HTTPS 正常 | 浏览器访问 `https://nimbus.yourdomain.com` | 🔒 锁图标 |
| 5 | IIS 反向代理生效 | F12 → Network | 状态码 200 |
| 6 | Cookie 正常 | F12 → Application → Cookies | `admin-token` 存在，`SameSite=None; Secure` |
| 7 | Admin 路径安全 | 访问 `https://nimbus.yourdomain.com/admin` | 404 |
| 8 | 数据库连接 | `psql -h localhost -U postgres -d nimbus_cms -c "SELECT 1;"` | 成功 |
| 9 | Redis 连接 | `redis-cli ping` | `PONG` |
| 10 | 证书有效期 | IIS → 站点 → 绑定 → SSL 证书 | 未过期 |
| 11 | NEXTAUTH_SECRET 已修改 | 检查 `.env` | 不是默认值 |
| 12 | 日志无异常 | `Get-Content logs/stderr.log -Tail 20` | 无 `Error` / 堆栈信息 |

---

## 十、故障排查

### 10.1 服务启动失败

```powershell
# 查看 nssm 状态详情
C:\tools\nssm\nssm.exe status NimbusCMS

# 查看 stderr 错误日志
Get-Content E:\www\nimbus-cms\logs\stderr.log -Tail 50
```

常见问题：
- **端口 3000 被占用**：`netstat -ano | findstr :3000` → 找到占用进程 → 杀掉或修改端口
- **环境变量未生效**：检查 nssm 中 `AppEnvironmentExtra` 或 `AppEnvironmentFile` 配置
- **数据库连接失败**：检查 `.env` 中 `DATABASE_URL` 的密码和主机名

### 10.2 HTTPS 访问异常

```powershell
# 检查证书绑定
netsh http show sslcert ipport=0.0.0.0:443

# 检查 IIS 站点绑定
Get-WebBinding -Name "NimbusCMS"
```

### 10.3 Cookie / 登录失败

- 检查 `NEXTAUTH_URL` 是否与浏览器地址栏域名**完全一致**
- 检查浏览器是否阻止第三方 Cookie（建议用 Chrome 隐身窗口测试）
- 检查 `web.config` 中的 `SameSite` 出站规则是否生效

### 10.4 页面能访问但 API 返回 404

- 确认 IIS URL Rewrite 规则中 API 规则**在 SPA 规则之前**（规则执行顺序从上到下）
- 确认 Next.js 项目中 `src/app/api/` 目录结构正确

---

## 十一、资源占用参考

| 组件 | 内存占用 | CPU 占用 |
|---|---|---|
| Windows Server 2016 系统 | ~1.5 GB | 极低 |
| Node.js (Next.js next start) | 300~800 MB | 中等（随请求量） |
| PostgreSQL 15 | 500 MB ~ 2 GB | 中等（随查询量） |
| Redis 7 | 50~200 MB | 极低 |
| IIS + ARR | ~200 MB | 极低 |
| **合计** | **约 3~5 GB** | — |

> 建议服务器至少 **8 GB 内存**。

---

> **文档版本**: v1.0  
> **最后更新**: 2026-05-15  
> **备注**: 本方案不修改项目任何源码文件，所有配置均为部署层面操作。