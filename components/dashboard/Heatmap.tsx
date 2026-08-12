'use client'

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { motion, Variants } from 'motion/react'
import { useRouter } from 'next/navigation'
import { Trade, JournalEntry } from '@/lib/types'
import { fmtMoney, isoDaysAgo } from '@/lib/calculations'
import { Crosshair, Calendar, Rows3 } from 'lucide-react'

// ─────────────────────────── Types ───────────────────────────

export interface HeatmapProps {
  trades?: Trade[]
  journalEntries?: JournalEntry[]
  weeks?: number
  baseDate?: string
  selectedDate?: string
  onSelectDate?: (date: string) => void
  className?: string
}

interface DailyInfo {
  pnl: number
  count: number
  wins: number
  rMultiples: number[]
  bestTradePnl: number | null
  worstTradePnl: number | null
  hasJournalEntry: boolean
}

interface TooltipData {
  date: string
  pnl: number
  count: number
  winRate: number
  avgR: number | null
  bestPnl: number | null
  worstPnl: number | null
  x: number
  y: number
  flipped: boolean
}

// ─────────────────────────── Shared Color Scale ───────────────────────────

function getCellColor(pnl?: number, count?: number): string {
  if (!count || pnl === undefined || pnl === 0) return 'var(--color-surface-alt)'
  if (pnl > 0) {
    if (pnl > 1000) return '#34D399'
    if (pnl > 400) return '#10B981'
    return '#065F46'
  } else {
    if (pnl < -1000) return '#F87171'
    if (pnl < -400) return '#EF4444'
    return '#991B1B'
  }
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// ─────────────────────────── Main Component ───────────────────────────

export function Heatmap({
  trades = [],
  journalEntries = [],
  weeks = 24,
  baseDate = new Date().toISOString().split('T')[0],
  selectedDate,
  onSelectDate,
  className = '',
}: HeatmapProps) {
  const router = useRouter()
  const gridRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [hoveredCell, setHoveredCell] = useState<TooltipData | null>(null)
  const [viewMode, setViewMode] = useState<'weeks' | 'month'>('weeks')

  const todayStr = new Date().toISOString().split('T')[0]

  // ── Aggregate daily stats from trades ──
  const dailyData = useMemo(() => {
    const map: Record<string, DailyInfo> = {}
    trades.forEach((t) => {
      const rawDate = t.trade_date || (t as any).exit_date || (t as any).created_at
      if (!rawDate) return
      const dateStr = String(rawDate).split('T')[0]
      if (!map[dateStr]) {
        map[dateStr] = { pnl: 0, count: 0, wins: 0, rMultiples: [], bestTradePnl: null, worstTradePnl: null, hasJournalEntry: false }
      }
      const pnl = Number(t.pnl || 0)
      map[dateStr].pnl += pnl
      map[dateStr].count += 1
      if (pnl > 0) map[dateStr].wins += 1
      if (t.r_multiple !== null && t.r_multiple !== undefined) {
        map[dateStr].rMultiples.push(Number(t.r_multiple))
      }
      if (map[dateStr].bestTradePnl === null || pnl > map[dateStr].bestTradePnl) {
        map[dateStr].bestTradePnl = pnl
      }
      if (map[dateStr].worstTradePnl === null || pnl < map[dateStr].worstTradePnl) {
        map[dateStr].worstTradePnl = pnl
      }
    })

    journalEntries.forEach(entry => {
      const dateStr = entry.entry_date
      if (!map[dateStr]) {
        map[dateStr] = { pnl: 0, count: 0, wins: 0, rMultiples: [], bestTradePnl: null, worstTradePnl: null, hasJournalEntry: true }
      } else {
        map[dateStr].hasJournalEntry = true
      }
    })

    return map
  }, [trades, journalEntries])

  // ── Generate week columns (left = oldest, right = newest) ──
  const columns = useMemo(() => {
    const cols: { date: string; weekIndex: number; dayIndex: number }[][] = []
    for (let w = 0; w < weeks; w++) {
      const col: { date: string; weekIndex: number; dayIndex: number }[] = []
      for (let d = 0; d < 7; d++) {
        const daysBack = (weeks - 1 - w) * 7 + (6 - d)
        const date = isoDaysAgo(baseDate, daysBack)
        col.push({ date, weekIndex: w, dayIndex: d })
      }
      cols.push(col)
    }
    return cols
  }, [baseDate, weeks])

  // ── Sticky month labels ──
  const monthLabels = useMemo(() => {
    const labels: { month: string; colIndex: number }[] = []
    let lastMonth = ''
    columns.forEach((col, colIdx) => {
      const firstDate = col[0].date // Monday of this week
      const m = MONTH_NAMES[parseInt(firstDate.slice(5, 7), 10) - 1]
      if (m !== lastMonth) {
        labels.push({ month: m, colIndex: colIdx })
        lastMonth = m
      }
    })
    return labels
  }, [columns])

  // ── Auto-scroll to current week on mount ──
  const scrollToToday = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.scrollTo({
        left: gridRef.current.scrollWidth,
        behavior: 'smooth',
      })
    }
  }, [])

  useEffect(() => {
    // Delay to allow the grid to render
    const timer = setTimeout(scrollToToday, 100)
    return () => clearTimeout(timer)
  }, [scrollToToday])

  // ── Cell click → navigate to /trades filtered by date ──
  const handleCellClick = (date: string) => {
    onSelectDate?.(date)
    router.push(`/trades?date=${date}`)
  }

  // ── Tooltip with edge-collision detection ──
  const handleMouseEnter = (e: React.MouseEvent, date: string, info: DailyInfo | undefined) => {
    const cellRect = e.currentTarget.getBoundingClientRect()
    const cardRect = cardRef.current?.getBoundingClientRect()
    if (!cardRect) return

    const pnl = info?.pnl || 0
    const count = info?.count || 0
    const winRate = count > 0 ? ((info?.wins || 0) / count) * 100 : 0
    const avgR = info && info.rMultiples.length > 0
      ? info.rMultiples.reduce((a, b) => a + b, 0) / info.rMultiples.length
      : null

    const tooltipWidth = 180
    const cellCenterX = cellRect.left - cardRect.left + cellRect.width / 2
    const cellTopY = cellRect.top - cardRect.top

    // Flip tooltip left if it would overflow the card's right edge
    const flipped = cellCenterX + tooltipWidth / 2 > cardRect.width - 16

    setHoveredCell({
      date,
      pnl,
      count,
      winRate,
      avgR,
      bestPnl: count > 1 ? info?.bestTradePnl ?? null : null,
      worstPnl: count > 1 ? info?.worstTradePnl ?? null : null,
      x: cellCenterX,
      y: cellTopY,
      flipped,
    })
  }

  // ─── Calendar Month View ───
  const monthViewData = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDow = (firstDay.getDay() + 6) % 7 // 0=Mon

    const cells: { date: string; isCurrentMonth: boolean }[] = []
    // Fill leading blanks
    for (let i = 0; i < startDow; i++) {
      const d = new Date(year, month, 1 - (startDow - i))
      cells.push({ date: d.toISOString().slice(0, 10), isCurrentMonth: false })
    }
    // Fill month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dt = new Date(year, month, d)
      cells.push({ date: dt.toISOString().slice(0, 10), isCurrentMonth: true })
    }
    // Fill trailing to complete 6th week if needed
    while (cells.length < 42 && cells.length % 7 !== 0) {
      const lastDate = new Date(cells[cells.length - 1].date)
      lastDate.setDate(lastDate.getDate() + 1)
      cells.push({ date: lastDate.toISOString().slice(0, 10), isCurrentMonth: false })
    }

    return {
      monthName: `${MONTH_NAMES[month]} ${year}`,
      cells,
      weekRows: Array.from({ length: Math.ceil(cells.length / 7) }, (_, i) => cells.slice(i * 7, i * 7 + 7)),
    }
  }, [])

  // ── Animation variants ──
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.02 } },
  }
  const columnVariants: Variants = {
    hidden: { opacity: 0, x: -8, scale: 0.97 },
    show: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.3, staggerChildren: 0.01 } },
  }
  const cellVariants: Variants = {
    hidden: { opacity: 0, scale: 0.7 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  }

  // Cell size
  const CELL = 'w-3.5 h-3.5'

  return (
    <div
      ref={cardRef}
      className={`relative flex flex-col gap-3 p-5 rounded-2xl bg-[var(--color-surface-alt)]/70 backdrop-blur-md border border-[var(--color-border-soft)] shadow-md hover:shadow-lg transition-shadow ${className}`}
    >
      {/* ── Header ── */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white font-display tracking-tight">
            Trading Activity
          </h3>
          <p className="text-[11px] text-[var(--color-muted-dark)] mt-0.5">
            {viewMode === 'weeks' ? `${weeks}-week daily P&L` : monthViewData.monthName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Today snap-back button */}
          {viewMode === 'weeks' && (
            <button
              onClick={scrollToToday}
              className="flex items-center gap-1 text-[10px] font-mono font-medium text-[var(--color-accent)] bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/25 px-2 py-1 rounded-md transition-colors"
              title="Jump to today"
            >
              <Crosshair size={11} />
              Today
            </button>
          )}

          {/* Week / Month toggle */}
          <div className="flex items-center bg-[var(--color-surface)]/80 p-0.5 rounded-md border border-[var(--color-border-soft)]">
            <button
              onClick={() => setViewMode('weeks')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all ${
                viewMode === 'weeks'
                  ? 'bg-[#6E8CFA] text-white shadow-xs'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
              }`}
              title="24-week strip view"
            >
              <Rows3 size={11} />
              Weeks
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all ${
                viewMode === 'month'
                  ? 'bg-[#6E8CFA] text-white shadow-xs'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
              }`}
              title="Calendar month view"
            >
              <Calendar size={11} />
              Month
            </button>
          </div>

          {/* Legend */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[var(--color-muted-dark)] font-mono">
            <span>Loss</span>
            <span className="w-2.5 h-2.5 rounded-xs bg-[#F87171]" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[#991B1B]" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[var(--color-surface-alt)] border border-[var(--color-border)]" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[#065F46]" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[#34D399]" />
            <span>Profit</span>
          </div>
        </div>
      </div>

      {/* ── Tooltip ── */}
      {hoveredCell && (
        <div
          className="absolute z-50 pointer-events-none bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-2.5 shadow-2xl text-xs flex flex-col gap-1 min-w-[170px]"
          style={{
            left: hoveredCell.flipped
              ? Math.max(8, hoveredCell.x - 170)
              : Math.min(hoveredCell.x, (cardRef.current?.clientWidth || 300) - 178),
            top: hoveredCell.y - 8,
            transform: 'translateY(-100%)',
          }}
        >
          <div className="font-mono text-[10px] text-[var(--color-muted)] border-b border-[var(--color-border-soft)] pb-1">
            {hoveredCell.date}
            {hoveredCell.date === todayStr && (
              <span className="ml-1.5 text-[var(--color-accent)] font-semibold">Today</span>
            )}
          </div>

          <div className="flex justify-between items-center pt-0.5">
            <span className="text-[var(--color-muted)]">P&L:</span>
            <span className={`font-mono font-semibold ${hoveredCell.pnl >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
              {hoveredCell.pnl >= 0 ? '+' : ''}{fmtMoney(hoveredCell.pnl)}
            </span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-[var(--color-muted)]">Trades:</span>
            <span className="font-mono text-[var(--color-text)]">{hoveredCell.count}</span>
          </div>

          {hoveredCell.count > 0 && (
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[var(--color-muted)]">Win Rate:</span>
              <span className="font-mono text-[var(--color-text)]">{hoveredCell.winRate.toFixed(0)}%</span>
            </div>
          )}

          {hoveredCell.avgR !== null && (
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[var(--color-muted)]">Avg R:</span>
              <span className={`font-mono font-semibold ${hoveredCell.avgR >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
                {hoveredCell.avgR >= 0 ? '+' : ''}{hoveredCell.avgR.toFixed(2)}R
              </span>
            </div>
          )}

          {hoveredCell.bestPnl !== null && hoveredCell.worstPnl !== null && (
            <div className="flex justify-between items-center text-[11px] border-t border-[var(--color-border-soft)] pt-1 mt-0.5">
              <span className="text-[var(--color-profit)] font-mono">↑{fmtMoney(hoveredCell.bestPnl)}</span>
              <span className="text-[var(--color-loss)] font-mono">↓{fmtMoney(hoveredCell.worstPnl)}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Weeks Strip View ── */}
      {viewMode === 'weeks' && (
        <div className="flex flex-col gap-0.5">
          {/* Month Labels Row */}
          <div className="flex items-start gap-2">
            {/* Spacer for weekday labels */}
            <div className="w-6 shrink-0" />
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-1" style={{ minWidth: columns.length * 18 }}>
                {columns.map((col, colIdx) => {
                  const label = monthLabels.find((ml) => ml.colIndex === colIdx)
                  return (
                    <div key={`ml-${colIdx}`} className="w-3.5 shrink-0 text-center">
                      {label && (
                        <span className="text-[9px] font-mono text-[var(--color-muted-dark)] font-semibold whitespace-nowrap">
                          {label.month}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Grid Row */}
          <div className="flex items-start gap-2">
            {/* Y-Axis Day Labels */}
            <div className="grid grid-rows-7 gap-1 pt-0.5 text-[10px] text-[var(--color-muted-dark)] font-mono select-none shrink-0 w-6">
              {WEEKDAYS.map((day, idx) => (
                <div key={day} className="h-3.5 flex items-center justify-end pr-1">
                  {idx % 2 === 0 ? day : ''}
                </div>
              ))}
            </div>

            {/* Scrollable Grid — touch-friendly with snap */}
            <div
              ref={gridRef}
              className="flex-1 overflow-x-auto pb-1.5 hide-scrollbar"
              style={{
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex items-center gap-1"
                style={{ minWidth: 'max-content' }}
              >
                {columns.map((col, colIdx) => (
                  <motion.div
                    key={`col-${colIdx}`}
                    variants={columnVariants}
                    className="grid grid-rows-7 gap-1"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    {col.map(({ date }) => {
                      const info = dailyData[date]
                      const pnl = info?.pnl || 0
                      const count = info?.count || 0
                      const bgColor = getCellColor(pnl, count)
                      const isSelected = selectedDate === date
                      const isToday = date === todayStr

                      return (
                        <motion.div
                          key={date}
                          variants={cellVariants}
                          onClick={() => handleCellClick(date)}
                          onMouseEnter={(e) => handleMouseEnter(e, date, info)}
                          onMouseLeave={() => setHoveredCell(null)}
                          whileHover={{ scale: 1.3, zIndex: 20 }}
                          className={`${CELL} rounded-xs cursor-pointer border transition-colors flex items-center justify-center relative ${
                            isToday
                              ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/40 z-10'
                              : isSelected
                                ? 'border-white ring-1 ring-white/30 z-10'
                                : 'border-[var(--color-border-soft)]/40 hover:border-white/50'
                          }`}
                          style={{ backgroundColor: bgColor }}
                        >
                          {info?.hasJournalEntry && (
                            <span className="w-1 h-1 rounded-full bg-white/80 shadow-sm" />
                          )}
                        </motion.div>
                      )
                    })}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* ── Calendar Month View ── */}
      {viewMode === 'month' && (
        <div className="flex flex-col gap-1.5">
          {/* Day-of-week header */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-[10px] font-mono text-[var(--color-muted-dark)] font-semibold py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar weeks */}
          {monthViewData.weekRows.map((row, rowIdx) => (
            <div key={`mrow-${rowIdx}`} className="grid grid-cols-7 gap-1.5">
              {row.map((cell) => {
                const info = dailyData[cell.date]
                const pnl = info?.pnl || 0
                const count = info?.count || 0
                const bgColor = getCellColor(pnl, count)
                const isToday = cell.date === todayStr
                const dayNum = parseInt(cell.date.slice(8, 10), 10)

                return (
                  <div
                    key={cell.date}
                    onClick={() => handleCellClick(cell.date)}
                    onMouseEnter={(e) => handleMouseEnter(e, cell.date, info)}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`relative h-9 rounded-lg cursor-pointer border flex flex-col items-center justify-center transition-all hover:scale-105 ${
                      isToday
                        ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/40'
                        : 'border-[var(--color-border-soft)]/40 hover:border-white/40'
                    } ${!cell.isCurrentMonth ? 'opacity-30' : ''}`}
                    style={{ backgroundColor: bgColor }}
                  >
                    <span className={`text-[10px] font-mono leading-none ${
                      isToday ? 'text-[var(--color-accent)] font-bold' : 'text-white/70'
                    }`}>
                      {dayNum}
                    </span>
                    {count > 0 && (
                      <span className={`text-[8px] font-mono leading-none mt-0.5 font-bold ${
                        pnl >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'
                      }`}>
                        {pnl >= 0 ? '+' : ''}{fmtMoney(pnl)}
                      </span>
                    )}
                    {info?.hasJournalEntry && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shadow-sm" />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Heatmap
