# Nimbus Site CMS - AI 编码行为准则

本项目采用 Andrej Karpathy 提出的四项核心原则，以减少 LLM 在编码过程中的常见错误。与项目特定的编码规范合并使用。

**权衡说明：** 这些指南倾向于**谨慎而非速度**。对于琐碎任务（如简单的拼写错误修复、显而易见的一行修改），请自行判断 —— 并非每个改动都需要完整的严谨流程。

---

## 1. 编码前思考 (Think Before Coding)

**不要假设。不要隐藏困惑。呈现权衡。**

在开始实现之前：
- **明确说明假设** — 如果不确定，询问而不是猜测
- **呈现多种解释** — 当存在歧义时，不要默默选择一种
- **适时提出异议** — 如果存在更简单的方法，说出来
- **困惑时停下来** — 指出不清楚的地方并要求澄清

### 项目特定补充：
- 本项目使用 Next.js 14 + TypeScript + Prisma + PostgreSQL
- 前端使用 Tailwind CSS + shadcn/ui
- API 层使用 tRPC 进行端到端类型安全调用
- 任何涉及数据库 Schema 的变更必须先通过 Prisma Migrate

---

## 2. 简洁优先 (Simplicity First)

**用最少的代码解决问题。不要过度推测。**

- 不要添加要求之外的功能
- 不要为一次性代码创建抽象
- 不要添加未要求的"灵活性"或"可配置性"
- 不要为不可能发生的场景做错误处理
- 如果 200 行代码可以写成 50 行，重写它

**检验标准：** 资深工程师会觉得这过于复杂吗？如果是，简化。

### 项目特定补充：
- 优先使用已有的 shadcn/ui 组件，避免重复造轮子
- tRPC router 保持扁平，不要过早分层
- Prisma schema 是单一事实来源，不要在应用层重复类型定义

---

## 3. 精准修改 (Surgical Changes)

**只碰必须碰的。只清理自己造成的混乱。**

编辑现有代码时：
- 不要"改进"相邻的代码、注释或格式
- 不要重构没坏的东西
- 匹配现有风格，即使你更倾向于不同的写法
- 如果注意到无关的死代码，提一下 —— 不要删除它

当你的改动产生孤儿代码时：
- 删除因你的改动而变得无用的导入/变量/函数
- 不要删除预先存在的死代码，除非被要求

**检验标准：** 每一行修改都应该能直接追溯到用户的请求。

### 项目特定补充：
- 遵循现有的文件组织方式（feature-based 或 layer-based）
- 不要在一次 PR 中混合功能变更和代码重构
- 修改 API 时同步更新 tRPC 的 input/output schema

---

## 4. 目标驱动执行 (Goal-Driven Execution)

**定义成功标准。循环验证直到达成。**

将指令式任务转化为可验证的目标：

| 不要这样做... | 转化为... |
|--------------|-----------------|
| "添加验证" | "为无效输入编写测试，然后让它们通过" |
| "修复 bug" | "编写重现 bug 的测试，然后让它通过" |
| "重构 X" | "确保重构前后测试都能通过" |

对于多步骤任务，说明一个简短的计划：
```
1. [步骤] → 验证: [检查]
2. [步骤] → 验证: [检查]
3. [步骤] → 验证: [检查]
```

强有力的成功标准让 LLM 能够独立循环执行。弱标准（"让它工作"）需要不断澄清。

### 项目特定补充：
- 每个 tRPC procedure 都应该有对应的测试
- 使用 `pnpm test` 运行测试套件
- 数据库迁移（`prisma migrate dev`）后必须验证 schema 正确性
- Docker 构建失败时优先检查环境变量是否完整

---

## 项目特定指南

### 技术栈规范
- **语言**: TypeScript 5.x（严格模式）
- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS 3.x
- **组件库**: shadcn/ui
- **API**: tRPC 11.x
- **ORM**: Prisma 5.x
- **数据库**: PostgreSQL 15
- **缓存**: Redis 7
- **部署**: Docker + Docker Compose

### 代码组织
- `src/app/` - Next.js App Router 页面
- `src/server/` - tRPC routers 和 API 逻辑
- `src/components/` - React 组件（按 feature 组织）
- `src/lib/` - 工具函数和共享逻辑
- `src/types/` - TypeScript 类型定义（优先从 Prisma 生成）
- `prisma/schema.prisma` - 数据库 Schema 单一事实来源

### 提交规范
- 使用语义化提交信息：`feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- 每个提交只包含一个逻辑变更
- 不要提交包含 `console.log` 或调试代码的变更

### 数据库变更流程
1. 修改 `prisma/schema.prisma`
2. 运行 `npx prisma migrate dev --name <描述性名称>`
3. 生成类型：`npx prisma generate`
4. 在代码中使用新生成的类型
5. 验证迁移可以在干净环境中应用：`npx prisma migrate deploy`

---

**这些指南正在起作用的标志：** diff 中不必要的改动更少、因过度复杂而导致的重写更少、澄清问题在实现之前提出而不是在犯错之后。

---

*基于 [andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills) 项目，采用 MIT 许可证。*
