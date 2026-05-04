const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function test() {
  const prisma = new PrismaClient();
  
  // 查找用户
  const user = await prisma.adminUser.findUnique({
    where: { username: 'admin' }
  });
  
  console.log('User found:', user ? 'yes' : 'no');
  console.log('User status:', user?.status);
  console.log('Password hash:', user?.password);
  
  // 验证密码
  const isValid = await bcrypt.compare('admin123', user.password);
  console.log('Password valid:', isValid);
  
  await prisma.$disconnect();
}

test().catch(console.error);
