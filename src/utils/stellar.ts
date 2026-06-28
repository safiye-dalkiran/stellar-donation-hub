import { Horizon } from '@stellar/stellar-sdk'
import { isConnected as freighterConnected, getAddress } from '@stellar/freighter-api'

const HORIZON_URL = 'https://horizon-testnet.stellar.org'
const server = new Horizon.Server(HORIZON_URL)

export async function isWalletConnected(): Promise<boolean> {
  try {
    const result = await freighterConnected()
    return !!result.isConnected
  } catch {
    return false
  }
}

// Alias to match the isConnected interface specified in the brief
export async function isConnected(): Promise<boolean> {
  return isWalletConnected()
}

export async function getConnectedPublicKey(): Promise<string> {
  try {
    const result = await getAddress()
    if (result.error) throw new Error(result.error)
    if (!result.address) throw new Error('Cüzdan adresi bulunamadı.')
    return result.address
  } catch (err: any) {
    throw new Error(err.message || 'Cüzdan bağlantısı başarısız.')
  }
}

// Alias to match the getPublicKey interface specified in the brief
export async function getPublicKey(): Promise<string> {
  return getConnectedPublicKey()
}

export async function fetchXlmBalance(publicKey: string): Promise<string> {
  try {
    const account = await server.loadAccount(publicKey)
    const nativeBalance = account.balances.find((b) => b.asset_type === 'native')
    return nativeBalance ? parseFloat(nativeBalance.balance).toFixed(4) : '0.0000'
  } catch (err) {
    console.error(err)
    return '0.0000'
  }
}
