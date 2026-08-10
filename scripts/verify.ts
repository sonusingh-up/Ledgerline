import { createClient } from '@supabase/supabase-js'
import { calculateAccountStats, calculatePropStatus } from '../lib/calculations'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runTests() {
  console.log('--- Starting Verification Tests ---')
  
  // 1. Create a dummy user
  const email = `testuser_${Date.now()}@example.com`
  console.log(`Creating test user: ${email}`)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: 'password123',
    email_confirm: true
  })
  
  if (authError || !authData.user) {
    console.error('Failed to create user:', authError)
    return
  }
  const userId = authData.user.id
  
  // Wait a moment for trigger to create profile
  await new Promise(r => setTimeout(r, 1000))

  // 2. Create an account
  console.log('Creating Prop Account...')
  const { data: accData, error: accError } = await supabase.from('accounts').insert({
    user_id: userId,
    label: 'Test Prop 100K',
    account_type: 'prop',
    start_balance: 100000,
    prop_firm_name: 'TestFirm',
    daily_loss_limit_pct: 5,
    max_drawdown_pct: 10,
    profit_target_pct: 10,
    drawdown_type: 'trailing'
  }).select().single()
  
  if (accError) {
    console.error('Failed to create account:', accError)
    await cleanup(userId)
    return
  }
  const account = accData
  
  // 3. Log Trades
  console.log('Logging trades...')
  const tradesToLog = [
    { user_id: userId, account_id: account.id, trade_date: new Date().toISOString().slice(0,10), symbol: 'EURUSD', asset_type: 'fx', side: 'long', entry_price: 1.1, exit_price: 1.2, size: 1, pnl: 500, r_multiple: 2 },
    { user_id: userId, account_id: account.id, trade_date: new Date().toISOString().slice(0,10), symbol: 'GBPUSD', asset_type: 'fx', side: 'short', entry_price: 1.3, exit_price: 1.35, size: 1, pnl: -200, r_multiple: -1 },
    { user_id: userId, account_id: account.id, trade_date: new Date().toISOString().slice(0,10), symbol: 'XAUUSD', asset_type: 'metal', side: 'long', entry_price: 2000, exit_price: 2010, size: 1, pnl: 1000, r_multiple: 4 },
  ]
  
  const { data: trades, error: tradesError } = await supabase.from('trades').insert(tradesToLog).select()
  
  if (tradesError) {
    console.error('Failed to insert trades:', tradesError)
    await cleanup(userId)
    return
  }

  // 4. Test Calculations Logic
  console.log('Testing calculation engine...')
  const stats = calculateAccountStats(trades as any, account as any)
  
  console.log(`- Net PnL: $${stats.netPnL} (Expected: $1300)`)
  console.log(`- Win Rate: ${stats.winRate}% (Expected: 66.67%)`)
  console.log(`- Profit Factor: ${stats.profitFactor} (Expected: 7.5)`)
  const propStatus = calculatePropStatus(account as any, stats, trades as any)
  console.log(`- Peak Equity: $${propStatus?.peakEquity} (Expected: $101300)`)
  console.log(`- Prop Buffer Remaining: $${propStatus?.bufferRemaining} (Expected: $10000 - Trailing Drawdown uses Peak Equity)`)
  
  // 5. Cleanup
  await cleanup(userId)
  console.log('--- Verification Complete ---')
}

async function cleanup(userId: string) {
  console.log('Cleaning up test user...')
  await supabase.auth.admin.deleteUser(userId)
}

runTests()
