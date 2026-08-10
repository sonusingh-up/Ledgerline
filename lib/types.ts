export type AccountType = 'retail' | 'prop'
export type DrawdownType = 'trailing' | 'static'
export type AssetType = 'fx' | 'metal' | 'index' | 'crypto' | 'stock' | 'futures' | 'other'
export type TradeSide = 'long' | 'short'

export interface Profile {
  id: string
  email: string
  display_name: string | null
  created_at: string
}

export interface Account {
  id: string
  user_id: string
  label: string
  account_type: AccountType
  start_balance: number
  currency: string
  prop_firm_name: string | null
  daily_loss_limit_pct: number | null
  max_drawdown_pct: number | null
  profit_target_pct: number | null
  drawdown_type: DrawdownType | null
  archived: boolean
  created_at: string
}

export interface Trade {
  id: string
  user_id: string
  account_id: string
  trade_date: string
  symbol: string
  asset_type: AssetType
  side: TradeSide
  entry_price: number
  exit_price: number | null
  size: number
  pnl: number | null
  r_multiple: number | null
  setup_tag: string | null
  notes: string | null
  screenshot_url: string | null
  created_at: string
  updated_at: string
}

export interface PropFirmTemplate {
  name: string
  dailyLossLimitPct: number | null
  maxDrawdownPct: number | null
  profitTargetPct: number | null
  drawdownType: DrawdownType
}

export interface KPIStats {
  netPnL: number
  winRate: number
  profitFactor: number
  expectancy: number
  equityCurve: { date: string; equity: number }[]
  tradesCount: number
  endEquity: number
}

export interface PropStatus {
  peakEquity: number
  maxDrawdownDollars: number
  drawdownFloor: number
  bufferRemaining: number
  pctBufferUsed: number
  breach: boolean
  dailyLossLimitDollars: number
  todaysPnL: number
  dailyPctUsed: number
  profitTargetDollars: number
  profitProgressPct: number
}
