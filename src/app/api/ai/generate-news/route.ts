import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import { extractJson } from '@/lib/ai-utils'

interface GenerateNewsRequest {
  topic?: string
  title?: string
  lang: string
}

interface GenerateNewsResponse {
  title: string
  slug: string
  summary: string
  content: string
  tags: string[]
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
    let body: GenerateNewsRequest
    try {
      body = await request.json()
    } catch (parseErr) {
      console.error('[AI Generate News] Request body parse error:', parseErr)
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

    // Optional: Brave Search enhancement
    let searchContext = ''
    if (siteConfig.braveSearchKey && topic) {
      try {
        const searchRes = await fetch(
          `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(topic)}&count=3`,
          {
            headers: {
              'X-Subscription-Token': siteConfig.braveSearchKey,
              Accept: 'application/json',
            },
          }
        )
        if (searchRes.ok) {
          const searchData = await searchRes.json()
          const results = searchData.web?.results || []
          if (results.length > 0) {
            searchContext = results
              .map((r: { title?: string; description?: string }) => `${r.title}: ${r.description}`)
              .join('\n')
              .slice(0, 2000)
          }
        }
      } catch {
        // ignore search errors, fallback to pure AI
      }
    }

    const openai = new OpenAI({
      apiKey: siteConfig.aiApiKey,
      baseURL: siteConfig.aiEndpoint || undefined,
    })

    const model = siteConfig.aiModel || 'gpt-4o-mini'
    const langName = langNames[lang] || lang

    const systemPrompt = `You are a professional news writer for a home decoration company specializing in high-quality PVC products (artificial leather, floor mats, table protectors).

COMPANY PROFILE:
- Products: PVC artificial leather, floor mats, table protectors
- Industry: Home decoration / eco-friendly materials / soft furnishings
- Target market: B2B and B2C, export trade
- Style: Professional, warm, lifestyle-oriented

WRITING RULES:
1. Title: Eye-catching, include company vibe if natural, 20-30 characters
2. Summary: 2-3 sentences summarizing the key points, under 100 words
3. Content: Professional news article format (lead, body, conclusion), 800-1500 words
4. Tags: 5-8 relevant keywords
5. SEO: Generate SEO Title (50-60 chars), Description (150-160 chars), Keywords (5-10 comma-separated)
6. Slug: URL-friendly identifier in English, lowercase, hyphen-separated, 3-5 words (e.g. "eco-pvc-home-decor-2025")
7. Image Keywords: 2-3 English keywords for stock photo search (e.g. "modern kitchen table mat, pvc floor mat decoration")
8. Language: ${langName}
9. Output: STRICT JSON only, no markdown, no explanations

OUTPUT FORMAT:
{"title":"...","slug":"...","summary":"...","content":"...","tags":["..."],"seoTitle":"...","seoDescription":"...","seoKeywords":"...","imageKeywords":"..."}`

    const userPromptParts = [
      `Generate a news article in ${langName} for our PVC home decoration products company.`,
      topic ? `Topic/Keyword: ${topic}` : 'No specific topic provided. Please choose a timely and relevant topic related to PVC home decoration products (e.g. seasonal trends, eco-friendly materials, home renovation tips, or industry insights).',
      title ? `Existing title to refine: ${title}` : '',
      searchContext ? `Relevant real-world context from search:\n${searchContext}` : '',
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
    // Fallback for reasoning models (e.g. DeepSeek) that may put output in reasoning_content
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

    let result: GenerateNewsResponse
    try {
      const extracted = extractJson(content)
      result = extracted.data as GenerateNewsResponse
    } catch (err) {
      console.error('[AI Generate News] JSON parse failed:', err)
      return NextResponse.json(
        { error: 'AI 返回的内容无法解析为 JSON', raw: content.slice(0, 2000) },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      title: result.title || '',
      slug: result.slug || '',
      summary: result.summary || '',
      content: result.content || '',
      tags: Array.isArray(result.tags) ? result.tags : [],
      seoTitle: result.seoTitle || '',
      seoDescription: result.seoDescription || '',
      seoKeywords: result.seoKeywords || '',
      imageKeywords: result.imageKeywords || '',
    })
  } catch (error) {
    console.error('AI generate news error:', error)
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
