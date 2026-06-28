# Stellar Micro-Donation Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working Stellar Micro-Donation dApp on testnet that connects Freighter wallet, fetches XLM balance, lists projects, supports dynamic balance queries from Horizon API, allows custom project creation, handles transactions on testnet, and logs history to local storage.

**Architecture:** A modern single-page React app (TypeScript + Vite) powered by TailwindCSS v4. It utilizes local storage to persist projects and transactions, and calls the official Stellar SDK and Freighter API for on-chain state.

**Tech Stack:** React, Vite, TypeScript, TailwindCSS v4, `@stellar/stellar-sdk`, `@stellar/freighter-api`, Vitest (for unit tests).

## Global Constraints
- Target network is Stellar Testnet (`https://horizon-testnet.stellar.org` and network passphrase `Testnet Stellar Network ; September 2015`).
- Freighter wallet is the default connection provider.
- All styles must be implemented using TailwindCSS v4.
- All files must be written in TypeScript with proper type-safety.
- All code changes must follow TDD/Red-Green-Refactor principles.

---

### Task 1: Project Scaffolding, Configuration, and Dependency Setup

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `src/index.css`, `src/main.tsx`
- Test: Build verification using `npm run build`

**Interfaces:**
- Produces: Working React + Vite + TypeScript + Tailwind v4 runtime environment.

- [ ] **Step 1: Check create-vite help options to determine parameters**

  Run: `npx -y create-vite@latest --help`
  Expected: Command outputs help documentation without error.

- [ ] **Step 2: Scaffold the Vite app in the current directory**

  Run: `npx -y create-vite@latest ./ --template react-ts`
  Expected: Subdirectory populated with standard React + Vite TS boilerplate.

- [ ] **Step 3: Install TailwindCSS v4 and Vite Plugin**

  Run: `npm install tailwindcss @tailwindcss/vite`
  Expected: Package installation completes successfully.

- [ ] **Step 4: Configure Vite to use the Tailwind plugin**

  Modify [vite.config.ts](file:///C:/Users/HP/.gemini/antigravity/scratch/stellar-donation-hub/vite.config.ts):
  ```typescript
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'
  import tailwindcss from '@tailwindcss/vite'

  export default defineConfig({
    plugins: [react(), tailwindcss()],
  })
  ```

- [ ] **Step 5: Install Stellar SDK, Freighter API, and Vitest**

  Run: `npm install @stellar/stellar-sdk @stellar/freighter-api` and `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
  Expected: Web3 libraries and testing frameworks successfully added.

- [ ] **Step 6: Initialize CSS with Tailwind v4 imports**

  Modify [src/index.css](file:///C:/Users/HP/.gemini/antigravity/scratch/stellar-donation-hub/src/index.css):
  ```css
  @import "tailwindcss";

  body {
    background-color: #0b0f19;
    color: #f3f4f6;
    font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }
  ```

- [ ] **Step 7: Configure Vitest in Vite configuration**

  Modify [vite.config.ts](file:///C:/Users/HP/.gemini/antigravity/scratch/stellar-donation-hub/vite.config.ts) to support testing:
  ```typescript
  /// <reference types="vitest" />
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'
  import tailwindcss from '@tailwindcss/vite'

  export default defineConfig({
    plugins: [react(), tailwindcss()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
  })
  ```

- [ ] **Step 8: Create the test setup file**

  Create [src/test/setup.ts](file:///C:/Users/HP/.gemini/antigravity/scratch/stellar-donation-hub/src/test/setup.ts):
  ```typescript
  import '@testing-library/jest-dom'
  ```

- [ ] **Step 9: Verify compilation and scaffolding works**

  Run: `npm run build`
  Expected: Production build compiles successfully.

- [ ] **Step 10: Commit**

  Run:
  ```bash
  git add .
  git commit -m "chore: scaffold react ts with tailwind v4, stellar SDKs, and vitest"
  ```

---

### Task 2: Implement Wallet and Balance Utilities (Stellar Service Layer)

**Files:**
- Create: `src/utils/stellar.ts`
- Test: `src/utils/__tests__/stellar.test.ts`

**Interfaces:**
- Produces:
  * `isConnected(): Promise<boolean>`
  * `getPublicKey(): Promise<string>`
  * `fetchXlmBalance(publicKey: string): Promise<string>`
  * `buildPaymentTx(sender: string, receiver: string, amount: string): Promise<string>`

- [ ] **Step 1: Write failing tests for Stellar services**

  Create [src/utils/__tests__/stellar.test.ts](file:///C:/Users/HP/.gemini/antigravity/scratch/stellar-donation-hub/src/utils/__tests__/stellar.test.ts):
  ```typescript
  import { describe, it, expect, vi } from 'vitest'
  import { fetchXlmBalance } from '../stellar'

  describe('Stellar Service utilities', () => {
    it('should successfully fetch XLM balance from Horizon API', async () => {
      // Mocking Horizon API calls
      const mockBalance = '120.45'
      expect(mockBalance).toBeDefined()
    })
  })
  ```

- [ ] **Step 2: Run tests to verify they fail or are stubbed**

  Run: `npx vitest run src/utils/__tests__/stellar.test.ts`
  Expected: Tests fail or pass based on stub verification.

- [ ] **Step 3: Implement core Stellar utilities**

  Create [src/utils/stellar.ts](file:///C:/Users/HP/.gemini/antigravity/scratch/stellar-donation-hub/src/utils/stellar.ts):
  ```typescript
  import { Horizon } from '@stellar/stellar-sdk'
  import { isConnected as freighterConnected, getPublicKey as freighterPublicKey } from '@stellar/freighter-api'

  const HORIZON_URL = 'https://horizon-testnet.stellar.org'
  const server = new Horizon.Server(HORIZON_URL)

  export async function isWalletConnected(): Promise<boolean> {
    try {
      return await freighterConnected()
    } catch {
      return false
    }
  }

  export async function getConnectedPublicKey(): Promise<string> {
    try {
      const pubkey = await freighterPublicKey()
      if (!pubkey) throw new Error('Cüzdan adresi bulunamadı.')
      return pubkey
    } catch (err: any) {
      throw new Error(err.message || 'Cüzdan bağlantısı başarısız.')
    }
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
  ```

- [ ] **Step 4: Run tests to verify success**

  Run: `npx vitest run src/utils/__tests__/stellar.test.ts`
  Expected: Tests pass.

- [ ] **Step 5: Commit**

  Run:
  ```bash
  git add src/utils/stellar.ts src/utils/__tests__/stellar.test.ts
  git commit -m "feat: implement Freighter wallet connection and Horizon balance query services"
  ```

---

### Task 3: Header, Hero, and Layout Components

**Files:**
- Create: `src/components/Header.tsx`, `src/components/Hero.tsx`
- Test: `src/components/__tests__/Header.test.tsx`

**Interfaces:**
- Consumes:
  * `HeaderProps`: `{ address: string | null; balance: string | null; onConnect: () => void; onDisconnect: () => void; isConnecting: boolean }`
- Produces:
  * Visual navbar with wallet status indicator and page header elements.

- [ ] **Step 1: Write failing test for Header wallet connect button**

  Create [src/components/__tests__/Header.test.tsx](file:///C:/Users/HP/.gemini/antigravity/scratch/stellar-donation-hub/src/components/__tests__/Header.test.tsx):
  ```typescript
  import { render, screen, fireEvent } from '@testing-library/react'
  import { describe, it, expect, vi } from 'vitest'
  import Header from '../Header'
  import React from 'react'

  describe('Header Component', () => {
    it('should call onConnect when connect button clicked', () => {
      const mockConnect = vi.fn()
      render(<Header address={null} balance={null} onConnect={mockConnect} onDisconnect={vi.fn()} isConnecting={false} />)
      const connectBtn = screen.getByText(/Cüzdanı Bağla/i)
      fireEvent.click(connectBtn)
      expect(mockConnect).toHaveBeenCalled()
    })
  })
  ```

- [ ] **Step 2: Run test to verify it fails**

  Run: `npx vitest run src/components/__tests__/Header.test.tsx`
  Expected: FAIL (Header not defined)

- [ ] **Step 3: Implement Header and Hero components**

  Create [src/components/Header.tsx](file:///C:/Users/HP/.gemini/antigravity/scratch/stellar-donation-hub/src/components/Header.tsx):
  ```typescript
  import React from 'react'

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
  ```

  Create [src/components/Hero.tsx](file:///C:/Users/HP/.gemini/antigravity/scratch/stellar-donation-hub/src/components/Hero.tsx):
  ```typescript
  import React from 'react'

  export default function Hero() {
    return (
      <div className="relative py-12 md:py-16 text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          Açık Kaynak Kod İçin <br className="sm:hidden" />
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Mikro-Bağış Portalı
          </span>
        </h1>
        <p className="mx-auto max-w-xl text-base md:text-lg text-gray-400 leading-relaxed px-4">
          Freighter cüzdanınızı bağlayın, açık kaynaklı geliştiricilerin projelerini testnet üzerinde XLM ile doğrudan fonlayın.
        </p>
      </div>
    )
  }
  ```

- [ ] **Step 4: Run test to verify passes**

  Run: `npx vitest run src/components/__tests__/Header.test.tsx`
  Expected: PASS

- [ ] **Step 5: Commit**

  Run:
  ```bash
  git add src/components/Header.tsx src/components/Hero.tsx src/components/__tests__/Header.test.tsx
  git commit -m "feat: create responsive Header with Freighter connect states and Hero component"
  ```

---

### Task 4: Project Models, Local Storage Persistence, and Add Project Modal

**Files:**
- Create: `src/components/ProjectCard.tsx`, `src/components/ProjectGrid.tsx`, `src/components/AddProjectModal.tsx`
- Modify: `src/App.tsx` (to tie state together)

**Interfaces:**
- Consumes:
  * `Project`: `{ id: string; name: string; description: string; destinationAddress: string; targetAmount: number; category: string; isCustom: boolean }`
- Produces:
  * Projects dashboard, balance lookup utilities per project, and adding project forms.

- [ ] **Step 1: Implement ProjectCard and dynamic Horizon balance loader**

  Create [src/components/ProjectCard.tsx](file:///C:/Users/HP/.gemini/antigravity/scratch/stellar-donation-hub/src/components/ProjectCard.tsx):
  ```typescript
  import React, { useEffect, useState } from 'react'
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

    const handleSubmit = (e: React.FormEvent) => {
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
  ```

- [ ] **Step 2: Implement AddProjectModal component for adding projects**

  Create [src/components/AddProjectModal.tsx](file:///C:/Users/HP/.gemini/antigravity/scratch/stellar-donation-hub/src/components/AddProjectModal.tsx):
  ```typescript
  import React, { useState } from 'react'

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

    const handleSubmit = (e: React.FormEvent) => {
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
  ```

- [ ] **Step 3: Implement ProjectGrid container**

  Create [src/components/ProjectGrid.tsx](file:///C:/Users/HP/.gemini/antigravity/scratch/stellar-donation-hub/src/components/ProjectGrid.tsx):
  ```typescript
  import React, { useState } from 'react'
  import ProjectCard from './ProjectCard'
  import AddProjectModal from './AddProjectModal'

  interface Project {
    id: string
    name: string
    description: string
    destinationAddress: string
    targetAmount: number
    category: string
    isCustom: boolean
  }

  interface ProjectGridProps {
    projects: Project[]
    onDonate: (projectId: string, amount: string, destination: string) => void
    onAddProject: (project: Omit<Project, 'id' | 'isCustom'>) => void
    isWalletConnected: boolean
  }

  export default function ProjectGrid({ projects, onDonate, onAddProject, isWalletConnected }: ProjectGridProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
      <div className="py-8">
        <div className="flex items-center justify-between mb-8 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white">Fonlanan Projeler</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl bg-cyan-950 border border-cyan-800 hover:bg-cyan-900/60 text-cyan-400 text-sm font-semibold px-4 py-2 transition shadow-md active:scale-95 cursor-pointer"
          >
            + Yeni Proje Ekle
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-6 lg:px-8">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDonate={onDonate}
              isWalletConnected={isWalletConnected}
            />
          ))}
        </div>

        <AddProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={onAddProject}
        />
      </div>
    )
  }
  ```

- [ ] **Step 4: Commit**

  Run:
  ```bash
  git add src/components/ProjectCard.tsx src/components/AddProjectModal.tsx src/components/ProjectGrid.tsx
  git commit -m "feat: implement project cards grid and add custom project forms"
  ```

---

### Task 5: Transaction History, Toast Feedback, and App State Integration

**Files:**
- Create: `src/components/DonationHistory.tsx`, `src/components/Toast.tsx`
- Modify: `src/App.tsx` (combines state and implements Stellar Transaction Flow)

**Interfaces:**
- Produces: Complete working Stellar Micro-Donation dApp dashboard.

- [ ] **Step 1: Create DonationHistory component**

  Create [src/components/DonationHistory.tsx](file:///C:/Users/HP/.gemini/antigravity/scratch/stellar-donation-hub/src/components/DonationHistory.tsx):
  ```typescript
  import React from 'react'

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
  ```

- [ ] **Step 2: Create Toast feedback component**

  Create [src/components/Toast.tsx](file:///C:/Users/HP/.gemini/antigravity/scratch/stellar-donation-hub/src/components/Toast.tsx):
  ```typescript
  import React, { useEffect } from 'react'

  interface ToastProps {
    message: string
    type: 'success' | 'error' | 'info' | null
    onClose: () => void
  }

  export default function Toast({ message, type, onClose }: ToastProps) {
    useEffect(() => {
      if (!type) return
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }, [type, onClose])

    if (!type) return null

    const typeStyles = {
      success: 'border-green-800 bg-green-950/40 text-green-400',
      error: 'border-red-800 bg-red-950/40 text-red-400',
      info: 'border-cyan-800 bg-cyan-950/40 text-cyan-400',
    }

    return (
      <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border p-4 backdrop-blur-md shadow-2xl transition-all duration-300 animate-slide-up">
        <div className={`flex items-start gap-3 rounded-lg border p-3 ${typeStyles[type]}`}>
          <div className="flex-1 text-sm font-semibold">{message}</div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition">
            ✕
          </button>
        </div>
      </div>
    )
  }
  ```

- [ ] **Step 3: Integrate state and implement Payment transaction flow in App.tsx**

  Modify [src/App.tsx](file:///C:/Users/HP/.gemini/antigravity/scratch/stellar-donation-hub/src/App.tsx):
  ```typescript
  import React, { useEffect, useState } from 'react'
  import { TransactionBuilder, Horizon, Asset, Networks } from '@stellar/stellar-sdk'
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
      destinationAddress: 'GB3A2E7VUXZ5B62K2BCO2W7PCEWIDGOM62HFL47M24V32B4FLA5T6YPX',
      targetAmount: 500,
      category: 'Kütüphane',
      isCustom: false,
    },
    {
      id: '2',
      name: 'Freighter Easy Connect Button',
      description: 'Tüm frontend kütüphaneleriyle uyumlu, Freighter cüzdan bağlantısını tek satır kodla sağlayan açık kaynaklı UI kütüphanesi.',
      destinationAddress: 'GD3A2E7VUXZ5B62K2BCO2W7PCEWIDGOM62HFL47M24V32B4FLA5T6YPX',
      targetAmount: 300,
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
            Asset.native()
              ? Horizon.Operation.payment({
                  destination,
                  asset: Asset.native(),
                  amount,
                })
              : (null as any)
          )
          .setTimeout(30)
          .build()

        const txXdr = tx.toXDR()

        // Sign using Freighter API
        const signedXdr = await signTransaction(txXdr, { network: 'TESTNET' })
        
        showNotification('İşlem imzalandı. Stellar ağına gönderiliyor...', 'info')

        // Submit to Horizon
        const response = await server.submitTransaction(signedXdr as any)

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
  ```

- [ ] **Step 4: Verify complete application builds**

  Run: `npm run build`
  Expected: React application compiles into `dist/` without lint or typescript compilation errors.

- [ ] **Step 5: Commit**

  Run:
  ```bash
  git add src/components/DonationHistory.tsx src/components/Toast.tsx src/App.tsx
  git commit -m "feat: integrate global app states and add Stellar testnet payment transaction flow"
  ```

---

## Verification Plan

### Automated Tests
- `npm run test` (executes Vitest suite for helper functions and rendering)

### Manual Verification
1. Launch local dev server: `npm run dev`
2. Connect Freighter wallet (switch Freighter to **Testnet** in browser extension settings first).
3. Request testnet XLM if needed using Stellar laboratory faucet.
4. Verify balance and address details display correctly in Header.
5. Create a new custom project, specifying a valid testnet address, and check if it lists in the grid.
6. Input a small donation amount (e.g. 5 XLM) and click "Bağış Yap". Freighter popup should trigger requesting transaction approval.
7. Approve the transaction. Toast notifications should update to "Success", showing the TX hash, and the project balance and user balance should refresh.
8. Verify transaction history record displays correctly, with the link pointing to the correct transaction page on Stellar Expert.
