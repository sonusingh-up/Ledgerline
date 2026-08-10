'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  BookOpen, 
  Shield, 
  Settings, 
  LogOut, 
  BarChart3,
  NotebookPen,
  X,
  LucideIcon 
} from 'lucide-react'
import { signOut } from '@/actions/auth'
import { useSidebar } from './sidebar-context'

interface NavItemProps {
  icon: LucideIcon
  label: string
  href: string
  active: boolean
  isCollapsed: boolean
  onClick?: () => void
}

function NavItem({ icon: Icon, label, href, active, isCollapsed, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-lg border-l-2 text-xs font-medium transition-all duration-150 ${
        active 
          ? 'border-[var(--color-accent)] bg-[var(--color-surface-alt)] text-[var(--color-text)] font-semibold shadow-sm' 
          : 'border-transparent text-[var(--color-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
      }`}
    >
      <Icon 
        size={18} 
        className={`shrink-0 transition-colors ${active ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted-dark)] group-hover:text-[var(--color-text)]'}`} 
      />
      
      {!isCollapsed && <span className="truncate leading-none">{label}</span>}

      {/* Tooltip for collapsed desktop state */}
      {isCollapsed && (
        <div className="absolute left-full ml-3 px-2.5 py-1 rounded bg-[var(--color-surface-alt)] text-[var(--color-text)] text-xs font-medium whitespace-nowrap shadow-lg border border-[var(--color-border)] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
          {label}
        </div>
      )}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar()

  const handleSignOut = async () => {
    await signOut()
    router.push('/sign-in')
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: NotebookPen, label: 'Journal', href: '/journal' },
    { icon: BookOpen, label: 'Trade Log', href: '/trades' },
    { icon: Shield, label: 'Accounts', href: '/accounts' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 z-50 h-screen bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col justify-between p-4 transition-all duration-300 ${
          isCollapsed ? 'w-[68px]' : 'w-60'
        } ${
          isMobileOpen ? 'translate-x-0 w-60' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Logo & Brand */}
        <div className="flex flex-col gap-6">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-1`}>
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div 
                className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-bold text-white text-xs shadow-md"
                style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-profit))' }}
              >
                L
              </div>
              {!isCollapsed && (
                <span className="font-display text-base font-bold text-[var(--color-text)] tracking-tight">
                  Ledgerline
                </span>
              )}
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1 text-[var(--color-muted)] hover:text-[var(--color-text)]"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <NavItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={pathname.startsWith(item.href)}
                isCollapsed={isCollapsed}
                onClick={() => setIsMobileOpen(false)}
              />
            ))}
          </nav>
        </div>

        {/* Bottom: Sign Out */}
        <div className="pt-4 border-t border-[var(--color-border)]">
          <button
            onClick={handleSignOut}
            className={`group relative flex items-center ${
              isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
            } py-2.5 w-full rounded-lg text-xs font-medium text-[var(--color-muted-dark)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-all`}
          >
            <LogOut size={18} className="shrink-0 group-hover:text-[var(--color-loss)] transition-colors" />
            {!isCollapsed && <span className="truncate leading-none">Sign out</span>}
            
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1 rounded bg-[var(--color-surface-alt)] text-[var(--color-text)] text-xs font-medium whitespace-nowrap shadow-lg border border-[var(--color-border)] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                Sign out
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
