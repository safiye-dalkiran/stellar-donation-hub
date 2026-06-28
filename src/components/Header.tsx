
interface HeaderProps {
  address: string | null
  balance: string | null
  onConnect: () => void
  onDisconnect: () => void
  isConnecting: boolean
}

export default function Header({ address, balance, onConnect, onDisconnect, isConnecting }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-[#0b0f19]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
            S
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Stellar Spark
          </span>
        </div>

        <div className="flex items-center gap-4">
          {address ? (
            <div className="flex items-center gap-3 bg-gray-900/80 border border-gray-800 rounded-xl px-4 py-1.5 shadow-inner">
              <div className="flex flex-col text-right">
                <span className="text-xs text-gray-500 font-mono">
                  {address.slice(0, 4)}...{address.slice(-4)}
                </span>
                <span className="text-sm font-semibold text-cyan-400">
                  {balance} XLM
                </span>
              </div>
              <button
                onClick={onDisconnect}
                className="rounded-lg bg-red-950/40 px-3 py-1 text-xs font-medium text-red-400 border border-red-900/50 hover:bg-red-900/30 transition-colors"
              >
                Çıkış
              </button>
            </div>
          ) : (
            <button
              disabled={isConnecting}
              onClick={onConnect}
              className="relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/30 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isConnecting ? 'Bağlanıyor...' : 'Cüzdanı Bağla'}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
