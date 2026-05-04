# 编码行为准则示例

本文件展示如何在实际编码中应用四项核心原则。所有示例均基于 Nimbus Site CMS 项目的实际场景。

---

## 1. 编码前思考 (Think Before Coding)

### 示例 1: 隐藏假设

**用户请求:** "添加产品导出功能"

**❌ 错误做法（假设过多）**

```typescript
// 假设导出所有产品、假设使用 JSON、假设字段
function exportProducts() {
  const products = await prisma.product.findMany();
  fs.writeFileSync('products.json', JSON.stringify(products));
  return products.length;
}
```

**问题：**
- 假设导出所有产品（不考虑权限、筛选？）
- 假设文件位置无需询问
- 假设包含所有字段（有些可能是敏感字段）
- 假设导出格式是 JSON

**✅ 正确做法（明确假设）**

```
在实施前，我需要澄清：

1. **范围**: 导出所有产品还是按条件筛选？（考虑权限和数据量）
2. **格式**: 您期望的导出格式是：
   - 浏览器下载 JSON/CSV 文件？
   - 后台生成文件并通知下载？
   - API 端点返回数据？
3. **字段**: 哪些字段需要导出？（有些如成本价可能是敏感字段）
4. **数据量**: 通常多少产品？（影响导出方式和性能）

最简单的方案：添加 API 端点返回分页 JSON 数据。
如需文件导出，需要更多信息。

您的偏好是？
```

### 示例 2: 多种解释

**用户请求:** "让产品搜索更快"

**❌ 错误做法（默默选择）**

```typescript
// 添加缓存、数据库索引、异步处理，不问哪种"快"更重要
@Cacheable({ ttl: 3600 })
async function searchProducts(query: string) {
  // ... 200 行优化代码
}
```

**✅ 正确做法**

```
"让搜索更快"可能有几种含义：

1. **响应时间更快** (< 100ms 替代 500ms)
   - 添加数据库索引
   - 缓存频繁查询
   - 预计工作量: 2 小时

2. **支持更多并发搜索** (吞吐量)
   - 添加连接池
   - 优化查询
   - 预计工作量: 4 小时

3. **更快的感知速度** (UX)
   - 立即显示部分结果
   - 渐进式加载
   - 预计工作量: 3 小时

当前搜索典型查询约 500ms。
对于您的使用场景，哪个方面最重要？
```

---

## 2. 简洁优先 (Simplicity First)

### 示例 1: 过度抽象

**用户请求:** "添加计算折扣的功能"

**❌ 错误做法（过度设计）**

```typescript
// 使用策略模式、抽象工厂等，对于单一需求过于复杂
interface DiscountStrategy {
  calculate(amount: number): number;
}

class PercentageDiscount implements DiscountStrategy {
  constructor(private percent: number) {}
  calculate(amount: number): number {
    return amount * (this.percent / 100);
  }
}

class FixedDiscount implements DiscountStrategy {
  constructor(private amount: number) {}
  calculate(amount: number): number {
    return Math.min(this.amount, amount);
  }
}

class DiscountCalculator {
  constructor(private strategy: DiscountStrategy) {}
  apply(amount: number): number {
    return this.strategy.calculate(amount);
  }
}

// 使用需要 30+ 行代码
```

**✅ 正确做法（简单）**

```typescript
function calculateDiscount(amount: number, percent: number): number {
  return amount * (percent / 100);
}

// 使用
discount = calculateDiscount(100.0, 10.0); // $10 折扣
```

**何时添加复杂度:** 只有当你真正需要多种折扣类型时。如果后续有这个需求，那时再重构。

### 示例 2: 推测性特性

**用户请求:** "保存用户偏好到数据库"

**❌ 错误做法（添加未要求的特性）**

```typescript
class PreferenceManager {
  constructor(
    private db: Database,
    private cache?: Cache,
    private validator?: Validator
  ) {}

  async save(
    userId: string,
    prefs: Record<string, unknown>,
    options: {
      merge?: boolean;
      validate?: boolean;
      notify?: boolean;
    } = {}
  ) {
    if (options.validate) {
      await this.validate(prefs);
    }
    
    const existing = options.merge ? await this.get(userId) : {};
    const merged = options.merge ? { ...existing, ...prefs } : prefs;
    
    await this.db.update('users', userId, { preferences: merged });
    
    if (this.cache) {
      await this.cache.set(`prefs:${userId}`, merged);
    }
    
    if (options.notify) {
      await this.notifyChange(userId, merged);
    }
  }
}
```

**✅ 正确做法（只做要求的）**

```typescript
async function savePreferences(
  db: PrismaClient,
  userId: string,
  preferences: Record<string, unknown>
) {
  await db.user.update({
    where: { id: userId },
    data: { preferences }
  });
}
```

**后续如需添加:** 缓存（当性能成为问题时）、验证（当坏数据出现时）、合并（当需求出现时）。

---

## 3. 精准修改 (Surgical Changes)

### 示例 1: 顺路重构

**用户请求:** "修复空邮箱导致验证器崩溃的 bug"

**❌ 错误做法（改动过多）**

```diff
  function validateUser(data: UserData) {
-     // 检查邮箱格式
-     if (!data.email) {
+     /** 验证用户数据 */
+     const email = data.email?.trim();
+     
+     // 验证邮箱
+     if (!email || !email.includes('@')) {
          throw new Error("邮箱必填");
      }
      
-     // 基本邮箱验证
-     if (!data.email.includes('@')) {
+     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw new Error("邮箱格式无效");
      }
      
-     // 检查用户名
-     if (!data.username) {
+     // 验证用户名
+     const username = data.username?.trim();
+     if (!username || username.length < 3) {
          throw new Error("用户名必填");
+     }
+     if (!/^[a-zA-Z0-9_]+$/.test(username)) {
+         throw new Error("用户名只能包含字母、数字和下划线");
      }
      
      return true;
  }
```

**问题：**
- "改进"了邮箱验证，超出 bug 修复范围
- 添加了用户名验证，没人要求
- 修改了注释
- 添加了 JSDoc

**✅ 正确做法（精准）**

```diff
  function validateUser(data: UserData) {
      // 检查邮箱格式
-     if (!data.email) {
+     const email = data.email || '';
+     if (!email.trim()) {
          throw new Error("邮箱必填");
      }
      
      // 基本邮箱验证
-     if (!data.email.includes('@')) {
+     if (!email.includes('@')) {
          throw new Error("邮箱格式无效");
      }
      
      // 检查用户名
      if (!data.username) {
          throw new Error("用户名必填");
      }
      
      return true;
  }
```

**只修改了:** 修复空邮箱处理的特定行。

### 示例 2: 风格漂移

**用户请求:** "添加上传功能的日志"

**❌ 错误做法（重排所有代码）**

```diff
- function uploadFile(filePath: string, dest: string) {
+ function uploadFile(filePath: string, dest: string): Promise<boolean> {
+     /** 上传文件到目标位置 */
+     logger.info(`开始上传: ${filePath}`);
+     
      try {
-         const data = fs.readFileSync(filePath);
+         const data = await fs.promises.readFile(filePath);
          
-         const response = await fetch(dest, { 
-             method: 'POST', 
-             body: data 
-         });
+         const response = await fetch(dest, {
+             method: 'POST',
+             body: data,
+         });
          
-         return response.ok;
+         const success = response.ok;
+         
+         if (success) {
+             logger.info(`上传成功: ${filePath}`);
+         } else {
+             logger.error(`上传失败: ${filePath}, 状态=${response.status}`);
+         }
+         
+         return success;
      } catch (error) {
-         console.error('上传错误:', error);
+         logger.error(`上传错误: ${filePath}`, error);
          return false;
      }
  }
```

**问题：**
- 添加了返回类型注解（未要求）
- 添加了 JSDoc
- 修改了代码格式
- 重构了返回逻辑

**✅ 正确做法（匹配现有风格）**

```diff
+ import { logger } from '@/lib/logger';
+ 
  function uploadFile(filePath, dest) {
+     logger.info(`开始上传: ${filePath}`);
      try {
          const data = fs.readFileSync(filePath);
          
          const response = await fetch(dest, { 
              method: 'POST', 
              body: data 
          });
          
-         return response.ok;
+         if (response.ok) {
+             logger.info(`上传成功: ${filePath}`);
+         } else {
+             logger.error(`上传失败: ${filePath}, 状态=${response.status}`);
+         }
+         return response.ok;
      } catch (error) {
-         console.error('上传错误:', error);
+         logger.error(`上传错误: ${filePath}`, error);
          return false;
      }
  }
```

**匹配了:** 现有代码风格、变量命名、缩进方式。

---

## 4. 目标驱动执行 (Goal-Driven Execution)

### 示例 1: 模糊 vs 可验证

**用户请求:** "修复认证系统"

**❌ 错误做法（模糊处理）**

```
我会通过以下方式修复认证系统：
1. 审查代码
2. 识别问题
3. 进行改进
4. 测试更改

[ proceeded to make changes without clear success criteria ]
```

**✅ 正确做法（可验证目标）**

```
要"修复认证"，我需要定义成功标准。
您看到的具体问题是什么？

如果问题是"用户修改密码后仍保持登录状态"：

计划：
1. 编写测试: 修改密码 → 验证旧 session 被注销
   验证: 测试失败（重现 bug）

2. 实现: 修改密码时使 session 失效
   验证: 测试通过

3. 检查边界情况: 多设备登录、并发修改
   验证: 额外测试通过

4. 验证无回归: 现有认证测试仍然通过
   验证: 完整测试套件通过

当前认证测试覆盖: [展示覆盖率]
您看到的具体认证问题是什么？
```

### 示例 2: 多步骤与验证

**用户请求:** "为 API 添加速率限制"

**❌ 错误做法（一次性全部实现）**

```typescript
// 在一个 300 行的提交中实现完整的速率限制
// 包含 Redis、多种策略、配置系统和监控
// 没有明确的验证步骤
```

**✅ 正确做法（增量实现与验证）**

```
速率限制实现计划：

1. 添加基本内存速率限制（单个端点）
   验证：
   - 测试: 100 次请求 → 前 10 次成功，后续获得 429
   - 手动: curl 端点 11 次，看到速率限制错误

2. 提取为中间件（应用到所有端点）
   验证：
   - 测试: 速率限制应用于 /users 和 /posts
   - 现有端点测试仍然通过

3. 添加 Redis 后端（用于多服务器）
   验证：
   - 测试: 速率限制在应用重启后仍然有效
   - 测试: 两个应用实例共享速率限制计数器

4. 添加配置（每个端点不同的限制）
   验证：
   - 测试: /search 允许 10/分钟, /users 允许 100/分钟
   - 配置文件解析正确

每个步骤都是独立可验证和可部署的。
从步骤 1 开始？
```

---

## 反模式总结

| 原则 | 反模式 | 修正 |
|-----------|-------------|-----|
| 编码前思考 | 默默假设文件格式、字段、范围 | 明确列出假设，询问澄清 |
| 简洁优先 | 为单一折扣计算使用策略模式 | 一个函数，直到真正需要复杂度 |
| 精准修改 | 修复 bug 时重排引号、添加类型注解 | 只修改修复报告问题的行 |
| 目标驱动 | "我会审查和改进代码" | "为 bug X 编写测试 → 使其通过 → 验证无回归" |

## 核心洞察

"过度复杂"的示例并不明显错误——它们遵循设计模式和最佳实践。问题在于**时机**：它们在需要之前添加复杂度，这会导致：

- 代码更难理解
- 引入更多 bug
- 实现时间更长
- 测试更困难

而"简单"版本：
- 更容易理解
- 实现更快
- 更容易测试
- 可以在真正需要时重构

**好的代码是简单解决今天问题的代码，而不是过早解决明天问题的代码。**
