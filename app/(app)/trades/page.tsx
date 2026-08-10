import { getAccounts } from '@/actions/accounts'
import { getTrades } from '@/actions/trades'
import Link from 'next/link'
import { TradeTable } from '@/components/trades/TradeTable'
import { AccountSwitcher } from '@/components/accounts/AccountSwitcher'
import { DashboardClient } from '../dashboard/DashboardClient'
import { AmbientBackground } from '@/components/ui/AmbientBackground'
import { BookOpen, TrendingUp, Award, BarChart2 } from 'lucide-react'
import { fmtMoney } from '@/lib/calculations'

export const dynamic = 'force-dynamic'

export default async function TradesPage({ searchParams }: { searchParams: Promise<{ accountId?: string, date?: string }> }) {
  const params = await searchParams
  const { accounts } = await getAccounts()
  
  if (!accounts || accounts.length === 0) {
    return (
      <div className="relative flex-1 flex items-center justify-center min-h-screen p-6">
        <AmbientBackground />
        <div className="text-center text-[var(--color-muted)] relative z-10 font-mono text-sm">
          No accounts found. Create one first.
        </div>
      </div>
    )
  }

  const selectedAccountId = params.accountId || accounts[0].id
  const account = accounts.find((a) => a.id === selectedAccountId) || accounts[0]
  
  const { trades } = await getTrades(account.id)
  const allTrades = trades || []
  const filterDate = params.date || null
  const safeTrades = filterDate
    ? allTrades.filter((t) => t.trade_date === filterDate)
    : allTrades

  // Quick stats summary
  const totalTrades = safeTrades.length
  const winningTrades = safeTrades.filter((t) => Number(t.pnl || 0) >= 0).length
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
  const netPnL = safeTrades.reduce((acc, t) => acc + Number(t.pnl || 0), 0)

  return (
    <div className="relative min-h-screen">
      {/* Dark Ambient Tech Backdrop */}
      <AmbientBackground />

      <div className="p-4 lg:p-6 flex flex-col gap-6 relative z-10">
        {/* Account Switcher Bar */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border-soft)] gap-3 flex-wrap bg-[var(--color-surface-alt)]/80 backdrop-blur-md shadow-xs">
          <div className="flex items-center gap-3">
            <AccountSwitcher accounts={accounts as any} />
          </div>
          <DashboardClient accountId={account.id} accountType={account.account_type as 'prop' | 'retail'} />
        </div>
        {/* Page Title & Stats Summary Pills */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border-soft)] text-[var(--color-accent)]">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-[var(--color-text)] tracking-tight">
                Trade Log & Journal
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-[var(--color-muted)]">
                  {filterDate ? `Showing trades for ${filterDate}` : 'Complete record of executed trades and setup tags'}
                </p>
                {filterDate && (
                  <Link
                    href={`/trades?accountId=${account.id}`}
                    className="text-[10px] font-mono text-[var(--color-accent)] bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/25 px-2 py-0.5 rounded-md transition-colors"
                  >
                    ✕ Clear filter
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface-alt)]/80 border border-[var(--color-border-soft)] backdrop-blur-sm text-xs">
              <BarChart2 size={14} className="text-[var(--color-cyan)]" />
              <span className="text-[var(--color-muted)]">Trades:</span>
              <span className="font-mono font-bold text-[var(--color-text)]">{totalTrades}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface-alt)]/80 border border-[var(--color-border-soft)] backdrop-blur-sm text-xs">
              <Award size={14} className="text-[var(--color-accent)]" />
              <span className="text-[var(--color-muted)]">Win Rate:</span>
              <span className="font-mono font-bold text-[var(--color-text)]">{winRate.toFixed(1)}%</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface-alt)]/80 border border-[var(--color-border-soft)] backdrop-blur-sm text-xs">
              <TrendingUp size={14} className={netPnL >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'} />
              <span className="text-[var(--color-muted)]">Net P&L:</span>
              <span className={`font-mono font-bold ${netPnL >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
                {netPnL >= 0 ? '+' : ''}{fmtMoney(netPnL)}
              </span>
            </div>
          </div>
        </div>

        {/* Trade Log Table Container */}
        {safeTrades.length > 0 ? (
          <div className="bg-[var(--color-surface-alt)]/80 backdrop-blur-md border border-[var(--color-border-soft)] rounded-xl p-1 shadow-md">
            <TradeTable trades={safeTrades as any} />
          </div>
        ) : (
          <div className="bg-[var(--color-surface)]/80 backdrop-blur-md border border-dashed border-[var(--color-border)] rounded-xl p-12 text-center">
            <div className="font-display text-base text-[var(--color-text)] mb-1 font-semibold">No trades logged yet</div>
            <div className="text-xs text-[var(--color-muted)] mb-4">Click "Log Trade" above to start tracking your trading activity.</div>
          </div>
        )}
      </div>
    </div>
  )
}
