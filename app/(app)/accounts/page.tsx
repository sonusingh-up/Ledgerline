import { getAccounts, archiveAccount } from '@/actions/accounts'
import Link from 'next/link'
import { Plus, Archive } from 'lucide-react'
import { fmtMoney } from '@/lib/calculations'

export const dynamic = 'force-dynamic'

export default async function AccountsPage() {
  const { accounts } = await getAccounts()

  return (
    <div className="p-[24px]">
      <div className="flex justify-between items-center mb-[20px]">
        <h1 className="font-display text-[20px] font-semibold">Accounts</h1>
        <Link 
          href="/accounts/new"
          className="flex items-center gap-[6px] bg-[var(--color-accent)] text-[#0E1318] border-none rounded-[8px] p-[9px_16px] font-body font-semibold text-[13.5px] no-underline shadow-[0_2px_8px_rgba(110,140,250,0.25)] hover:opacity-90 transition-opacity"
        >
          <Plus size={15} /> New Account
        </Link>
      </div>

      {(!accounts || accounts.length === 0) ? (
        <div className="bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-[10px] p-[60px_20px] text-center">
          <div className="font-display text-[16px] text-[var(--color-text)] mb-[6px]">No accounts found</div>
          <div className="text-[13px] text-[var(--color-muted)] mb-[18px]">Create an account to start journaling.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
          {accounts.map((acc) => (
            <div key={acc.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] p-[20px] flex flex-col gap-[12px]">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-display text-[16px] font-semibold m-0">{acc.label}</h3>
                  <div className="text-[12px] text-[var(--color-muted)] mt-[4px] capitalize">{acc.account_type} {acc.prop_firm_name ? `• ${acc.prop_firm_name}` : ''}</div>
                </div>
                <form action={async () => { 'use server'; await archiveAccount(acc.id) }}>
                  <button type="submit" className="bg-transparent border-none text-[var(--color-muted-dark)] cursor-pointer hover:text-[var(--color-loss)] transition-colors" title="Archive">
                    <Archive size={16} />
                  </button>
                </form>
              </div>
              
              <div className="mt-auto">
                <div className="text-[11px] text-[var(--color-muted-dark)] mb-[2px]">STARTING BALANCE</div>
                <div className="font-mono text-[18px] font-semibold">{fmtMoney(acc.start_balance)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
