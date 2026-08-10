'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { LogTradeModal } from '@/components/trades/LogTradeModal'

export function DashboardClient({ accountId, accountType }: { accountId: string, accountType: 'prop' | 'retail' }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="flex items-center gap-[6px] bg-[var(--color-accent)] text-[#0E1318] border-none rounded-[8px] p-[9px_16px] font-body font-semibold text-[13.5px] cursor-pointer shadow-[0_2px_8px_rgba(110,140,250,0.25)] hover:opacity-90 transition-opacity"
      >
        <Plus size={15} /> Log Trade
      </button>

      {showModal && (
        <LogTradeModal 
          accountId={accountId} 
          accountType={accountType} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  )
}
