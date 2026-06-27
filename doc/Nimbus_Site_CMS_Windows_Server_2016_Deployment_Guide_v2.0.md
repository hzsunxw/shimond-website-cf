# Nimbus Site CMS — Windows Server 2016 生产部署方案

> **适用环境**：Windows Server 2016 (Build 14393+)  
> **核心约束**：不修改现有系统、全组件兼容 Server 2016、最小权限隔离  
> **进程管理**：PM2 (fork 模式)  
> **运行模式**：Next.js Standalone (`server.js`)  
> **反向代理**：IIS (SSL 终止、WebSocket 透传)

---

## 一、架构总览与隔离设计

```
                         客户端浏览器
                              │
                         HTTPS (443)
                              │
                    ┌─────────▼─────────┐
                    │       IIS         │  ← SSL 终止、安全策略、IP 白名单
                    │   (独立站点)       │  ← 仅绑定独立域名，与现有站点隔离
                    └─────────┬─────────┘
                              │ HTTP
                    ┌─────────▼─────────┐
                    │   PM2 (fork)      │  ← 进程守护、内存限制、日志切割
                    │  server.js:3001   │  ← 强制绑定 127.0.0.1，无外网暴露
                    └─────────┬─────────┘
          ┌───────────────────┼───────────────────┐
          │                   │                   │
    ┌─────▼─────┐      ┌──────▼──────┐     ┌─────▼─────┐
    │PostgreSQL │      │   Redis     │     │ 本地文件   │
    │  14       │      │ 3.x Windows │     │ 存储       │
    │ port 5433 │      │ port 6380   │     │ uploads/   │
    │ 127.0.0.1 │      │ 127.0.0.1   │     │            │
    └───────────┘      └─────────────┘     └────────────┘
```

### 1.1 端口隔离规划（避免与现有系统冲突）

| 组件 | 协议 | 地址 | 端口 | 说明 |
|------|------|------|------|------|
| IIS HTTPS | TCP | 0.0.0.0 | **443** | 对外服务，与现有 IIS 站点通过主机头区分 |
| IIS HTTP | TCP | 0.0.0.0 | **80** | 仅用于证书验证（如现有系统占用，改用 DNS 验证） |
| Next.js | TCP | **127.0.0.1** | **3001** | 禁止监听 0.0.0.0，避免绕过 IIS |
| PostgreSQL | TCP | **127.0.0.1** | **5433** | 非默认 5432，避免与现有 PG 实例冲突 |
| Redis | TCP | **127.0.0.1** | **6380** | 非默认 6379，避免与现有 Redis 冲突 |

> ⚠️ **部署前必做**：确认上述端口未被现有系统占用。
> ```powershell
> netstat -ano | findstr ":3001\|:5433\|:6380"
> ```

---

## 二、兼容性说明（为什么这样选型）

| 组件 | 选型 | 兼容性说明 |
|------|------|-----------|
| **Node.js** | **20.x LTS** | 最后一个支持 Server 2016 的 LTS 大版本（需 Build 14393+）。**18.x 已停止维护，禁止使用。** |
| **PostgreSQL** | **14.x** | **PG 15+ 官方不再支持 Windows Server 2016**。PG 14 是最后一个支持该系统的稳定版。 |
| **Redis** | **3.0.504 (Microsoft Archive)** | Windows 官方原生版最高仅到 3.x。**不存在 Redis 7 Windows 原生版**。若需 Redis 6+ 特性，需改用商业软件 Memurai 或独立 Linux 虚拟机。 |
| **PM2** | **fork 模式** | Windows 上 PM2 的 `cluster` 模式不稳定，明确使用 `fork` 单实例。 |
| **Next.js** | **Standalone** | 输出精简运行时，脱离完整 `node_modules`，启动更快、文件占用更少。 |

---

## 三、环境准备（零影响现有系统）

### 3.1 创建隔离服务账户

创建专用低权限账户运行 NimbusCMS 服务，**严禁使用 LocalSystem**。

```powershell
# 创建用户（密码需符合域/本地安全策略复杂度）
$Password = Read-Host -AsSecureString -Prompt "输入 NimbusSvc 强密码"
New-LocalUser -Name "NimbusSvc" -Password $Password -PasswordNeverExpires -UserMayNotChangePassword
# 从 Users 组移除（防止继承多余权限）
Remove-LocalGroupMember -Group "Users" -Member "NimbusSvc"
# 添加到 IIS_IUSRS（使 IIS 可读取相关目录，如需要）
Add-LocalGroupMember -Group "IIS_IUSRS" -Member "NimbusSvc"
```

**安全策略配置**（`secpol.msc` → 本地策略 → 用户权限分配）：
- **作为服务登录** → 添加 `NimbusSvc`
- **允许通过远程桌面服务登录** → 确保**不包含** `NimbusSvc`（禁止 RDP）
- **拒绝本地登录** → 添加 `NimbusSvc`（该账户仅用于后台服务）

### 3.2 目录结构与 NTFS 权限

```powershell
# 创建目录
$dirs = @(
    "D:\shimond2\www\nimbus-cms",
    "D:\shimond2\www\nimbus-cms\logs",
    "D:\shimond2\www\nimbus-cms\uploads",
    "D:\shimond2\pgdata\nimbus",
    "D:\shimond2\redis-nimbus\data",
    "D:\shimond2\redis-nimbus\logs",
    "D:\shimond2\backup\nimbus"
)
foreach ($d in $dirs) { New-Item -ItemType Directory -Path $d -Force }

# 设置 NimbusCMS 目录权限（仅 NimbusSvc 和 Administrators）
$path = "D:\shimond2\www\nimbus-cms"
$acl = Get-Acl $path

# 移除继承并清除现有权限
$acl.SetAccessRuleProtection($true, $false)

# 添加 Administrators 完全控制
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule("Administrators", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.SetAccessRule($rule)

# 添加 NimbusSvc 完全控制
$rule2 = New-Object System.Security.AccessControl.FileSystemAccessRule("NimbusSvc", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.AddAccessRule($rule2)

Set-Acl $path $acl
# 对 logs、uploads 目录同样执行上述权限设置
```

### 3.3 安装 Node.js 20.x LTS

```powershell
# 下载 Node.js 20.x (例如 20.19.0)
# 官方地址: https://nodejs.org/dist/v20.19.0/node-v20.19.0-x64.msi
# 安装时勾选 "Automatically install the necessary tools"（如需编译原生模块）

# 验证
node -v   # 应显示 v20.x.x
npm -v
```

### 3.4 安装 PostgreSQL 14（自定义实例隔离）

1. 下载 PostgreSQL 14 Windows 安装程序（EnterpriseDB 版）。
2. 安装时**务必修改以下默认值**：
   - **安装目录**：`E:\PostgreSQL\14`（与现有实例隔离）
   - **数据目录**：`E:\pgdata\nimbus`
   - **端口**：`5433`
   - **服务名**：`postgresql-nimbus`（与现有服务区分）
   - **超级用户密码**：设置强密码并记录
3. 安装完成后，**创建应用专用账户**（禁止应用使用 `postgres` 超级用户）：

```powershell
$env:PGPASSWORD = "你的超级用户密码"
& "E:\PostgreSQL\14\bin\psql.exe" -U postgres -p 5433 -c "CREATE USER nimbus_app WITH PASSWORD 'Kjm123$%^';"
& "E:\PostgreSQL\14\bin\psql.exe" -U postgres -p 5433 -c "CREATE DATABASE nimbus_cms OWNER nimbus_app;"
& "E:\PostgreSQL\14\bin\psql.exe" -U postgres -p 5433 -c "GRANT ALL PRIVILEGES ON DATABASE nimbus_cms TO nimbus_app;"
```

4. 验证：
```powershell
& "E:\PostgreSQL\14\bin\psql.exe" -U nimbus_app -p 5433 -d nimbus_cms -c "SELECT version();"
```

### 3.5 安装 Redis Windows 原生版（隔离+加固）

Redis 官方无 Windows 7+ 原生版本，使用 Microsoft Archive 3.0.504（最稳定原生版）。

```powershell
# 下载并解压到 E:\redis-nimbus
# 下载地址: https://github.com/microsoftarchive/redis/releases (Redis-x64-3.0.504.zip)

# 创建配置文件 E:\redis-nimbus\redis.windows.conf
@"
port 6380
bind 127.0.0.1
requirepass 你的Redis强密码
maxmemory 256mb
maxmemory-policy allkeys-lru

# 禁用危险命令
rename-command FLUSHALL ""
rename-command FLUSHDB ""
rename-command CONFIG ""
rename-command KEYS ""

# 持久化与日志
dir E:\redis-nimbus\data
dbfilename nimbus.rdb
logfile E:\redis-nimbus\logs\redis.log
"@ | Out-File -Encoding utf8 "E:\redis-nimbus\redis.windows.conf"
```

安装并启动服务（服务名隔离）：

```powershell
cd E:\redis-nimbus
.\redis-server.exe --service-install redis.windows.conf --service-name Redis-Nimbus --port 6380
.\redis-server.exe --service-start --service-name Redis-Nimbus

# 验证
$env:REDISCLI_AUTH = "你的Redis强密码"
.\redis-cli.exe -p 6380 ping
# 预期返回: PONG
```

---

## 四、项目配置与构建（Standalone 模式）

### 4.1 配置 next.config.js

确保 Next.js 输出 Standalone 模式，并**强制绑定本地回环地址**。

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // 确保 Prisma 引擎被包含在 standalone 输出中
  outputFileTracingIncludes: {
    '**': [
      './node_modules/.prisma/client/**/*',
      './node_modules/@prisma/client/**/*'
    ]
  }
}
module.exports = nextConfig
```

### 4.2 配置 .env.production

创建 `E:\www\nimbus-cms\.env.production`，**严格限制文件权限**：

```powershell
# 复制示例配置
copy .env.example .env.production

# 设置权限：仅 NimbusSvc 和 Administrators 可读取
$path = "E:\www\nimbus-cms\.env.production"
$acl = Get-Acl $path
$acl.SetAccessRuleProtection($true, $false)
$acl.AddAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule("Administrators", "Read", "None", "None", "Allow")))
$acl.AddAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule("NimbusSvc", "Read", "None", "None", "Allow")))
Set-Acl $path $acl
```

编辑 `.env.production`：

```env
# ========== 数据库（使用非默认端口和专用账户）==========
DATABASE_URL="postgresql://nimbus_app:应用专用强密码@127.0.0.1:5433/nimbus_cms?schema=public"

# ========== Next.js / NextAuth ==========
NEXTAUTH_URL=https://nimbus.yourdomain.com
NEXTAUTH_SECRET=此处填入生成的强密钥（见下方）

# ========== Redis（非默认端口+密码）==========
REDIS_URL=redis://:你的Redis强密码@127.0.0.1:6380

# ========== 运行绑定（强制本地回环）==========
HOSTNAME=127.0.0.1
PORT=3001

# ========== Admin 路径安全 ==========
NEXT_PUBLIC_ADMIN_PATH=/你的随机管理路径

# ========== 文件存储 ==========
UPLOAD_DIR=E:\www\nimbus-cms\uploads

# ========== OSS / SMTP / Unsplash（按需）==========
# ...
```

生成 `NEXTAUTH_SECRET`：
```powershell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### 4.3 安装依赖与构建

```powershell
cd E:\www\nimbus-cms

# 精确安装 lockfile 版本
npm ci

# 生成 Prisma Client
npx prisma generate

# 构建 Standalone 输出
npm run build
```

构建完成后，验证 standalone 目录完整性：
```powershell
# 必须存在 server.js
Test-Path "E:\www\nimbus-cms\.next\standalone\server.js"

# 验证 Prisma 查询引擎是否存在（防止运行时崩溃）
Get-ChildItem "E:\www\nimbus-cms\.next\standalone\node_modules\.prisma\client\query_engine_windows.dll.node" -ErrorAction SilentlyContinue
if (-not $?) { Write-Warning "Prisma 引擎未包含在 standalone 中，需检查 outputFileTracingIncludes 配置" }
```

### 4.4 数据库初始化

```powershell
cd E:\www\nimbus-cms

# 执行迁移
npx prisma migrate deploy

# 导入种子数据（首次部署）
npx tsx prisma/seed.ts
```

---

### 4.5 后台管理员账号初始化

种子脚本（`prisma/seed.ts`）会自动创建默认管理员账号，**首次部署后必须立即修改默认密码**。

#### 4.5.1 默认管理员凭据

| 字段 | 值 |
|------|-----|
| 用户名 | `admin` |
| 初始密码 | `admin123` |
| 昵称 | `管理员` |

#### 4.5.2 首次登录与修改密码

1. 浏览器访问 `https://nimbus.yourdomain.com/{你的随机管理路径}/login`
2. 使用上述凭据登录
3. 登录成功后，进入 **系统设置 → 管理员管理** 修改密码
4. 设置符合安全策略的强密码（建议至少 12 位，含大小写字母、数字和特殊字符）

#### 4.5.3 重新执行种子（重置管理员账户）

如需重置管理员密码或恢复默认数据：

```powershell
cd E:\www\nimbus-cms

# 重新执行种子脚本（不会覆盖已有数据，仅 upsert 缺失记录）
npx tsx prisma/seed.ts

# 验证管理员账号
& "E:\PostgreSQL\14\bin\psql.exe" -U nimbus_app -p 5433 -d nimbus_cms -c "SELECT id, username, nickname, status FROM admin_users;"
```

> **注意**：`prisma/seed.ts` 使用 `upsert` 方式写入，对已存在的记录仅更新空字段，不会覆盖已有密码以外的数据。如需强制重置密码，见下方 4.5.4。

#### 4.5.4 手动创建 / 重置管理员账号

**场景 A：种子脚本未执行或执行失败**

```powershell
# 手动插入管理员账号（密码通过 bcrypt 加密）
$env:PGPASSWORD = "应用专用强密码"
& "E:\PostgreSQL\14\bin\psql.exe" -U nimbus_app -p 5433 -d nimbus_cms -c @"
INSERT INTO admin_users (id, username, nickname, password, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin',
  '管理员',
  -- 下方为 'admin123' 的 bcrypt hash，生产环境应替换为自定义密码的 hash
  '\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'ACTIVE',
  NOW(),
  NOW()
)
ON CONFLICT (username) DO NOTHING;
"@
```

**场景 B：忘记密码，需要重置**

方法一（推荐）：通过种子脚本重置
```powershell
# 直接更新密码为默认值，然后登录后立即修改
# 在 psql 中执行：
& "E:\PostgreSQL\14\bin\psql.exe" -U nimbus_app -p 5433 -d nimbus_cms -c @"
UPDATE admin_users
SET password = '\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE username = 'admin';
"@
```

方法二：使用 Node.js 生成自定义密码的 bcrypt hash 后更新
```powershell
# 在项目目录下执行，生成自定义密码对应的 hash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('你的新密码', 10).then(h => console.log(h));"
# 将输出的 hash 值代入 SQL 更新命令中
```

> ⚠️ **安全提醒**：
> - 生产环境部署完成后，**必须**通过后台管理页面修改默认密码
> - 切勿在部署检查清单中保留默认密码
> - 建议为每个环境（开发/预发布/生产）使用不同的管理员密码
> - 可在部署检查清单第 17 项追加确认"默认密码已修改"

---

## 五、PM2 进程管理（Windows 适配方案）

### 5.1 安装 PM2 与日志切割插件

```powershell
npm install -g pm2
pm2 install pm2-logrotate

# 配置日志切割（防止磁盘占满影响现有系统）
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 10
pm2 set pm2-logrotate:compress true
```

### 5.2 配置 ecosystem.config.js

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'nimbus-cms',
    // Standalone 入口
    script: '.next/standalone/server.js',
    cwd: 'E:\\www\\nimbus-cms',

    // Windows 必须使用 fork 模式，cluster 模式不稳定
    exec_mode: 'fork',
    instances: 1,

    // 从独立文件加载环境变量（避免命令行转义问题）
    env_file: 'E:\\www\\nimbus-cms\\.env.production',

    // 运行时环境变量（覆盖绑定地址和端口）
    env: {
      NODE_ENV: 'production',
      HOSTNAME: '127.0.0.1',
      PORT: 3001
    },

    // 日志路径
    log_file: 'E:\\www\\nimbus-cms\\logs\\pm2-combined.log',
    out_file: 'E:\\www\\nimbus-cms\\logs\\pm2-out.log',
    error_file: 'E:\\www\\nimbus-cms\\logs\\pm2-err.log',
    merge_logs: true,
    time: true,

    // 资源限制（防止内存泄漏影响现有系统）
    max_memory_restart: '512M',

    // 重启策略
    restart_delay: 3000,
    max_restarts: 5,
    min_uptime: '10s',
    kill_timeout: 5000
  }]
};
```

### 5.3 启动应用并持久化进程列表

```powershell
cd D:\shimond2\www\nimbus-cms

# 设置 PM2 Home（必须指向 NimbusSvc 有权限的目录）
$env:PM2_HOME = "D:\shimond2\www\nimbus-cms\.pm2"
# 确保目录存在且权限正确
New-Item -ItemType Directory -Path $env:PM2_HOME -Force

# 启动
pm2 start ecosystem.config.js

# 保存进程列表（用于开机自启恢复）
pm2 save

# 验证
pm2 status
pm2 logs --lines 20

# 本地测试（应返回 HTML）
curl http://127.0.0.1:3001
```

### 5.4 配置 Windows 开机自启（计划任务方案）

PM2 在 Windows 上需通过计划任务实现守护，**严禁使用 LocalSystem 账户**。

```powershell
# 创建启动脚本 E:\www\nimbus-cms\pm2-startup.bat
@"
@echo off
set PM2_HOME=E:\www\nimbus-cms\.pm2
set PATH=%PATH%;C:\Program Files\nodejs
cd /d E:\www\nimbus-cms
pm2 resurrect
"@ | Out-File -Encoding ASCII "E:\www\nimbus-cms\pm2-startup.bat"

# 创建计划任务（以 NimbusSvc 运行）
$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c E:\www\nimbus-cms\pm2-startup.bat"
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "NimbusSvc" -LogonType Password -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 5)

Register-ScheduledTask -TaskName "NimbusCMS-PM2-AutoStart" -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force
```

> 创建后需输入 `NimbusSvc` 的密码完成注册。

### 5.5 PM2 日常管理命令

```powershell
# 查看状态
pm2 status

# 重启
pm2 restart nimbus-cms

# 重载（零停机，fork 模式下等同于 restart）
pm2 reload nimbus-cms

# 停止
pm2 stop nimbus-cms

# 查看日志（实时）
pm2 logs nimbus-cms --lines 100

# 监控资源占用
pm2 monit
```

---

## 六、IIS 反向代理与 SSL

### 6.1 安装必要 IIS 模块

确保已安装（与现有系统共用 IIS 时不影响）：
- **URL Rewrite Module 2**：https://www.iis.net/downloads/microsoft/url-rewrite
- **Application Request Routing (ARR) 3.1**：https://www.iis.net/downloads/microsoft/application-request-routing

安装后重启 IIS：
```powershell
iisreset /restart
```

### 6.2 配置 ARR（仅代理到本地，不启用缓存）

1. IIS 管理器 → **服务器节点** → **Application Request Routing Cache**
2. 右侧面板点击 **Server Proxy Settings**
3. 勾选 ✅ **Enable proxy**（若未启用）
4. ✅ **Enable WebSocket protocol**（Next.js 热重载/实时功能需要）
5. **取消勾选** "Enable disk cache"（避免与现有系统缓存冲突）
6. 点击 **Apply**

### 6.3 创建 IIS 站点（完全隔离）

1. IIS 管理器 → 右键"网站" → "添加网站"
   - **站点名称**：`NimbusCMS`
   - **物理路径**：`E:\www\nimbus-cms\public`（用于放置 web.config 和静态文件）
   - **绑定**：
     - 类型：`https`
     - 端口：`443`
     - 主机名：`nimbus.yourdomain.com`
     - SSL 证书：后续配置
   - **应用程序池**：新建独立池 `NimbusCMS-AppPool`，.NET CLR 版本选 **无托管代码**，托管管道模式选 **集成**

2. 配置应用程序池标识（避免使用默认 ApplicationPoolIdentity 造成权限混乱）：
   - 高级设置 → 标识 → 自定义账户 → `NimbusSvc`（输入密码）
   - 或保持 `ApplicationPoolIdentity`，但需额外授予其对 `E:\www\nimbus-cms\public` 的读取权限

### 6.4 配置 web.config（完整、语法正确的 XML）

在 `E:\www\nimbus-cms\public\web.config` 创建以下内容。**已修正所有 XML 结构错误**：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>

    <!-- ============================
         Admin 后台 IP 白名单（规则1）
         放在最前，优先执行
         ============================ -->
    <security>
      <ipSecurity allowUnlisted="false">
        <!-- 允许公司内网/办公室出口 IP（示例：10.x.x.x） -->
        <!--<add ipAddress="10.0.0.0" subnetMask="255.0.0.0" allowed="true" />-->
        <!--<add ipAddress="127.0.0.1" subnetMask="255.255.255.255" allowed="true" />-->
        <!-- 如需公网特定 IP，取消下行注释并修改 -->
        <!-- <add ipAddress="203.0.113.0" subnetMask="255.255.255.0" allowed="true" /> -->
      </ipSecurity> 

      <requestFiltering removeServerHeader="true">
        <requestLimits maxAllowedContentLength="1073741824" />
        <hiddenSegments>
          <add segment=".git" />
          <add segment=".env" />
          <add segment=".env.production" />
          <add segment="node_modules" />
          <add segment="prisma" />
        </hiddenSegments>
      </requestFiltering>
    </security>

    <!-- ============================
         URL 重写规则
         ============================ -->
    <rewrite>
      <rules>

        <!-- 规则1: Admin 路径 IP 限制（配合上面 ipSecurity） -->
        <rule name="Admin-Access-Control" stopProcessing="true">
          <match url="^你的随机管理路径/.*" />
          <conditions logicalGrouping="MatchAll" trackAllCaptures="false" />
          <action type="CustomResponse" statusCode="403" statusReason="Forbidden" statusDescription="Access Denied" />
        </rule>

        <!-- 规则2: 静态资源直接转发（.next/static） -->
        <rule name="Static-Next-Assets" stopProcessing="true">
          <match url="^_next/static/(.*)" />
          <action type="Rewrite" url="http://127.0.0.1:3001/_next/static/{R:1}" />
        </rule>

        <!-- 规则3: Public 目录静态文件 -->
        <rule name="Static-Public-Files" stopProcessing="true">
          <match url="^(.*\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot|webmanifest|json|txt|xml))(.*)?$" />
          <conditions logicalGrouping="MatchAll" trackAllCaptures="false">
            <add input="{REQUEST_URI}" pattern="^/_next/" negate="true" />
          </conditions>
          <action type="Rewrite" url="http://127.0.0.1:3001/{R:0}" />
        </rule>

        <!-- 规则4: API 请求转发 -->
        <rule name="API-Routes" stopProcessing="true">
          <match url="^api/(.*)" />
          <action type="Rewrite" url="http://127.0.0.1:3001/api/{R:1}" />
        </rule>

        <!-- 规则5: Next.js 前端路由 (Catch-All) -->
        <rule name="NextJS-SPA-Routes" stopProcessing="true">
          <match url="(.*)" />
          <conditions logicalGrouping="MatchAll" trackAllCaptures="false">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="http://127.0.0.1:3001/{R:1}" />
        </rule>

      </rules>

      <!-- ============================
           出站规则（修正响应头）
           ============================ -->
      <outboundRules>
        <!-- 正确定义前置条件（修正原文致命错误） -->
        <preConditions>
          <preCondition name="IsRedirection">
            <add input="{RESPONSE_STATUS}" pattern="^3\d\d" />
          </preCondition>
        </preConditions>

        <!-- 修正 301/302 跳转中的 Location 头（将内网地址替换为公网域名） -->
        <rule name="Fix-Location-Header" preCondition="IsRedirection">
          <match serverVariable="RESPONSE_LOCATION" pattern="^http://127\.0\.0\.1:3001/(.*)" />
          <action type="Rewrite" value="https://nimbus.yourdomain.com/{R:1}" />
        </rule>

      </outboundRules>
    </rewrite>

    <!-- ============================
         HTTP 安全响应头
         ============================ -->
    <httpProtocol>
      <customHeaders>
        <add name="X-Frame-Options" value="SAMEORIGIN" />
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="Referrer-Policy" value="strict-origin-when-cross-origin" />
        <add name="Permissions-Policy" value="camera=(), microphone=(), geolocation=()" />
        <!-- 确认 HTTPS 正常运行一周后再启用 HSTS -->
        <!-- <add name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains; preload" /> -->
      </customHeaders>
      <removeServerHeader />
      <remove name="X-Powered-By" />
    </httpProtocol>

    <!-- ============================
         静态文件缓存
         ============================ -->
    <staticContent>
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="30.00:00:00" />
    </staticContent>

  </system.webServer>

  <location path="xK9m2pQ7">  <!-- 替换为实际的 NEXT_PUBLIC_ADMIN_PATH -->
    <system.webServer>
      <security>
        <ipSecurity allowUnlisted="false">
          <add ipAddress="10.0.0.0" subnetMask="255.0.0.0" allowed="true" />
          <add ipAddress="127.0.0.1" subnetMask="255.255.255.255" allowed="true" />
        </ipSecurity>
      </security>
    </system.webServer>
  </location>

</configuration>
```

> ⚠️ **必做替换**：
> 1. 将 `nimbus.yourdomain.com` 替换为实际域名
> 2. 将 `你的随机管理路径` 替换为实际的 `NEXT_PUBLIC_ADMIN_PATH` 值（如 `/xK9m2pQ7`）
> 3. 根据实际网络环境修改 `<ipSecurity>` 中的允许 IP 段

### 6.5 SSL 证书（推荐 DNS 验证，避免 80 端口冲突）

如果现有系统已占用 80 端口，**使用 DNS 验证**申请 Let's Encrypt 证书，避免端口冲突。

```powershell
# 1. 下载 win-acme: https://www.win-acme.com/
# 2. 以管理员运行
cd C:\tools\wacs
.\wacs.exe

# 按提示操作：
#   - M: Create certificate (full options)
#   - 输入域名: nimbus.yourdomain.com
#   - 验证方式: DNS validation（选择你的 DNS 提供商，如阿里云/Cloudflare API）
#   - 选择存储: Windows Certificate Store (WebHosting)
#   - 安装目标: IIS 站点 (NimbusCMS)

# 3. 检查自动续期任务（默认每 60 天）
schtasks /query /tn "\wacs-renew-*"
```

> 若无法使用 DNS 验证且现有系统也是 IIS：可在现有站点临时添加 URL Rewrite 规则，将 `/.well-known/acme-challenge/*` 反向代理到 win-acme 的验证端口，实现共用 80 端口。

---

## 七、防火墙与网络隔离

```powershell
# 1. 仅开放 HTTPS（对外服务）
New-NetFirewallRule -DisplayName "NimbusCMS-HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow -Profile Any

# 2. 明确拒绝 Next.js、DB、Redis 端口的外部访问（即使配置错误绑定到 0.0.0.0，也有兜底）
New-NetFirewallRule -DisplayName "NimbusCMS-Block-3001" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Block -Profile Any
New-NetFirewallRule -DisplayName "NimbusCMS-Block-5433" -Direction Inbound -Protocol TCP -LocalPort 5433 -Action Block -Profile Any
New-NetFirewallRule -DisplayName "NimbusCMS-Block-6380" -Direction Inbound -Protocol TCP -LocalPort 6380 -Action Block -Profile Any

# 3. （可选）如果现有系统与 NimbusCMS 需内部通信，按需添加特定 IP 的白名单规则
```

---

## 八、日常运维

### 8.1 启动 / 停止 / 重启

```powershell
# 停止应用（不影响 IIS 本身，但站点会 502）
pm2 stop nimbus-cms

# 启动
pm2 start ecosystem.config.js

# 重启
pm2 restart nimbus-cms

# 同时重启 IIS（SSL 配置变更后）
iisreset /restart
```

### 8.2 查看日志

```powershell
# PM2 实时日志
pm2 logs nimbus-cms --lines 100

# 查看 PM2 自身日志
Get-Content "E:\www\nimbus-cms\logs\pm2-err.log" -Tail 50 -Wait

# IIS 日志（默认在 %SystemDrive%\inetpub\logs\LogFiles\W3SVCx\）
```

### 8.3 代码更新流程（最小影响）

```powershell
cd E:\www\nimbus-cms

# 1. 拉取/复制新代码

# 2. 停止应用（用户会短暂看到 502，建议维护窗口操作）
pm2 stop nimbus-cms

# 3. 安装依赖（如有 package.json 变更）
npm ci

# 4. 重新构建
npm run build

# 5. 数据库迁移（如有 schema 变更）
npx prisma migrate deploy

# 6. 启动
pm2 start ecosystem.config.js
pm2 save

# 7. 验证
curl https://nimbus.yourdomain.com/api/health  # 假设有健康检查端点
```

### 8.4 数据库备份与恢复（安全流程）

**备份（UTF-8 编码，无 BOM 问题）**：
```powershell
$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$backupFile = "E:\backup\nimbus\nimbus_cms_${timestamp}.sql"
$env:PGPASSWORD = "应用专用强密码"

# 使用 -f 参数直接输出到文件，避免 Out-File 的 UTF-16 问题
& "E:\PostgreSQL\14\bin\pg_dump.exe" -h 127.0.0.1 -p 5433 -U nimbus_app -d nimbus_cms --encoding=UTF8 -f $backupFile

# 验证
if ((Get-Item $backupFile).Length -eq 0) {
    Write-Error "备份失败，文件为空！"
} else {
    Write-Host "备份成功: $backupFile"
}
```

**恢复（先验证，再切换，避免直接覆盖）**：
```powershell
# 1. 先备份当前数据库（见上方）
# 2. 创建临时库进行恢复验证
$env:PGPASSWORD = "超级用户密码"
& "E:\PostgreSQL\14\bin\psql.exe" -U postgres -p 5433 -c "CREATE DATABASE nimbus_cms_verify WITH OWNER nimbus_app;"
& "E:\PostgreSQL\14\bin\psql.exe" -U nimbus_app -p 5433 -d nimbus_cms_verify -f $backupFile

# 3. 验证数据完整性（检查表数量、关键记录）
$tables = & "E:\PostgreSQL\14\bin\psql.exe" -U nimbus_app -p 5433 -d nimbus_cms_verify -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';"
Write-Host "验证库表数量: $tables"

# 4. 确认无误后，进入维护窗口执行切换：
#    - 停止应用: pm2 stop nimbus-cms
#    - 重命名旧库: ALTER DATABASE nimbus_cms RENAME TO nimbus_cms_backup;
#    - 重命名验证库: ALTER DATABASE nimbus_cms_verify RENAME TO nimbus_cms;
#    - 启动应用: pm2 start ecosystem.config.js
```

### 8.5 SSL 续期

win-acme 默认创建计划任务自动续期。若使用 DNS 验证，确保 API 密钥未过期。

```powershell
# 手动触发测试续期
cd C:\tools\wacs
.\wacs.exe --renew --baseuri https://acme-v02.api.letsencrypt.org/

# 续期后 IIS 自动重新绑定（如未生效，手动重启 IIS）
iisreset /restart
```

---

## 九、部署检查清单

| # | 检查项 | 验证命令/操作 | 预期结果 |
|---|-------|-------------|---------|
| 1 | 端口无冲突 | `netstat -ano | findstr ":3001\|:5433\|:6380"` | 无 LISTENING（部署前） |
| 2 | 账户权限正确 | `icacls E:\www\nimbus-cms` | 仅 `NimbusSvc` 和 `Administrators` |
| 3 | 敏感文件权限 | `icacls .env.production` | 无 `Everyone`/`Users` 读取权 |
| 4 | PM2 运行中 | `pm2 status` | `nimbus-cms` 状态 `online` |
| 5 | 本地绑定验证 | `netstat -ano | findstr "127.0.0.1:3001"` | 显示为 `127.0.0.1:3001`（非 `0.0.0.0`） |
| 6 | 应用响应 | `curl http://127.0.0.1:3001` | 返回 HTML |
| 7 | API 可用 | `curl http://127.0.0.1:3001/api/site/public` | 返回 JSON |
| 8 | IIS 反向代理 | 浏览器访问 `https://nimbus.yourdomain.com` | 显示页面，无混合内容警告 |
| 9 | Admin IP 白名单 | 从非白名单 IP 访问 `.../admin-path/...` | 返回 403 Forbidden |
| 10 | 外网端口封闭 | 从外部扫描服务器 3001/5433/6380 | 连接超时或被拒 |
| 11 | Cookie 安全 | F12 → Application → Cookies | `Secure` 标记存在，`SameSite` 未被恶意覆盖 |
| 12 | 数据库连接 | `psql -U nimbus_app -p 5433 -d nimbus_cms -c "SELECT 1;"` | 成功 |
| 13 | Redis 连接 | `redis-cli -p 6380 -a 密码 ping` | `PONG` |
| 14 | 响应头安全 | `curl -I https://nimbus.yourdomain.com` | 无 `X-Powered-By`，无 `Server` 头 |
| 15 | 密钥非默认 | 检查 `.env.production` 中 `NEXTAUTH_SECRET` | 非空且非默认值 |
| 16 | 日志无异常 | `pm2 logs --lines 20` | 无 `Error` / 堆栈信息 |
| 17 | 默认密码已修改 | 登录后台 → 系统设置 → 管理员管理 | 管理员密码已改为强密码，非默认 `admin123` |

---

## 十、故障排查

### 10.1 PM2 进程启动失败或频繁重启

```powershell
# 查看 PM2 错误日志
pm2 logs nimbus-cms --lines 100

# 常见原因：
# 1. Prisma 查询引擎缺失：检查 .next/standalone/node_modules/.prisma/client/
# 2. 环境变量未加载：确认 .env.production 路径正确且权限可读
# 3. 端口被占用：netstat -ano | findstr :3001
```

### 10.2 IIS 返回 502.3 / 503

```powershell
# 检查 Next.js 是否监听
curl http://127.0.0.1:3001

# 检查 ARR 是否启用代理
# IIS 管理器 → 服务器 → ARR → Server Proxy Settings → Enable proxy

# 检查 web.config XML 语法（若有修改）
# 使用浏览器访问时，查看 C:\inetpub\logs\LogFiles\ 中的子状态码
```

### 10.3 HTTPS / Cookie / 登录异常

- `NEXTAUTH_URL` 必须与浏览器地址栏域名**完全一致**（包括 `https://`）
- 检查 IIS 出站规则 `Fix-Location-Header` 是否生效
- 浏览器隐身模式测试，排除插件拦截

### 10.4 数据库连接失败

```powershell
# 测试连接
$env:PGPASSWORD = "密码"
& "E:\PostgreSQL\14\bin\psql.exe" -U nimbus_app -p 5433 -d nimbus_cms -c "SELECT 1;"

# 检查 PG 服务名和端口（确认不是默认实例 5432）
Get-Service postgresql-nimbus
```

---

## 十一、资源占用参考（与现有系统共存）

| 组件 | 内存占用 | 说明 |
|------|---------|------|
| Windows Server 2016 基础 | ~1.5 GB | 现有系统已占用 |
| IIS (新站点 + ARR) | +50~100 MB | 极低 |
| Next.js (Standalone) | +200~400 MB | PM2 限制 512MB，超出自动重启 |
| PostgreSQL 14 | +300~800 MB | 独立实例，可配置 shared_buffers 限制 |
| Redis 3.x | +50~100 MB | 已限制 maxmemory 256MB |
| **NimbusCMS 合计增量** | **约 1~2 GB** | 建议服务器空闲内存 ≥ 2GB 再部署 |

> 若服务器内存紧张，可在 `E:\PostgreSQL\14\data\postgresql.conf` 中降低：
> - `shared_buffers = 256MB`（默认通常为 128MB 或 256MB，勿超过总内存 25%）

---

> **文档版本**: v2.0  
> **最后更新**: 2026-05-19  
> **关键变更**: 
> - 降级 PostgreSQL 15→14（兼容 Server 2016）
> - 修正 Redis 7→3.x Windows 原生版（消除虚构组件）
> - 升级 Node.js 18→20 LTS（消除 EOL 风险）
> - 修正 web.config XML 结构错误（preConditions 定义、悬挂 conditions 标签）
> - 引入专用服务账户 NimbusSvc（消除 LocalSystem 权限过高问题）
> - 引入 IP 白名单 + 端口隔离 + 资源限制（确保与现有系统零冲突）
