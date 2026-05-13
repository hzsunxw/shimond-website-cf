/**
 * Shared AI utilities for robust JSON extraction from LLM responses.
 */

function repairJsonStrings(content: string): string {
  let inString = false
  let escaped = false
  let result = ''
  for (let i = 0; i < content.length; i++) {
    const char = content[i]
    if (escaped) {
      result += char
      escaped = false
      continue
    }
    if (char === '\\') {
      result += char
      escaped = true
      continue
    }
    if (char === '"') {
      inString = !inString
      result += char
      continue
    }
    if (inString && (char === '\n' || char === '\r')) {
      // Collapse \r\n to a single escaped newline
      if (char === '\r' && i + 1 < content.length && content[i + 1] === '\n') {
        continue
      }
      result += '\\n'
      continue
    }
    result += char
  }
  return result
}

/**
 * 尝试修复被截断的不完整 JSON。
 * 策略：找到最后一个完整的 `"key":"value"` 对，然后补全缺失的闭合括号。
 */
function repairTruncatedJson(content: string): string {
  // 如果已经以 } 结尾，不需要修复
  const trimmed = content.trim()
  if (trimmed.endsWith('}')) return trimmed

  // 找到最后一个完整的字符串值对（以 " 结尾）
  // 从后向前扫描，找到最后一个可以作为有效结尾的位置
  let lastValidIndex = -1
  let inString = false
  let escaped = false

  for (let i = trimmed.length - 1; i >= 0; i--) {
    const char = trimmed[i]
    if (escaped) {
      escaped = false
      continue
    }
    if (char === '\\') {
      escaped = true
      continue
    }
    if (char === '"') {
      inString = !inString
      if (!inString) {
        // 字符串结束，记录这个位置
        lastValidIndex = i
      }
      continue
    }
  }

  if (lastValidIndex > 0) {
    // 截断到 lastValidIndex+1，然后补全 JSON
    const candidate = trimmed.slice(0, lastValidIndex + 1)
    // 检查最后一个非空白字符
    const lastChar = candidate.trim().slice(-1)
    if (lastChar === '"') {
      // 可能是 "key":"value" 后面缺少逗号和后续内容
      // 简单补全：添加 "}" 来闭合对象
      return candidate.trim() + '\n}'
    }
  }

  return trimmed
}

function isLikelyInstructionText(content: string): boolean {
  // 检测模型是否把 prompt 中的指令重复输出了
  const instructionPatterns = [
    '我们要求',
    '我们要求输出',
    '输出JSON',
    '你是一个',
    '你的任务',
    'CRITICAL RULES',
    'EXACT OUTPUT FORMAT',
  ]
  return instructionPatterns.some((p) => content.includes(p))
}

export function extractJson(content: string): { data: unknown; raw: string } {
  // 快速拒绝：如果内容是中文指令文本，直接失败
  if (isLikelyInstructionText(content)) {
    console.error('[extractJson] Rejected: content appears to be instruction text, not JSON')
    throw new Error('无法从 AI 响应中提取有效 JSON')
  }

  // 去除 BOM、零宽字符、控制字符、双向文本控制字符
  let cleaned = content
    .replace(/^\uFEFF/, '') // BOM
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // 零宽字符
    .replace(/[\u200E\u200F\u202A-\u202E]/g, '') // 双向文本控制字符 (RTL/LTR marks)
    .trim()

  // 1. 直接解析
  try {
    return { data: JSON.parse(cleaned), raw: cleaned.slice(0, 500) }
  } catch (e) {
    console.error('[extractJson] Direct parse failed:', e instanceof Error ? e.message : String(e))
    // ignore
  }

  // 2. 修复字符串内部的未转义换行符后重试
  const repaired = repairJsonStrings(cleaned)
  try {
    return { data: JSON.parse(repaired), raw: repaired.slice(0, 500) }
  } catch (e) {
    console.error('[extractJson] Repaired parse failed:', e instanceof Error ? e.message : String(e))
    // ignore
  }

  // 3. 提取 ```json ... ``` 或 ``` ... ``` 代码块（支持多种变体）
  const codeBlockPatterns = [
    /```(?:json)?\s*([\s\S]*?)\s*```/,
    /```\s*([\s\S]*?)\s*```/,
    /`{3,}\s*([\s\S]*?)\s*`{3,}/,
  ]
  for (const pattern of codeBlockPatterns) {
    const match = cleaned.match(pattern)
    if (match) {
      const block = match[1].trim()
      try {
        return { data: JSON.parse(block), raw: cleaned.slice(0, 500) }
      } catch (e) {
        console.error('[extractJson] Code block parse failed:', e instanceof Error ? e.message : String(e))
        // try repaired block
        const repairedBlock = repairJsonStrings(block)
        try {
          return { data: JSON.parse(repairedBlock), raw: cleaned.slice(0, 500) }
        } catch (e2) {
          console.error('[extractJson] Repaired code block parse failed:', e2 instanceof Error ? e2.message : String(e2))
          // try next pattern
        }
      }
    }
  }

  // 4. 提取最外层 JSON 对象（第一个 { 到最后一个 }）
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = cleaned.slice(firstBrace, lastBrace + 1)
    try {
      return { data: JSON.parse(candidate), raw: cleaned.slice(0, 500) }
    } catch (e) {
      console.error('[extractJson] Brace extraction parse failed:', e instanceof Error ? e.message : String(e))
      // try repaired candidate
      const repairedCandidate = repairJsonStrings(candidate)
      try {
        return { data: JSON.parse(repairedCandidate), raw: cleaned.slice(0, 500) }
      } catch (e2) {
        console.error('[extractJson] Repaired brace extraction parse failed:', e2 instanceof Error ? e2.message : String(e2))
        // ignore
      }
    }
  }

  // 5. 尝试修复截断的 JSON
  if (firstBrace !== -1) {
    const truncatedCandidate = repairTruncatedJson(cleaned.slice(firstBrace))
    try {
      return { data: JSON.parse(truncatedCandidate), raw: cleaned.slice(0, 500) }
    } catch (e) {
      console.error('[extractJson] Truncated repair parse failed:', e instanceof Error ? e.message : String(e))
      // try repaired truncated
      const repairedTruncated = repairJsonStrings(truncatedCandidate)
      try {
        return { data: JSON.parse(repairedTruncated), raw: cleaned.slice(0, 500) }
      } catch (e2) {
        console.error('[extractJson] Repaired truncated parse failed:', e2 instanceof Error ? e2.message : String(e2))
        // ignore
      }
    }
  }

  // 6. 提取最外层 JSON 数组
  const firstBracket = cleaned.indexOf('[')
  const lastBracket = cleaned.lastIndexOf(']')
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    const candidate = cleaned.slice(firstBracket, lastBracket + 1)
    try {
      return { data: JSON.parse(candidate), raw: cleaned.slice(0, 500) }
    } catch (e) {
      console.error('[extractJson] Bracket extraction parse failed:', e instanceof Error ? e.message : String(e))
      const repairedCandidate = repairJsonStrings(candidate)
      try {
        return { data: JSON.parse(repairedCandidate), raw: cleaned.slice(0, 500) }
      } catch (e2) {
        console.error('[extractJson] Repaired bracket extraction parse failed:', e2 instanceof Error ? e2.message : String(e2))
        // ignore
      }
    }
  }

  throw new Error('无法从 AI 响应中提取有效 JSON')
}
