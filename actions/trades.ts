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
    let assetType = data.asset_type
    const sym = data.symbol.toUpperCase()
    if (!assetType || assetType === 'other') {
      if (sym.startsWith('XAU') || sym.startsWith('XAG') || sym.includes('GOLD') || sym.includes('SILVER')) {
        assetType = 'metal'
      } else if (sym.includes('BTC') || sym.includes('ETH') || sym.includes('SOL') || sym.includes('CRYPTO')) {
        assetType = 'crypto'
      } else if (sym.includes('US30') || sym.includes('NAS') || sym.includes('SPX') || sym.includes('NDX') || sym.includes('GER30')) {
        assetType = 'index'
      } else if (sym.includes('USD') || sym.includes('EUR') || sym.includes('GBP') || sym.includes('JPY') || sym.includes('AUD') || sym.includes('CAD')) {
        assetType = 'fx'
      } else {
        assetType = 'other'
      }
    }
    const direction = data.side === 'long' ? 1 : -1
    // Simplified PnL math, typical for journal generic
    pnl = Math.round((data.exit_price - data.entry_price) * direction * data.size * 1000) / 10
    
    // R-multiple estimation for MVP (assuming 1R risk difference based on account type)
    const riskR = data.account_type === 'prop' ? 300 : 120
    r_multiple = Number((pnl / riskR).toFixed(2))
  }

  const { data: trade, error } = await supabase
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
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/trades')
  return { success: true, tradeId: (trade as any).id }
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

export async function uploadTradeScreenshot(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) return { error: 'Unauthorized' }

  const tradeId = formData.get('tradeId') as string
  const file = formData.get('file') as File

  if (!tradeId || !file) return { error: 'Missing tradeId or file' }

  const fileExt = file.name.split('.').pop()
  const path = `${userData.user.id}/${tradeId}.${fileExt}`

  // 1. Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('trade-screenshots')
    .upload(path, file, { upsert: true })

  if (uploadError) return { error: uploadError.message }

  // 2. Update trade row
  const { error: updateError } = await supabase
    .from('trades')
    .update({ screenshot_url: path })
    .eq('id', tradeId)
    .eq('user_id', userData.user.id)

  if (updateError) return { error: updateError.message }

  revalidatePath('/dashboard')
  revalidatePath('/trades')
  return { success: true, path }
}

export async function getTradeScreenshotUrl(path: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  
  if (!userData.user) return { error: 'Unauthorized' }

  const { data, error } = await supabase.storage
    .from('trade-screenshots')
    .createSignedUrl(path, 60 * 60) // 1 hour expiry

  if (error) return { error: error.message }
  return { url: data.signedUrl }
}

export async function deleteTradeScreenshot(tradeId: string, path: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) return { error: 'Unauthorized' }

  const { error: storageError } = await supabase.storage
    .from('trade-screenshots')
    .remove([path])

  if (storageError) return { error: storageError.message }

  const { error: updateError } = await supabase
    .from('trades')
    .update({ screenshot_url: null })
    .eq('id', tradeId)
    .eq('user_id', userData.user.id)

  if (updateError) return { error: updateError.message }

  revalidatePath('/dashboard')
  revalidatePath('/trades')
  return { success: true }
}

