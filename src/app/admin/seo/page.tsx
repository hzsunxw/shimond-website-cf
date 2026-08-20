'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SeoFields {
  companyName: string
  siteTitle: string
  siteDescription: string
  defaultSeoTitle: string
  defaultSeoDescription: string
  defaultSeoKeywords: string
  address: string
  phone: string
  email: string
}

interface LangConfig {
  code: string
  label: string
  flag: string
}

const languages: LangConfig[] = [
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
]

const emptyFields: SeoFields = {
  companyName: '',
  siteTitle: '',
  siteDescription: '',
  defaultSeoTitle: '',
  defaultSeoDescription: '',
  defaultSeoKeywords: '',
  address: '',
  phone: '',
  email: '',
}

export default function SeoPage() {
  const [activeLang, setActiveLang] = useState('zh')
  const [configs, setConfigs] = useState<Record<string, SeoFields>>({
    zh: { ...emptyFields },
    en: { ...emptyFields },
    es: { ...emptyFields },
    ar: { ...emptyFields },
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [message, setMessage] = useState('')
  const [aiEnabled, setAiEnabled] = useState(false)

  useEffect(() => {
    fetchConfigs()
    fetchAiStatus()
  }, [])

  async function fetchConfigs() {
    try {
      setLoading(true)
      const res = await fetch('/api/site-seo-config')
      if (res.ok) {
        const data = await res.json()
        const next: Record<string, SeoFields> = {
          zh: { ...emptyFields },
          en: { ...emptyFields },
          es: { ...emptyFields },
          ar: { ...emptyFields },
        }
        for (const item of data) {
          if (next[item.languageCode]) {
            next[item.languageCode] = {
              companyName: item.companyName || '',
              siteTitle: item.siteTitle || '',
              siteDescription: item.siteDescription || '',
              defaultSeoTitle: item.defaultSeoTitle || '',
              defaultSeoDescription: item.defaultSeoDescription || '',
              defaultSeoKeywords: item.defaultSeoKeywords || '',
              address: item.address || '',
              phone: item.phone || '',
              email: item.email || '',
            }
          }
        }
        setConfigs(next)
      }
    } catch (error) {
      console.error('Fetch SEO configs error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchAiStatus() {
    try {
      const res = await fetch('/api/site-config')
      if (res.ok) {
        const data = await res.json()
        setAiEnabled(!!data.aiEnabled && !!data.aiApiKey)
      }
    } catch {
      // ignore
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      setMessage('')
      const results = await Promise.all(
        languages.map((lang) => {
          const fields = configs[lang.code]
          return fetch('/api/site-seo-config', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ languageCode: lang.code, ...fields }),
          })
        })
      )
      const allOk = results.every((res) => res.ok)
      if (allOk) {
        setMessage('保存成功！')
      } else {
        setMessage('部分语言保存失败，请重试')
      }
    } catch {
      setMessage('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  async function handleAiTranslate() {
    const sourceFields = configs[activeLang]
    const hasContent = Object.values(sourceFields).some((v) => v && v.trim())
    if (!hasContent) {
      setMessage('请先填写当前语言的 SEO 内容，再进行翻译')
      return
    }

    const targetLangs = languages
      .map((l) => l.code)
      .filter((code) => code !== activeLang)

    try {
      setTranslating(true)
      setMessage('AI 翻译中，请稍候...')
      const res = await fetch('/api/ai/translate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceLang: activeLang,
          targetLangs,
          fields: sourceFields,
        }),
      })
      const data = await res.json()
      if (res.ok && data.translations) {
        setConfigs((prev) => {
          const next = { ...prev }
          for (const [lang, fields] of Object.entries(data.translations)) {
            if (next[lang]) {
              next[lang] = { ...(fields as SeoFields) }
            }
          }
          return next
        })
        setMessage('AI 翻译完成！已填充到其他语言，请检查并分别保存。')
      } else {
        const detail = data.detail ? ` (${data.detail})` : ''
        setMessage((data.error || 'AI 翻译失败') + detail)
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      setMessage('AI 翻译失败：' + errMsg)
    } finally {
      setTranslating(false)
    }
  }

  function handleChange(field: keyof SeoFields, value: string) {
    setConfigs((prev) => ({
      ...prev,
      [activeLang]: { ...prev[activeLang], [field]: value },
    }))
  }

  const current = configs[activeLang]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO 设置</h1>
          <p className="text-gray-500 mt-1">配置多语言网站标题、描述及默认 SEO 元数据</p>
        </div>
        {aiEnabled && (
          <Button
            type="button"
            variant="outline"
            onClick={handleAiTranslate}
            disabled={translating}
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            {translating ? '翻译中...' : '🤖 AI 翻译到其他语言'}
          </Button>
        )}
      </div>

      {!aiEnabled && (
        <div className="mb-6 p-4 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-sm">
          💡 AI 翻译功能未启用。请先在「站点基础配置」页面设置 AI 参数。
        </div>
      )}

      {message && (
        <div
          className={`mb-6 p-4 rounded-md ${
            message.includes('成功') || message.includes('完成')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* Language Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-gray-200">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setActiveLang(lang.code)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeLang === lang.code
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="mr-1">{lang.flag}</span>
            {lang.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>网站基本信息 ({languages.find((l) => l.code === activeLang)?.label})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">企业名称</Label>
              <Input
                id="companyName"
                value={current.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="Shimond"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteTitle">网站标题</Label>
              <Input
                id="siteTitle"
                value={current.siteTitle}
                onChange={(e) => handleChange('siteTitle', e.target.value)}
                placeholder="Shimond - Professional PVC Products"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">网站描述</Label>
              <textarea
                id="siteDescription"
                value={current.siteDescription}
                onChange={(e) => handleChange('siteDescription', e.target.value)}
                placeholder="Professional manufacturer of high-quality PVC products"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>默认 SEO 配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultSeoTitle">默认 SEO 标题</Label>
              <Input
                id="defaultSeoTitle"
                value={current.defaultSeoTitle}
                onChange={(e) => handleChange('defaultSeoTitle', e.target.value)}
                placeholder="Shimond - Professional PVC Products Manufacturer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultSeoDescription">默认 Meta Description</Label>
              <textarea
                id="defaultSeoDescription"
                value={current.defaultSeoDescription}
                onChange={(e) => handleChange('defaultSeoDescription', e.target.value)}
                placeholder="High-quality PVC leather, mats, and table protectors..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultSeoKeywords">默认 Meta Keywords</Label>
              <Input
                id="defaultSeoKeywords"
                value={current.defaultSeoKeywords}
                onChange={(e) => handleChange('defaultSeoKeywords', e.target.value)}
                placeholder="PVC leather, PVC mats, table protector, manufacturer"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>联系方式</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">地址</Label>
              <textarea
                id="address"
                value={current.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="No. 1688 Xingye Road, Xiaoshan District, Hangzhou, China"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">电话</Label>
                <Input
                  id="phone"
                  value={current.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+86 18158194952"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={current.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="service@shimondpvc.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? '保存中...' : '保存所有语言'}
          </Button>
        </div>
      </div>
    </div>
  )
}
