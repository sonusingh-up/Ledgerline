import { getAccounts } from '@/actions/accounts'
import { getTrades } from '@/actions/trades'
import { TradeTable } from '@/components/trades/TradeTable'
import { AccountSwitcher } from '@/components/accounts/AccountSwitcher'
import { LogTradeModal } from '@/components/trades/LogTradeModal'
import { DashboardClient } from '../dashboard/DashboardClient'

export const dynamic = 'force-dynamic'

export default async function TradesPage({ searchParams }: { searchParams: Promise<{ accountId?: string }> }) {
  const params = await searchParams
  const { accounts } = await getAccounts()
  
  if (!accounts || accounts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center text-[var(--color-muted)]">No accounts found. Create one first.</div>
      </div>
    )
  }

  const selectedAccountId = params.accountId || accounts[0].id
  const account = accounts.find((a) => a.id === selectedAccountId) || accounts[0]
  
  const { trades } = await getTrades(account.id)

  return (
    <>
      <div className="flex items-center justify-between p-[16px_24px] border-b border-[var(--color-border)] gap-[12px] flex-wrap">
        <div className="flex items-center gap-[10px]">
          <AccountSwitcher accounts={accounts as any} />
        </div>
        <DashboardClient accountId={account.id} accountType={account.account_type as 'prop' | 'retail'} />
      </div>
      
      <div className="p-[24px]">
        <h1 className="font-display text-[20px] font-semibold mb-[20px]">Trade Log</h1>
        {trades && trades.length > 0 ? (
          <TradeTable trades={trades as any} />
        ) : (
          <div className="bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-[10px] p-[60px_20px] text-center">
            <div className="font-display text-[16px] text-[var(--color-text)] mb-[6px]">No trades on this account yet</div>
            <div className="text-[13px] text-[var(--color-muted)] mb-[18px]">Log your first trade to see it here.</div>
          </div>
        )}
      </div>
    </>
  )
}
