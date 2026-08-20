import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  try {
    const { env } = getCloudflareContext()
    const object = await env.BUCKET.get(filename)

    if (!object) {
      return new NextResponse('Not Found', { status: 404 })
    }

    const ext = filename.split('.').pop()?.toLowerCase()
    const headers = new Headers()
    headers.set('Content-Type', object.httpMetadata?.contentType || MIME[ext || ''] || 'application/octet-stream')
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')

    const data = await object.arrayBuffer()
    return new NextResponse(data, { headers })
  } catch {
    return new NextResponse('Not Found', { status: 404 })
  }
}
