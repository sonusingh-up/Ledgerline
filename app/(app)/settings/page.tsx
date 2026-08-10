import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/actions/auth'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="p-[24px] max-w-[600px]">
      <h1 className="font-display text-[20px] font-semibold mb-[20px]">Settings</h1>
      
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[14px] p-[28px] mb-[24px]">
        <h2 className="font-display text-[16px] font-semibold mb-[16px]">Profile</h2>
        
        <div className="flex flex-col gap-[16px]">
          <div>
            <div className="text-[12px] text-[var(--color-muted)] mb-[4px]">Email</div>
            <div className="text-[14px]">{user?.email}</div>
          </div>
          <div>
            <div className="text-[12px] text-[var(--color-muted)] mb-[4px]">User ID</div>
            <div className="text-[13px] font-mono text-[var(--color-muted-dark)]">{user?.id}</div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[14px] p-[28px] mb-[24px]">
        <h2 className="font-display text-[16px] font-semibold mb-[16px]">Billing</h2>
        <div className="text-[13px] text-[var(--color-muted)] mb-[12px]">You are currently on the Free Tier (Beta).</div>
        <button className="bg-[var(--color-surface-alt)] border border-[var(--color-border)] text-[var(--color-muted)] rounded-[6px] p-[8px_14px] text-[13px] cursor-not-allowed">
          Upgrade Plan (Coming Soon)
        </button>
      </div>

      <form action={signOut}>
        <button type="submit" className="text-[var(--color-loss)] bg-transparent border border-[var(--color-loss-dim)] rounded-[6px] p-[8px_14px] text-[13px] cursor-pointer hover:bg-[var(--color-loss-dim)] transition-colors">
          Sign out
        </button>
      </form>
    </div>
  )
}
