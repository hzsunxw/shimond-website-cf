'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CaseItem {
  id: string
  title: string
  slug: string
  clientName: string | null
  coverImage: string | null
  summary: string | null
  description: string | null
  sortOrder: number
  status: string
  createdAt: string
}

const emptyForm = {
  title: '', slug: '', clientName: '', coverImage: '', summary: '',
  description: '', sortOrder: 0, status: 'ACTIVE', seoTitle: '', seoDescription: '', seoKeywords: '',
}

const statusMap: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: '已发布', color: 'bg-green-100 text-green-800' },
  INACTIVE: { label: '未发布', color: 'bg-gray-100 text-gray-800' },
  SCHEDULED: { label: '定时', color: 'bg-yellow-100 text-yellow-800' },
  ARCHIVED: { label: '已归档', color: 'bg-red-100 text-red-800' },
}

export default function CasesAdminPage() {
  const [cases, setCases] = useState<CaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<CaseItem | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchCases = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cases')
      if (res.ok) { const data = await res.json(); setCases(data) }
    } catch (err) { console.error('Fetch cases error:', err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchCases() }, [fetchCases])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }

  const openEdit = (item: CaseItem) => {
    setEditing(item)
    setForm({
      title: item.title, slug: item.slug, clientName: item.clientName || '',
      coverImage: item.coverImage || '', summary: item.summary || '',
      description: item.description || '', sortOrder: item.sortOrder,
      status: item.status, seoTitle: '', seoDescription: '', seoKeywords: '',
    })
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditing(null); setForm(emptyForm) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.slug) return
    setSaving(true)
    try {
      const method = editing ? 'PUT' : 'POST'
      const body = editing ? { ...form, id: editing.id } : form
      const res = await fetch('/api/cases', {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      if (res.ok) { closeModal(); fetchCases() }
      else { const err = await res.json(); alert(err.error || '操作失败') }
    } catch { alert('保存失败') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个案例吗？')) return
    try {
      const res = await fetch(`/api/cases?id=${id}`, { method: 'DELETE' })
      if (res.ok) fetchCases()
      else { const err = await res.json(); alert(err.error || '删除失败') }
    } catch { alert('删除失败') }
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">案例管理</h2>
        <Button onClick={openCreate}>+ 新建案例</Button>
      </header>

      <div className="p-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">封面</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客户</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排序</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cases.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.coverImage ? (
                      <img src={item.coverImage} alt={item.title} className="w-12 h-12 object-cover rounded-lg" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">无图</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.slug}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.clientName || '--'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${statusMap[item.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                      {statusMap[item.status]?.label || item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sortOrder}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button onClick={() => openEdit(item)} className="text-sky-600 hover:text-sky-800 font-medium">编辑</button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 font-medium">删除</button>
                  </td>
                </tr>
              ))}
              {cases.length === 0 && !loading && (
                <tr><td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">暂无数据，点击右上角"新建案例"添加</td></tr>
              )}
              {loading && (
                <tr><td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">加载中...</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{editing ? '编辑案例' : '新建案例'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="案例标题" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="URL 标识" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">客户名称</label>
                <Input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} placeholder="客户公司名称" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="ACTIVE">已发布</option>
                    <option value="INACTIVE">未发布</option>
                    <option value="SCHEDULED">定时</option>
                    <option value="ARCHIVED">已归档</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                  <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">摘要</label>
                <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="简短描述" rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">详细描述</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="案例详细描述" rows={4} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">封面图片 URL</label>
                <Input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="https://example.com/image.jpg" />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={closeModal}>取消</Button>
                <Button type="submit" disabled={saving}>{saving ? '保存中...' : '保存'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
