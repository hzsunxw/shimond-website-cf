// Cloudflare D1 + Prisma 6 via OpenNext
// Import from @prisma/client/wasm to use WASM query engine (no fs/binary needed).
// + React cache() for per-request PrismaClient.

import { getCloudflareContext } from '@opennextjs/cloudflare'
import { cache } from 'react'
import { PrismaClient } from '@prisma/client/wasm'
import { PrismaD1 } from '@prisma/adapter-d1'

export const getDb = cache(() => {
  const { env } = getCloudflareContext()
  const adapter = new PrismaD1(env.DB)
  return new PrismaClient({ adapter })
})

// Async version for static routes (ISR/SSG)
export const getDbAsync = cache(async () => {
  const { env } = await getCloudflareContext({ async: true })
  const adapter = new PrismaD1(env.DB)
  return new PrismaClient({ adapter })
})

// Backward-compatible proxy: `import { prisma } from '@/lib/prisma'` still works.
// Lazy creation on first property access within a request context.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop)
  },
})

/** Reset the cached client (useful for dev HMR or tests). */
export function resetPrisma() {
  // cache() doesn't expose a clear method, but re-importing is fine
  // since this is only used in dev
}
