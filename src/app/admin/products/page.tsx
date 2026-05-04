'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, Plus, Upload, X } from 'lucide-react'

interface Product {
  id: string
  title: string
  titleEn: string | null
  slug: string
  summary: string | null
  coverImage: string | null
  gallery: string[]
  description: string | null
  descriptionEn: string | null
  price: string | null
  priceUnit: string | null
  priceCurrency: string | null
  priceStrategy: string
  sortOrder: number
  status: string
  seoTitle: string | null
  seoDescription: string | null
  seoKeywords: string | null
  createdAt: string
  updatedAt: string
}

const emptyForm = {
  title: '',
  titleEn: '',
  slug: '',
  summary: '',
  coverImage: '',
  gallery: [] as string[],
  description: '',
  descriptionEn: '',
  price: '',
  priceUnit: '',
  priceCurrency: 'USD',
  priceStrategy: 'CONTACT',
  sortOrder: 0,
  status: 'ACTIVE',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
}

type TabKey = 'basic' | 'content' | 'seo'

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('basic')

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (err) {
      console.error('Fetch products error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setActiveTab('basic')
    setShowModal(true)
  }

  const openEdit = (item: Product) => {
    setEditing(item)
    setForm({
      title: item.title,
      titleEn: item.titleEn || '',
      slug: item.slug,
      summary: item.summary || '',
      coverImage: item.coverImage || '',
      gallery: Array.isArray(item.gallery) ? item.gallery : [],
      description: item.description || '',
      descriptionEn: item.descriptionEn || '',
      price: item.price || '',
      priceUnit: item.priceUnit || '',
      priceCurrency: item.priceCurrency || 'USD',
      priceStrategy: item.priceStrategy || 'CONTACT',
      sortOrder: item.sortOrder,
      status: item.status,
      seoTitle: item.seoTitle || '',
      seoDescription: item.seoDescription || '',
      seoKeywords: item.seoKeywords || '',
    })
    setActiveTab('basic')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setForm(emptyForm)
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
      setForm((prev) => ({ ...prev, gallery: [...prev.gallery, ...newUrls] }))
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
      gallery: prev.gallery.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.slug) return
    setSaving(true)
    try {
      const url = '/api/products'
      const method = editing ? 'PUT' : 'POST'
      const body: Record<string, unknown> = {
        title: form.title,
        titleEn: form.titleEn || null,
        slug: form.slug,
        summary: form.summary || null,
        coverImage: form.coverImage || null,
        gallery: form.gallery,
        description: form.description || null,
        descriptionEn: form.descriptionEn || null,
        price: form.price ? parseFloat(form.price) : null,
        priceUnit: form.priceUnit || null,
        priceCurrency: form.priceCurrency || 'USD',
        priceStrategy: form.priceStrategy,
        sortOrder: form.sortOrder,
        status: form.status,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
        seoKeywords: form.seoKeywords || null,
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
        closeModal()
        fetchProducts()
      } else {
        const err = await res.json()
        alert(err.error || '\u64cd\u4f5c\u5931\u8d25')
      }
    } catch (err) {
      console.error('Save product error:', err)
      alert('\u4fdd\u5b58\u5931\u8d25')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('\u786e\u5b9a\u8981\u5220\u9664\u8fd9\u4e2a\u4ea7\u54c1\u5417\uff1f')) return
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchProducts()
      } else {
        const err = await res.json()
        alert(err.error || '\u5220\u9664\u5931\u8d25')
      }
    } catch (err) {
      console.error('Delete product error:', err)
      alert('\u5220\u9664\u5931\u8d25')
    }
  }

  const renderPrice = (item: Product) => {
    if (item.priceStrategy === 'CONTACT') return '\u8054\u7cfb\u8be2\u4ef7'
    if (item.price) {
      return `${item.price} ${item.priceCurrency || 'USD'}`
    }
    return '--'
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
        <h2 className='text-lg font-semibold text-gray-900'>{'\u4ea7\u54c1\u7ba1\u7406'}</h2>
        <Button onClick={openCreate}>
          <Plus className='w-4 h-4 mr-1' />
          {'\u65b0\u5efa\u4ea7\u54c1'}
        </Button>
      </header>

      <div className='p-8'>
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>{'\u5c01\u9762'}</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>{'\u6807\u9898'}</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Slug</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>{'\u4ef7\u683c'}</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>{'\u72b6\u6001'}</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>{'\u6392\u5e8f'}</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>{'\u64cd\u4f5c'}</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {products.map((item) => (
                <tr key={item.id}>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    {item.coverImage ? (
                      <img src={item.coverImage} alt={item.title} className='w-16 h-10 object-cover rounded border border-gray-200' />
                    ) : (
                      <span className='text-gray-400'>--</span>
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{item.title}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{item.slug}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{renderPrice(item)}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${item.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {item.status === 'ACTIVE' ? '\u5df2\u53d1\u5e03' : '\u672a\u53d1\u5e03'}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{item.sortOrder}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm space-x-2'>
                    <button onClick={() => openEdit(item)} className='text-sky-600 hover:text-sky-800 font-medium inline-flex items-center gap-1'>
                      <Pencil className='w-3 h-3' />
                      {'\u7f16\u8f91'}
                    </button>
                    <button onClick={() => handleDelete(item.id)} className='text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1'>
                      <Trash2 className='w-3 h-3' />
                      {'\u5220\u9664'}
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className='px-6 py-4 text-center text-sm text-gray-500'>{'\u6682\u65e0\u6570\u636e\uff0c\u70b9\u51fb\u53f3\u4e0a\u89d2\u65b0\u5efa\u4ea7\u54c1\u6dfb\u52a0'}</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={7} className='px-6 py-4 text-center text-sm text-gray-500'>{'\u52a0\u8f7d\u4e2d...'}</td>
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
                {editing ? '\u7f16\u8f91\u4ea7\u54c1' : '\u65b0\u5efa\u4ea7\u54c1'}
              </h3>
              <button onClick={closeModal} className='text-gray-400 hover:text-gray-600 text-2xl leading-none'>
                &times;
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

            <form onSubmit={handleSubmit} className='px-6 py-4 space-y-4'>
              {activeTab === 'basic' && (
                <>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>{'\u6807\u9898'} *</label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder={'\u8bf7\u8f93\u5165\u4ea7\u54c1\u6807\u9898'}
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>{'\u82f1\u6587\u6807\u9898'}</label>
                    <Input
                      value={form.titleEn}
                      onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                      placeholder='English title'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Slug *</label>
                    <Input
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder='URL \u6807\u8bc6\uff0c\u5982: hydraulic-press'
                      required
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>{'\u72b6\u6001'}</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className={selectCls}
                      >
                        <option value='ACTIVE'>{'\u5df2\u53d1\u5e03'}</option>
                        <option value='INACTIVE'>{'\u672a\u53d1\u5e03'}</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>{'\u6392\u5e8f'}</label>
                      <Input
                        type='number'
                        value={form.sortOrder}
                        onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>{'\u6458\u8981'}</label>
                    <textarea
                      value={form.summary}
                      onChange={(e) => setForm({ ...form, summary: e.target.value })}
                      placeholder={'\u7b80\u77ed\u63cf\u8ff0'}
                      rows={3}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>{'\u5c01\u9762\u56fe\u7247'}</label>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <label className='inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent cursor-pointer'>
                          <Upload className='w-4 h-4' />
                          {uploading ? '\u4e0a\u4f20\u4e2d...' : '\u9009\u62e9\u6587\u4ef6'}
                          <input
                            type='file'
                            accept='image/*'
                            onChange={handleCoverUpload}
                            disabled={uploading}
                            className='hidden'
                          />
                        </label>
                        <Input
                          value={form.coverImage}
                          onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                          placeholder={'\u6216\u624b\u52a8\u8f93\u5165\u56fe\u7247 URL'}
                          className='flex-1'
                        />
                      </div>
                      {form.coverImage && (
                        <img src={form.coverImage} alt='cover' className='w-32 h-20 object-cover rounded-md border border-gray-200' />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>{'\u4ea7\u54c1\u56fe\u96c6'}</label>
                    <div className='space-y-2'>
                      <label className='inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent cursor-pointer'>
                        <Upload className='w-4 h-4' />
                        {uploading ? '\u4e0a\u4f20\u4e2d...' : '\u6dfb\u52a0\u56fe\u7247'}
                        <input
                          type='file'
                          accept='image/*'
                          multiple
                          onChange={handleGalleryUpload}
                          disabled={uploading}
                          className='hidden'
                        />
                      </label>
                      {form.gallery.length > 0 && (
                        <div className='flex flex-wrap gap-2'>
                          {form.gallery.map((url, index) => (
                            <div key={index} className='relative group'>
                              <img src={url} alt={'gallery-' + (index + 1)} className='w-24 h-16 object-cover rounded-md border border-gray-200' />
                              <button
                                type='button'
                                onClick={() => removeGalleryImage(index)}
                                className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
                              >
                                <X className='w-3 h-3' />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='border-t border-gray-200 pt-4'>
                    <h4 className='text-sm font-medium text-gray-900 mb-3'>{'\u4ef7\u683c\u8bbe\u7f6e'}</h4>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>{'\u4ef7\u683c\u7b56\u7565'}</label>
                        <select
                          value={form.priceStrategy}
                          onChange={(e) => setForm({ ...form, priceStrategy: e.target.value })}
                          className={selectCls}
                        >
                          <option value='CONTACT'>{'\u8054\u7cfb\u8be2\u4ef7'}</option>
                          <option value='EXACT'>{'\u56fa\u5b9a\u4ef7\u683c'}</option>
                          <option value='RANGE'>{'\u4ef7\u683c\u533a\u95f4'}</option>
                        </select>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>{'\u4ef7\u683c'}</label>
                        <Input
                          type='number'
                          step='0.01'
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: e.target.value })}
                          disabled={form.priceStrategy === 'CONTACT'}
                          placeholder='0.00'
                        />
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-4 mt-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>{'\u4ef7\u683c\u5355\u4f4d'}</label>
                        <Input
                          value={form.priceUnit}
                          onChange={(e) => setForm({ ...form, priceUnit: e.target.value })}
                          placeholder={'\u5982: \u53f0/\u5957'}
                          disabled={form.priceStrategy === 'CONTACT'}
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>{'\u8d27\u5e01'}</label>
                        <select
                          value={form.priceCurrency}
                          onChange={(e) => setForm({ ...form, priceCurrency: e.target.value })}
                          className={selectCls}
                          disabled={form.priceStrategy === 'CONTACT'}
                        >
                          <option value='USD'>USD</option>
                          <option value='CNY'>CNY</option>
                          <option value='EUR'>EUR</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'content' && (
                <>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>{'\u8be6\u7ec6\u63cf\u8ff0'}</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder={'\u4ea7\u54c1\u8be6\u7ec6\u4ecb\u7ecd'}
                      rows={8}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>{'\u82f1\u6587\u8be6\u7ec6\u63cf\u8ff0'}</label>
                    <textarea
                      value={form.descriptionEn}
                      onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                      placeholder='Detailed product description in English'
                      rows={8}
                      className={inputCls}
                    />
                  </div>
                </>
              )}

              {activeTab === 'seo' && (
                <>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>SEO Title</label>
                    <Input
                      value={form.seoTitle}
                      onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                      placeholder='SEO \u6807\u9898'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>SEO Description</label>
                    <textarea
                      value={form.seoDescription}
                      onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                      placeholder='SEO \u63cf\u8ff0'
                      rows={4}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>SEO Keywords</label>
                    <Input
                      value={form.seoKeywords}
                      onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
                      placeholder={'\u5173\u952e\u8bcd\uff0c\u9017\u53f7\u5206\u9694'}
                    />
                  </div>
                </>
              )}

              <div className='pt-4 flex justify-end space-x-3 border-t border-gray-200'>
                <Button type='button' variant='outline' onClick={closeModal}>
                  {'\u53d6\u6d88'}
                </Button>
                <Button type='submit' disabled={saving}>
                  {saving ? '\u4fdd\u5b58\u4e2d...' : '\u4fdd\u5b58'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
