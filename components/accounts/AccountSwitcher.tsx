'use client'

import { useState, useEffect } from 'react'
import { Account } from '@/lib/types'
import { useRouter, useSearchParams } from 'next/navigation'

export function AccountSwitcher({ accounts }: { accounts: Account[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialAccountId = searchParams.get('accountId') || (accounts.length > 0 ? accounts[0].id : '')
  
  const [selectedId, setSelectedId] = useState(initialAccountId)

  useEffect(() => {
    if (selectedId) {
      const currentParams = new URLSearchParams(Array.from(searchParams.entries()))
      currentParams.set('accountId', selectedId)
      const currentPath = window.location.pathname
      router.push(`${currentPath}?${currentParams.toString()}`)
    }
  }, [selectedId])

  if (accounts.length === 0) {
    return <div className="text-[12px] text-[var(--color-muted)]">No accounts found. Create one.</div>
  }

  return (
    <div>
      <div className="text-[11px] text-[var(--color-muted-dark)] font-body">ACCOUNT</div>
      <select 
        value={selectedId} 
        onChange={(e) => setSelectedId(e.target.value)}
        className="bg-transparent border-none text-[var(--color-text)] font-display text-[16px] font-semibold cursor-pointer outline-none focus-visible:outline-[2px] focus-visible:outline-[var(--color-accent)] rounded"
      >
        {accounts.map((acc) => (
          <option key={acc.id} value={acc.id} className="bg-[var(--color-surface)] text-[14px]">
            {acc.label}
          </option>
        ))}
      </select>
    </div>
  )
}
