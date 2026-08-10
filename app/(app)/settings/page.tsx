import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/actions/auth'
import { AmbientBackground } from '@/components/ui/AmbientBackground'
import { Settings, User, CreditCard, ShieldAlert, Sliders, LogOut } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="relative min-h-screen">
      {/* Dark Ambient Tech Backdrop */}
      <AmbientBackground />

      <div className="p-4 lg:p-6 max-w-4xl mx-auto flex flex-col gap-6 relative z-10">
        {/* Page Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--color-border)]">
          <div className="p-2.5 rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border-soft)] text-[var(--color-accent)]">
            <Settings size={20} />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-[var(--color-text)] tracking-tight">
              Settings & Preferences
            </h1>
            <p className="text-xs text-[var(--color-muted)]">
              Account parameters, prop firm risk limits, and profile configuration
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-[var(--color-surface-alt)]/80 backdrop-blur-md border border-[var(--color-border-soft)] rounded-2xl p-6 shadow-md flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-[var(--color-border-soft)] pb-3">
            <User size={18} className="text-[var(--color-accent)]" />
            <h2 className="font-display text-base font-bold text-[var(--color-text)] m-0">
              User Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <span className="text-xs text-[var(--color-muted)] block mb-1">Email Address</span>
              <div className="text-sm font-medium font-mono text-[var(--color-text)] bg-[var(--color-surface)] px-3 py-2 rounded-lg border border-[var(--color-border)]">
                {user?.email || 'trader@ledgerline.app'}
              </div>
            </div>

            <div>
              <span className="text-xs text-[var(--color-muted)] block mb-1">User Identifier (UID)</span>
              <div className="text-xs font-mono text-[var(--color-muted-dark)] bg-[var(--color-surface)] px-3 py-2.5 rounded-lg border border-[var(--color-border)] truncate">
                {user?.id || 'uid_demo_trader_100k'}
              </div>
            </div>
          </div>
        </div>

        {/* Subscription & Billing Card */}
        <div className="bg-[var(--color-surface-alt)]/80 backdrop-blur-md border border-[var(--color-border-soft)] rounded-2xl p-6 shadow-md flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-[var(--color-border-soft)] pb-3">
            <CreditCard size={18} className="text-[var(--color-profit)]" />
            <h2 className="font-display text-base font-bold text-[var(--color-text)] m-0">
              Plan & Billing
            </h2>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4 pt-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--color-text)]">Beta Pro Membership</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[var(--color-profit)]/15 text-[var(--color-profit)] border border-[var(--color-profit)]/30">
                  Active
                </span>
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Full access to Prop Firm Drawdown Gauges, 24-Week Heatmaps, and TradingView Charts.
              </p>
            </div>

            <button
              disabled
              className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted-dark)] rounded-lg px-4 py-2 text-xs font-medium cursor-not-allowed opacity-70"
            >
              Enterprise Tier (Coming Soon)
            </button>
          </div>
        </div>

        {/* Risk & Rules Compliance Default Preferences */}
        <div className="bg-[var(--color-surface-alt)]/80 backdrop-blur-md border border-[var(--color-border-soft)] rounded-2xl p-6 shadow-md flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-[var(--color-border-soft)] pb-3">
            <ShieldAlert size={18} className="text-[var(--color-amber)]" />
            <h2 className="font-display text-base font-bold text-[var(--color-text)] m-0">
              Risk Management Defaults
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 font-mono text-xs">
            <div className="bg-[var(--color-surface)] p-3.5 rounded-xl border border-[var(--color-border)]">
              <span className="text-[10px] font-body text-[var(--color-muted-dark)] block mb-1">DEFAULT DAILY LOSS LIMIT</span>
              <span className="text-sm font-bold text-[var(--color-loss)]">5.0%</span>
            </div>

            <div className="bg-[var(--color-surface)] p-3.5 rounded-xl border border-[var(--color-border)]">
              <span className="text-[10px] font-body text-[var(--color-muted-dark)] block mb-1">MAX DRAWDOWN BUFFER</span>
              <span className="text-sm font-bold text-[var(--color-amber)]">10.0%</span>
            </div>

            <div className="bg-[var(--color-surface)] p-3.5 rounded-xl border border-[var(--color-border)]">
              <span className="text-[10px] font-body text-[var(--color-muted-dark)] block mb-1">PROFIT EVALUATION TARGET</span>
              <span className="text-sm font-bold text-[var(--color-profit)]">10.0%</span>
            </div>
          </div>
        </div>

        {/* Sign Out Card */}
        <div className="pt-2">
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-2 text-xs font-semibold text-[var(--color-loss)] hover:bg-[var(--color-loss)]/10 border border-[var(--color-loss)]/30 rounded-xl px-5 py-3 transition-colors active:scale-98"
            >
              <LogOut size={15} />
              <span>Sign Out of Account</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
