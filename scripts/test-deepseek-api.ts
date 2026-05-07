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

  const userPrompt = `Translate these SEO fields from Chinese:

siteTitle: Shimond - 专业PVC产品制造商 | 人造革·地垫·桌垫保护器
siteDescription: Shimond成立于2010年，专业生产和销售高品质PVC人造革、PVC地垫、桌垫保护器等产品。采用进口原料，通过ISO 9001认证，产品远销全球50多个国家和地区。支持定制服务，欢迎询盘！
defaultSeoTitle: 高品质PVC产品制造商 | Shimond专业人造革与地垫供应商
defaultSeoDescription: Shimond是值得信赖的PVC产品制造商，提供人造革、地板垫、桌垫保护器等高品质产品。15年行业经验，ISO认证，支持OEM/ODM定制。立即联系我们获取报价！
defaultSeoKeywords: PVC人造革, PVC地垫, 桌垫保护器, PVC产品制造商, 人造革厂家, PVC地板垫, 合成皮革, PVC定制, 工业用地垫, 家具皮革

Target languages: English, Spanish, Arabic`;

  console.log('=== Test 1: Without response_format ===');
  console.log('Model:', model);
  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content?.trim() || '';
    console.log('\nRaw response:');
    console.log('---START---');
    console.log(content);
    console.log('---END---');
    console.log('\nLength:', content.length);
    try {
      const parsed = JSON.parse(content);
      console.log('Direct JSON.parse: SUCCESS');
      console.log('Languages:', Object.keys(parsed));
    } catch {
      console.log('Direct JSON.parse: FAILED');
    }
  } catch (error: any) {
    console.error('API Error:', error.message || error);
  }

  console.log('\n\n=== Test 2: With response_format ===');
  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content?.trim() || '';
    console.log('\nRaw response:');
    console.log('---START---');
    console.log(content);
    console.log('---END---');
    console.log('\nLength:', content.length);
    try {
      const parsed = JSON.parse(content);
      console.log('Direct JSON.parse: SUCCESS');
      console.log('Languages:', Object.keys(parsed));
    } catch {
      console.log('Direct JSON.parse: FAILED');
    }
  } catch (error: any) {
    console.error('API Error:', error.message || error);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
