import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isWalletConnected, isConnected, getConnectedPublicKey, getPublicKey, fetchXlmBalance } from '../stellar'
import { Horizon } from '@stellar/stellar-sdk'
import { isConnected as freighterConnected, requestAccess } from '@stellar/freighter-api'

// Mock freighter-api
vi.mock('@stellar/freighter-api', () => ({
  isConnected: vi.fn(),
  requestAccess: vi.fn(),
}))

// Mock stellar-sdk Horizon Server
vi.mock('@stellar/stellar-sdk', () => {
  const mockLoadAccount = vi.fn()
  return {
    Horizon: {
      Server: vi.fn().mockImplementation(() => ({
        loadAccount: mockLoadAccount,
      })),
    },
  }
})

describe('Stellar Service utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isWalletConnected / isConnected', () => {
    it('should return true when freighterConnected returns true', async () => {
      vi.mocked(freighterConnected).mockResolvedValue({ isConnected: true })
      const result = await isWalletConnected()
      expect(result).toBe(true)
      expect(await isConnected()).toBe(true)
      expect(freighterConnected).toHaveBeenCalled()
    })

    it('should return false when freighterConnected throws or returns false', async () => {
      vi.mocked(freighterConnected).mockRejectedValue(new Error('freighter error'))
      const result = await isWalletConnected()
      expect(result).toBe(false)
      expect(await isConnected()).toBe(false)
    })
  })

  describe('getConnectedPublicKey / getPublicKey', () => {
    it('should return public key when requestAccess succeeds', async () => {
      const mockKey = 'GB3A2E7VUXZ5B62K2BCO2W7PCEWIDGOM62HFL47M24V32B4FLA5T6YPX'
      vi.mocked(freighterConnected).mockResolvedValue({ isConnected: true })
      vi.mocked(requestAccess).mockResolvedValue({ address: mockKey })
      const result = await getConnectedPublicKey()
      expect(result).toBe(mockKey)
      expect(await getPublicKey()).toBe(mockKey)
      expect(requestAccess).toHaveBeenCalled()
    })

    it('should throw an error when freighterConnected is false', async () => {
      vi.mocked(freighterConnected).mockResolvedValue({ isConnected: false })
      await expect(getConnectedPublicKey()).rejects.toThrow('Freighter cüzdan eklentisi bulunamadı.')
    })

    it('should throw an error when requestAccess returns empty/null', async () => {
      vi.mocked(freighterConnected).mockResolvedValue({ isConnected: true })
      vi.mocked(requestAccess).mockResolvedValue({ address: '' })
      await expect(getConnectedPublicKey()).rejects.toThrow('Cüzdan adresi bulunamadı.')
      await expect(getPublicKey()).rejects.toThrow('Cüzdan adresi bulunamadı.')
    })

    it('should throw connection error when requestAccess fails', async () => {
      vi.mocked(freighterConnected).mockResolvedValue({ isConnected: true })
      vi.mocked(requestAccess).mockRejectedValue(new Error('Freighter failure'))
      await expect(getConnectedPublicKey()).rejects.toThrow('Freighter failure')
      await expect(getPublicKey()).rejects.toThrow('Freighter failure')
    })
  })

  describe('fetchXlmBalance', () => {
    it('should successfully fetch XLM balance from Horizon API', async () => {
      const mockServerInstance = new Horizon.Server('https://horizon-testnet.stellar.org')
      const mockLoadAccount = vi.mocked(mockServerInstance.loadAccount)
      
      mockLoadAccount.mockResolvedValue({
        balances: [
          { asset_type: 'native', balance: '120.4500000' },
          { asset_type: 'credit_alphanum4', asset_code: 'USDC', balance: '50.00' }
        ]
      } as any)

      const balance = await fetchXlmBalance('GB3A2E7VUXZ5B62K2BCO2W7PCEWIDGOM62HFL47M24V32B4FLA5T6YPX')
      expect(balance).toBe('120.4500')
    })

    it('should return 0.0000 if native balance is not found', async () => {
      const mockServerInstance = new Horizon.Server('https://horizon-testnet.stellar.org')
      const mockLoadAccount = vi.mocked(mockServerInstance.loadAccount)
      
      mockLoadAccount.mockResolvedValue({
        balances: [
          { asset_type: 'credit_alphanum4', asset_code: 'USDC', balance: '50.00' }
        ]
      } as any)

      const balance = await fetchXlmBalance('GB3A2E7VUXZ5B62K2BCO2W7PCEWIDGOM62HFL47M24V32B4FLA5T6YPX')
      expect(balance).toBe('0.0000')
    })

    it('should return 0.0000 if server.loadAccount throws an error', async () => {
      const mockServerInstance = new Horizon.Server('https://horizon-testnet.stellar.org')
      const mockLoadAccount = vi.mocked(mockServerInstance.loadAccount)
      
      mockLoadAccount.mockRejectedValue(new Error('Account not found'))

      const balance = await fetchXlmBalance('GB3A2E7VUXZ5B62K2BCO2W7PCEWIDGOM62HFL47M24V32B4FLA5T6YPX')
      expect(balance).toBe('0.0000')
    })
  })
})
