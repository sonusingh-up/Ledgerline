import { getAccounts } from '@/actions/accounts'
import { getTrades } from '@/actions/trades'
import { listJournalEntries } from '@/actions/journal'
import { JournalClient } from './JournalClient'
import { AmbientBackground } from '@/components/ui/AmbientBackground'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function JournalPage() {
  const { accounts } = await getAccounts()
  
  if (!accounts || accounts.length === 0) {
    redirect('/dashboard')
  }

  // Use the first active account for the journal's trade context if none selected in URL
  const defaultAccount = accounts[0]
  
  const { trades } = await getTrades(defaultAccount.id)
  
  // Fetch a generous chunk of history for the client (e.g. 6 months) to avoid frequent loading
  const endDate = new Date().toISOString().split('T')[0]
  const d = new Date()
  d.setMonth(d.getMonth() - 6)
  const startDate = d.toISOString().split('T')[0]
  
  const { entries } = await listJournalEntries(startDate, endDate)

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <div className="p-4 lg:p-6 xl:p-8 flex flex-col gap-6 relative z-10">
        <JournalClient 
          initialTrades={trades || []} 
          initialEntries={entries || []} 
        />
      </div>
    </div>
  )
}
