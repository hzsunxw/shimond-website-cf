import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: '没有文件' }, { status: 400 })
    }

    // 只接受图片
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '只支持图片文件' }, { status: 400 })
    }

    // 限制 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: '文件超过 5MB' }, { status: 400 })
    }

    // 生成文件名: timestamp-originalname
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.\-]/g, '_')
    const filename = `${timestamp}-${originalName}`

    // 上传到 R2
    const { env } = getCloudflareContext()
    await env.BUCKET.put(filename, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    })

    const url = `/api/uploads/${filename}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: '上传失败' }, { status: 500 })
  }
}
