import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'

interface SeoFields {
  companyName?: string
  siteTitle?: string
  siteDescription?: string
  defaultSeoTitle?: string
  defaultSeoDescription?: string
  defaultSeoKeywords?: string
  address?: string
  phone?: string
  email?: string
}

interface TranslateRequest {
  sourceLang: string
  targetLangs: string[]
  fields: SeoFields
}

interface TranslateResponse {
  [lang: string]: SeoFields
}

const langNames: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  ar: 'Arabic',
  zh: 'Chinese',
}

/**
 * 从 AI 响应文本中提取有效 JSON
 * 处理 DeepSeek 等模型常见的不规范输出
 */
function extractJson(content: string): { data: unknown; raw: string } {
  // 去除 BOM、零宽字符、控制字符
  let cleaned = content
    .replace(/^\uFEFF/, '') // BOM
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // 零宽字符
    .trim()

  // 1. 直接解析
  try {
    return { data: JSON.parse(cleaned), raw: cleaned.slice(0, 500) }
  } catch {
    // ignore
  }

  // 2. 提取 ```json ... ``` 或 ``` ... ``` 代码块（支持多种变体）
  const codeBlockPatterns = [
    /```(?:json)?\s*([\s\S]*?)\s*```/,
    /```\s*([\s\S]*?)\s*```/,
    /`{3,}\s*([\s\S]*?)\s*`{3,}/,
  ]
  for (const pattern of codeBlockPatterns) {
    const match = cleaned.match(pattern)
    if (match) {
      try {
        return { data: JSON.parse(match[1].trim()), raw: cleaned.slice(0, 500) }
      } catch {
        // try next pattern
      }
    }
  }

  // 3. 提取最外层 JSON 对象（第一个 { 到最后一个 }）
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = cleaned.slice(firstBrace, lastBrace + 1)
    try {
      return { data: JSON.parse(candidate), raw: cleaned.slice(0, 500) }
    } catch {
      // ignore
    }
  }

  // 4. 提取最外层 JSON 数组
  const firstBracket = cleaned.indexOf('[')
  const lastBracket = cleaned.lastIndexOf(']')
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    const candidate = cleaned.slice(firstBracket, lastBracket + 1)
    try {
      return { data: JSON.parse(candidate), raw: cleaned.slice(0, 500) }
    } catch {
      // ignore
    }
  }

  throw new Error('无法从 AI 响应中提取有效 JSON')
}

export async function POST(request: Request) {
  try {
    const body: TranslateRequest = await request.json()
    const { sourceLang, targetLangs, fields } = body

    if (!sourceLang || !targetLangs?.length || !fields) {
      return NextResponse.json(
        { error: 'sourceLang, targetLangs 和 fields 是必需的' },
        { status: 400 }
      )
    }

    // 获取 AI 配置
    const siteConfig = await prisma.siteConfig.findFirst()
    if (!siteConfig?.aiEnabled || !siteConfig.aiApiKey) {
      return NextResponse.json(
        { error: 'AI 功能未启用或未配置 API Key' },
        { status: 400 }
      )
    }

    const openai = new OpenAI({
      apiKey: siteConfig.aiApiKey,
      baseURL: siteConfig.aiEndpoint || undefined,
    })

    const model = siteConfig.aiModel || 'gpt-4o-mini'

    // 构建 prompt
    const sourceLangName = langNames[sourceLang] || sourceLang
    const targetLangNames = targetLangs.map((l) => langNames[l] || l).join(', ')

    const fieldsText = Object.entries(fields)
      .filter(([, v]) => v && String(v).trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n')

    const systemPrompt = `You are a professional SEO translation expert. Translate the given SEO metadata from ${sourceLangName} to the following languages: ${targetLangNames}.

CRITICAL RULES:
1. Keep translations SEO-optimized and natural for each target language
2. Maintain appropriate length for SEO fields (title ~50-60 chars, description ~150-160 chars)
3. Keywords should be comma-separated and relevant to the local market
4. Return ONLY a valid JSON object — NO markdown, NO explanations, NO code blocks
5. The response must start with "{" and end with "}"
6. Include ALL target languages: ${targetLangNames}
7. All string values must be properly escaped (use \\\" for quotes inside strings)

EXACT OUTPUT FORMAT:
{"en":{"companyName":"...","siteTitle":"...","siteDescription":"...","defaultSeoTitle":"...","defaultSeoDescription":"...","defaultSeoKeywords":"...","address":"...","phone":"...","email":"..."},"es":{"companyName":"...","siteTitle":"...","siteDescription":"...","defaultSeoTitle":"...","defaultSeoDescription":"...","defaultSeoKeywords":"...","address":"...","phone":"...","email":"..."},"ar":{"companyName":"...","siteTitle":"...","siteDescription":"...","defaultSeoTitle":"...","defaultSeoDescription":"...","defaultSeoKeywords":"...","address":"...","phone":"...","email":"..."}}`

    const userPrompt = `Translate these SEO fields from ${sourceLangName}:

${fieldsText}

Target languages: ${targetLangNames}`

    // 优先尝试使用 json_object 响应格式强制返回 JSON（OpenAI / OpenRouter 部分模型支持）
    let completion
    try {
      completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      })
    } catch (apiError) {
      const errorMsg = String(apiError)
      // 如果模型不支持 response_format（常见 400 错误），回退到普通调用
      if (
        errorMsg.includes('response_format') ||
        errorMsg.includes('400') ||
        errorMsg.includes('not supported')
      ) {
        completion = await openai.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.1,
          max_tokens: 3000,
        })
      } else {
        throw apiError
      }
    }

    const content = completion.choices[0]?.message?.content?.trim() || ''

    // 尝试解析 JSON
    let result: TranslateResponse
    try {
      const extracted = extractJson(content)
      result = extracted.data as TranslateResponse
    } catch {
      return NextResponse.json(
        { error: 'AI 返回的内容无法解析为 JSON', raw: content.slice(0, 2000) },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, translations: result })
  } catch (error) {
    console.error('AI translate SEO error:', error)
    const errStr = String(error)
    let detail = errStr
    if (errStr.includes('401') || errStr.includes('auth') || errStr.includes('API key')) {
      detail = 'API Key 无效或已过期，请在「站点基础配置」中检查 AI 配置'
    } else if (errStr.includes('ENOTFOUND') || errStr.includes('ECONNREFUSED') || errStr.includes('timeout')) {
      detail = '无法连接到 AI 服务，请检查网络或 API 端点配置'
    } else if (errStr.includes('model') || errStr.includes('does not exist')) {
      detail = '模型名称错误或不支持，请在「站点基础配置」中修改 AI 模型'
    }
    return NextResponse.json(
      { error: 'AI 翻译失败', detail },
      { status: 500 }
    )
  }
}
