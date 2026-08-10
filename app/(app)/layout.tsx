import { SidebarProvider } from '@/components/nav/sidebar-context'
import { Sidebar } from '@/components/nav/Sidebar'
import { Header } from '@/components/nav/Header'
import { getAccounts } from '@/actions/accounts'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch accounts once at layout level so Header badge stays in sync
  const { accounts } = await getAccounts()

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[var(--color-bg)] font-body text-[var(--color-text)] flex relative overflow-x-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area with Sticky Header */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header accounts={(accounts || []) as any} />
          <main className="flex-1 min-w-0 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
