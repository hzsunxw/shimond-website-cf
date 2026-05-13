import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import { extractJson } from '@/lib/ai-utils'

interface GenerateCaseRequest {
  topic?: string
  title?: string
  lang: string
}

interface GenerateCaseResponse {
  title: string
  slug: string
  clientName: string
  summary: string
  description: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  imageKeywords: string
}

const langNames: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  ar: 'Arabic',
  zh: 'Chinese',
}

export async function POST(request: Request) {
  try {
    let body: GenerateCaseRequest
    try {
      body = await request.json()
    } catch (parseErr) {
      console.error('[AI Generate Case] Request body parse error:', parseErr)
      return NextResponse.json(
        { error: '请求体格式错误，请确保发送的是合法 JSON' },
        { status: 400 }
      )
    }
    const { topic, title, lang } = body

    if (!lang) {
      return NextResponse.json({ error: 'lang 是必需的' }, { status: 400 })
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

    const systemPrompt = `You are a professional case study writer for a home decoration company specializing in high-quality PVC products (artificial leather, floor mats, table protectors).

COMPANY PROFILE:
- Products: PVC artificial leather, floor mats, table protectors
- Industry: Home decoration / eco-friendly materials / soft furnishings
- Target market: B2B and B2C, export trade
- Style: Professional, results-oriented, trustworthy

WRITING RULES:
1. Title: Professional and compelling, 20-40 characters
2. Client Name: A realistic fictional company name (e.g. "EuroFurn Co.", "BuildRight Ltd.")
3. Summary: 2-3 sentences highlighting the project scope and results, under 100 words
4. Description: Detailed case study format (background, challenge, solution, results), 500-1000 words
5. SEO: Generate SEO Title (50-60 chars), Description (150-160 chars), Keywords (5-10 comma-separated)
6. Slug: URL-friendly identifier in English, lowercase, hyphen-separated, 3-6 words
7. Image Keywords: 2-3 English keywords for stock photo search
8. Language: ${langName}
9. Output: STRICT JSON only, no markdown, no explanations

OUTPUT FORMAT:
{"title":"...","slug":"...","clientName":"...","summary":"...","description":"...","seoTitle":"...","seoDescription":"...","seoKeywords":"...","imageKeywords":"..."}`

    const userPromptParts = [
      `Generate a case study in ${langName} for our PVC home decoration products company.`,
      topic ? `Topic/Project type: ${topic}` : 'No specific topic provided. Please create a realistic customer success story related to PVC home decoration products (e.g. furniture manufacturing partnership, commercial flooring project, automotive interior supply).',
      title ? `Existing title to refine: ${title}` : '',
      'Current date: May 2025.',
    ].filter(Boolean).join('\n\n')

    let completion
    try {
      completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPromptParts },
        ],
        temperature: 0.7,
        max_tokens: 4000,
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
            { role: 'user', content: userPromptParts },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        })
      } else {
        throw apiError
      }
    }

    let content = completion.choices[0]?.message?.content?.trim() || ''
    const msg = completion.choices[0]?.message as unknown as Record<string, unknown> | undefined
    if (!content && msg?.reasoning_content) {
      const reasoning = String(msg.reasoning_content).trim()
      if (reasoning) {
        content = reasoning
      }
    }

    if (!content) {
      return NextResponse.json({ error: 'AI 返回了空内容' }, { status: 500 })
    }

    let result: GenerateCaseResponse
    try {
      const extracted = extractJson(content)
      result = extracted.data as GenerateCaseResponse
    } catch (err) {
      console.error('[AI Generate Case] JSON parse failed:', err)
      return NextResponse.json(
        { error: 'AI 返回的内容无法解析为 JSON', raw: content.slice(0, 2000) },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      title: result.title || '',
      slug: result.slug || '',
      clientName: result.clientName || '',
      summary: result.summary || '',
      description: result.description || '',
      seoTitle: result.seoTitle || '',
      seoDescription: result.seoDescription || '',
      seoKeywords: result.seoKeywords || '',
      imageKeywords: result.imageKeywords || '',
    })
  } catch (error) {
    console.error('AI generate case error:', error)
    const errStr = String(error)
    let detail = errStr
    if (errStr.includes('401') || errStr.includes('auth') || errStr.includes('API key')) {
      detail = 'API Key 无效或已过期，请在「站点基础配置」中检查 AI 配置'
    } else if (errStr.includes('ENOTFOUND') || errStr.includes('ECONNREFUSED') || errStr.includes('timeout')) {
      detail = '无法连接到 AI 服务，请检查网络或 API 端点配置'
    } else if (errStr.includes('model') || errStr.includes('does not exist')) {
      detail = '模型名称错误或不支持，请在「站点基础配置」中修改 AI 模型'
    }
    return NextResponse.json({ error: 'AI 生成失败', detail }, { status: 500 })
  }
}
