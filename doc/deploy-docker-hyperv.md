# Nimbus Site CMS — Docker + Hyper-V 部署方案

> 适用环境：Windows Server 2016 + Docker Engine CE (Hyper-V 隔离模式)
> 部署方式：独立域名 + HTTPS + IIS 反向代理
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
                    ┌──────▼──────┐
                    │  Docker      │
                    │  ┌────────┐ │
                    │  │Next.js  │ │  ← standalone 模式
                    │  │App      │ │
                    │  └────────┘ │
                    │  ┌────────┐ │
                    │  │PostgreSQL│ │ ← 容器内
                    │  │  15     │ │
                    │  └────────┘ │
                    │  ┌────────┐ │
                    │  │ Redis  │ │
                    │  │   7    │ │
                    │  └────────┘ │
                    └─────────────┘
                           │
                    ┌──────▼──────┐
                    │  宿主机磁盘   │ ← 数据持久化卷
                    └─────────────┘
```

---

## 二、环境准备

### 2.1 硬件与系统要求

| 项目 | 最低要求 | 推荐配置 |
|---|---|---|
| CPU | 2 核 | 4 核+ |
| 内存 | 6 GB | 8~16 GB |
| 磁盘 | 20 GB SSD | 50 GB+ SSD |
| 操作系统 | Windows Server 2016 (≥ 14393) | Windows Server 2016/2019 |

### 2.2 启用 Hyper-V 和容器功能

以**管理员身份**打开 PowerShell，依次执行：

```powershell
# 启用 Hyper-V
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All

# 启用容器功能
Enable-WindowsOptionalFeature -Online -FeatureName Containers -All

# 重启服务器
Restart-Computer -Force
```

### 2.3 安装 Docker Engine（社区版）

Windows Server 2016 **不支持 Docker Desktop**，需要使用 Docker Engine CE（社区版）：

```powershell
# 1. 安装 Docker 的 PowerShell 模块（OneGet 提供程序）
Install-Module -Name DockerMsftProvider -Force -AllowClobber

# 2. 通过 OneGet 安装 Docker Engine
Install-Package -Name Docker -ProviderName DockerMsftProvider -Force

# 3. 启动 Docker 服务
Start-Service Docker

# 4. 设置 Docker 开机自启
Set-Service -Name Docker -StartupType 'Automatic'

# 5. 验证安装
docker --version
docker-compose --version
```

> **注意**：如果安装过程中提示 NuGet 提供程序，先执行 `Install-PackageProvider -Name NuGet -Force`。

### 2.4 Docker 配置（Hyper-V 隔离 + 内存限制）

Windows Server 2016 上运行 Linux 容器需要使用 Hyper-V 隔离模式。创建或编辑 Docker daemon 配置文件：

```powershell
# 创建配置目录（如不存在）
if (!(Test-Path C:\ProgramData\Docker\config)) {
  New-Item -ItemType Directory -Path C:\ProgramData\Docker\config
}
```

编辑 `C:\ProgramData\Docker\config\daemon.json`：

```json
{
  "storage-driver": "windowsfilter",
  "exec-opts": ["isolation=hyperv"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

**关键配置说明**：

| 配置项 | 说明 |
|---|---|
| `isolation=hyperv` | 必须设置，使 Linux 容器在 Hyper-V 隔离模式下运行 |
| `log-driver / log-opts` | 日志轮转，防止日志撑爆磁盘 |

保存后重启 Docker：

```powershell
Restart-Service Docker
```

---

## 三、DNS 与 SSL 证书

### 3.1 DNS 解析

在域名管理面板添加 A 记录：

| 记录类型 | 主机记录 | 记录值 | TTL |
|---|---|---|---|
| A | nimbus | 你的服务器公网 IP | 自动 |

例如：`nimbus.yourdomain.com → 123.45.67.89`

### 3.2 申请 Let's Encrypt 免费 SSL 证书

在 Windows Server 上使用 **win-acme** 工具：

```powershell
# 1. 下载 win-acme（https://www.win-acme.com/）
# 解压到 C:\tools\wacs

# 2. 以管理员身份运行，申请证书
cd C:\tools\wacs
.\wacs.exe

# 按照提示选择：
#   - 证书类型: Single Certificate
#   - 域名: nimbus.yourdomain.com
#   - 验证方式: 自托管 (self-hosting)
#   - 存储位置: Windows Certificate Store
#   - 安装到: IIS (会自动绑定)

# 3. 自动续期（win-acme 默认已创建计划任务）
# 检查任务计划中是否存在 "wacs-renew" 任务
schtasks /query /tn "\wacs-renew"
```

### 3.3 证书文件导出（可选，供 Docker 使用）

如果需要在 Docker 容器内使用证书：

```powershell
# 导出 PFX 证书
$cert = Get-ChildItem -Path Cert:\LocalMachine\My | Where-Object { $_.Subject -like "*nimbus*" }
Export-PfxCertificate -Cert $cert -FilePath "C:\certs\nimbus.pfx" -Password (ConvertTo-SecureString -String "你的密码" -Force -AsPlainText)
```

---

## 四、项目配置

### 4.1 复制并配置 `.env` 文件

```powershell
cd E:\deploy\nimbus-cms
copy .env.example .env
```

编辑 `.env`：

```env
# ========== 数据库 ==========
DATABASE_URL="postgresql://postgres:你的强密码@postgres:5432/nimbus_cms?schema=public&connect_timeout=30"

# ========== Next.js ==========
NEXTAUTH_URL=https://nimbus.yourdomain.com
NEXTAUTH_SECRET=生成长随机密钥: openssl rand -base64 32
NEXT_PUBLIC_ADMIN_PATH=/你的随机管理路径

# ========== Redis ==========
REDIS_URL=redis://redis:6379

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

# ========== Unsplash API ==========
UNSPLASH_ACCESS_KEY=
```

> ⚠️ **重要安全项**：
> - `NEXTAUTH_SECRET` 必须为强随机值
> - `NEXT_PUBLIC_ADMIN_PATH` 不要用默认 `/admin`
> - 数据库密码不要使用默认 `postgres`

### 4.2 修改 `docker-compose.prod.yml`

如果需要启用内存限制和重启策略，修改后的完整文件：

```yaml
version: '3.8'

services:
  # PostgreSQL 数据库
  postgres:
    image: postgres:15-alpine
    container_name: nimbus-postgres-prod
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme}
      POSTGRES_DB: ${DB_NAME:-nimbus_cms}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    networks:
      - nimbus-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
    # 优化 PostgreSQL 性能参数
    command: >
      postgres
      -c shared_buffers=512MB
      -c effective_cache_size=1536MB
      -c work_mem=16MB
      -c maintenance_work_mem=128MB
      -c max_connections=60
      -c random_page_cost=1.1

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: nimbus-redis-prod
    restart: unless-stopped
    command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru --appendonly yes
    volumes:
      - redis_prod_data:/data
    networks:
      - nimbus-network
    deploy:
      resources:
        limits:
          memory: 512m
        reservations:
          memory: 128m

  # Next.js 应用
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nimbus-app-prod
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"  # 仅本机可访问，通过 IIS 反向代理暴露
    environment:
      - DATABASE_URL=postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-changeme}@postgres:5432/${DB_NAME:-nimbus_cms}
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NODE_ENV=production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - nimbus-network
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512m

volumes:
  postgres_prod_data:
  redis_prod_data:

networks:
  nimbus-network:
    driver: bridge
```

---

## 五、首次部署流程

### 5.1 拉取代码与构建

```powershell
# 1. 将项目代码复制到服务器（或从 Git 克隆）
cd E:\deploy\nimbus-cms

# 2. 配置 .env 文件（见第四步）

# 3. 构建并启动所有容器
docker-compose -f docker-compose.prod.yml up -d --build

# 4. 查看容器状态
docker-compose -f docker-compose.prod.yml ps
```

### 5.2 数据库初始化

```powershell
# 执行数据库迁移
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# 生成 Prisma Client
docker-compose -f docker-compose.prod.yml exec app npx prisma generate

# 导入种子数据（首次部署）
docker-compose -f docker-compose.prod.yml exec app npx tsx prisma/seed.ts
```

### 5.3 验证应用运行

```powershell
# 查看应用日志
docker-compose -f docker-compose.prod.yml logs -f app

# 测试本地访问
curl http://127.0.0.1:3000

# 测试 API
curl http://127.0.0.1:3000/api/site/public
```

---

## 六、IIS 反向代理配置

### 6.1 安装必要模块

确认已安装以下 IIS 模块（如果没有，从微软官网下载）：
- **URL Rewrite Module 2**
- **Application Request Routing (ARR) 3.1**

### 6.2 创建 IIS 站点

1. **IIS 管理器** → 右键"网站" → "添加网站"
2. 填写：
   - 站点名称：`NimbusCMS`
   - 物理路径：`E:\deploy\nimbus-cms\public`（或任意空目录）
   - 绑定类型：`https`，端口 `443`，主机名 `nimbus.yourdomain.com`
   - SSL 证书：选择 Let's Encrypt 申请的证书

### 6.3 启用 WebSocket 代理

1. IIS 管理器 → 选择服务器节点 → **Application Request Routing Cache**
2. 点击 **Server Proxy Settings**
3. 勾选 ✅ **Enable WebSocket protocol**
4. 点击 **Apply**

### 6.4 web.config 配置

在站点根目录创建 `web.config`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>

    <!-- ==================== URL 重写 ==================== -->
    <rewrite>
      <rules>

        <!-- 规则1: API 请求 -->
        <rule name="API-Routes" stopProcessing="true">
          <match url="^api/(.*)" />
          <action type="Rewrite" url="http://127.0.0.1:3000/api/{R:1}" />
        </rule>

        <!-- 规则2: 静态资源 (_next/static, images, etc.) -->
        <rule name="Static-Assets" stopProcessing="true">
          <match url="^(.*\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map|json|txt|xml|ico|webmanifest))(.*)?$" />
          <action type="Rewrite" url="http://127.0.0.1:3000/{R:0}" />
        </rule>

        <!-- 规则3: Next.js 前端路由 (catch-all) -->
        <rule name="Frontend-Routes" stopProcessing="true">
          <match url="(.*)" />
          <conditions logicalGrouping="MatchAll" trackAllCaptures="false">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="http://127.0.0.1:3000/{R:1}" />
        </rule>

      </rules>

      <!-- ==================== 出站规则 ==================== -->
      <outboundRules>

        <!-- 修正响应中的 Location 重定向头 -->
        <rule name="FixRedirectLocation" preCondition="IsRedirection">
          <match serverVariable="RESPONSE_LOCATION" pattern="^http://127.0.0.1:3000/(.*)" />
          <action type="Rewrite" value="https://nimbus.yourdomain.com/{R:1}" />
        </rule>

        <!-- 修正 Set-Cookie，添加 SameSite=None; Secure -->
        <rule name="FixCookies" preCondition="IsHtml">
          <match serverVariable="RESPONSE_Set_Cookie" pattern="(.*)" />
          <conditions>
            <add input="{R:1}" pattern="SameSite=" negate="true" />
          </conditions>
          <action type="Rewrite" value="{R:1}; SameSite=None; Secure" />
        </rule>

      </outboundRules>

    </rewrite>

    <!-- ==================== HTTP 安全响应头 ==================== -->
    <httpProtocol>
      <customHeaders>
        <add name="X-Frame-Options" value="SAMEORIGIN" />
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-XSS-Protection" value="1; mode=block" />
        <add name="Referrer-Policy" value="strict-origin-when-cross-origin" />
        <add name="Permissions-Policy" value="camera=(), microphone=(), geolocation=()" />
        <!-- 确认 HTTPS 正常后再启用 HSTS -->
        <!-- <add name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains; preload" /> -->
      </customHeaders>
    </httpProtocol>

    <!-- ==================== 静态文件缓存 ==================== -->
    <staticContent>
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="30.00:00:00" />
    </staticContent>

    <!-- ==================== 请求大小限制 ==================== -->
    <security>
      <requestFiltering>
        <requestLimits maxAllowedContentLength="1073741824" /> <!-- 1GB -->
      </requestFiltering>
    </security>

    <!-- ==================== 日志 ==================== -->
    <httpLogging dontLog="false" />

  </system.webServer>
</configuration>
```

> ⚠️ 将所有 `nimbus.yourdomain.com` 替换为你的实际域名。

---

## 七、防火墙配置

```powershell
# 开放 HTTPS 端口（对外）
New-NetFirewallRule -DisplayName "NimbusCMS-HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow

# 确认 3000 端口只对内网开放（Docker 绑定 127.0.0.1 即可不配）
# 不建议将 3000 暴露到外网
```

---

## 八、日常运维命令

### 8.1 启动 / 停止 / 重启

```powershell
# 启动所有容器
docker-compose -f docker-compose.prod.yml up -d

# 停止所有容器
docker-compose -f docker-compose.prod.yml down

# 重启应用容器
docker-compose -f docker-compose.prod.yml restart app

# 重启单个容器
docker restart nimbus-app-prod
```

### 8.2 查看日志与监控

```powershell
# 实时查看所有容器日志
docker-compose -f docker-compose.prod.yml logs -f

# 查看单个容器日志
docker-compose -f docker-compose.prod.yml logs -f app

# 查看实时资源使用
docker stats --no-stream

# 查看容器内部运行状态
docker exec -it nimbus-app-prod sh
```

### 8.3 代码更新

```powershell
# 1. 拉取/复制新代码到服务器

# 2. 重建并重启
docker-compose -f docker-compose.prod.yml up -d --build

# 3. 执行数据库迁移（如有 schema 变更）
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# 4. 验证
curl https://nimbus.yourdomain.com/api/site/public
```

### 8.4 数据库备份与恢复

```powershell
# ====== 备份 ======
docker exec nimbus-postgres-prod pg_dump -U postgres nimbus_cms > E:\backup\nimbus_cms_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql

# ====== 恢复 ======
# 先停止应用容器
docker-compose -f docker-compose.prod.yml stop app

# 清空并重建数据库（谨慎操作！）
docker exec -it nimbus-postgres-prod psql -U postgres nimbus_cms -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
docker exec -i nimbus-postgres-prod psql -U postgres nimbus_cms < E:\backup\nimbus_cms_20260515.sql

# 重启应用
docker-compose -f docker-compose.prod.yml up -d app
```

### 8.5 SSL 证书续期

```powershell
# win-acme 自动续期（默认每 60 天运行一次计划任务）
# 手动触发续期：
cd C:\tools\wacs
.\wacs.exe --renew --baseuri https://acme-v02.api.letsencrypt.org/

# 续期后重启 IIS
iisreset /restart
```

### 8.6 服务器重启后恢复

Docker 服务已设置为开机自启，重启后自动拉起所有容器。验证：

```powershell
# 确认 Docker 服务运行
Get-Service Docker | Select-Object Name, Status, StartType

# 确认容器自动恢复
docker-compose -f docker-compose.prod.yml ps

# 如果容器未自动启动，手动拉起
docker-compose -f docker-compose.prod.yml up -d
```

---

## 九、部署检查清单

| # | 检查项 | 命令/操作 | 预期结果 |
|---|-------|----------|---------|
| 1 | Docker 服务运行中 | `Get-Service Docker` | `Status: Running` |
| 2 | 容器全部启动 | `docker ps` | app、postgres、redis 均运行 |
| 3 | 应用正常响应 | `curl 127.0.0.1:3000` | 返回 HTML |
| 4 | API 可用 | `curl 127.0.0.1:3000/api/site/public` | 返回 JSON |
| 5 | HTTPS 正常 | 浏览器访问 `https://nimbus.yourdomain.com` | 页面加载正常，🔒 锁图标 |
| 6 | 反向代理生效 | F12 → Network | 所有请求通过 443，无跨域错误 |
| 7 | Cookie 正常 | F12 → Application → Cookies | `admin-token` cookie 存在，`SameSite=None; Secure` |
| 8 | Admin 安全 | 访问 `https://nimbus.yourdomain.com/admin` | 返回 404（因为自定义了 admin 路径） |
| 9 | 数据库连接 | `docker exec nimbus-postgres-prod pg_isready` | `/tmp:5432 - accepting connections` |
| 10 | Redis 连接 | `docker exec nimbus-redis-prod redis-cli ping` | `PONG` |
| 11 | 内存使用正常 | `docker stats --no-stream` | 各容器内存使用在限制范围内 |
| 12 | NEXTAUTH_SECRET 已修改 | 检查 `.env` | 不是默认值 |

---

## 十、故障排查

### 10.1 容器启动失败

```powershell
# 查看具体错误
docker-compose -f docker-compose.prod.yml logs app
docker-compose -f docker-compose.prod.yml logs postgres
```

常见问题：
- **数据库连接失败**：检查 `.env` 中 `DATABASE_URL` 的密码和主机名
- **Prisma Client 未生成**：执行 `docker-compose exec app npx prisma generate`
- **端口冲突**：检查是否有其他服务占用了 3000 端口

### 10.2 HTTPS 访问异常

```powershell
# 检查证书绑定
netsh http show sslcert ipport=0.0.0.0:443

# 检查 IIS 站点绑定
Get-WebBinding -Name "NimbusCMS"
```

### 10.3 Cookie / 登录失败

- 检查 `NEXTAUTH_URL` 是否与浏览器地址栏域名完全一致（含 `https://`）
- 检查浏览器是否阻止第三方 Cookie
- 检查 `web.config` 中的 SameSite Cookie 修正规则是否生效

### 10.4 内存不足

```powershell
# 查看 Docker 容器实时内存使用
docker stats --no-stream

# 如果容器内存超限，调整 docker-compose.prod.yml 中的 mem_limit 值
# 例如将 PostgreSQL 从 2G 调大到 3G：
#   deploy:
#     resources:
#       limits:
#         memory: 3G

# 应用新配置
docker-compose -f docker-compose.prod.yml up -d
```

---

## 十一、部署拓扑总结

```
┌─────────────────────────────────────────────────────────────┐
│                    Windows Server 2016                        │
│                                                             │
│  ┌──────────┐   ┌──────────────────┐   ┌──────────────────┐ │
│  │   IIS     │   │   Docker Engine   │   │  其他 IIS 站点    │ │
│  │  (SSL)    │   │  (Hyper-V mode)   │   │  (已有系统)       │ │
│  │  443      │──▶│  ┌─────────────┐  │   │                  │ │
│  │           │   │  │ Moby VM     │  │   │                  │ │
│  │ web.config│   │  │             │  │   │                  │ │
│  │           │   │  │ ┌─────────┐ │  │   │                  │ │
│  │           │   │  │ │Next.js  │ │  │   │                  │ │
│  │           │   │  │ │ port:3000│ │  │   │                  │ │
│  │           │   │  │ └─────────┘ │  │   │                  │ │
│  │           │   │  │ ┌─────────┐ │  │   │                  │ │
│  │           │   │  │ │Postgres │ │  │   │                  │ │
│  │           │   │  │ │ port:5432│ │  │   │                  │ │
│  │           │   │  │ └─────────┘ │  │   │                  │ │
│  │           │   │  │ ┌─────────┐ │  │   │                  │ │
│  │           │   │  │ │ Redis   │ │  │   │                  │ │
│  │           │   │  │ │ port:6379│ │  │   │                  │ │
│  │           │   │  │ └─────────┘ │  │   │                  │ │
│  │           │   │  └─────────────┘  │   │                  │ │
│  └──────────┘   └──────────────────┘   └──────────────────┘ │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              宿主机磁盘 (数据持久化)                     │   │
│  │  postgres_prod_data  │  redis_prod_data  │  .env      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

> **文档版本**: v1.1  
> **最后更新**: 2026-05-18  
> **备注**: 本方案不修改项目任何源码文件，所有配置均为部署层面操作。