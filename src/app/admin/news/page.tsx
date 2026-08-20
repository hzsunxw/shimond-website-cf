'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, Plus, Upload, X, Languages, Sparkles } from 'lucide-react'

interface NewsItem {
  id: string
  title: string
  titleEn: string | null
  titleEs: string | null
  titleAr: string | null
  slug: string
  summary: string | null
  summaryEn: string | null
  summaryEs: string | null
  summaryAr: string | null
  coverImage: string | null
  content: string | null
  contentEn: string | null
  contentEs: string | null
  contentAr: string | null
  author: string | null
  tags: string[]
  tagsEn: string[]
  tagsEs: string[]
  tagsAr: string[]
  publishAt: string | null
  status: string
  seoTitle: string | null
  seoDescription: string | null
  seoKeywords: string | null
  seoTitleEn: string | null
  seoDescriptionEn: string | null
  seoKeywordsEn: string | null
  seoTitleEs: string | null
  seoDescriptionEs: string | null
  seoKeywordsEs: string | null
  seoTitleAr: string | null
  seoDescriptionAr: string | null
  seoKeywordsAr: string | null
  ogImage: string | null
  canonicalUrl: string | null
  schemaOrg: unknown
  createdAt: string
}

const emptyForm = {
  title: '',
  titleEn: '',
  titleEs: '',
  titleAr: '',
  slug: '',
  summary: '',
  summaryEn: '',
  summaryEs: '',
  summaryAr: '',
  coverImage: '',
  content: '',
  contentEn: '',
  contentEs: '',
  contentAr: '',
  author: '',
  tags: [] as string[],
  tagsEn: [] as string[],
  tagsEs: [] as string[],
  tagsAr: [] as string[],
  publishAt: '',
  status: 'ACTIVE',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  seoTitleEn: '',
  seoDescriptionEn: '',
  seoKeywordsEn: '',
  seoTitleEs: '',
  seoDescriptionEs: '',
  seoKeywordsEs: '',
  seoTitleAr: '',
  seoDescriptionAr: '',
  seoKeywordsAr: '',
  ogImage: '',
  canonicalUrl: '',
  schemaOrg: '',
}

type TabKey = 'basic' | 'content' | 'seo'

const languages = [
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
]

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function getLangField(base: string, lang: string) {
  return lang === 'zh' ? base : `${base}${capitalize(lang)}`
}

export default function NewsAdminPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<NewsItem | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('basic')
  const [activeLang, setActiveLang] = useState('zh')
  const [translating, setTranslating] = useState(false)
  const [generatingSeo, setGeneratingSeo] = useState(false)
  const [generatingNews, setGeneratingNews] = useState(false)
  const [generatedPhotos, setGeneratedPhotos] = useState<{ id: string; url: string; thumb: string; alt: string }[]>([])
  const [showImagePicker, setShowImagePicker] = useState(false)

  const fetchNews = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/news')
      if (res.ok) {
        const data = await res.json()
        setNews(data)
      }
    } catch (err) {
      console.error('Fetch news error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setActiveLang('zh')
    setActiveTab('basic')
    setShowModal(true)
  }

  const openEdit = (item: NewsItem) => {
    setEditing(item)
    setForm({
      title: item.title || '',
      titleEn: item.titleEn || '',
      titleEs: item.titleEs || '',
      titleAr: item.titleAr || '',
      slug: item.slug,
      summary: item.summary || '',
      summaryEn: item.summaryEn || '',
      summaryEs: item.summaryEs || '',
      summaryAr: item.summaryAr || '',
      coverImage: item.coverImage || '',
      content: item.content || '',
      contentEn: item.contentEn || '',
      contentEs: item.contentEs || '',
      contentAr: item.contentAr || '',
      author: item.author || '',
      tags: Array.isArray(item.tags) ? item.tags : [],
      tagsEn: Array.isArray(item.tagsEn) ? item.tagsEn : [],
      tagsEs: Array.isArray(item.tagsEs) ? item.tagsEs : [],
      tagsAr: Array.isArray(item.tagsAr) ? item.tagsAr : [],
      publishAt: item.publishAt ? item.publishAt.slice(0, 10) : '',
      status: item.status,
      seoTitle: item.seoTitle || '',
      seoDescription: item.seoDescription || '',
      seoKeywords: item.seoKeywords || '',
      seoTitleEn: item.seoTitleEn || '',
      seoDescriptionEn: item.seoDescriptionEn || '',
      seoKeywordsEn: item.seoKeywordsEn || '',
      seoTitleEs: item.seoTitleEs || '',
      seoDescriptionEs: item.seoDescriptionEs || '',
      seoKeywordsEs: item.seoKeywordsEs || '',
      seoTitleAr: item.seoTitleAr || '',
      seoDescriptionAr: item.seoDescriptionAr || '',
      seoKeywordsAr: item.seoKeywordsAr || '',
      ogImage: item.ogImage || '',
      canonicalUrl: item.canonicalUrl || '',
      schemaOrg: item.schemaOrg ? JSON.stringify(item.schemaOrg) : '',
    })
    setActiveLang('zh')
    setActiveTab('basic')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setForm(emptyForm)
    setActiveLang('zh')
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const data = new FormData()
      data.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: data })
      if (res.ok) {
        const result = await res.json()
        setForm((prev) => ({ ...prev, coverImage: result.url }))
      } else {
        const err = await res.json()
        alert(err.error || '\u4e0a\u4f20\u5931\u8d25')
      }
    } catch (err) {
      console.error('Upload error:', err)
      alert('\u4e0a\u4f20\u5931\u8d25')
    } finally {
      setUploading(false)
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const newUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const data = new FormData()
        data.append('file', files[i])
        const res = await fetch('/api/upload', { method: 'POST', body: data })
        if (res.ok) {
          const result = await res.json()
          newUrls.push(result.url)
        }
      }
      setForm((prev) => ({ ...prev, coverImage: newUrls[0] || prev.coverImage }))
    } catch (err) {
      console.error('Gallery upload error:', err)
      alert('\u4e0a\u4f20\u5931\u8d25')
    } finally {
      setUploading(false)
    }
  }

  const removeGalleryImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      coverImage: '',
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.slug) return
    setSaving(true)
    try {
      const url = '/api/news'
      const method = editing ? 'PUT' : 'POST'
      const body: Record<string, unknown> = {
        title: form.title,
        titleEn: form.titleEn || null,
        titleEs: form.titleEs || null,
        titleAr: form.titleAr || null,
        slug: form.slug,
        summary: form.summary || null,
        summaryEn: form.summaryEn || null,
        summaryEs: form.summaryEs || null,
        summaryAr: form.summaryAr || null,
        coverImage: form.coverImage || null,
        content: form.content || null,
        contentEn: form.contentEn || null,
        contentEs: form.contentEs || null,
        contentAr: form.contentAr || null,
        author: form.author || null,
        tags: form.tags,
        tagsEn: form.tagsEn,
        tagsEs: form.tagsEs,
        tagsAr: form.tagsAr,
        publishAt: form.publishAt ? new Date(form.publishAt).toISOString() : null,
        status: form.status,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
        seoKeywords: form.seoKeywords || null,
        seoTitleEn: form.seoTitleEn || null,
        seoDescriptionEn: form.seoDescriptionEn || null,
        seoKeywordsEn: form.seoKeywordsEn || null,
        seoTitleEs: form.seoTitleEs || null,
        seoDescriptionEs: form.seoDescriptionEs || null,
        seoKeywordsEs: form.seoKeywordsEs || null,
        seoTitleAr: form.seoTitleAr || null,
        seoDescriptionAr: form.seoDescriptionAr || null,
        seoKeywordsAr: form.seoKeywordsAr || null,
        ogImage: form.ogImage || null,
        canonicalUrl: form.canonicalUrl || null,
        schemaOrg: form.schemaOrg ? JSON.parse(form.schemaOrg) : undefined,
      }
      if (editing) {
        body.id = editing.id
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        alert('新闻已保存')
        closeModal()
        fetchNews()
      } else {
        const err = await res.json()
        alert(err.error || '\u64cd\u4f5c\u5931\u8d25')
      }
    } catch (err) {
      console.error('Save news error:', err)
      alert('\u4fdd\u5b58\u5931\u8d25')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('\u786e\u5b9a\u8981\u5220\u9664\u8fd9\u6761\u65b0\u95fb\u5417\uff1f')) return
    try {
      const res = await fetch(`/api/news?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchNews()
      } else {
        const err = await res.json()
        alert(err.error || '\u5220\u9664\u5931\u8d25')
      }
    } catch (err) {
      console.error('Delete news error:', err)
      alert('\u5220\u9664\u5931\u8d25')
    }
  }

  const getLangValue = (base: string, lang: string) => {
    const field = getLangField(base, lang)
    return ((form as unknown) as Record<string, string>)[field] || ''
  }

  const setLangValue = (base: string, lang: string, value: string) => {
    const field = getLangField(base, lang)
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleAiGenerateNews = async () => {
    const topic = prompt('请输入新闻主题或关键词（留空则由 AI 自行决定）：') || ''
    const currentTitle = getLangValue('title', activeLang)

    if (!currentTitle.trim() && !topic.trim()) {
      if (!confirm('未输入主题，AI 将自行决定生成内容。是否继续？')) {
        return
      }
    }

    setGeneratingNews(true)
    try {
      const res = await fetch('/api/ai/generate-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic || undefined,
          title: currentTitle || undefined,
          lang: activeLang,
        }),
      })
      const result = await res.json()
      if (!res.ok || !result.success) {
        alert(result.error || result.detail || 'AI 生成失败')
        return
      }

      setForm((prev) => {
        const suffix = activeLang === 'zh' ? '' : capitalize(activeLang)
        return {
          ...prev,
          [getLangField('title', activeLang)]: result.title || '',
          slug: result.slug || prev.slug,
          [getLangField('summary', activeLang)]: result.summary || '',
          [getLangField('content', activeLang)]: result.content || '',
          [`tags${suffix}`]: Array.isArray(result.tags) ? result.tags : (prev as Record<string, unknown>)[`tags${suffix}`] as string[] || [],
          author: prev.author || 'Shimond编辑部',
          publishAt: prev.publishAt || new Date().toISOString().slice(0, 10),
          [getLangField('seoTitle', activeLang)]: result.seoTitle || '',
          [getLangField('seoDescription', activeLang)]: result.seoDescription || '',
          [getLangField('seoKeywords', activeLang)]: result.seoKeywords || '',
        }
      })

      if (result.imageKeywords) {
        try {
          const imgRes = await fetch(`/api/unsplash?q=${encodeURIComponent(result.imageKeywords)}`)
          const imgData = await imgRes.json()
          if (imgData.success && imgData.photos?.length > 0) {
            setGeneratedPhotos(imgData.photos)
            setShowImagePicker(true)
          }
        } catch {
          // ignore image search errors
        }
      }

      alert('AI 新闻生成完成！请检查内容并选择封面图片。')
    } catch (err) {
      console.error('AI generate news error:', err)
      alert('AI 生成失败')
    } finally {
      setGeneratingNews(false)
    }
  }

  const handleSelectImage = (url: string) => {
    setForm((prev) => ({ ...prev, coverImage: url }))
    setShowImagePicker(false)
  }

  const handleAiTranslate = async () => {
    const targetLangs = languages.filter((l) => l.code !== activeLang).map((l) => l.code)
    const fields: Record<string, string> = {}
    const fieldMap: Record<string, string> = {
      title: getLangField('title', activeLang),
      summary: getLangField('summary', activeLang),
      content: getLangField('content', activeLang),
      seoTitle: getLangField('seoTitle', activeLang),
      seoDescription: getLangField('seoDescription', activeLang),
      seoKeywords: getLangField('seoKeywords', activeLang),
    }

    for (const [key, formKey] of Object.entries(fieldMap)) {
      const value = ((form as unknown) as Record<string, string>)[formKey]
      if (value?.trim()) {
        fields[key] = value
      }
    }

    // tags 是数组，需要 join 成逗号分隔字符串传给 API
    const currentTags = ((form as unknown) as Record<string, string[]>)[getLangField('tags', activeLang)]
    if (Array.isArray(currentTags) && currentTags.length > 0) {
      fields.tags = currentTags.join(', ')
    }

    if (Object.keys(fields).length === 0) {
      alert('当前语言没有可翻译的内容，请先填写字段')
      return
    }

    if (!confirm(`将以「${languages.find((l) => l.code === activeLang)?.label}」为基准，翻译到其余 ${targetLangs.length} 种语言。现有内容将被覆盖，是否继续？`)) {
      return
    }

    setTranslating(true)
    try {
      const res = await fetch('/api/ai/translate-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceLang: activeLang,
          targetLangs,
          fields,
        }),
      })
      const result = await res.json()
      if (!res.ok || !result.success) {
        alert(result.error || result.detail || 'AI 翻译失败')
        return
      }

      const newForm = { ...form }
      const formRec = (newForm as unknown) as Record<string, string | string[]>
      for (const lang of targetLangs) {
        const trans = result.translations[lang]
        if (!trans) continue
        const suffix = lang === 'zh' ? '' : capitalize(lang)
        if (trans.title) formRec[`title${suffix}`] = trans.title
        if (trans.summary) formRec[`summary${suffix}`] = trans.summary
        if (trans.content) formRec[`content${suffix}`] = trans.content
        if (trans.seoTitle) formRec[`seoTitle${suffix}`] = trans.seoTitle
        if (trans.seoDescription) formRec[`seoDescription${suffix}`] = trans.seoDescription
        if (trans.seoKeywords) formRec[`seoKeywords${suffix}`] = trans.seoKeywords
        if (trans.tags) {
          formRec[`tags${suffix}`] = String(trans.tags)
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        }
      }
      setForm(newForm)
      alert('AI 翻译完成！已填充到其他语言，请检查。')
    } catch (err) {
      console.error('AI translate error:', err)
      alert('AI 翻译失败')
    } finally {
      setTranslating(false)
    }
  }

  const handleAiGenerateSeo = async () => {
    const title = getLangValue('title', activeLang)
    const summary = getLangValue('summary', activeLang)
    const content = getLangValue('content', activeLang)

    if (!title.trim()) {
      alert('请先在「基本信息」标签页填写标题，才能生成 SEO 内容')
      return
    }

    setGeneratingSeo(true)
    try {
      const res = await fetch('/api/ai/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          summary: summary || undefined,
          description: content || undefined,
          lang: activeLang,
        }),
      })
      const result = await res.json()
      if (!res.ok || !result.success) {
        console.error('[AI Generate SEO] server error:', result.error, 'raw:', result.raw)
        alert(result.error || result.detail || 'AI 生成失败')
        return
      }

      setForm((prev) => ({
        ...prev,
        [getLangField('seoTitle', activeLang)]: result.seoTitle || '',
        [getLangField('seoDescription', activeLang)]: result.seoDescription || '',
        [getLangField('seoKeywords', activeLang)]: result.seoKeywords || '',
      }))
      alert('AI SEO 生成完成！')
    } catch (err) {
      console.error('AI generate SEO error:', err)
      alert('AI 生成失败')
    } finally {
      setGeneratingSeo(false)
    }
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'basic', label: '\u57fa\u672c\u4fe1\u606f' },
    { key: 'content', label: '\u8be6\u7ec6\u5185\u5bb9' },
    { key: 'seo', label: 'SEO' },
  ]

  const inputCls =
    'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
  const selectCls =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

  return (
    <>
      <header className='bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-gray-900'>新闻管理</h2>
        <Button onClick={openCreate}>
          <Plus className='w-4 h-4 mr-1' />
          新建新闻
        </Button>
      </header>

      <div className='p-8'>
        <div className='bg-white rounded-lg shadow overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>标题</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Slug</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>作者</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>发布时间</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>状态</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>标签</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-10'>操作</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {news.map((item) => (
                <tr key={item.id}>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{item.title}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{item.slug}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{item.author || '--'}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {item.publishAt ? new Date(item.publishAt).toLocaleDateString('zh-CN') : '--'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${item.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {item.status === 'ACTIVE' ? '已发布' : '未发布'}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{item.tags?.join(', ') || '--'}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm space-x-2 sticky right-0 bg-white z-10'>
                    <button onClick={() => openEdit(item)} className='text-sky-600 hover:text-sky-800 font-medium inline-flex items-center gap-1'>
                      <Pencil className='w-3 h-3' />
                      编辑
                    </button>
                    <button onClick={() => handleDelete(item.id)} className='text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1'>
                      <Trash2 className='w-3 h-3' />
                      删除
                    </button>
                  </td>
                </tr>
              ))}
              {news.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className='px-6 py-4 text-center text-sm text-gray-500'>暂无数据，点击右上角新建新闻添加</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={7} className='px-6 py-4 text-center text-sm text-gray-500'>加载中...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-gray-900'>
                {editing ? '编辑新闻' : '新建新闻'}
              </h3>
              <button onClick={closeModal} className='text-gray-400 hover:text-gray-600 text-2xl leading-none'>
                &times;
              </button>
            </div>

            <div className='flex items-center justify-between px-6 py-2 bg-gray-50 border-b border-gray-200'>
              <div className='flex items-center gap-1'>
                <Languages className='w-4 h-4 text-gray-400 mr-1' />
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type='button'
                    onClick={() => setActiveLang(lang.code)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      activeLang === lang.code
                        ? 'bg-white text-sky-600 shadow-sm border border-gray-200 font-medium'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {lang.flag} {lang.label}
                  </button>
                ))}
              </div>
              <button
                type='button'
                onClick={handleAiGenerateNews}
                disabled={generatingNews}
                className='inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-blue-200'
              >
                <Sparkles className='w-3.5 h-3.5' />
                {generatingNews ? 'AI 生成中...' : '📝 AI 生成新闻'}
              </button>
              <button
                type='button'
                onClick={handleAiTranslate}
                disabled={translating}
                className='inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-purple-200'
              >
                <Sparkles className='w-3.5 h-3.5' />
                {translating ? 'AI 翻译中...' : '🤖 AI 翻译到其他语言'}
              </button>
            </div>

            <div className='flex border-b border-gray-200'>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-sky-500 text-sky-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={handleSubmit}
              className={`px-6 py-4 space-y-4 ${activeLang === 'ar' ? 'text-right' : ''}`}
              dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
            >
              {activeTab === 'basic' && (
                <>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      {activeLang === 'zh' ? '标题' : activeLang === 'en' ? 'Title' : activeLang === 'es' ? 'Título' : 'العنوان'}
                      {activeLang === 'zh' ? ' *' : ''}
                    </label>
                    <Input
                      value={getLangValue('title', activeLang)}
                      onChange={(e) => setLangValue('title', activeLang, e.target.value)}
                      placeholder={
                        activeLang === 'zh'
                          ? '请输入新闻标题'
                          : activeLang === 'en'
                            ? 'Enter news title'
                            : activeLang === 'es'
                              ? 'Ingrese el título de la noticia'
                              : 'أدخل عنوان الخبر'
                      }
                      required={activeLang === 'zh'}
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Slug *</label>
                    <Input
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder='URL 标识，如: hydraulic-press'
                      required
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>状态</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className={selectCls}
                      >
                        <option value='ACTIVE'>已发布</option>
                        <option value='INACTIVE'>未发布</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>发布时间</label>
                      <Input
                        type='date'
                        value={form.publishAt}
                        onChange={(e) => setForm({ ...form, publishAt: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>作者</label>
                      <Input
                        value={form.author}
                        onChange={(e) => setForm({ ...form, author: e.target.value })}
                        placeholder='作者名称'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>标签</label>
                      <Input
                        value={(() => {
                          const arr = ((form as unknown) as Record<string, string[]>)[getLangField('tags', activeLang)]
                          return Array.isArray(arr) ? arr.join(', ') : ''
                        })()}
                        onChange={(e) => {
                          const field = getLangField('tags', activeLang)
                          setForm((prev) => ({
                            ...prev,
                            [field]: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                          }))
                        }}
                        placeholder='标签1, 标签2, 标签3'
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      {activeLang === 'zh' ? '摘要' : activeLang === 'en' ? 'Summary' : activeLang === 'es' ? 'Resumen' : 'الملخص'}
                    </label>
                    <textarea
                      value={getLangValue('summary', activeLang)}
                      onChange={(e) => setLangValue('summary', activeLang, e.target.value)}
                      placeholder={
                        activeLang === 'zh'
                          ? '简短描述'
                          : activeLang === 'en'
                            ? 'Short description'
                            : activeLang === 'es'
                              ? 'Descripción breve'
                              : 'وصف مختصر'
                      }
                      rows={3}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>封面图片</label>
                    <div className='space-y-2'>
                      <input
                        type='file'
                        accept='image/*'
                        onChange={handleCoverUpload}
                        disabled={uploading}
                        className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 disabled:opacity-50'
                      />
                      {uploading && <p className='text-sm text-gray-500'>上传中...</p>}
                      {form.coverImage && (
                        <div className='relative'>
                          <img
                            src={form.coverImage}
                            alt='封面预览'
                            className='w-32 h-20 object-cover rounded-md border border-gray-200'
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>或手动输入图片 URL</label>
                    <Input
                      value={form.coverImage}
                      onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                      placeholder='https://example.com/image.jpg'
                    />
                  </div>

                  {showImagePicker && generatedPhotos.length > 0 && (
                    <div className='border border-gray-200 rounded-lg p-4 bg-gray-50'>
                      <div className='flex items-center justify-between mb-3'>
                        <label className='text-sm font-medium text-gray-700'>AI 推荐封面图片（点击选择）</label>
                        <button
                          type='button'
                          onClick={() => setShowImagePicker(false)}
                          className='text-gray-400 hover:text-gray-600'
                        >
                          <X className='w-4 h-4' />
                        </button>
                      </div>
                      <div className='grid grid-cols-4 gap-3'>
                        {generatedPhotos.map((photo) => (
                          <button
                            key={photo.id}
                            type='button'
                            onClick={() => handleSelectImage(photo.url)}
                            className='relative group rounded-lg overflow-hidden border-2 border-transparent hover:border-sky-500 transition-colors'
                          >
                            <img
                              src={photo.thumb}
                              alt={photo.alt}
                              className='w-full h-20 object-cover'
                            />
                            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors' />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'content' && (
                <>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      {activeLang === 'zh'
                        ? '正文内容'
                        : activeLang === 'en'
                          ? 'Content'
                          : activeLang === 'es'
                            ? 'Contenido'
                            : 'المحتوى'}
                    </label>
                    <textarea
                      value={getLangValue('content', activeLang)}
                      onChange={(e) => setLangValue('content', activeLang, e.target.value)}
                      placeholder={
                        activeLang === 'zh'
                          ? '新闻正文内容'
                          : activeLang === 'en'
                            ? 'News content'
                            : activeLang === 'es'
                              ? 'Contenido de la noticia'
                              : 'محتوى الخبر'
                      }
                      rows={12}
                      className={inputCls}
                    />
                  </div>
                </>
              )}

              {activeTab === 'seo' && (
                <>
                  <div className='flex items-center justify-between mb-2'>
                    <p className='text-sm text-gray-500'>
                      {activeLang === 'zh'
                        ? '当前语言：中文'
                        : activeLang === 'en'
                          ? 'Current language: English'
                          : activeLang === 'es'
                            ? 'Idioma actual: Español'
                            : 'اللغة الحالية: العربية'}
                    </p>
                    <button
                      type='button'
                      onClick={handleAiGenerateSeo}
                      disabled={generatingSeo}
                      className='inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-emerald-200'
                    >
                      <Sparkles className='w-3.5 h-3.5' />
                      {generatingSeo ? 'AI 生成中...' : '✨ AI 自动生成 SEO'}
                    </button>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>SEO Title</label>
                    <Input
                      value={getLangValue('seoTitle', activeLang)}
                      onChange={(e) => setLangValue('seoTitle', activeLang, e.target.value)}
                      placeholder={
                        activeLang === 'zh'
                          ? 'SEO 标题'
                          : activeLang === 'en'
                            ? 'SEO Title'
                            : activeLang === 'es'
                              ? 'Título SEO'
                              : 'عنوان SEO'
                      }
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>SEO Description</label>
                    <textarea
                      value={getLangValue('seoDescription', activeLang)}
                      onChange={(e) => setLangValue('seoDescription', activeLang, e.target.value)}
                      placeholder={
                        activeLang === 'zh'
                          ? 'SEO 描述'
                          : activeLang === 'en'
                            ? 'SEO Description'
                            : activeLang === 'es'
                              ? 'Descripción SEO'
                              : 'وصف SEO'
                      }
                      rows={4}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>SEO Keywords</label>
                    <Input
                      value={getLangValue('seoKeywords', activeLang)}
                      onChange={(e) => setLangValue('seoKeywords', activeLang, e.target.value)}
                      placeholder={
                        activeLang === 'zh'
                          ? '关键词，逗号分隔'
                          : activeLang === 'en'
                            ? 'Keywords, comma separated'
                            : activeLang === 'es'
                              ? 'Palabras clave, separadas por comas'
                              : 'الكلمات الرئيسية، مفصولة بفواصل'
                      }
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>OG Image URL</label>
                    <Input
                      value={form.ogImage}
                      onChange={(e) => setForm({ ...form, ogImage: e.target.value })}
                      placeholder='https://example.com/og-image.jpg'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Canonical URL</label>
                    <Input
                      value={form.canonicalUrl}
                      onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                      placeholder='https://example.com/original-source'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Schema.org JSON</label>
                    <textarea
                      value={form.schemaOrg}
                      onChange={(e) => setForm({ ...form, schemaOrg: e.target.value })}
                      placeholder={'{ "@type": "NewsArticle", "headline": "..." }'}
                      rows={4}
                      className={inputCls}
                    />
                  </div>
                </>
              )}

              <div className='pt-4 flex justify-end space-x-3 border-t border-gray-200'>
                <Button type='button' variant='outline' onClick={closeModal}>
                  取消
                </Button>
                <Button type='submit' disabled={saving}>
                  {saving ? '保存中...' : '保存'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
