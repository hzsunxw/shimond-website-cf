import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const config = await prisma.siteConfig.findFirst();
  if (!config) {
    console.log('No SiteConfig found');
    return;
  }
  console.log('AI Provider:', config.aiProvider);
  console.log('AI Model:', config.aiModel);
  console.log('AI Endpoint:', config.aiEndpoint);
  console.log('AI Enabled:', config.aiEnabled);
  console.log('AI Key (first 10 chars):', config.aiApiKey ? config.aiApiKey.substring(0, 10) + '...' : 'NOT SET');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
