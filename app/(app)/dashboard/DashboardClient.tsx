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
        className="flex items-center gap-1.5 bg-[#6E8CFA] hover:bg-[#5C7CFA] text-white border-none rounded-lg px-4 py-2 font-body font-semibold text-xs cursor-pointer shadow-md transition-all active:scale-95"
      >
        <Plus size={15} className="stroke-[2.5]" /> Log Trade
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
