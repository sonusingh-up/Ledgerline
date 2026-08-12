'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { fmtMoney } from '@/lib/calculations'
import * as motion from 'motion/react-client'
import { useRouter } from 'next/navigation'

interface CalendarViewProps {
  trades: {
    id: string
    trade_date: string
    pnl: number | null
  }[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.02, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
}

export function CalendarView({ trades }: CalendarViewProps) {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Group trades by date string (YYYY-MM-DD)
  const tradesByDate = trades.reduce((acc, trade) => {
    if (!trade.trade_date) return acc
    const dateStr = trade.trade_date.split('T')[0]
    if (!acc[dateStr]) {
      acc[dateStr] = { pnl: 0, count: 0 }
    }
    const pnl = Number(trade.pnl)
    acc[dateStr].pnl += isNaN(pnl) ? 0 : pnl
    acc[dateStr].count += 1
    return acc
  }, {} as Record<string, { pnl: number, count: number }>)

  const renderCells = () => {
    const cells = []
    
    // Empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      cells.push(
        <motion.div variants={itemVariants} key={`empty-${i}`} className="min-h-[100px] border-b border-r border-[var(--color-border-soft)] opacity-20 bg-[var(--color-surface)] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')]"></motion.div>
      )
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayData = tradesByDate[dateStr]
      cells.push(
        <motion.div 
          variants={itemVariants}
          key={day}
          onClick={() => router.push(`/journal?date=${dateStr}`)}
          className="min-h-[100px] p-2 flex flex-col items-center justify-between border-b border-r border-[var(--color-border-soft)] hover:bg-[var(--color-surface-hover)] transition-colors group cursor-pointer bg-[var(--color-surface)]"
        >
          <div className="w-full text-right text-xs font-mono text-[var(--color-muted-dark)] mb-2 group-hover:text-[var(--color-muted)] transition-colors">
            {day}
          </div>
          
          {dayData ? (
            <div className="flex flex-col items-center text-center">
              <div className={`text-[13px] font-mono font-semibold ${dayData.pnl > 0 ? 'text-[var(--color-profit)]' : dayData.pnl < 0 ? 'text-[var(--color-loss)]' : 'text-[var(--color-muted)]'}`}>
                {dayData.pnl > 0 ? '+' : ''}{fmtMoney(dayData.pnl)}
              </div>
              <div className="text-[10px] text-[var(--color-muted)] mt-0.5 group-hover:text-[var(--color-text)] transition-colors">
                {dayData.count} trade{dayData.count !== 1 ? 's' : ''}
              </div>
            </div>
          ) : (
            <div className="flex-1 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-20 transition-opacity">
               <CalendarIcon size={16} className="text-[var(--color-muted)]" />
            </div>
          )}
        </motion.div>
      )
    }
    
    // Fill the rest of the grid row
    const remaining = (firstDay + daysInMonth) % 7
    if (remaining > 0) {
      for (let i = remaining; i < 7; i++) {
        cells.push(
          <motion.div variants={itemVariants} key={`empty-end-${i}`} className="min-h-[100px] border-b border-r border-[var(--color-border-soft)] opacity-20 bg-[var(--color-surface)] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')]"></motion.div>
        )
      }
    }
    
    return cells
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border-soft)] rounded-2xl overflow-hidden mt-6 flex flex-col shadow-md">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-soft)]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[var(--color-accent)] rounded-sm"></div>
          <h2 className="text-sm font-semibold text-white font-display">Ledgerline Calendar</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="text-[var(--color-muted-dark)] hover:text-white transition-colors p-1 rounded hover:bg-[var(--color-surface-hover)]">
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-mono font-medium text-white w-24 text-center">
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} className="text-[var(--color-muted-dark)] hover:text-white transition-colors p-1 rounded hover:bg-[var(--color-surface-hover)]">
            <ChevronRight size={16} />
          </button>
        </div>
        
        <button className="px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase text-white bg-[var(--color-surface-alt)] border border-[var(--color-border-soft)] hover:bg-[var(--color-surface-hover)] rounded-md transition-colors shadow-sm">
          Journal Card
        </button>
      </div>
      
      {/* Grid */}
      <div className="grid grid-cols-7 w-full bg-[var(--color-surface-alt)]">
        {/* Days Header */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 text-center text-[10px] font-bold tracking-widest uppercase text-[var(--color-muted-dark)] border-b border-[var(--color-border-soft)]">
            {day}
          </div>
        ))}
        
        {/* Cells */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="col-span-7 grid grid-cols-7 border-l border-t border-[var(--color-border-soft)] -ml-[1px] -mt-[1px]">
          {renderCells()}
        </motion.div>
      </div>
      
    </div>
  )
}

