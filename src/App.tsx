import { useEffect, useState } from 'react'
import { TransactionBuilder, Horizon, Asset, Networks, Operation } from '@stellar/stellar-sdk'
import { signTransaction } from '@stellar/freighter-api'
import Header from './components/Header'
import Hero from './components/Hero'
import ProjectGrid from './components/ProjectGrid'
import DonationHistory from './components/DonationHistory'
import Toast from './components/Toast'
import { getConnectedPublicKey, fetchXlmBalance } from './utils/stellar'

interface Project {
  id: string
  name: string
  description: string
  destinationAddress: string
  targetAmount: number
  category: string
  isCustom: boolean
}

interface Donation {
  id: string
  projectName: string
  amount: string
  txHash: string
  timestamp: number
}

const DEFAULT_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Stellar TypeScript SDK Enhancements',
    description: 'Stellar JavaScript/TypeScript SDK\'sı için gelişmiş React hook desteği ve Horizon bakiye izleme modülleri.',
    destinationAddress: 'GDMSTR4UV7LMXYPU6RD2OV3BMR4NRZ7OSLBW2SJVON2YW2WF45PDRLYO',
    targetAmount: 15000,
    category: 'Kütüphane',
    isCustom: false,
  },
  {
    id: '2',
    name: 'Freighter Easy Connect Button',
    description: 'Tüm frontend kütüphaneleriyle uyumlu, Freighter cüzdan bağlantısını tek satır kodla sağlayan açık kaynaklı UI kütüphanesi.',
    destinationAddress: 'GCTV4ROEWNZHXF5EBQFM4JZQD2EUYML2CGOA6GVVCBLLAEF5FQCCYVHU',
    targetAmount: 20000,
    category: 'Altyapı',
    isCustom: false,
  },
]

export default function App() {
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [donations, setDonations] = useState<Donation[]>([])

  // Toast States
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | null>(null)

  const showNotification = (msg: string, type: 'success' | 'error' | 'info') => {
    setToastMessage(msg)
    setToastType(type)
  }

  // Load dynamic projects and history
  useEffect(() => {
    const storedProjects = localStorage.getItem('stellar_projects')
    const storedDonations = localStorage.getItem('stellar_donations')
    
    setProjects(storedProjects ? JSON.parse(storedProjects) : DEFAULT_PROJECTS)
    setDonations(storedDonations ? JSON.parse(storedDonations) : [])
  }, [])

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const pubkey = await getConnectedPublicKey()
      setAddress(pubkey)
      const xlmBal = await fetchXlmBalance(pubkey)
      setBalance(xlmBal)
      showNotification('Freighter cüzdanı başarıyla bağlandı!', 'success')
    } catch (err: any) {
      showNotification(err.message || 'Cüzdan bağlantısı yapılamadı.', 'error')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    setAddress(null)
    setBalance(null)
    showNotification('Cüzdan bağlantısı kesildi.', 'info')
  }

  const handleAddProject = (newProj: Omit<Project, 'id' | 'isCustom'>) => {
    const created: Project = {
      ...newProj,
      id: Date.now().toString(),
      isCustom: true,
    }
    const updated = [created, ...projects]
    setProjects(updated)
    localStorage.setItem('stellar_projects', JSON.stringify(updated))
    showNotification(`${newProj.name} projesi başarıyla eklendi!`, 'success')
  }

  const handleDonate = async (projectId: string, amount: string, destination: string) => {
    if (!address) {
      showNotification('Lütfen önce cüzdanınızı bağlayın!', 'error')
      return
    }

    showNotification('İşlem Freighter cüzdanınızda onay bekliyor...', 'info')

    try {
      const server = new Horizon.Server('https://horizon-testnet.stellar.org')
      const sourceAccount = await server.loadAccount(address)

      // Create transaction
      const tx = new TransactionBuilder(sourceAccount, {
        fee: '10000', // Standard high fee to ensure prompt inclusion
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination,
            asset: Asset.native(),
            amount,
          })
        )
        .setTimeout(30)
        .build()

      const txXdr = tx.toXDR()

      // Sign using Freighter API
      const result = await signTransaction(txXdr, { networkPassphrase: Networks.TESTNET })
      
      if (result.error) {
        throw new Error(result.error)
      }
      if (!result.signedTxXdr) {
        throw new Error('İşlem imzalanamadı.')
      }

      showNotification('İşlem imzalandı. Stellar ağına gönderiliyor...', 'info')

      // Submit to Horizon
      const transactionToSubmit = TransactionBuilder.fromXDR(result.signedTxXdr, Networks.TESTNET)
      const response = await server.submitTransaction(transactionToSubmit)

      if (response.successful) {
        showNotification('Bağış başarıyla gönderildi!', 'success')
        
        // Log donation history
        const targetProj = projects.find(p => p.id === projectId)
        const newDonation: Donation = {
          id: Date.now().toString(),
          projectName: targetProj ? targetProj.name : 'Unknown Project',
          amount,
          txHash: response.hash,
          timestamp: Date.now()
        }

        const updatedDonations = [newDonation, ...donations]
        setDonations(updatedDonations)
        localStorage.setItem('stellar_donations', JSON.stringify(updatedDonations))

        // Update user balances
        const newBal = await fetchXlmBalance(address)
        setBalance(newBal)

        // Refresh the page data briefly to fetch updated project balance
        window.location.reload()
      } else {
        showNotification('İşlem başarısız oldu.', 'error')
      }
    } catch (err: any) {
      console.error(err)
      showNotification(err.message || 'Ödeme gönderimi sırasında hata oluştu.', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col selection:bg-cyan-500/30">
      <Header
        address={address}
        balance={balance}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        isConnecting={isConnecting}
      />
      <main className="flex-1 pb-16">
        <Hero />
        <ProjectGrid
          projects={projects}
          onDonate={handleDonate}
          onAddProject={handleAddProject}
          isWalletConnected={address !== null}
        />
        <DonationHistory donations={donations} />
      </main>
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastType(null)}
      />
    </div>
  )
}
