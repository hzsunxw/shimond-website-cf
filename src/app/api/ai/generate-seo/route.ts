import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'

interface GenerateRequest {
  title: string
  summary?: string
  description?: string
  lang: string
}

interface GenerateResponse {
  seoTitle: string
  seoDescription: string
  seoKeywords: string
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
    const body: GenerateRequest = await request.json()
    const { title, lang } = body

    if (!title || !lang) {
      return NextResponse.json(
        { error: 'title 和 lang 是必需的' },
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
    const langName = langNames[lang] || lang

    const systemPrompt = `You are a professional SEO expert. Generate SEO metadata in ${langName}.

STRICT RULES:
1. seoTitle: 50-60 chars, keyword-rich
2. seoDescription: 150-160 chars
3. seoKeywords: 5-10 keywords, comma-separated
4. Return ONLY raw JSON. No markdown, no code blocks, no explanations.
5. Output must be a single JSON object starting with { and ending with }

REQUIRED FORMAT:
{"seoTitle":"value","seoDescription":"value","seoKeywords":"value"}`

    const contentText = [
      `Product Title: ${title}`,
      body.summary ? `Summary: ${body.summary}` : '',
      body.description ? `Description: ${body.description}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const userPrompt = `Generate SEO metadata in ${langName} for this product:\n\n${contentText}\n\nRespond with ONLY a JSON object in this exact format: {"seoTitle":"...","seoDescription":"...","seoKeywords":"..."}`

    let completion
    try {
      completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1000,
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
          temperature: 0.3,
          max_tokens: 1000,
        })
      } else {
        throw apiError
      }
    }

    const content = completion.choices[0]?.message?.content?.trim() || ''

    if (!content) {
      return NextResponse.json(
        { error: 'AI 返回了空内容' },
        { status: 500 }
      )
    }

    console.log('[AI Generate SEO] raw response:', content.slice(0, 500))

    let result: GenerateResponse
    try {
      const extracted = extractJson(content)
      result = extracted.data as GenerateResponse
    } catch (err) {
      console.error('[AI Generate SEO] JSON parse failed:', err)
      console.error('[AI Generate SEO] raw content:', content)

      // Fallback: try regex extraction
      const seoTitleMatch = content.match(/"seoTitle"\s*:\s*"([^"]*)"/)
      const seoDescMatch = content.match(/"seoDescription"\s*:\s*"([^"]*)"/)
      const seoKeywordsMatch = content.match(/"seoKeywords"\s*:\s*"([^"]*)"/)

      if (seoTitleMatch || seoDescMatch || seoKeywordsMatch) {
        result = {
          seoTitle: seoTitleMatch?.[1] || '',
          seoDescription: seoDescMatch?.[1] || '',
          seoKeywords: seoKeywordsMatch?.[1] || '',
        }
        console.log('[AI Generate SEO] fallback regex extraction succeeded')
      } else {
        return NextResponse.json(
          { error: 'AI 返回的内容无法解析为 JSON', raw: content.slice(0, 2000) },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      seoTitle: result.seoTitle || '',
      seoDescription: result.seoDescription || '',
      seoKeywords: result.seoKeywords || '',
    })
  } catch (error) {
    console.error('AI generate SEO error:', error)
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
      { error: 'AI 生成失败', detail },
      { status: 500 }
    )
  }
}
