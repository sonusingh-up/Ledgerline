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

export async function upsertJournalEntry(date: string, content: string, mood?: number, imageUrl?: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('journal_entries')
    .upsert({
      user_id: userData.user.id,
      entry_date: date,
      content,
      image_url: imageUrl || null,
      mood: mood || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id, entry_date' })

  if (error) {
    console.error('Upsert Journal Error:', error)
    return { error: error.message }
  }

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

export async function uploadJournalImage(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) return { error: 'Unauthorized' }

  const file = formData.get('file') as File
  if (!file) return { error: 'No file provided' }

  const fileExt = file.name.split('.').pop()
  const fileName = `journal/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${userData.user.id}/${fileName}`

  const { data, error } = await supabase.storage
    .from('trade-screenshots')
    .upload(filePath, file)

  if (error) {
    console.error('Upload Journal Image Error:', error)
    return { error: error.message }
  }

  const { data: publicUrlData } = supabase.storage
    .from('trade-screenshots')
    .getPublicUrl(filePath)

  return { publicUrl: publicUrlData.publicUrl }
}
