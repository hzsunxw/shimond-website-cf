'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SiteConfig {
  companyName: string
  companyNameEn: string
  siteTitle: string
  siteDescription: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  phone: string
  email: string
  address: string
  mapUrl: string
  defaultSeoTitle: string
  defaultSeoDescription: string
  defaultSeoKeywords: string
  socialLinks: {
    tiktok?: string
    facebook?: string
    instagram?: string
    linkedin?: string
    whatsapp?: string
  }
}

export default function SiteConfigPage() {
  const [config, setConfig] = useState<SiteConfig>({
    companyName: '',
    companyNameEn: '',
    siteTitle: '',
    siteDescription: '',
    primaryColor: '#0ea5e9',
    secondaryColor: '#f59e0b',
    accentColor: '#10b981',
    phone: '',
    email: '',
    address: '',
    mapUrl: '',
    defaultSeoTitle: '',
    defaultSeoDescription: '',
    defaultSeoKeywords: '',
    socialLinks: {},
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchConfig()
  }, [])

  async function fetchConfig() {
    try {
      setLoading(true)
      const res = await fetch('/api/site-config')
      const data = await res.json()
      if (res.ok) {
        setConfig({
          ...config,
          ...data,
          socialLinks: data.socialLinks || {},
        })
      }
    } catch (error) {
      console.error('Fetch config error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true)
      setMessage('')

      const res = await fetch('/api/site-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (res.ok) {
        setMessage('保存成功！')
      } else {
        setMessage('保存失败，请重试')
      }
    } catch (error) {
      setMessage('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  function handleChange(field: keyof SiteConfig, value: string) {
    setConfig((prev) => ({ ...prev, [field]: value }))
  }

  function handleSocialChange(platform: string, value: string) {
    setConfig((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">站点基础配置</h1>
        <p className="text-gray-500 mt-1">配置企业信息、品牌色、联系方式和社交媒体</p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-md ${
            message.includes('成功')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 企业信息 */}
        <Card>
          <CardHeader>
            <CardTitle>企业信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">企业名称（中文）</Label>
                <Input
                  id="companyName"
                  value={config.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder="Shimond"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyNameEn">企业名称（英文）</Label>
                <Input
                  id="companyNameEn"
                  value={config.companyNameEn}
                  onChange={(e) => handleChange('companyNameEn', e.target.value)}
                  placeholder="Shimond Industry"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteTitle">网站标题</Label>
              <Input
                id="siteTitle"
                value={config.siteTitle}
                onChange={(e) => handleChange('siteTitle', e.target.value)}
                placeholder="Shimond - Professional PVC Products"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">网站描述</Label>
              <textarea
                id="siteDescription"
                value={config.siteDescription}
                onChange={(e) => handleChange('siteDescription', e.target.value)}
                placeholder="Professional manufacturer of high-quality PVC products"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </CardContent>
        </Card>

        {/* 品牌颜色 */}
        <Card>
          <CardHeader>
            <CardTitle>品牌颜色</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">主色</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="primaryColor"
                    value={config.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="h-10 w-10 rounded border border-input"
                  />
                  <Input
                    value={config.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    placeholder="#0ea5e9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">辅助色</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="secondaryColor"
                    value={config.secondaryColor}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="h-10 w-10 rounded border border-input"
                  />
                  <Input
                    value={config.secondaryColor}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    placeholder="#f59e0b"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accentColor">强调色</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="accentColor"
                    value={config.accentColor}
                    onChange={(e) => handleChange('accentColor', e.target.value)}
                    className="h-10 w-10 rounded border border-input"
                  />
                  <Input
                    value={config.accentColor}
                    onChange={(e) => handleChange('accentColor', e.target.value)}
                    placeholder="#10b981"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 联系方式 */}
        <Card>
          <CardHeader>
            <CardTitle>联系方式</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">电话</Label>
                <Input
                  id="phone"
                  value={config.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+86 571 8273 8888"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={config.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="info@shimond.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">地址</Label>
              <Input
                id="address"
                value={config.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="No. 1688 Xingye Road, Xiaoshan District, Hangzhou, China"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mapUrl">地图链接</Label>
              <Input
                id="mapUrl"
                value={config.mapUrl}
                onChange={(e) => handleChange('mapUrl', e.target.value)}
                placeholder="https://maps.google.com/..."
              />
            </div>
          </CardContent>
        </Card>

        {/* SEO 配置 */}
        <Card>
          <CardHeader>
            <CardTitle>SEO 全局配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultSeoTitle">默认 SEO 标题</Label>
              <Input
                id="defaultSeoTitle"
                value={config.defaultSeoTitle}
                onChange={(e) => handleChange('defaultSeoTitle', e.target.value)}
                placeholder="Shimond - Professional PVC Products Manufacturer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultSeoDescription">默认 Meta Description</Label>
              <textarea
                id="defaultSeoDescription"
                value={config.defaultSeoDescription}
                onChange={(e) => handleChange('defaultSeoDescription', e.target.value)}
                placeholder="High-quality PVC leather, mats, and table protectors..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultSeoKeywords">默认 Meta Keywords</Label>
              <Input
                id="defaultSeoKeywords"
                value={config.defaultSeoKeywords}
                onChange={(e) => handleChange('defaultSeoKeywords', e.target.value)}
                placeholder="PVC leather, PVC mats, table protector, manufacturer"
              />
            </div>
          </CardContent>
        </Card>

        {/* 社交媒体 */}
        <Card>
          <CardHeader>
            <CardTitle>社交媒体链接</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'tiktok', label: 'TikTok' },
                { key: 'facebook', label: 'Facebook' },
                { key: 'instagram', label: 'Instagram' },
                { key: 'linkedin', label: 'LinkedIn' },
                { key: 'whatsapp', label: 'WhatsApp' },
                { key: 'youtube', label: 'YouTube' },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    value={config.socialLinks[key as keyof typeof config.socialLinks] || ''}
                    onChange={(e) => handleSocialChange(key, e.target.value)}
                    placeholder={`https://${key}.com/...`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? '保存中...' : '保存配置'}
          </Button>
        </div>
      </form>
    </div>
  )
}
