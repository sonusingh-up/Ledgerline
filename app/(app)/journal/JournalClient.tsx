'use client'

import React, { useState, useMemo } from 'react'
import { Trade, JournalEntry } from '@/lib/types'
import { JournalEditor } from '@/components/journal/JournalEditor'
import { Heatmap } from '@/components/dashboard/Heatmap'
import { TradeTable } from '@/components/trades/TradeTable'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Target, Award, ListTodo } from 'lucide-react'
import { fmtMoney } from '@/lib/calculations'
import { useSearchParams, useRouter } from 'next/navigation'

import { ImageLightbox } from '@/components/ui/ImageLightbox'
import Image from 'next/image'

type ViewMode = 'day' | 'week' | 'month' | 'list'

interface JournalClientProps {
  initialTrades: Trade[]
  initialEntries: JournalEntry[]
}

export function JournalClient({ initialTrades, initialEntries }: JournalClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const dateParam = searchParams.get('date')

  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [selectedDate, setSelectedDate] = useState<string>(dateParam || new Date().toISOString().split('T')[0])
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  // Update URL when date changes
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate)
    const params = new URLSearchParams(searchParams.toString())
    params.set('date', newDate)
    router.replace(`?${params.toString()}`)
  }

  // Helpers for navigation
  const navigateDay = (offset: number) => {
    const d = new Date(selectedDate)
    d.setUTCDate(d.getUTCDate() + offset)
    handleDateChange(d.toISOString().split('T')[0])
  }

  // --- DAY VIEW DATA ---
  const dayTrades = useMemo(() => initialTrades.filter(t => t.trade_date === selectedDate), [initialTrades, selectedDate])
  const dayEntry = useMemo(() => initialEntries.find(e => e.entry_date === selectedDate) || null, [initialEntries, selectedDate])

  // --- WEEK VIEW DATA ---
  const weekData = useMemo(() => {
    // Determine the start of the week (Monday) for the selectedDate
    const d = new Date(selectedDate)
    const day = d.getUTCDay()
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    const monday = new Date(d.setUTCDate(diff))
    
    const days = []
    let weekNetPnl = 0
    let weekWins = 0
    let weekTradesCount = 0
    let daysJournaled = 0
    let activeTradingDays = 0

    for (let i = 0; i < 7; i++) {
      const current = new Date(monday)
      current.setUTCDate(monday.getUTCDate() + i)
      const dateStr = current.toISOString().split('T')[0]
      
      const t = initialTrades.filter(tr => tr.trade_date === dateStr)
      const e = initialEntries.find(en => en.entry_date === dateStr)
      
      const pnl = t.reduce((sum, tr) => sum + Number(tr.pnl || 0), 0)
      const wins = t.filter(tr => Number(tr.pnl || 0) > 0).length
      
      if (t.length > 0) activeTradingDays++
      if (e && e.content) daysJournaled++
      
      weekNetPnl += pnl
      weekWins += wins
      weekTradesCount += t.length
      
      days.push({ date: dateStr, trades: t, entry: e, pnl })
    }
    
    return { days, weekNetPnl, weekWins, weekTradesCount, daysJournaled, activeTradingDays }
  }, [selectedDate, initialTrades, initialEntries])

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border-soft)] text-[#6E8CFA]">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-[var(--color-text)] tracking-tight">
              Trading Journal
            </h1>
            <p className="text-xs text-[var(--color-muted)]">
              Reflect, review, and refine your edge.
            </p>
          </div>
        </div>

        <div className="flex items-center bg-[var(--color-surface-alt)] p-1 rounded-lg border border-[var(--color-border)] shadow-sm">
          {(['day', 'week', 'month', 'list'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                viewMode === mode 
                  ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-xs border border-[var(--color-border-soft)]' 
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)] border border-transparent'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Views */}
      {viewMode === 'day' && (
        <div className="flex flex-col gap-5">
          {/* Date Navigator */}
          <div className="flex items-center justify-between bg-[var(--color-surface-alt)]/80 backdrop-blur-md border border-[var(--color-border-soft)] rounded-xl p-3 px-5 shadow-sm">
            <button onClick={() => navigateDay(-1)} className="p-1 text-[var(--color-muted)] hover:text-white transition-colors">
              <ChevronLeft size={20} />
            </button>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-transparent border-none text-white font-mono font-bold outline-none text-center cursor-pointer"
            />
            <button onClick={() => navigateDay(1)} className="p-1 text-[var(--color-muted)] hover:text-white transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          <JournalEditor 
            date={selectedDate}
            initialEntry={dayEntry}
            trades={dayTrades}
            title="Session Reflection"
          />

          {dayTrades.length > 0 && (
            <div className="mt-2">
              <TradeTable trades={dayTrades} />
            </div>
          )}
        </div>
      )}

      {viewMode === 'week' && (
        <div className="flex flex-col gap-5">
          {/* Week Summary Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[var(--color-surface-alt)]/80 backdrop-blur-md border border-[var(--color-border-soft)] rounded-xl p-4 flex flex-col gap-1 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[var(--color-muted)] tracking-wider">Weekly P&L</span>
              <span className={`font-mono text-lg font-bold ${weekData.weekNetPnl >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
                {weekData.weekNetPnl >= 0 ? '+' : ''}{fmtMoney(weekData.weekNetPnl)}
              </span>
            </div>
            <div className="bg-[var(--color-surface-alt)]/80 backdrop-blur-md border border-[var(--color-border-soft)] rounded-xl p-4 flex flex-col gap-1 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[var(--color-muted)] tracking-wider">Win Rate</span>
              <span className="font-mono text-lg font-bold text-white">
                {weekData.weekTradesCount ? Math.round((weekData.weekWins / weekData.weekTradesCount) * 100) : 0}%
              </span>
            </div>
            <div className="bg-[var(--color-surface-alt)]/80 backdrop-blur-md border border-[var(--color-border-soft)] rounded-xl p-4 flex flex-col gap-1 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[var(--color-muted)] tracking-wider">Trades</span>
              <span className="font-mono text-lg font-bold text-white">{weekData.weekTradesCount}</span>
            </div>
            <div className="bg-[var(--color-surface-alt)]/80 backdrop-blur-md border border-[var(--color-border-soft)] rounded-xl p-4 flex flex-col gap-1 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[var(--color-muted)] tracking-wider">Consistency</span>
              <span className="font-mono text-lg font-bold text-[var(--color-accent)]">
                {weekData.daysJournaled} / {Math.max(weekData.activeTradingDays, 1)} days
              </span>
            </div>
          </div>

          {/* Week Navigator */}
          <div className="flex items-center justify-between bg-[var(--color-surface-alt)]/50 border border-[var(--color-border-soft)] rounded-xl p-3 px-5 shadow-sm">
            <button onClick={() => navigateDay(-7)} className="p-1 text-[var(--color-muted)] hover:text-white transition-colors">
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-bold text-[var(--color-text)] font-mono">
              Week of {new Date(weekData.days[0].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
            <button onClick={() => navigateDay(7)} className="p-1 text-[var(--color-muted)] hover:text-white transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
            {weekData.days.map(d => (
              <div 
                key={d.date} 
                onClick={() => {
                  handleDateChange(d.date)
                  setViewMode('day')
                }}
                className={`flex flex-col gap-3 p-4 rounded-xl border transition-all cursor-pointer hover:-translate-y-1 ${
                  d.date === new Date().toISOString().split('T')[0]
                    ? 'bg-[var(--color-surface-alt)]/90 border-[var(--color-accent)]/50 shadow-md ring-1 ring-[var(--color-accent)]/20'
                    : 'bg-[var(--color-surface-alt)]/60 border-[var(--color-border-soft)] hover:border-[var(--color-border)] shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-wider">
                      {new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}
                    </span>
                    <span className="text-xs font-mono font-semibold text-white">
                      {new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {d.trades.length > 0 && (
                    <span className="bg-[var(--color-surface)] border border-[var(--color-border-soft)] text-[var(--color-muted)] text-[9px] px-1.5 py-0.5 rounded font-bold">
                      {d.trades.length} T
                    </span>
                  )}
                </div>
                
                {d.trades.length > 0 ? (
                  <span className={`font-mono text-sm font-bold ${d.pnl >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
                    {d.pnl >= 0 ? '+' : ''}{fmtMoney(d.pnl)}
                  </span>
                ) : (
                  <span className="text-[11px] text-[var(--color-muted-dark)] italic">No trades</span>
                )}

                <div className="mt-auto pt-3 border-t border-[var(--color-border-soft)]">
                  {d.entry?.content ? (
                    <p className="text-[10px] text-[var(--color-muted)] line-clamp-3 leading-relaxed">
                      {d.entry.content}
                    </p>
                  ) : (
                    <p className="text-[10px] text-[var(--color-muted-dark)] italic">
                      No entry
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'month' && (
        <div className="flex flex-col gap-5">
          {/* Note: In a complete implementation, Heatmap.tsx would be updated to accept journalEntries prop and render an indicator dot. */}
          <div className="bg-[var(--color-surface-alt)]/80 backdrop-blur-md border border-[var(--color-border-soft)] rounded-xl shadow-md overflow-hidden">
            <Heatmap 
              trades={initialTrades} 
              weeks={24} 
              selectedDate={selectedDate} 
              journalEntries={initialEntries} // Will be passed down once Heatmap is updated
            />
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <div className="flex flex-col gap-6">
          {initialEntries.length === 0 ? (
            <div className="text-center p-12 text-[var(--color-muted-dark)] bg-[var(--color-surface-alt)]/80 rounded-xl border border-[var(--color-border-soft)]">
              No journal entries found. Start journaling in the Day view!
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {initialEntries.map(entry => {
                const entryTrades = initialTrades.filter(t => t.trade_date === entry.entry_date)
                const pnl = entryTrades.reduce((sum, tr) => sum + Number(tr.pnl || 0), 0)
                
                return (
                  <div key={entry.id} className="bg-[var(--color-surface-alt)]/80 backdrop-blur-md border border-[var(--color-border-soft)] rounded-xl p-5 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-[var(--color-border-soft)] pb-3">
                      <div className="flex items-center gap-3">
                        <CalendarIcon size={16} className="text-[var(--color-muted)]" />
                        <span className="font-bold font-mono text-sm text-[var(--color-text)]">
                          {new Date(entry.entry_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {entryTrades.length > 0 && (
                          <span className={`text-xs font-mono font-bold ${pnl >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
                            {pnl >= 0 ? '+' : ''}{fmtMoney(pnl)} ({entryTrades.length} trades)
                          </span>
                        )}
                        <button 
                          onClick={() => {
                            handleDateChange(entry.entry_date)
                            setViewMode('day')
                          }}
                          className="px-3 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] text-xs font-semibold rounded-md transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                    
                    {entry.content && (
                      <p className="text-sm text-[var(--color-muted)] leading-relaxed whitespace-pre-wrap font-body">
                        {entry.content}
                      </p>
                    )}
                    
                    {entry.image_url && (
                      <div 
                        className="relative w-48 h-32 rounded-lg overflow-hidden border border-[var(--color-border)] cursor-zoom-in hover:opacity-90 transition-opacity"
                        onClick={() => setLightboxUrl(entry.image_url)}
                      >
                        <Image src={entry.image_url} alt="Journal Attachment" fill className="object-cover" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {lightboxUrl && (
        <ImageLightbox imageUrl={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}
    </div>
  )
}
