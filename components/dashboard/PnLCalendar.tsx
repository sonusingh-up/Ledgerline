import { useMemo } from 'react'
import { buildPnLCalendarMatrix, isoDaysAgo, fmtMoney } from '@/lib/calculations'
import { Trade } from '@/lib/types'

export function PnLCalendar({ trades, baseDate = new Date().toISOString().split('T')[0], weeks = 6 }: { trades: Trade[], baseDate?: string, weeks?: number }) {
  const dailyMap = useMemo(() => buildPnLCalendarMatrix(trades, baseDate, weeks), [trades, baseDate, weeks])

  const maxAbs = Math.max(1, ...Object.values(dailyMap).map((v) => Math.abs(v)))
  const totalDays = weeks * 7
  const days = Array.from({ length: totalDays }, (_, i) => isoDaysAgo(baseDate, totalDays - 1 - i))

  const cellColor = (pnl?: number) => {
    if (pnl === undefined) return 'var(--color-border-soft)'
    if (pnl === 0) return 'var(--color-surface-alt)'
    const intensity = Math.min(1, Math.abs(pnl) / maxAbs)
    const base = pnl > 0 ? [79, 168, 138] : [196, 97, 74] // profit vs loss rgb
    const alpha = 0.25 + intensity * 0.75
    return `rgba(${base[0]},${base[1]},${base[2]},${alpha})`
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] p-[18px_20px]">
      <div className="flex justify-between items-center mb-[14px]">
        <div className="text-[12px] text-[var(--color-muted)]">DAILY P&L — LAST {weeks} WEEKS</div>
        <div className="flex items-center gap-[6px] text-[10.5px] text-[var(--color-muted-dark)]">
          <span>Loss</span>
          <span className="w-[10px] h-[10px] rounded-[2px]" style={{ background: `rgba(196,97,74,0.7)` }} />
          <span className="w-[10px] h-[10px] rounded-[2px]" style={{ background: 'var(--color-surface-alt)' }} />
          <span className="w-[10px] h-[10px] rounded-[2px]" style={{ background: `rgba(79,168,138,0.7)` }} />
          <span>Profit</span>
        </div>
      </div>
      <div className="overflow-x-auto pb-[4px]">
        <div 
          className="grid grid-flow-col gap-[4px] w-max" 
          style={{ gridTemplateRows: 'repeat(7, 1fr)' }}
        >
          {days.map((d) => {
            const pnl = dailyMap[d]
            return (
              <div key={d} title={pnl !== undefined ? `${d}: ${fmtMoney(pnl)}` : d}
                className="w-[14px] h-[14px] rounded-[3px] border border-[var(--color-border-soft)]"
                style={{ background: cellColor(pnl) }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
