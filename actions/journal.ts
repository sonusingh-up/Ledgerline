'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { JournalEntry } from '@/lib/types'

export async function getJournalEntry(date: string): Promise<{ entry: JournalEntry | null; error?: string }> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) return { entry: null, error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userData.user.id)
    .eq('entry_date', date)
    .single()

  // Supabase returns PGRST116 (No rows found) when using .single() on an empty result.
  if (error && error.code !== 'PGRST116') {
    return { entry: null, error: error.message }
  }

  return { entry: data || null }
}

export async function upsertJournalEntry(date: string, content: string, mood?: number) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('journal_entries')
    .upsert({
      user_id: userData.user.id,
      entry_date: date,
      content,
      mood: mood || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id, entry_date' })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/journal')
  return { success: true }
}

export async function listJournalEntries(startDate: string, endDate: string): Promise<{ entries: JournalEntry[]; error?: string }> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) return { entries: [], error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userData.user.id)
    .gte('entry_date', startDate)
    .lte('entry_date', endDate)
    .order('entry_date', { ascending: false })

  if (error) return { entries: [], error: error.message }

  return { entries: data || [] }
}
