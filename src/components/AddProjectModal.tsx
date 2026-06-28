import { useState, FormEvent } from 'react'

interface Project {
  id: string
  name: string
  description: string
  destinationAddress: string
  targetAmount: number
  category: string
  isCustom: boolean
}

interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (project: Omit<Project, 'id' | 'isCustom'>) => void
}

export default function AddProjectModal({ isOpen, onClose, onAdd }: AddProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [target, setTarget] = useState('')
  const [category, setCategory] = useState('Altyapı')

  if (!isOpen) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name || !description || !address || !target) return
    // Basic Stellar address format check
    if (!/^G[A-D2-7][A-Z2-7]{54}$/.test(address)) {
      alert('Geçersiz Stellar testnet adresi! Adres G harfi ile başlamalı ve 56 karakter uzunluğunda olmalıdır.')
      return
    }
    onAdd({
      name,
      description,
      destinationAddress: address,
      targetAmount: parseFloat(target),
      category,
    })
    setName('')
    setDescription('')
    setAddress('')
    setTarget('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Yeni Proje Ekle</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Proje Adı</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Stellar Parser"
              className="w-full rounded-xl bg-gray-900 border border-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Açıklama</label>
            <textarea
              required
              value={description}
              rows={3}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Projenizi kısaca tanıtın..."
              className="w-full rounded-xl bg-gray-900 border border-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Stellar Alıcı Adresi (XLM Public Key)</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="G..."
              className="w-full rounded-xl bg-gray-900 border border-gray-800 px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Hedef Bakiye (XLM)</label>
              <input
                type="number"
                required
                min="1"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Hedef"
                className="w-full rounded-xl bg-gray-900 border border-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl bg-gray-900 border border-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="Altyapı">Altyapı</option>
                <option value="Kütüphane">Kütüphane</option>
                <option value="Tasarım">Tasarım</option>
                <option value="Eğitim">Eğitim</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-800 px-4 py-2 text-sm font-semibold text-gray-400 hover:bg-gray-900 transition"
            >
              İptal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold px-4 py-2 transition"
            >
              Proje Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
