interface Donation {
  id: string
  projectName: string
  amount: string
  txHash: string
  timestamp: number
}

interface DonationHistoryProps {
  donations: Donation[]
}

export default function DonationHistory({ donations }: DonationHistoryProps) {
  if (donations.length === 0) return null

  return (
    <div className="py-12 border-t border-gray-900 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h2 className="text-xl font-bold text-white mb-6">Son Bağışlarınız</h2>
      <div className="overflow-x-auto rounded-2xl border border-gray-900 bg-gray-950/20 backdrop-blur-sm">
        <table className="w-full border-collapse text-left text-sm text-gray-400">
          <thead>
            <tr className="border-b border-gray-900 bg-gray-950/60 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">Proje</th>
              <th className="px-6 py-4">Miktar</th>
              <th className="px-6 py-4">Tarih</th>
              <th className="px-6 py-4 text-right">İşlem Kodu (Hash)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-900">
            {donations.map((donation) => (
              <tr key={donation.id} className="hover:bg-gray-950/40 transition">
                <td className="px-6 py-4 font-semibold text-white">{donation.projectName}</td>
                <td className="px-6 py-4 text-cyan-400 font-mono">{donation.amount} XLM</td>
                <td className="px-6 py-4 text-xs">
                  {new Date(donation.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                  {new Date(donation.timestamp).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right font-mono text-xs">
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${donation.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-500 hover:text-cyan-400 underline"
                  >
                    {donation.txHash.slice(0, 8)}...{donation.txHash.slice(-8)}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
