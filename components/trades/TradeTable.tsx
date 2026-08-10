'use client'

import React from 'react'
import { Trade } from '@/lib/types'
import { fmtDate, fmtMoney } from '@/lib/calculations'
import { TrendingUp, TrendingDown, Tag, Camera } from 'lucide-react'
import { ScreenshotLightbox } from './ScreenshotLightbox'

const ASSET_TYPE_COLOR: Record<string, string> = { 
  fx: '#6E8CFA', 
  metal: '#D9A441', 
  index: '#9B8CFA', 
  crypto: '#4FB8D9',
  stock: '#4FA88A',
  futures: '#C4614A',
  other: '#8B96A6'
}

export function TradeTable({ trades, limit }: { trades: Trade[], limit?: number }) {
  const [selectedScreenshot, setSelectedScreenshot] = React.useState<string | null>(null)
  const displayTrades = limit ? trades.slice(0, limit) : trades

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-[var(--color-surface-alt)]/70 backdrop-blur-md border border-[var(--color-border-soft)] shadow-md hover:shadow-lg transition-shadow">
      <div className="px-5 py-4 text-xs font-semibold text-[var(--color-muted)] border-b border-[var(--color-border-soft)] font-display flex items-center justify-between">
        <span className="text-white tracking-tight text-sm">Execution Log</span>
        <span className="text-[11px] font-mono text-[var(--color-muted-dark)] bg-[var(--color-surface)]/60 px-2.5 py-0.5 rounded-md border border-[var(--color-border-soft)]">{displayTrades.length} Trades</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-xs text-left">
          <thead>
            <tr className="text-[var(--color-muted-dark)] border-b border-[var(--color-border-soft)] bg-[var(--color-surface-alt)]/50">
              {['Date', 'Symbol', 'Side', 'Size', 'Entry', 'Exit', 'R-Multiple', 'P&L', 'Setup Tag'].map((h) => (
                <th key={h} className="px-5 py-3 font-semibold font-body text-[11px]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-soft)]">
            {displayTrades.map((t) => {
              const isProfit = (t.pnl ?? 0) >= 0
              const isLong = t.side === 'long'
              const assetColor = ASSET_TYPE_COLOR[t.asset_type] || ASSET_TYPE_COLOR.fx

              return (
                <tr
                  key={t.id}
                  className="transition-colors hover:bg-[var(--color-surface-hover)]/70 group"
                >
                  {/* Date */}
                  <td className="px-5 py-3.5 text-[var(--color-muted)] whitespace-nowrap">
                    {fmtDate(t.trade_date)}
                  </td>

                  {/* Symbol & Asset Indicator */}
                  <td className="px-5 py-3.5 text-[var(--color-text)] font-bold whitespace-nowrap">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: assetColor }}
                      />
                      {t.symbol}
                    </span>
                  </td>

                  {/* Direction Badge */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        isLong
                          ? 'bg-[var(--color-profit)]/15 text-[var(--color-profit)] border-[var(--color-profit)]/30'
                          : 'bg-[var(--color-loss)]/15 text-[var(--color-loss)] border-[var(--color-loss)]/30'
                      }`}
                    >
                      {t.side}
                    </span>
                  </td>

                  {/* Size */}
                  <td className="px-5 py-3.5 text-[var(--color-muted)] font-mono whitespace-nowrap">
                    {t.size}
                  </td>

                  {/* Entry */}
                  <td className="px-5 py-3.5 text-[var(--color-text)] font-mono whitespace-nowrap">
                    {t.entry_price ? t.entry_price.toFixed(4) : '-'}
                  </td>

                  {/* Exit */}
                  <td className="px-5 py-3.5 text-[var(--color-muted)] font-mono whitespace-nowrap">
                    {t.exit_price ? t.exit_price.toFixed(4) : '-'}
                  </td>

                  {/* R Multiple */}
                  <td
                    className={`px-5 py-3.5 font-bold whitespace-nowrap ${
                      (t.r_multiple ?? 0) >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'
                    }`}
                  >
                    {(t.r_multiple ?? 0) >= 0 ? '+' : ''}
                    {t.r_multiple ?? '0'}R
                  </td>

                  {/* Net PnL */}
                  <td className="px-5 py-3.5 font-bold whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 ${
                        isProfit ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'
                      }`}
                    >
                      {isProfit ? (
                        <TrendingUp size={13} className="shrink-0" />
                      ) : (
                        <TrendingDown size={13} className="shrink-0" />
                      )}
                      {isProfit ? '+' : ''}
                      {fmtMoney(t.pnl ?? 0)}
                    </span>
                  </td>

                  {/* Setup Tag & Screenshot */}
                  <td className="px-5 py-3.5 whitespace-nowrap flex items-center gap-2">
                    {t.setup_tag ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium font-body px-2 py-0.5 rounded-md bg-[var(--color-surface-alt)] border border-[var(--color-border)] text-[var(--color-text)]">
                        <Tag size={10} className="text-[var(--color-accent)] shrink-0" />
                        {t.setup_tag}
                      </span>
                    ) : (
                      <span className="text-[11px] text-[var(--color-muted-dark)] font-body">No tag</span>
                    )}

                    {t.screenshot_url && (
                      <button 
                        onClick={() => setSelectedScreenshot(t.screenshot_url!)}
                        className="p-1 rounded text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] transition-colors"
                        title="View Screenshot"
                      >
                        <Camera size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}

            {displayTrades.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-5 py-8 text-center text-[var(--color-muted)] font-body text-xs"
                >
                  No trades recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedScreenshot && (
        <ScreenshotLightbox 
          screenshotPath={selectedScreenshot} 
          onClose={() => setSelectedScreenshot(null)} 
        />
      )}
    </div>
  )
}

export default TradeTable
