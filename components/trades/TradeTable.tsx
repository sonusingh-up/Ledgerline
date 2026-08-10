import { Trade } from '@/lib/types'
import { fmtDate, fmtMoney } from '@/lib/calculations'
import { Pill } from '@/components/ui/Pill'
import { TrendingUp, TrendingDown } from 'lucide-react'

const TYPE_COLOR: Record<string, string> = { 
  fx: 'var(--color-accent)', 
  metal: 'var(--color-amber)', 
  index: 'var(--color-violet)', 
  crypto: 'var(--color-cyan)',
  stock: 'var(--color-profit)',
  futures: 'var(--color-loss)',
  other: 'var(--color-text)'
}

export function TradeTable({ trades, limit }: { trades: Trade[], limit?: number }) {
  const displayTrades = limit ? trades.slice(0, limit) : trades

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] overflow-hidden">
      <div className="p-[14px_20px] text-[12px] text-[var(--color-muted)] border-b border-[var(--color-border)]">RECENT TRADES</div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-[12.5px]">
          <thead>
            <tr className="text-[var(--color-muted-dark)] text-left">
              {["Date", "Symbol", "Side", "Size", "R", "P&L", "Setup"].map((h) => (
                <th key={h} className="p-[8px_20px] font-medium font-body text-[11px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayTrades.map((t) => (
              <tr key={t.id} className="border-t border-[var(--color-border-soft)] transition-colors duration-100 hover:bg-[var(--color-surface-alt)]">
                <td className="p-[9px_20px] text-[var(--color-muted)]">{fmtDate(t.trade_date)}</td>
                <td className="p-[9px_20px] text-[var(--color-text)]">
                  <span className="inline-flex items-center gap-[6px]">
                    <span 
                      className="w-[6px] h-[6px] rounded-full" 
                      style={{ background: TYPE_COLOR[t.asset_type] || TYPE_COLOR.fx }} 
                    />
                    {t.symbol}
                  </span>
                </td>
                <td className="p-[9px_20px]">
                  <Pill tone={t.side === "long" ? "profit" : "loss"}>{t.side.toUpperCase()}</Pill>
                </td>
                <td className="p-[9px_20px] text-[var(--color-muted)]">{t.size}</td>
                <td className="p-[9px_20px]" style={{ color: (t.r_multiple ?? 0) >= 0 ? 'var(--color-profit)' : 'var(--color-loss)' }}>
                  {(t.r_multiple ?? 0) >= 0 ? "+" : ""}{t.r_multiple}R
                </td>
                <td className="p-[9px_20px] font-semibold" style={{ color: (t.pnl ?? 0) >= 0 ? 'var(--color-profit)' : 'var(--color-loss)' }}>
                  {(t.pnl ?? 0) >= 0 ? (
                    <TrendingUp size={12} className="inline mr-1" />
                  ) : (
                    <TrendingDown size={12} className="inline mr-1" />
                  )}
                  {fmtMoney(t.pnl ?? 0)}
                </td>
                <td className="p-[9px_20px]">
                  {t.setup_tag && <Pill>{t.setup_tag}</Pill>}
                </td>
              </tr>
            ))}
            {displayTrades.length === 0 && (
              <tr>
                <td colSpan={7} className="p-[20px] text-center text-[var(--color-muted)] font-body text-[13px]">
                  No trades found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
