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

  // 测试包含特殊字符的内容
  const testCases = [
    {
      name: '包含英文双引号',
      fields: {
        siteTitle: 'Shimond - "专业"PVC制造商',
        siteDescription: '所谓"高品质"就是指...',
        defaultSeoTitle: '',
        defaultSeoDescription: '',
        defaultSeoKeywords: ''
      }
    },
    {
      name: '包含反斜杠',
      fields: {
        siteTitle: 'Shimond \\ PVC',
        siteDescription: '路径 C:\\Users\\test',
        defaultSeoTitle: '',
        defaultSeoDescription: '',
        defaultSeoKeywords: ''
      }
    },
    {
      name: '包含换行符',
      fields: {
        siteTitle: 'Shimond',
        siteDescription: '第一行\n第二行\n第三行',
        defaultSeoTitle: '',
        defaultSeoDescription: '',
        defaultSeoKeywords: ''
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n=== Test: ${testCase.name} ===`);

    const fieldsText = Object.entries(testCase.fields)
      .filter(([, v]) => v && String(v).trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

    const systemPrompt = `You are a professional SEO translation expert. Translate the given SEO metadata from Chinese to the following languages: English.

Rules:
1. Keep translations SEO-optimized and natural for each target language
2. Return ONLY a valid JSON object with this exact structure:
{
  "en": { "siteTitle": "...", "siteDescription": "...", "defaultSeoTitle": "...", "defaultSeoDescription": "...", "defaultSeoKeywords": "..." }
}
3. Your ENTIRE response must be a single valid JSON object parseable by JSON.parse()`;

    const userPrompt = `Translate these SEO fields from Chinese:\n\n${fieldsText}\n\nTarget languages: English`;

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
      console.log('Response length:', content.length);
      console.log('First/last char:', content.charCodeAt(0), content.charCodeAt(content.length - 1));

      try {
        JSON.parse(content);
        console.log('Direct JSON.parse: SUCCESS');
      } catch {
        console.log('Direct JSON.parse: FAILED');
        console.log('Raw (first 200 chars):', content.substring(0, 200));
      }
    } catch (error: any) {
      console.error('API Error:', error.message || error);
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
