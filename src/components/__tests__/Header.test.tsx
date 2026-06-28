import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Header from '../Header'

describe('Header Component', () => {
  it('should call onConnect when connect button clicked', () => {
    const mockConnect = vi.fn()
    render(<Header address={null} balance={null} onConnect={mockConnect} onDisconnect={vi.fn()} isConnecting={false} />)
    const connectBtn = screen.getByRole('button', { name: /Cüzdanı Bağla/i })
    fireEvent.click(connectBtn)
    expect(mockConnect).toHaveBeenCalled()
  })
})
