import { getAccounts, archiveAccount } from '@/actions/accounts'
import Link from 'next/link'
import { Plus, Archive, ShieldCheck, ArrowRight, Wallet, CheckCircle2 } from 'lucide-react'
import { fmtMoney } from '@/lib/calculations'
import { AmbientBackground } from '@/components/ui/AmbientBackground'

export const dynamic = 'force-dynamic'

export default async function AccountsPage() {
  const { accounts } = await getAccounts()

  return (
    <div className="relative min-h-screen">
      {/* Dark Ambient Tech Backdrop */}
      <AmbientBackground />

      <div className="p-4 lg:p-6 flex flex-col gap-6 relative z-10">
        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border-soft)] text-[var(--color-profit)]">
              <Wallet size={20} />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-[var(--color-text)] tracking-tight">
                Trading Accounts
              </h1>
              <p className="text-xs text-[var(--color-muted)]">
                Manage your prop firm evaluations and live retail trading accounts
              </p>
            </div>
          </div>

          <Link
            href="/accounts/new"
            className="flex items-center gap-1.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-white font-medium text-xs px-4 py-2.5 rounded-lg transition-all shadow-md active:scale-95"
          >
            <Plus size={15} />
            <span>Create New Account</span>
          </Link>
        </div>

        {/* Account Cards Grid */}
        {!accounts || accounts.length === 0 ? (
          <div className="bg-[var(--color-surface)]/80 backdrop-blur-md border border-dashed border-[var(--color-border)] rounded-xl p-12 text-center">
            <div className="font-display text-base text-[var(--color-text)] mb-1 font-semibold">No active accounts found</div>
            <div className="text-xs text-[var(--color-muted)] mb-4">Create your first prop or retail account to get started.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {accounts.map((acc) => {
              const isProp = acc.account_type === 'prop'

              return (
                <div
                  key={acc.id}
                  className="group bg-[var(--color-surface-alt)]/80 backdrop-blur-md border border-[var(--color-border-soft)] hover:border-[var(--color-accent)]/50 rounded-2xl p-5 flex flex-col justify-between gap-5 transition-all shadow-sm hover:shadow-xl relative overflow-hidden"
                >
                  {/* Top Bar: Title & Archive Button */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-base font-bold text-[var(--color-text)] m-0">
                          {acc.label}
                        </h3>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            isProp
                              ? 'bg-[var(--color-profit)]/15 text-[var(--color-profit)] border-[var(--color-profit)]/30'
                              : 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/30'
                          }`}
                        >
                          {acc.account_type}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--color-muted)] mt-1 font-medium">
                        {acc.prop_firm_name ? acc.prop_firm_name : 'Retail Brokerage'}
                      </div>
                    </div>

                    <form
                      action={async () => {
                        'use server'
                        await archiveAccount(acc.id)
                      }}
                    >
                      <button
                        type="submit"
                        className="p-1.5 rounded-lg text-[var(--color-muted-dark)] hover:text-[var(--color-loss)] hover:bg-[var(--color-surface-hover)] transition-colors"
                        title="Archive Account"
                      >
                        <Archive size={16} />
                      </button>
                    </form>
                  </div>

                  {/* Prop Rules Summary (if applicable) */}
                  {isProp && (
                    <div className="grid grid-cols-3 gap-2 bg-[var(--color-surface)]/60 rounded-xl p-3 border border-[var(--color-border-soft)] text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-[var(--color-muted-dark)] block font-body">Daily Limit</span>
                        <span className="text-[var(--color-loss)] font-semibold">{acc.daily_loss_limit_pct}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--color-muted-dark)] block font-body">Max DD</span>
                        <span className="text-[var(--color-amber)] font-semibold">{acc.max_drawdown_pct}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--color-muted-dark)] block font-body">Target</span>
                        <span className="text-[var(--color-profit)] font-semibold">{acc.profit_target_pct}%</span>
                      </div>
                    </div>
                  )}

                  {/* Starting Balance & Navigation Action */}
                  <div className="flex items-end justify-between pt-2 border-t border-[var(--color-border-soft)]">
                    <div>
                      <span className="text-[10px] text-[var(--color-muted-dark)] font-mono block">STARTING BALANCE</span>
                      <span className="font-mono text-xl font-bold text-white leading-tight">
                        {fmtMoney(acc.start_balance)}
                      </span>
                    </div>

                    <Link
                      href={`/dashboard?accountId=${acc.id}`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] hover:text-white transition-colors group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Open Journal</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
