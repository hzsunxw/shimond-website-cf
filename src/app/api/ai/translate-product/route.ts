import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'

interface ProductFields {
  title?: string
  summary?: string
  description?: string
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

function extractJson(content: string): { data: unknown; raw: string } {
  let cleaned = content
    .replace(/^\uFEFF/, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()

  try {
    return { data: JSON.parse(cleaned), raw: cleaned.slice(0, 500) }
  } catch {
    // ignore
  }

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
        // try next
      }
    }
  }

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
    const targetLangNames = targetLangs.map((l) => langNames[l] || l).join(', ')

    const fieldsText = Object.entries(fields)
      .filter(([, v]) => v && String(v).trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n')

    const systemPrompt = `You are a professional product content and SEO translation expert. Translate the given product fields from ${sourceLangName} to: ${targetLangNames}.\n\nCRITICAL RULES:\n1. Keep translations natural, professional, and suitable for a B2B industrial product website\n2. For SEO fields: title ~50-60 chars, description ~150-160 chars, keywords comma-separated\n3. Maintain technical accuracy for industrial product terminology\n4. Return ONLY a valid JSON object — NO markdown, NO explanations, NO code blocks\n5. The response must start with { and end with }\n6. Include ALL target languages: ${targetLangNames}\n7. All string values must be properly escaped\n\nEXACT OUTPUT FORMAT:\n{"en":{"title":"...","summary":"...","description":"...","seoTitle":"...","seoDescription":"...","seoKeywords":"..."},"es":{"title":"...","summary":"...","description":"...","seoTitle":"...","seoDescription":"...","seoKeywords":"..."},"ar":{"title":"...","summary":"...","description":"...","seoTitle":"...","seoDescription":"...","seoKeywords":"..."}}`

    const userPrompt = `Translate these product fields from ${sourceLangName}:\n\n${fieldsText}\n\nTarget languages: ${targetLangNames}`

    let completion
    try {
      completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      })
    } catch (apiError) {
      const errorMsg = String(apiError)
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
          max_tokens: 4000,
        })
      } else {
        throw apiError
      }
    }

    const content = completion.choices[0]?.message?.content?.trim() || ''

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