# 技术规格说明书

> 版本: 1.0  
> 日期: 2026-04-29  
> 状态: 初稿

---

## 目录

1. [技术栈概览](#1-技术栈概览)
2. [详细技术栈](#2-详细技术栈)
3. [部署架构](#3-部署架构)
4. [Hyper-V + Ubuntu 虚拟机配置](#4-hyper-v--ubuntu-虚拟机配置)
5. [IIS + ARR 反向代理集成](#5-iis--arr-反向代理集成)
6. [Docker Compose 配置](#6-docker-compose-配置)
7. [操作系统支持](#7-操作系统支持)
8. [迁移策略](#8-迁移策略)

---

## 1. 技术栈概览

本项目采用全栈 TypeScript 方案，前后端统一语言，减少上下文切换成本。核心组合如下:

```
Next.js 14 + React + Tailwind CSS    ← 前端
         │
         ▼
      tRPC                              ← 类型安全 API 层
         │
         ▼
   Prisma ORM                           ← 数据库访问
         │
         ▼
   PostgreSQL + Redis                   ← 持久化 + 缓存
         │
         ▼
      Docker                            ← 容器化部署
```

**选型理由:**

- **Next.js 14**: App Router 稳定，RSC 支持成熟，SSR/SSG 灵活切换
- **tRPC**: 端到端类型安全，无需手写 API 文档，前后端共享类型定义
- **Prisma**: 声明式 Schema，自动迁移，查询类型安全，比 TypeORM 更易上手
- **PostgreSQL**: 功能完备的关系型数据库，JSON 支持好，扩展生态丰富
- **Redis**: 会话存储、速率限制、缓存热数据，弥补 PostgreSQL 在高读场景的不足
- **Docker**: 环境一致性，部署可复现，配合 CI/CD 实现一键发布

---

## 2. 详细技术栈

### 2.1 前端层

| 技术 | 版本 | 用途 | 许可证/费用 |
|------|------|------|-------------|
| Next.js | 14.x | React 全栈框架，SSR/SSG/API Routes | MIT / 免费 |
| React | 18.x | UI 组件库 | MIT / 免费 |
| TypeScript | 5.x | 类型安全 JavaScript 超集 | Apache-2.0 / 免费 |
| Tailwind CSS | 3.x | 原子化 CSS 框架 | MIT / 免费 |
| tRPC Client | 10.x | 类型安全 API 客户端 | MIT / 免费 |
| React Query | 4.x | 服务端状态管理，缓存与同步 | MIT / 免费 |
| Zod | 3.x | 运行时类型校验 | MIT / 免费 |

### 2.2 后端/API 层

| 技术 | 版本 | 用途 | 许可证/费用 |
|------|------|------|-------------|
| tRPC Server | 10.x | 类型安全 API 服务端 | MIT / 免费 |
| Prisma | 5.x | ORM，Schema 驱动数据库迁移 | Apache-2.0 / 免费 |
| Next.js API Routes | 14.x | BFF 层，承载 tRPC Router | MIT / 免费 |
| Node.js | 20 LTS | 运行时环境 | MIT / 免费 |
| bcrypt | 5.x | 密码哈希 | MIT / 免费 |
| jsonwebtoken | 9.x | JWT 令牌签发与验证 | MIT / 免费 |

### 2.3 数据库/缓存层

| 技术 | 版本 | 用途 | 许可证/费用 |
|------|------|------|-------------|
| PostgreSQL | 16.x | 主数据库，业务数据持久化 | PostgreSQL License / 免费 |
| Redis | 7.x | 会话存储、速率限制、查询缓存 | BSD-3 / 免费 (社区版) |

### 2.4 基础设施层

| 技术 | 版本 | 用途 | 许可证/费用 |
|------|------|------|-------------|
| Docker | 24.x | 容器化运行环境 | Apache-2.0 / 免费 (社区版) |
| Docker Compose | 2.x | 多容器编排 | Apache-2.0 / 免费 |
| Nginx | 1.25.x | 容器内反向代理，静态资源托管 | BSD-2 / 免费 |
| IIS | 10.x | Windows 端反向代理，SSL 终止 | Windows Server 许可证 |
| ARR | 3.0 | IIS 应用请求路由 | 免费 (Web Platform Installer) |
| Hyper-V | Server 2016+ | 虚拟化平台 | Windows Server 许可证 |
| Ubuntu Server | 22.04 LTS | 虚拟机操作系统 | 免费 |

---

## 3. 部署架构

### 3.1 整体拓扑

```
+-----------------------------------------------------------------+
|                    Windows Server 2016                           |
|                                                                 |
|  +--------------+         +----------------------------------+  |
|  |    IIS 10    |         |        Hyper-V 虚拟机             |  |
|  |              |         |   +----------------------------+  |  |
|  |  +--------+  |         |   |    Ubuntu 22.04 LTS        |  |  |
|  |  |  ARR   |  |  :80/   |   |                            |  |  |
|  |  | 反向代理|----------->|   |  +----------------------+  |  |  |
|  |  +--------+  | 443     |   |  |  Docker Compose      |  |  |  |
|  |              | (Int.   |   |  |                      |  |  |  |
|  |  站点 A      | Switch) |   |  |  +----------------+ |  |  |  |
|  |  站点 B      |         |   |  |  |   Nginx        | |  |  |  |
|  |  (共存)      |         |   |  |  |   :80/:443     | |  |  |  |
|  +--------------+         |   |  |  +-------+--------+ |  |  |  |
|                           |   |  |          |          |  |  |  |
|                           |   |  |  +-------v--------+ |  |  |  |
|                           |   |  |  |  Next.js       | |  |  |  |
|                           |   |  |  |  :3000         | |  |  |  |
|                           |   |  |  +----------------+ |  |  |  |
|                           |   |  |                      |  |  |  |
|                           |   |  |  +----------------+ |  |  |  |
|                           |   |  |  |  PostgreSQL    | |  |  |  |
|                           |   |  |  |  :5432         | |  |  |  |
|                           |   |  |  +----------------+ |  |  |  |
|                           |   |  |                      |  |  |  |
|                           |   |  |  +----------------+ |  |  |  |
|                           |   |  |  |  Redis         | |  |  |  |
|                           |   |  |  |  :6379         | |  |  |  |
|                           |   |  |  +----------------+ |  |  |  |
|                           |   |  +----------------------+  |  |  |
|                           |   +----------------------------+  |  |
|                           +----------------------------------+  |
|                                                                 |
|  物理网卡: 192.168.1.100 (外网)                                  |
|  Internal Switch: 172.16.0.1 (NAT 网关)                         |
|  VM IP: 172.16.0.2                                              |
+-----------------------------------------------------------------+
```

### 3.2 请求流转

```
用户浏览器
    |
    v HTTPS :443
  IIS (SSL 终止)
    |
    v HTTP :80 (ARR 转发)
  172.16.0.2:80
    |
    v
  Nginx (容器内)
    |
    +---> /api/*  -->  Next.js API Routes (tRPC)
    |
    +---> /*      -->  Next.js SSR/SSG 页面
```

### 3.3 数据流

```
Next.js ---> tRPC ---> Prisma ---> PostgreSQL
   |
   +---> Redis (会话 / 缓存 / 限流)
```

---

## 4. Hyper-V + Ubuntu 虚拟机配置

### 4.1 为什么用 Hyper-V + Ubuntu VM

| 方案 | 优点 | 缺点 |
|------|------|------|
| **Docker Desktop (Windows)** | 安装简单 | 占用内存大，WSL2 资源开销高，许可证条款变更 |
| **WSL2 直接运行** | 轻量 | 生产环境不适用，systemd 支持有限 |
| **Hyper-V + Ubuntu VM** | 接近生产环境，资源可控，网络隔离清晰 | 初次配置稍复杂 |

选择 Hyper-V + Ubuntu VM 的核心原因:

1. **环境一致性**: Ubuntu 22.04 与主流云服务器 (AWS EC2, 阿里云 ECS) 一致，部署无差异
2. **资源可控**: 内存、CPU、磁盘精确分配，避免 Docker Desktop 的资源黑洞
3. **网络隔离**: Internal Switch + NAT，VM 拥有独立网段，安全可控
4. **systemd 完整支持**: Docker 服务、开机自启、日志管理全部正常
5. **无许可证风险**: Docker Desktop 对企业使用有许可限制，Linux VM 中直接运行 Docker Engine 无此问题

### 4.2 网络配置: Internal Switch + NAT

Hyper-V 提供三种虚拟交换机类型，我们选择 Internal Switch + 手动 NAT:

```
Default Switch       -- 自动 DHCP，IP 每次重启可能变化，不稳定
External Switch      -- 直接桥接物理网卡，VM 暴露在外网，不安全
Internal Switch + NAT -- 固定 IP，宿主机可控转发 (推荐)
```

**配置步骤 (PowerShell，以管理员身份运行):**

#### 步骤 1: 创建 Internal Switch

```powershell
New-VMSwitch -Name "InternalSwitch" -SwitchType Internal
```

#### 步骤 2: 为宿主机虚拟网卡分配 IP

```powershell
New-NetIPAddress -IPAddress 172.16.0.1 -PrefixLength 16 `
    -InterfaceAlias "vEthernet (InternalSwitch)"
```

#### 步骤 3: 启用 NAT

```powershell
New-NetNat -Name "VMNat" -InternalIPInterfaceAddressPrefix 172.16.0.0/16
```

#### 步骤 4: 创建虚拟机

```powershell
New-VM -Name "Ubuntu-Docker" -MemoryStartupBytes 4GB `
    -Generation 2 -NewVHDPath "D:\Hyper-V\Ubuntu-Docker\Disk.vhdx" `
    -NewVHDSizeBytes 80GB -SwitchName "InternalSwitch"
```

#### 步骤 5: 配置 VM 固定 IP (Ubuntu 内)

```yaml
# /etc/netplan/01-netcfg.yaml
network:
  version: 2
  ethernets:
    eth0:
      addresses:
        - 172.16.0.2/16
      routes:
        - to: default
          via: 172.16.0.1
      nameservers:
        addresses:
          - 8.8.8.8
          - 114.114.114.114
```

```bash
sudo netplan apply
```

#### 步骤 6: 端口转发 (宿主机到 VM)

```powershell
# 将宿主机 80 端口转发到 VM
Add-NetNatStaticMapping -NatName "VMNat" -Protocol TCP `
    -ExternalIPAddress 0.0.0.0 -ExternalPort 80 `
    -InternalIPAddress 172.16.0.2 -InternalPort 80

# 将宿主机 443 端口转发到 VM
Add-NetNatStaticMapping -NatName "VMNat" -Protocol TCP `
    -ExternalIPAddress 0.0.0.0 -ExternalPort 443 `
    -InternalIPAddress 172.16.0.2 -InternalPort 443
```

> **注意**: 如果使用 IIS ARR 做反向代理，则不需要此端口转发步骤。IIS 直接通过 Internal Switch 网段访问 VM。

### 4.3 VM 基础环境安装

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo apt install docker-compose-plugin -y

# 验证
docker --version
docker compose version
```

---

## 5. IIS + ARR 反向代理集成

### 5.1 为什么用 IIS + ARR

Windows Server 上已有 IIS 运行其他站点，让 Docker 应用与现有站点共存，IIS 是最自然的入口:

- **SSL 终止在 IIS**: 证书管理集中，Windows 证书存储 + 自动续期
- **多站点共存**: 不同域名绑定不同站点，ARR 按域名转发
- **运维熟悉度高**: Windows 团队对 IIS 管理界面熟悉，排障方便
- **无需额外安装 Nginx/HAProxy**: 减少一层技术栈

### 5.2 前置条件

| 组件 | 安装方式 | 说明 |
|------|----------|------|
| IIS 10 | 服务器管理器, 添加角色 | 已默认安装 |
| ARR 3.0 | Web Platform Installer | 应用请求路由，反向代理核心 |
| URL Rewrite 2.1 | Web Platform Installer | URL 重写规则引擎 |
| SSL 证书 | IIS 管理器, 服务器证书 | 绑定到站点 |

**安装 ARR:**

1. 打开 Web Platform Installer
2. 搜索 "Application Request Routing"
3. 点击添加, 然后安装
4. 安装完成后, 打开 IIS 管理器, 进入服务器节点, 找到 Application Request Routing Cache, 在右侧点击 Server Proxy Settings, 勾选 "Enable proxy"

### 5.3 站点配置

#### 创建站点

1. IIS 管理器, 右键 "网站", 添加网站
2. 配置:

| 字段 | 值 |
|------|-----|
| 网站名称 | DockerApp |
| 物理路径 | C:\inetpub\dockerapp (空目录即可) |
| 绑定类型 | https |
| 主机名 | app.example.com |
| 端口 | 443 |
| SSL 证书 | 选择已安装的证书 |

#### 同时添加 HTTP 绑定 (自动跳转用)

| 字段 | 值 |
|------|-----|
| 绑定类型 | http |
| 主机名 | app.example.com |
| 端口 | 80 |

### 5.4 URL Rewrite 规则

在站点根目录创建 `web.config` 文件:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <!-- 规则 1: HTTP 强制跳转 HTTPS -->
        <rule name="HTTP to HTTPS Redirect" stopProcessing="true">
          <match url="(.*)" />
          <conditions>
            <add input="{HTTPS}" pattern="^OFF$" />
          </conditions>
          <action type="Redirect" url="https://{HTTP_HOST}/{R:1}"
                  redirectType="Permanent" />
        </rule>

        <!-- 规则 2: 反向代理到 Docker VM -->
        <rule name="ReverseProxyToDocker" stopProcessing="true">
          <match url="(.*)" />
          <conditions>
            <add input="{HTTPS}" pattern="^ON$" />
          </conditions>
          <action type="Rewrite" url="http://172.16.0.2/{R:1}" />
          <serverVariables>
            <set name="HTTP_X_FORWARDED_PROTO" value="https" />
            <set name="HTTP_X_FORWARDED_FOR" value="{REMOTE_ADDR}" />
            <set name="HTTP_X_FORWARDED_HOST" value="{HTTP_HOST}" />
          </serverVariables>
        </rule>
      </rules>
    </rewrite>

    <!-- 代理相关配置 -->
    <proxy>
      <serverVariable name="HTTP_X_FORWARDED_PROTO" value="https" />
    </proxy>

    <!-- 请求限制 (ARR 默认限制内容长度 30MB, 此处放宽到 100MB) -->
    <security>
      <requestFiltering>
        <requestLimits maxAllowedContentLength="104857600" />
      </requestFiltering>
    </security>
  </system.webServer>
</configuration>
```

**关键配置说明:**

- `stopProcessing="true"`: 匹配后不再继续执行后续规则, 避免冲突
- HTTP 跳转 HTTPS: 检测到 `{HTTPS}` 为 OFF 时, 301 永久重定向到 HTTPS
- 反向代理: 当 HTTPS 请求到达时, ARR 将请求转发到 `http://172.16.0.2`, 即 Ubuntu VM 的 Nginx
- `X-Forwarded-*` 头: 让后端应用获取真实客户端 IP 和原始协议, 而不是代理服务器信息
- `maxAllowedContentLength`: 上传文件大小限制, 默认 30MB, 改为 100MB

### 5.5 SSL 终止

```
客户端 ===HTTPS===> IIS (SSL 终止) ===HTTP===> VM (Nginx)
         加密传输                    内网明文
```

- SSL 证书安装在 IIS 站点绑定中
- IIS 到 VM 之间走 Internal Switch 内网, 无需加密
- 如需端到端加密, 可在 VM 内 Nginx 也配置证书, 但通常无此必要

### 5.6 多站点共存

Windows Server 上可同时运行多个 IIS 站点, 通过主机名区分:

| 站点 | 域名 | 目标 | 处理方式 |
|------|------|------|----------|
| 站点 A | site-a.example.com | 本地 IIS | 直接处理 |
| 站点 B | site-b.example.com | 本地 IIS | 直接处理 |
| DockerApp | app.example.com | Ubuntu VM | ARR 反向代理 |

ARR 规则只在 DockerApp 站点的 `web.config` 中配置, 不影响其他站点。

---

## 6. Docker Compose 配置

### 6.1 完整 docker-compose.yml

```yaml
version: "3.8"

services:
  # ---------- Nginx 反向代理 ----------
  nginx:
    image: nginx:1.25-alpine
    container_name: nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - app-network
    mem_limit: 128m
    cpus: 0.5
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  # ---------- Next.js 应用 ----------
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://appuser:apppass@postgres:5432/appdb
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_SECRET=change-me-in-production
      - NEXTAUTH_URL=https://app.example.com
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - app-network
    mem_limit: 1024m
    cpus: 1.5
    logging:
      driver: json-file
      options:
        max-size: "20m"
        max-file: "5"

  # ---------- PostgreSQL ----------
  postgres:
    image: postgres:16-alpine
    container_name: postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=appuser
      - POSTGRES_PASSWORD=apppass
      - POSTGRES_DB=appdb
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser -d appdb"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network
    mem_limit: 1536m
    cpus: 1.0
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  # ---------- Redis ----------
  redis:
    image: redis:7-alpine
    container_name: redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --maxmemory 384mb --maxmemory-policy allkeys-lru --appendonly yes
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network
    mem_limit: 512m
    cpus: 0.5
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

networks:
  app-network:
    driver: bridge

volumes:
  postgres-data:
  redis-data:
```

### 6.2 内存分配表 (4GB VM)

VM 总内存 4GB, 需预留系统开销。以下为容器内存分配策略:

| 组件 | 内存限制 | 说明 |
|------|----------|------|
| Ubuntu 系统开销 | ~800 MB | 内核 + systemd + Docker daemon + 其他服务 |
| Nginx | 128 MB | 反向代理, 内存占用极小 |
| Next.js (app) | 1024 MB | Node.js 进程, SSR 渲染需要较多内存 |
| PostgreSQL | 1536 MB | 数据库主进程 + shared_buffers + 工作内存 |
| Redis | 512 MB | maxmemory 设为 384MB, 容器限制 512MB 留有余量 |
| **合计** | **4000 MB** | 接近 4GB 上限 |

> **关键**: Redis 的 `--maxmemory 384mb` 必须小于容器 `mem_limit: 512m`, 差值用于 Redis 的连接缓冲区和 AOF 重写缓冲区。如果 Redis 的 maxmemory 等于 mem_limit, OOM killer 会杀掉 Redis 进程。

### 6.3 VM Swap 配置

4GB 内存偏紧, 必须配置 swap 作为缓冲:

```bash
# 创建 4GB swap 文件
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 持久化配置
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 调整 swappiness (让系统更倾向使用物理内存)
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# 验证
free -h
swapon --show
```

**swappiness 参数说明:**

- `vm.swappiness=10`: 系统只在物理内存紧张时才使用 swap, 避免频繁换页导致性能下降
- 默认值 60 对数据库场景过高, 10 是服务器常用值
- 如果 VM 内存充裕 (8GB+), 可进一步降低到 1

### 6.4 Nginx 配置示例

```nginx
# ./nginx/conf.d/default.conf

upstream nextjs {
    server app:3000;
}

server {
    listen 80;
    server_name _;

    # 如果 IIS 已做 SSL 终止, 此处只监听 HTTP 即可
    # 信任 IIS 传来的 X-Forwarded-* 头
    real_ip_header X-Forwarded-For;
    real_ip_recursive on;

    location / {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;
        proxy_cache_bypass $http_upgrade;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 120s;
    }

    # 静态资源缓存 (Next.js 优化的静态文件)
    location /_next/static {
        proxy_pass http://nextjs;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 7. 操作系统支持

### 7.1 开发环境

| 组件 | 推荐方案 | 备选方案 | 说明 |
|------|----------|----------|------|
| 操作系统 | Windows 10/11 Pro | macOS, Linux | Windows 需 Pro 版才支持 Hyper-V |
| 容器运行时 | Docker Desktop | WSL2 + Docker Engine | Docker Desktop 开发体验好, 但有许可限制 |
| Node.js | 20 LTS (nvm 管理) | 20 LTS (fnm) | nvm-windows 或 fnm 均可 |
| 编辑器 | VS Code | WebStorm | VS Code + 扩展生态最完善 |
| 数据库客户端 | DBeaver / pgAdmin | DataGrip | DBeaver 免费且跨平台 |
| Redis 客户端 | RedisInsight | Another Redis Desktop Manager | RedisInsight 官方出品 |
| API 调试 | Postman | HTTPie / Bruno | Bruno 开源且支持 Git 同步 |
| 终端 | Windows Terminal | iTerm2 (macOS) | Windows Terminal 支持多标签 |

### 7.2 生产环境

| 组件 | 方案 | 版本要求 | 说明 |
|------|------|----------|------|
| 宿主机 OS | Windows Server 2016+ | 2016 Datacenter | 支持 Hyper-V 角色 |
| 虚拟机 OS | Ubuntu Server 22.04 LTS | 22.04.x | LTS 版本, 5 年支持周期 |
| 容器运行时 | Docker Engine | 24.x+ | 社区版, 免费 |
| 编排工具 | Docker Compose | 2.x+ | V2 版本, 作为 Docker 插件运行 |
| 反向代理 (Windows) | IIS 10 + ARR 3.0 | 10.0+ | SSL 终止 + 反向代理 |
| 反向代理 (容器) | Nginx | 1.25.x+ | 容器内路由分发 |
| 数据库 | PostgreSQL | 16.x+ | 容器化运行 |
| 缓存 | Redis | 7.x+ | 容器化运行 |

### 7.3 可移植性说明

本架构的分层设计使得各组件可独立替换:

| 当前方案 | 可替换为 | 难度 | 说明 |
|----------|----------|------|------|
| Windows Server + Hyper-V | 任意 Linux + KVM | 低 | Docker Compose 配置无需修改 |
| IIS + ARR | Nginx / Caddy / Traefik | 中 | 反向代理逻辑需要重新实现, 但 Next.js 侧无变化 |
| Docker Compose | Kubernetes | 高 | 需要编写 Helm Chart / K8s manifests, 但容器镜像不变 |
| PostgreSQL | 无需替换 | - | 各云厂商均提供兼容 PostgreSQL 的托管服务 |
| Redis | KeyDB / Dragonfly | 低 | API 完全兼容, 换镜像即可 |

**迁移到纯 Linux 生产环境的成本最低:** 去掉 Hyper-V 和 IIS 层, Docker Compose 配置直接复用, Nginx 直接对外服务。代码零修改。

---

## 8. 迁移策略

### 8.1 为什么不能直接"搬 Docker 容器"

常见误解: 把容器导出成镜像, 搬到新机器加载就行了。实际上不行, 原因如下:

| 问题 | 说明 |
|------|------|
| **数据库数据不随容器走** | PostgreSQL 数据存在 Docker Volume 中, `docker export` 不会包含 Volume 数据 |
| **容器状态不一致** | 运行中的容器可能有未落盘的内存数据, 导出会丢失 |
| **环境差异** | 新机器的内核版本、Docker 版本、网络配置可能不同 |
| **配置硬编码** | 如果配置写死在容器内 (而非环境变量), 迁移后会出问题 |
| **依赖关系** | 容器间依赖 (网络、Volume) 在新环境需要重新建立 |

### 8.2 推荐的代码驱动重建流程

正确做法是: 代码仓库 + 数据库备份 = 完整可复现的环境。

```
代码仓库 (Git)          数据库备份 (pg_dump)
    |                        |
    v                        v
 Dockerfile            恢复脚本
    |                        |
    v                        v
 新环境构建镜像 ---------> 新环境恢复数据
    |                        |
    +-----------+------------+
                |
                v
          应用正常运行
```

#### 步骤 1: 在旧环境导出数据库

```bash
# 在旧环境执行数据库逻辑备份
docker exec postgres pg_dump -U appuser -d appdb --format=custom > appdb_backup.dump

# 或者 SQL 文本格式 (更通用)
docker exec postgres pg_dump -U appuser -d appdb --clean --if-exists > appdb_backup.sql
```

#### 步骤 2: 迁移代码仓库

```bash
# 在新环境克隆代码
git clone <repository-url> /opt/app
cd /opt/app

# 切换到目标分支/标签
git checkout v1.0.0
```

#### 步骤 3: 传输数据库备份

```bash
# 使用 scp 传输备份文件
scp appdb_backup.sql user@new-server:/opt/app/backup/

# 或使用 rsync (大文件更可靠)
rsync -avz appdb_backup.sql user@new-server:/opt/app/backup/
```

#### 步骤 4: 在新环境构建并启动

```bash
# 构建镜像并启动服务
docker compose up -d --build

# 等待 PostgreSQL 就绪
docker compose exec postgres pg_isready -U appuser

# 恢复数据库 (SQL 文本格式)
cat /opt/app/backup/appdb_backup.sql | docker compose exec -T postgres psql -U appuser -d appdb

# 或恢复自定义格式 (推荐, 更快)
docker compose exec -T postgres pg_restore -U appuser -d appdb < /opt/app/backup/appdb_backup.dump
```

#### 步骤 5: 运行 Prisma 迁移 (确保 Schema 同步)

```bash
# 如果数据库备份的 Schema 版本与代码不完全一致
docker compose exec app npx prisma migrate deploy

# 验证迁移状态
docker compose exec app npx prisma migrate status
```

#### 步骤 6: 验证迁移结果

```bash
# 检查所有容器状态
docker compose ps

# 检查应用健康
curl -f http://localhost:3000/api/health || echo "Health check failed"

# 检查数据库连接
docker compose exec postgres psql -U appuser -d appdb -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"

# 检查 Redis 连接
docker compose exec redis redis-cli ping
```

### 8.3 迁移检查清单

| 检查项 | 命令/方法 | 预期结果 |
|--------|-----------|----------|
| 容器全部运行 | `docker compose ps` | 所有服务状态为 running |
| 数据库可连接 | `pg_isready` 或应用健康检查 | accepting connections |
| Redis 可连接 | `redis-cli ping` | PONG |
| 数据完整性 | 抽查关键表记录数 | 与旧环境一致 |
| 页面可访问 | 浏览器访问应用 URL | 页面正常渲染 |
| API 正常 | 请求关键 API 端点 | 返回正确数据 |
| SSL 证书有效 | 浏览器检查证书信息 | 有效且未过期 |
| 日志无异常 | `docker compose logs --tail=100` | 无 ERROR 级别日志 |

---

> **文档维护说明**: 本规格书应随技术栈升级和架构变更同步更新。每次重大变更后, 更新版本号和日期, 并在修订记录中注明变更内容。
