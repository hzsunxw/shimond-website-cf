import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// 上传目录：优先用环境变量，否则回退到项目根目录的 public/uploads
// standalone 模式下 process.cwd() 是 .next/standalone，需向上回溯两级
function getUploadsDir() {
  if (process.env.UPLOADS_DIR) return process.env.UPLOADS_DIR
  return join(process.cwd(), '..', '..', 'public', 'uploads')
}

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

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 生成文件名: timestamp-originalname
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.\-]/g, '_')
    const filename = `${timestamp}-${originalName}`

    const uploadDir = getUploadsDir()
    const filepath = join(uploadDir, filename)

    // 确保上传目录存在
    await mkdir(uploadDir, { recursive: true })
    await writeFile(filepath, buffer)

    const url = `/api/uploads/${filename}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: '上传失败' }, { status: 500 })
  }
}
