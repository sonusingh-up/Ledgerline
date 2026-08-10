'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTrade(data: {
  account_id: string
  trade_date: string
  symbol: string
  asset_type: 'fx' | 'metal' | 'index' | 'crypto' | 'stock' | 'futures' | 'other'
  side: 'long' | 'short'
  entry_price: number
  exit_price: number | null
  size: number
  setup_tag: string | null
  notes: string | null
  account_type: 'prop' | 'retail'
}) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) return { error: 'Unauthorized' }

  // Compute PnL and R-multiple
  let pnl = null
  let r_multiple = null

  if (data.exit_price !== null) {
    const direction = data.side === 'long' ? 1 : -1
    // Simplified PnL math, typical for journal generic
    pnl = Math.round((data.exit_price - data.entry_price) * direction * data.size * 1000) / 10
    
    // R-multiple estimation for MVP (assuming 1R risk difference based on account type)
    const riskR = data.account_type === 'prop' ? 300 : 120
    r_multiple = Number((pnl / riskR).toFixed(2))
  }

  const { error } = await supabase
    .from('trades')
    .insert({
      user_id: userData.user.id,
      account_id: data.account_id,
      trade_date: data.trade_date,
      symbol: data.symbol,
      asset_type: data.asset_type,
      side: data.side,
      entry_price: data.entry_price,
      exit_price: data.exit_price,
      size: data.size,
      pnl,
      r_multiple,
      setup_tag: data.setup_tag || null,
      notes: data.notes || null,
    })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/trades')
  return { success: true }
}

export async function deleteTrade(tradeId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', tradeId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/trades')
  return { success: true }
}

export async function getTrades(accountId: string) {
  const supabase = await createClient()
  
  const { data: trades, error } = await supabase
    .from('trades')
    .select('*')
    .eq('account_id', accountId)
    .order('trade_date', { ascending: false })

  if (error) return { trades: [], error: error.message }
  return { trades }
}
