import { useEffect, useState, FormEvent } from 'react'
import { Horizon } from '@stellar/stellar-sdk'

interface Project {
  id: string
  name: string
  description: string
  destinationAddress: string
  targetAmount: number
  category: string
  isCustom: boolean
}

interface ProjectCardProps {
  project: Project
  onDonate: (projectId: string, amount: string, destination: string) => void
  isWalletConnected: boolean
}

export default function ProjectCard({ project, onDonate, isWalletConnected }: ProjectCardProps) {
  const [balance, setBalance] = useState<string>('0.0000')
  const [loadingBalance, setLoadingBalance] = useState<boolean>(true)
  const [amount, setAmount] = useState<string>('')

  const fetchProjectOnChainBalance = async () => {
    try {
      const server = new Horizon.Server('https://horizon-testnet.stellar.org')
      const account = await server.loadAccount(project.destinationAddress)
      const native = account.balances.find((b) => b.asset_type === 'native')
      setBalance(native ? parseFloat(native.balance).toFixed(2) : '0.00')
    } catch (err) {
      setBalance('0.00')
    } finally {
      setLoadingBalance(false)
    }
  }

  useEffect(() => {
    fetchProjectOnChainBalance()
  }, [project.destinationAddress])

  const numericBalance = parseFloat(balance)
  const progress = Math.min((numericBalance / project.targetAmount) * 100, 100)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return
    onDonate(project.id, amount, project.destinationAddress)
    setAmount('')
  }

  return (
    <div className="group relative rounded-2xl border border-gray-800/80 bg-gray-950/40 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-700/80 hover:bg-gray-950/60 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <span className="rounded-lg bg-cyan-950/40 border border-cyan-900/30 px-3 py-1 text-xs font-semibold text-cyan-400">
          {project.category}
        </span>
        {project.isCustom && (
          <span className="text-xs text-gray-500 font-medium">Topluluk</span>
        )}
      </div>

      <h3 className="text-lg font-bold text-white mb-2">{project.name}</h3>
      <p className="text-sm text-gray-400 mb-6 line-clamp-3 leading-relaxed">{project.description}</p>

      <div className="mb-6">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-gray-500">Hedef Gelişimi</span>
          <span className="font-semibold text-cyan-400">
            {loadingBalance ? '...' : `${balance} / ${project.targetAmount} XLM`}
          </span>
        </div>
        <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden border border-gray-800 shadow-inner">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="number"
          step="0.0001"
          min="0.0001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Miktar (XLM)"
          required
          disabled={!isWalletConnected}
          className="flex-1 rounded-xl bg-gray-900 border border-gray-800 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={!isWalletConnected}
          className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold px-4 py-2 transition-all shadow-md shadow-cyan-500/10 active:scale-95 disabled:opacity-40 cursor-pointer"
        >
          Bağış Yap
        </button>
      </form>
      {!isWalletConnected && (
        <p className="text-[10px] text-gray-600 mt-1.5 text-center">
          Bağış yapmak için cüzdanınızı bağlamalısınız.
        </p>
      )}
    </div>
  )
}
