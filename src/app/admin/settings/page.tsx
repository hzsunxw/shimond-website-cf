'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SiteConfig {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  mapUrl: string
  socialLinks: {
    tiktok?: string
    facebook?: string
    instagram?: string
    linkedin?: string
    whatsapp?: string
  }
  aiEnabled: boolean
  aiProvider: string
  aiApiKey: string
  aiEndpoint: string
  aiModel: string
}

export default function SiteConfigPage() {
  const [config, setConfig] = useState<SiteConfig>({
    primaryColor: '#0ea5e9',
    secondaryColor: '#f59e0b',
    accentColor: '#10b981',
    mapUrl: '',
    socialLinks: {},
    aiEnabled: false,
    aiProvider: '',
    aiApiKey: '',
    aiEndpoint: '',
    aiModel: '',
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
        <p className="text-gray-500 mt-1">配置品牌色、社交媒体和 AI 参数</p>
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

        {/* AI 参数设置 */}
        <Card>
          <CardHeader>
            <CardTitle>AI 参数设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aiEnabled">启用 AI</Label>
                <select
                  id="aiEnabled"
                  value={config.aiEnabled ? 'true' : 'false'}
                  onChange={(e) => setConfig((prev) => ({ ...prev, aiEnabled: e.target.value === 'true' }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="false">关闭</option>
                  <option value="true">开启</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="aiProvider">AI 提供商</Label>
                <select
                  id="aiProvider"
                  value={config.aiProvider}
                  onChange={(e) => handleChange('aiProvider', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">请选择</option>
                  <option value="openai">OpenAI</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="openrouter">OpenRouter</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aiApiKey">API Key</Label>
              <Input
                id="aiApiKey"
                type="password"
                value={config.aiApiKey}
                onChange={(e) => handleChange('aiApiKey', e.target.value)}
                placeholder="sk-..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aiEndpoint">自定义 API 端点（Base URL）</Label>
              <Input
                id="aiEndpoint"
                value={config.aiEndpoint}
                onChange={(e) => handleChange('aiEndpoint', e.target.value)}
                placeholder="https://api.openai.com/v1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aiModel">模型名称</Label>
              <Input
                id="aiModel"
                value={config.aiModel}
                onChange={(e) => handleChange('aiModel', e.target.value)}
                placeholder="gpt-4o-mini"
              />
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
