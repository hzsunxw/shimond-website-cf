# Nimbus Site CMS — 方案三：iisnode 部署方案

> 适用环境：Windows Server 2016
> 部署方式：独立域名 + HTTPS + iisnode（IIS 原生托管 Node.js）
> 进程管理：IIS 应用池（零额外工具）
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
                       │        │     (iisnode 直接托管 Next.js)
                       │        │
                       │ ┌─────┴─────┐
                       │ │ iisnode    │
                       │ │ Next.js    │
                       │ │ (Node.js)  │
                       │ └─────┬─────┘
                       └───────┬───────┘
                               │
                    ┌──────────▼──────────┐
                    │  PostgreSQL / Redis  │  ← 宿主机直接安装
                    └─────────────────────┘
```

**核心优势**：不需要反向代理、不需要 nssm、不需要 PM2，所有东西都在 IIS 内统一管理。

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
3. **务必勾选 "Add to PATH"**
4. 验证安装：

```powershell
node -v
npm -v
```

### 2.3 安装 IIS 及必要组件

```powershell
# 使用 PowerShell 一键安装所需 IIS 组件
Import-Module ServerManager

# 安装 Web 服务器角色 + 必要功能
Install-WindowsFeature Web-Server, Web-WebServer, Web-Common-Http, Web-Static-Content, Web-Default-Doc, Web-Dir-Browsing, Web-Http-Errors, Web-App-Dev, Web-CGI, Web-ISAPI-Ext, Web-ISAPI-Filter, Web-Health, Web-Http-Logging, Web-Log-Libraries, Web-Request-Monitor, Web-Security, Web-Filtering, Web-Windows-Auth, Web-Mgmt-Tools, Web-Mgmt-Console, Web-Mgmt-Compat, Web-Metabase, NET-Framework-45-Features, NET-Framework-45-Core, NET-Framework-45-ASPNET, NET-WCF-HTTP-Activation45, Web-Asp-Net45, WAS, WAS-Process-Model, WAS-NET-Environment, Web-Lgcy-Scripting
```

> ⚠️ **Web-CGI** 是关键，iisnode 依赖 CGI 模块。

### 2.4 安装 iisnode

下载地址：[https://github.com/Azure/iisnode/releases](https://github.com/Azure/iisnode/releases)

```powershell
# 下载 iisnode 完整安装包（含 URL Rewrite 支持）
# 文件名: iisnode-full-v0.2.26-x64.msi

# 双击安装，或静默安装：
msiexec /i iisnode-full-v0.2.26-x64.msi /quiet /norestart
```

安装完成后，iisnode DLL 会自动注册到 IIS 中。

### 2.5 安装 PostgreSQL 15

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

### 2.6 安装 Redis 7

Windows 上可使用 MicrosoftArchive 版本：

1. 下载：[https://github.com/microsoftarchive/redis/releases](https://github.com/microsoftarchive/redis/releases)
2. 解压到 `C:\Redis`
3. 安装为 Windows 服务：

```powershell
cd C:\Redis
redis-server.exe --install-service
net start Redis
```

4. 验证：

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

使用 **win-acme**：

```powershell
# 下载: https://www.win-acme.com/
cd C:\tools\wacs
.\wacs.exe

# 按提示操作：
#   - 输入域名: nimbus.yourdomain.com
#   - 验证方式: 自托管
#   - 存储: Windows Certificate Store
#   - 安装目标: 选择刚创建的 IIS 站点
```

---

## 四、项目部署

### 4.1 复制项目到服务器

```powershell
mkdir E:\www\nimbus-cms
# 将项目文件复制到此目录（Git clone / SCP / FTP 等）
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
NEXTAUTH_SECRET=你的随机密钥
NEXT_PUBLIC_ADMIN_PATH=/你的随机管理路径

# ========== Redis ==========
REDIS_URL=redis://localhost:6379

# ========== OSS（按需） ==========
OSS_ENDPOINT=
OSS_BUCKET=
OSS_ACCESS_KEY=
OSS_SECRET_KEY=

# ========== SMTP（按需） ==========
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# ========== Unsplash ==========
UNSPLASH_ACCESS_KEY=
```

> ⚠️ `NEXTAUTH_SECRET` 使用以下命令生成：
> ```powershell
> [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
> ```

### 4.3 安装依赖与构建

```powershell
cd E:\www\nimbus-cms

# 安装依赖
npm ci

# 生成 Prisma Client
npx prisma generate

# 构建生产包
npm run build
```

### 4.4 数据库初始化

```powershell
# 数据库迁移
npx prisma migrate deploy

# 种子数据（首次部署）
npx tsx prisma/seed.ts
```

---

## 五、IIS 站点配置

### 5.1 创建站点

1. **IIS 管理器** → 右键"网站" → "添加网站"
2. 填写：
   - **站点名称**：`NimbusCMS`
   - **物理路径**：`E:\www\nimbus-cms`（项目根目录）
   - **绑定**：
     - 类型：`https`
     - 端口：`443`
     - 主机名：`nimbus.yourdomain.com`
     - SSL 证书：选择 Let's Encrypt 申请的证书

### 5.2 配置 web.config

在项目根目录 `E:\www\nimbus-cms\` 下创建 `web.config`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>

    <!-- ============================
         iisnode 核心配置
         ============================ -->
    <iisnode
      nodeProcessCommandLine="&quot;C:\Program Files\nodejs\node.exe&quot;"
      node_env="production"
      debuggingEnabled="false"
      loggingEnabled="true"
      logDirectory="iisnode"
      devErrorsEnabled="false"
      promoteServerVars="AUTH_USER,REMOTE_USER,LOGON_USER,HTTP_URL,
                         HTTP_ACCEPT_LANGUAGE,HTTP_USER_AGENT,
                         HTTP_ACCEPT,HTTP_ACCEPT_ENCODING"
      watchedFiles="web.config;*.js;node_modules\*\*;routes\**\*.js;views\**\*.html"
      uncFileChangesPollingInterval="5000"
      gracefulShutdownTimeout="60000"
      maxNamedPipeConnectionRetry="100"
      namedPipeConnectionRetryDelay="250"
      maxNamedPipeConnections="100"
      maxConcurrentRequestsPerProcess="1024"
      maxProcessesPerApplication="0"
      requestTimeout="00:02:00"
      shutdownTimeLimit="10"
      pingFrequency="00:00:05"
      pingResponseTimeLimit="00:00:30"
      enableXFF="false"
    />

    <!-- ============================
         处理器映射
         ============================ -->
    <handlers>
      <add name="iisnode"
           path="server.js"
           verb="*"
           modules="iisnode"
           resourceType="Either"
           requireAccess="Execute" />
    </handlers>

    <!-- ============================
         URL 重写
         ============================ -->
    <rewrite>
      <rules>

        <!--
          将所有传入请求路由到 Next.js。
          Next.js 的 standalone 模式会自己处理静态文件路由，
          所以这里用简单的通配规则即可。
        -->
        <rule name="NextJS-All-Routes" stopProcessing="true">
          <match url="(.*)" />
          <conditions logicalGrouping="MatchAll" trackAllCaptures="false">
            <!-- 不拦截 iisnode 内部请求 -->
            <add input="{URL}" pattern="iisnode/*" negate="true" />
          </conditions>
          <action type="Rewrite" url="server.js" />
        </rule>

      </rules>

      <!-- ============================
           出站规则
           ============================ -->
      <outboundRules>

        <!-- 修正 301/302 重定向中的 Location 头 -->
        <rule name="Fix-Redirect-Location" preCondition="IsRedirection">
          <match serverVariable="RESPONSE_LOCATION"
                 pattern="^http://127\.0\.0\.1:\d+/(.*)" />
          <action type="Rewrite"
                  value="https://nimbus.yourdomain.com/{R:1}" />
        </rule>

        <!-- 修复 Set-Cookie：添加 SameSite=None; Secure -->
        <rule name="Fix-Cookies" preCondition="IsHtml">
          <match serverVariable="RESPONSE_Set_Cookie"
                 pattern="(.*)" negate="false" />
          <conditions logicalGrouping="MatchAll">
            <add input="{R:0}" pattern="SameSite=" negate="true" />
          </conditions>
          <action type="Rewrite"
                  value="{R:0}; SameSite=None; Secure" />
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
        <add name="Referrer-Policy"
             value="strict-origin-when-cross-origin" />
        <add name="Permissions-Policy"
             value="camera=(), microphone=(), geolocation=()" />
        <!-- HTTPS 正常后再启用 HSTS -->
        <!-- <add name="Strict-Transport-Security"
             value="max-age=31536000; includeSubDomains; preload" /> -->
      </customHeaders>
      <remove name="X-Powered-By" />
    </httpProtocol>

    <!-- ============================
         静态文件缓存
         ============================ -->
    <staticContent>
      <clientCache cacheControlMode="UseMaxAge"
                   cacheControlMaxAge="30.00:00:00" />
    </staticContent>

    <!-- ============================
         请求大小限制
         ============================ -->
    <security>
      <requestFiltering>
        <requestLimits maxAllowedContentLength="1073741824" />
      </requestFiltering>
    </security>

    <!-- ============================
         URL 压缩（可选，加速传输）
         ============================ -->
    <urlCompression doStaticCompression="true"
                    doDynamicCompression="true" />

    <!-- ============================
         日志
         ============================ -->
    <httpLogging dontLog="false" />

  </system.webServer>
</configuration>
```

> ⚠️ 将所有 `nimbus.yourdomain.com` 替换为你的实际域名。

### 5.3 IIS 应用池优化配置

```powershell
Import-Module WebAdministration

# ── 应用池回收策略 ──
# 设为 AlwaysRunning，防止冷启动
Set-ItemProperty IIS:\AppPools\NimbusCMS `
  -Name startMode -Value "AlwaysRunning"

# 定期回收：每天凌晨 4 点
Set-ItemProperty IIS:\AppPools\NimbusCMS `
  -Name recycling.periodicRestart.schedule -Value @("04:00:00")

# 快速故障防护：5 分钟内崩溃 5 次则停止
Set-ItemProperty IIS:\AppPools\NimbusCMS `
  -Name failure.rapidFailProtection -Value $true
Set-ItemProperty IIS:\AppPools\NimbusCMS `
  -Name failure.rapidFailProtectionMaxCrashes -Value 5
Set-ItemProperty IIS:\AppPools\NimbusCMS `
  -Name failure.rapidFailProtectionInterval -Value 300

# ── CPU 限制（可选） ──
# 限制应用池 CPU 使用不超过 80%
Set-ItemProperty IIS:\AppPools\NimbusCMS `
  -Name cpu.limit -Value 80000
Set-ItemProperty IIS:\AppPools\NimbusCMS `
  -Name cpu.action -Value "Throttle"
```

### 5.4 设置站点开机自启

```powershell
Set-ItemProperty IIS:\Sites\NimbusCMS `
  -Name serverAutoStart -Value $true
```

---

## 六、验证部署

### 6.1 基础验证

```powershell
# 1. 确认 IIS 站点已启动
Get-Website -Name "NimbusCMS"
# State 应为 Started

# 2. 确认 iisnode 模块已加载
Get-WebGlobalModule | Where-Object { $_.Name -like "*iisnode*" }

# 3. 浏览器访问
# 打开 https://nimbus.yourdomain.com
# 应该看到首页正常加载

# 4. 测试 API
curl https://nimbus.yourdomain.com/api/site/public
# 应该返回 JSON 数据
```

### 6.2 日志查看

```powershell
# iisnode 日志目录
Get-ChildItem "E:\www\nimbus-cms\iisnode\" -Filter "*.txt" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 10

# 查看 Node.js stdout 日志
type "E:\www\nimbus-cms\iisnode\stdout_xxx.log"

# 查看错误日志
type "E:\www\nimbus-cms\iisnode\stderr_xxx.log"

# Windows 事件日志
Get-EventLog -LogName Application -Source iisnode -Newest 20
```

### 6.3 健康检查

```powershell
# 检查 Node.js 进程是否在运行
Get-Process node

# 检查内存使用
Get-Process node | Select-Object ProcessName, WorkingSet64, PagedMemorySize64
```

---

## 七、日常运维

### 7.1 代码更新

```powershell
cd E:\www\nimbus-cms

# 1. 拉取/复制新代码

# 2. 重新安装依赖（如有 package.json 变更）
npm ci

# 3. 重新构建
npm run build

# 4. 数据库迁移（如有 schema 变更）
npx prisma migrate deploy

# 5. iisnode 会自动检测 server.js 变更并重启
# 如果没有自动重启，强制回收应用池：
Restart-WebAppPool -Name "NimbusCMS"
```

### 7.2 重启策略

```powershell
# 重启 IIS 站点（快速重启，无缝切换）
Restart-WebItem IIS:\Sites\NimbusCMS

# 重启应用池（推荐）
Restart-WebAppPool -Name "NimbusCMS"

# 完整重启 IIS（会影响所有站点）
iisreset /restart
```

### 7.3 数据库备份与恢复

```powershell
# ====== 备份 ======
$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
& "C:\Program Files\PostgreSQL\15\bin\pg_dump.exe" `
  -h localhost -U postgres nimbus_cms |
  Out-File "E:\backup\nimbus_cms_${timestamp}.sql"

# ====== 恢复 ======
# 1. 停止站点
Stop-WebSite -Name "NimbusCMS"

# 2. 重建数据库
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -h localhost -U postgres `
  -c "DROP DATABASE IF EXISTS nimbus_cms;"
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -h localhost -U postgres `
  -c "CREATE DATABASE nimbus_cms;"

# 3. 执行 SQL 恢复
Get-Content "E:\backup\nimbus_cms_20260515.sql" |
  & "C:\Program Files\PostgreSQL\15\bin\psql.exe" -h localhost -U postgres nimbus_cms

# 4. 重新启动站点
Start-WebSite -Name "NimbusCMS"
```

### 7.4 SSL 证书续期

```powershell
# win-acme 自动续期（每 60 天）
cd C:\tools\wacs
.\wacs.exe --renew --baseuri https://acme-v02.api.letsencrypt.org/

# 重启站点使新证书生效
Restart-WebItem IIS:\Sites\NimbusCMS
```

---

## 八、部署检查清单

| # | 检查项 | 命令/操作 | 预期结果 |
|---|-------|----------|---------|
| 1 | iisnode 模块已安装 | IIS 管理器 → 模块 | 看到 `iisnode` |
| 2 | CGI 功能已启用 | IIS → 站点 → 处理程序映射 | `iisnode` 处理器存在 |
| 3 | 站点已启动 | `Get-Website -Name NimbusCMS` | `State: Started` |
| 4 | 页面正常加载 | 浏览器访问 `https://nimbus.yourdomain.com` | 首页正常显示 |
| 5 | API 可用 | `curl https://nimbus.yourdomain.com/api/site/public` | 返回 JSON |
| 6 | HTTPS 证书有效 | 浏览器点击 🔒 锁图标 | 证书有效、未过期 |
| 7 | Cookie SameSite | F12 → Application → Cookies | `SameSite=None; Secure` |
| 8 | Admin 路径安全 | 访问 `https://nimbus.yourdomain.com/admin` | 404 |
| 9 | Node.js 进程运行 | `Get-Process node` | 进程存在 |
| 10 | 数据库连接 | `psql -h localhost -U postgres -d nimbus_cms -c "SELECT 1;"` | 成功 |
| 11 | Redis 连接 | `redis-cli ping` | `PONG` |
| 12 | iisnode 日志 | 检查 `iisnode\` 目录 | 无错误信息 |
| 13 | NEXTAUTH_SECRET 已修改 | 检查 `.env` | 不是默认值 |
| 14 | 应用池自动启动 | `Get-ItemProperty IIS:\AppPools\NimbusCMS -Name startMode` | `AlwaysRunning` |

---

## 九、故障排查

### 9.1 页面返回 500 错误

```powershell
# 查看 iisnode 错误日志
type "E:\www\nimbus-cms\iisnode\stderr_xxx.log"
```

常见原因：
- **数据库连接失败**：检查 `.env` 中 `DATABASE_URL`
- **Prisma Client 未生成**：执行 `npx prisma generate`
- **端口冲突**：检查是否有其他进程占用端口

### 9.2 页面返回 503 Service Unavailable

```powershell
# 应用池可能已停止
Get-WebAppPoolState -Name "NimbusCMS"

# 如果已停止，查看事件日志
Get-EventLog -LogName Application -Source iisnode -Newest 10

# 手动重启应用池
Restart-WebAppPool -Name "NimbusCMS"
```

### 9.3 页面返回 404

- 确认 `web.config` 位于项目**根目录**
- 确认 URL Rewrite 规则路径正确
- 确认 `server.js` 存在于 `.next/standalone/` 目录

### 9.4 静态资源加载失败

```powershell
# iisnode 不处理静态文件，由 Next.js standalone 自己处理
# 确认 .next/static/ 目录存在且包含文件
ls E:\www\nimbus-cms\.next\static\
```

### 9.5 WebSocket 连接失败

确认 IIS WebSocket 功能已启用：

```powershell
# 检查 WebSocket 模块
Get-WebGlobalModule | Where-Object { $_.Name -like "*WebSocket*" }

# 如果未安装，通过"添加角色和功能"安装
Install-WindowsFeature Web-WebSockets
```

### 9.6 内存不足导致频繁崩溃

```powershell
# 检查 Node.js 内存使用
Get-Process node | Select-Object ProcessName, WorkingSet64

# 调整 iisnode 的最大进程数（默认只允许 1 个）
# 在 web.config 的 <iisnode> 中添加：
#   maxProcessesPerApplication="1"
#   maxConcurrentRequestsPerProcess="1024"

# 或者增加应用池私有内存限制（64 位系统默认无限制）
```

---

## 十、iisnode 关键配置说明

| 配置项 | 默认值 | 推荐值 | 说明 |
|---|---|---|---|
| `nodeProcessCommandLine` | 系统 PATH 中的 node | `C:\Program Files\nodejs\node.exe` | 明确指定 Node.js 路径 |
| `node_env` | — | `production` | 生产环境 |
| `loggingEnabled` | `false` | `true` | 启用日志便于排查问题 |
| `logDirectory` | — | `iisnode` | 日志存放目录（相对路径） |
| `devErrorsEnabled` | `false` | `false` | 生产环境禁止显示详细错误 |
| `gracefulShutdownTimeout` | `60000` | `60000` | 优雅关闭超时时间（毫秒） |
| `requestTimeout` | `00:02:00` | `00:02:00` | 请求超时时间 |
| `maxNamedPipeConnections` | `50` | `100` | 最大并发连接数 |
| `pingFrequency` | `00:00:05` | `00:00:05` | 健康检查频率 |
| `watchedFiles` | — | `web.config;*.js` | 监控文件变化自动重启 |

---

## 十一、方案选择建议

| 你的场景 | 推荐方案 |
|---|---|
| 追求最小化配置、零额外工具 | ✅ **iisnode（本方案）** |
| 需要完全环境隔离 | ✅ Docker + Hyper-V（参考 doc/deploy-docker-hyperv.md） |
| iisnode 遇到兼容性问题 | ✅ nssm + IIS 反代（参考 doc/deploy-nssm-iis-proxy.md） |

**iisnode 的最大优势**：整个 Node.js 进程被 IIS 进程管理，不需要安装任何额外软件（除了 iisnode MSI），日志集成到 IIS，日志轮转、应用池回收、进程监控全部由 IIS 原生处理。

---

> **文档版本**: v1.0  
> **最后更新**: 2026-05-15  
> **备注**: 本方案不修改项目任何源码文件，所有配置均为部署层面操作。