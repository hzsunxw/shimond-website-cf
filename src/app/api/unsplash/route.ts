import { NextResponse } from 'next/server'

interface Photo {
  id: string
  url: string
  thumb: string
  alt: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ error: '缺少搜索关键词' }, { status: 400 })
    }

    const accessKey = process.env.UNSPLASH_ACCESS_KEY

    // If Unsplash Access Key is configured, use official API
    if (accessKey) {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=8&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${accessKey}`,
          },
        }
      )

      if (res.ok) {
        const data = await res.json()
        const photos: Photo[] = (data.results || []).map((photo: {
          id: string
          urls: { regular: string; thumb: string }
          alt_description: string | null
        }) => ({
          id: photo.id,
          url: photo.urls.regular,
          thumb: photo.urls.thumb,
          alt: photo.alt_description || query,
        }))
        return NextResponse.json({ success: true, photos })
      }
    }

    // Fallback: use Lorem Picsum (source.unsplash.com is deprecated since 2024)
    // Picsum doesn't support keyword search, but seed-based URLs give stable images per query.
    const seed = encodeURIComponent(query.replace(/\s+/g, '-').toLowerCase())
    const photos: Photo[] = Array.from({ length: 6 }, (_, i) => ({
      id: `picsum-${i}`,
      url: `https://picsum.photos/seed/${seed}-${i}/800/600`,
      thumb: `https://picsum.photos/seed/${seed}-${i}/200/150`,
      alt: query,
    }))

    return NextResponse.json({ success: true, photos, fallback: true })
  } catch (error) {
    console.error('Unsplash search error:', error)
    return NextResponse.json({ error: '图片搜索失败' }, { status: 500 })
  }
}
