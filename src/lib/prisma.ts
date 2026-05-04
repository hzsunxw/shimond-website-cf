// Development mode: Use mock database if PostgreSQL is not available
// Production: Use real Prisma Client

let prisma: any

if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL) {
  const { PrismaClient } = require('@prisma/client')
  const globalForPrisma = global as unknown as { prisma: typeof PrismaClient }
  prisma = globalForPrisma.prisma || new PrismaClient()
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
} else {
  // Use mock database for development
  const { prisma: mockPrisma } = require('./prisma-mock')
  prisma = mockPrisma
}

export { prisma }
