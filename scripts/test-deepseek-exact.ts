import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();

async function main() {
  const config = await prisma.siteConfig.findFirst();
  if (!config?.aiApiKey) {
    console.log('No AI config found');
    return;
  }

  const openai = new OpenAI({
    apiKey: config.aiApiKey,
    baseURL: config.aiEndpoint || undefined,
  });

  const model = config.aiModel || 'deepseek-chat';

  // 用户实际填写的内容（来自截图）
  const fields = {
    siteTitle: 'Shimond - 专业PVC产品制造商 | 人造革·地垫·桌垫保护器',
    siteDescription: 'Shimond成立于2010年，专业生产和销售高品质PVC人造革、PVC地垫、桌垫保护器等产品。采用进口原料，通过ISO 9001认证，产品远销全球50多个国家和地区。支持定制服务，欢迎询盘！',
    defaultSeoTitle: '',
    defaultSeoDescription: '',
    defaultSeoKeywords: ''
  };

  const fieldsText = Object.entries(fields)
    .filter(([, v]) => v && String(v).trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  const systemPrompt = `You are a professional SEO translation expert. Translate the given SEO metadata from Chinese to the following languages: English, Spanish, Arabic.

Rules:
1. Keep translations SEO-optimized and natural for each target language
2. Maintain appropriate length for SEO fields (title ~50-60 chars, description ~150-160 chars)
3. Keywords should be comma-separated and relevant to the local market
4. Return ONLY a valid JSON object with this exact structure:
{
  "en": { "siteTitle": "...", "siteDescription": "...", "defaultSeoTitle": "...", "defaultSeoDescription": "...", "defaultSeoKeywords": "..." },
  "es": { ... },
  "ar": { ... }
}
5. Include ALL target languages in the response
6. Do not include any markdown code blocks or extra text
7. Your ENTIRE response must be a single valid JSON object parseable by JSON.parse()`;

  const userPrompt = `Translate these SEO fields from Chinese:\n\n${fieldsText}\n\nTarget languages: English, Spanish, Arabic`;

  console.log('=== Simulating exact route.ts logic ===');
  console.log('Model:', model);

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });
    console.log('Used response_format path');
  } catch (apiError: any) {
    const errorMsg = String(apiError);
    console.log('response_format failed with:', errorMsg);
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
        max_tokens: 2000,
      });
      console.log('Used fallback path');
    } else {
      throw apiError;
    }
  }

  const content = completion.choices[0]?.message?.content?.trim() || '';
  console.log('\nRaw response:');
  console.log('---START---');
  console.log(content);
  console.log('---END---');
  console.log('\nLength:', content.length);

  // 检查是否有不可见字符
  const firstChar = content.charCodeAt(0);
  const lastChar = content.charCodeAt(content.length - 1);
  console.log('First char code:', firstChar, '(' + content[0] + ')');
  console.log('Last char code:', lastChar, '(' + content[content.length - 1] + ')');

  // 测试 extractJson 函数
  function extractJson(content: string): unknown {
    const trimmed = content.trim();
    try {
      return JSON.parse(trimmed);
    } catch {}

    const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch {}
    }

    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
      } catch {}
    }

    const firstBracket = trimmed.indexOf('[');
    const lastBracket = trimmed.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(trimmed.slice(firstBracket, lastBracket + 1));
      } catch {}
    }

    throw new Error('无法从 AI 响应中提取有效 JSON');
  }

  try {
    const result = extractJson(content);
    console.log('\nextractJson: SUCCESS');
    console.log('Languages:', Object.keys(result as any));
  } catch (e: any) {
    console.log('\nextractJson: FAILED -', e.message);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
