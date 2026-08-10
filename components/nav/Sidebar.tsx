'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Shield, Settings, LogOut, LucideIcon } from 'lucide-react'
import { signOut } from '@/actions/auth'
import { useRouter } from 'next/navigation'

function NavItem({ icon: Icon, label, href, active }: { icon: LucideIcon, label: string, href: string, active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-[10px] w-full p-[9px_12px_9px_10px] rounded-[8px] border-l-2 font-body text-[13.5px] cursor-pointer text-left transition-all duration-120
        ${active ? 'border-[var(--color-accent)] bg-[var(--color-surface-alt)] text-[var(--color-text)] font-semibold' : 'border-transparent bg-transparent text-[var(--color-muted)] font-medium hover:bg-[var(--color-surface-hover)]'}
      `}
    >
      <Icon size={16} className={`shrink-0 ${active ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted-dark)]'}`} />
      {label}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/sign-in')
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: BookOpen, label: "Trade Log", href: "/trades" },
    { icon: Shield, label: "Accounts", href: "/accounts" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ]

  return (
    <aside className="hidden md:flex w-[210px] min-h-screen bg-[var(--color-surface)] border-r border-[var(--color-border)] p-[20px_14px] flex-col gap-[22px] sticky top-0">
      <div className="flex items-center gap-[9px] px-[6px]">
        <div className="w-[24px] h-[24px] rounded-[6px]" style={{ background: `linear-gradient(135deg, var(--color-accent), var(--color-profit))` }} />
        <span className="font-display text-[15.5px] font-bold text-[var(--color-text)]">Ledgerline</span>
      </div>
      
      <nav className="flex flex-col gap-[3px]">
        {navItems.map((n) => (
          <NavItem key={n.label} icon={n.icon} label={n.label} href={n.href} active={pathname.startsWith(n.href)} />
        ))}
      </nav>
      
      <div className="mt-auto">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-[9px] w-full bg-transparent border-none text-[var(--color-muted-dark)] text-[13px] p-[9px_12px] cursor-pointer hover:text-[var(--color-text)] transition-colors"
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </aside>
  )
}
