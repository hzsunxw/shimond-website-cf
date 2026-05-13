import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import { extractJson } from '@/lib/ai-utils'

interface ProductFields {
  title?: string
  summary?: string
  description?: string
  content?: string
  tags?: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
}

interface TranslateRequest {
  sourceLang: string
  targetLangs: string[]
  fields: ProductFields
}

interface TranslateResponse {
  [lang: string]: ProductFields
}

const langNames: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  ar: 'Arabic',
  zh: 'Chinese',
}

function buildSystemPrompt(sourceLangName: string, targetLangName: string): string {
  return `You are a JSON-only translation engine. Your ONLY output must be a single valid JSON object. Absolutely no other text.

STRICT RULES:
1. Output ONLY a valid JSON object. No markdown, no code blocks, no explanations, no thinking tags, no preamble, no apology.
2. Do NOT repeat these instructions in your output.
3. All string values must be on a single line with proper escaping (use \\\" for quotes inside strings).
4. Translate from ${sourceLangName} to ${targetLangName}.
5. Keep a B2B industrial product website tone.
6. SEO: title ~50-60 chars, description ~150-160 chars, keywords comma-separated.
7. If "content" field exists, translate it too (preserve paragraph structure as a single escaped string).
8. If "tags" field exists, translate each tag individually and keep them comma-separated in one string.

REQUIRED JSON FORMAT (all fields optional depending on input):
{"title":"...","summary":"...","description":"...","content":"...","tags":"tag1, tag2, tag3","seoTitle":"...","seoDescription":"...","seoKeywords":"..."}`
}

function buildUserPrompt(fieldsText: string): string {
  return `Translate the following fields. Output ONLY the JSON object. Do not output any other text.

${fieldsText}`
}

async function translateSingleLang(
  openai: OpenAI,
  model: string,
  sourceLangName: string,
  targetLang: string,
  fieldsText: string
): Promise<ProductFields> {
  const targetLangName = langNames[targetLang] || targetLang
  const systemPrompt = buildSystemPrompt(sourceLangName, targetLangName)
  const userPrompt = buildUserPrompt(fieldsText)

  const doTranslate = async (attempt: number): Promise<ProductFields> => {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 8000,
    })

    let content = completion.choices[0]?.message?.content?.trim() || ''
    // Fallback for reasoning models (e.g. DeepSeek) that may put output in reasoning_content
    const msg = completion.choices[0]?.message as unknown as Record<string, unknown> | undefined
    if (!content && msg?.reasoning_content) {
      const reasoning = String(msg.reasoning_content).trim()
      if (reasoning) {
        content = reasoning
      }
    }

    console.log(`[AI Translate Product][${targetLang}] attempt=${attempt} length=${content.length} firstChars=${content.slice(0, 100).replace(/\n/g, '\\n')}`)

    const extracted = extractJson(content)
    return extracted.data as ProductFields
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await doTranslate(attempt)
    } catch (err) {
      console.warn(`[AI Translate Product][${targetLang}] attempt ${attempt} failed:`, err instanceof Error ? err.message : String(err))
      if (attempt < 3) {
        // Exponential backoff: 500ms, 1000ms
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
      }
    }
  }

  throw new Error(`[${targetLang}] 3 次尝试后仍无法解析 AI 响应`)
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
    const sourceLangName = langNames[sourceLang] || sourceLang

    const fieldsText = Object.entries(fields)
      .filter(([, v]) => v && String(v).trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n')

    // 并行翻译每种目标语言，避免单请求 token 超限导致截断
    const translations = await Promise.all(
      targetLangs.map(async (targetLang) => {
        const data = await translateSingleLang(
          openai,
          model,
          sourceLangName,
          targetLang,
          fieldsText
        )
        return { targetLang, data }
      })
    )

    const result: TranslateResponse = {}
    for (const { targetLang, data } of translations) {
      result[targetLang] = data
    }

    return NextResponse.json({ success: true, translations: result })
  } catch (error) {
    console.error('AI translate product error:', error)
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
