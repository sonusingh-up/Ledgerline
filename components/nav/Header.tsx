'use client'

import React from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { 
  Menu, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Search, 
  Bell, 
  ShieldCheck,
} from 'lucide-react'
import { useSidebar } from './sidebar-context'
import { Account } from '@/lib/types'

export function Header({ accounts }: { accounts?: Account[] }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isCollapsed, toggleCollapse, toggleMobileOpen } = useSidebar()

  // Derive active account from URL param (same source as AccountSwitcher)
  const activeAccountId = searchParams.get('accountId')
  const activeAccount = accounts?.find((a) => a.id === activeAccountId) || accounts?.[0]

  const getPageTitle = () => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard'
    if (pathname.startsWith('/trades')) return 'Trade Log'
    if (pathname.startsWith('/accounts')) return 'Trading Accounts'
    if (pathname.startsWith('/settings')) return 'Settings'
    return 'Ledgerline'
  }

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between transition-colors">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileOpen}
          className="lg:hidden p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
          aria-label="Toggle mobile menu"
        >
          <Menu size={20} />
        </button>

        <button
          onClick={toggleCollapse}
          className="hidden lg:flex p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle desktop sidebar"
        >
          {isCollapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
        </button>

        <div className="h-4 w-[1px] bg-[var(--color-border)] hidden lg:block mx-1" />

        <div>
          <h1 className="text-base font-semibold text-[var(--color-text)] font-display tracking-tight leading-tight">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex items-center gap-2 max-w-sm w-full mx-4">
        <div className="relative w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-dark)]" />
          <input
            type="text"
            placeholder="Search trades, tickers, tags... (Press ⌘K)"
            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg pl-9 pr-12 py-1.5 text-xs text-[var(--color-text)] placeholder-[var(--color-muted-dark)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
            readOnly
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[var(--color-muted-dark)] bg-[var(--color-surface-alt)] px-1.5 py-0.5 rounded border border-[var(--color-border)]">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Account Badge — reads from URL param, same source as AccountSwitcher */}
        {activeAccount && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface-alt)] border border-[var(--color-border)] text-xs text-[var(--color-text)] font-medium">
            <ShieldCheck size={14} className="text-[var(--color-profit)]" />
            <span className="truncate max-w-[120px]">{activeAccount.label}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-profit)]" />
          </div>
        )}

        {/* Notification Bell */}
        <button 
          className="relative p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-1 border-l border-[var(--color-border)]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-accent)] to-[var(--color-violet)] text-white font-semibold text-xs flex items-center justify-center border border-[var(--color-border)]">
            TR
          </div>
        </div>
      </div>
    </header>
  )
}
