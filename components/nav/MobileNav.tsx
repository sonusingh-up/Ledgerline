'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, LayoutDashboard, BookOpen, Shield, Settings, LucideIcon } from 'lucide-react'

function NavItem({ icon: Icon, label, href, active, onClick }: { icon: LucideIcon, label: string, href: string, active: boolean, onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-[10px] w-full p-[9px_12px_9px_10px] rounded-[8px] border-l-2 font-body text-[13.5px] cursor-pointer text-left transition-all duration-120
        ${active ? 'border-[var(--color-accent)] bg-[var(--color-surface-alt)] text-[var(--color-text)] font-semibold' : 'border-transparent bg-transparent text-[var(--color-muted)] font-medium hover:bg-[var(--color-surface-hover)]'}
      `}
    >
      <Icon size={16} className={`shrink-0 ${active ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted-dark)]'}`} />
      {label}
    </Link>
  )
}

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: BookOpen, label: "Trade Log", href: "/trades" },
    { icon: Shield, label: "Accounts", href: "/accounts" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ]

  return (
    <>
      <button className="md:hidden bg-transparent border-none text-[var(--color-muted)] cursor-pointer" onClick={() => setOpen(true)}>
        <Menu size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-60 bg-black/70 md:hidden" onClick={() => setOpen(false)}>
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="w-[230px] h-full bg-[var(--color-surface)] border-r border-[var(--color-border)] p-[20px_14px] flex flex-col gap-[22px]"
          >
            <div className="flex items-center gap-[9px] px-[6px]">
              <div className="w-[24px] h-[24px] rounded-[6px]" style={{ background: `linear-gradient(135deg, var(--color-accent), var(--color-profit))` }} />
              <span className="font-display text-[15.5px] font-bold text-[var(--color-text)]">Ledgerline</span>
            </div>
            <nav className="flex flex-col gap-[3px]">
              {navItems.map((n) => (
                <NavItem key={n.label} icon={n.icon} label={n.label} href={n.href} active={pathname.startsWith(n.href)} onClick={() => setOpen(false)} />
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
