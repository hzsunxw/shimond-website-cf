import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// 读取目录：与 upload/route.ts 保持一致
function getUploadsDir() {
  if (process.env.UPLOADS_DIR) return process.env.UPLOADS_DIR
  return join(process.cwd(), '..', '..', 'public', 'uploads')
}

export async function GET(
  _request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const filepath = join(getUploadsDir(), params.filename)
    if (!existsSync(filepath)) {
      return new NextResponse('Not Found', { status: 404 })
    }
    const buffer = await readFile(filepath)
    const ext = params.filename.split('.').pop()?.toLowerCase()
    const mime: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
    }
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mime[ext || ''] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Not Found', { status: 404 })
  }
}
