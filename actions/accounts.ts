'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAccount(data: {
  label: string
  account_type: 'retail' | 'prop'
  start_balance: number
  prop_firm_name?: string
  daily_loss_limit_pct?: number | null
  max_drawdown_pct?: number | null
  profit_target_pct?: number | null
  drawdown_type?: 'trailing' | 'static'
}) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('accounts')
    .insert({
      user_id: userData.user.id,
      label: data.label,
      account_type: data.account_type,
      start_balance: data.start_balance,
      prop_firm_name: data.prop_firm_name || null,
      daily_loss_limit_pct: data.daily_loss_limit_pct || null,
      max_drawdown_pct: data.max_drawdown_pct || null,
      profit_target_pct: data.profit_target_pct || null,
      drawdown_type: data.drawdown_type || null
    })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/accounts')
  return { success: true }
}

export async function archiveAccount(accountId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('accounts')
    .update({ archived: true })
    .eq('id', accountId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/accounts')
  return { success: true }
}

export async function getAccounts() {
  const supabase = await createClient()
  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('archived', false)
    .order('created_at', { ascending: false })

  if (error) return { accounts: [], error: error.message }
  return { accounts }
}
