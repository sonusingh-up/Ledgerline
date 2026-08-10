import { Trade, Account, KPIStats, PropStatus } from './types'

export function calculateAccountStats(trades: Trade[], account: Account): KPIStats {
  if (!trades || trades.length === 0) {
    return {
      netPnL: 0,
      winRate: 0,
      profitFactor: 0,
      expectancy: 0,
      equityCurve: [],
      tradesCount: 0,
      endEquity: account.start_balance
    }
  }

  // Sort trades chronologically (oldest first) for equity curve
  const sortedTrades = [...trades].sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime())

  let wins = 0
  let grossWin = 0
  let grossLoss = 0
  let cum = Number(account.start_balance)
  const equityCurve: { date: string; equity: number }[] = [{ date: "start", equity: cum }]

  sortedTrades.forEach((t) => {
    const pnl = Number(t.pnl || 0)
    if (pnl >= 0) {
      wins++
      grossWin += pnl
    } else {
      grossLoss += Math.abs(pnl)
    }
    cum += pnl
    equityCurve.push({ date: t.trade_date, equity: Math.round(cum) })
  })

  const netPnL = cum - Number(account.start_balance)
  const winRate = (wins / sortedTrades.length) * 100
  const profitFactor = grossLoss === 0 ? (grossWin > 0 ? Infinity : 0) : grossWin / grossLoss
  const expectancy = netPnL / sortedTrades.length

  return {
    netPnL,
    winRate,
    profitFactor,
    expectancy,
    equityCurve,
    tradesCount: sortedTrades.length,
    endEquity: cum
  }
}

export function calculatePropStatus(account: Account, stats: KPIStats, trades: Trade[], targetDate: string = new Date().toISOString().split('T')[0]): PropStatus | null {
  if (account.account_type !== 'prop') return null

  const startBal = Number(account.start_balance)
  const peakEquity = Math.max(startBal, ...stats.equityCurve.map((p) => p.equity))
  
  const maxDDPct = Number(account.max_drawdown_pct || 0)
  const maxDrawdownDollars = (maxDDPct / 100) * startBal
  
  const floor = account.drawdown_type === 'trailing'
    ? peakEquity - maxDrawdownDollars
    : startBal - maxDrawdownDollars

  const currentEquity = stats.endEquity ?? startBal
  const bufferRemaining = currentEquity - floor
  const pctBufferUsed = maxDrawdownDollars > 0 ? Math.min(100, Math.max(0, (1 - bufferRemaining / maxDrawdownDollars) * 100)) : 0
  const breach = currentEquity <= floor

  // Today's PnL
  const todaysPnL = trades
    .filter((t) => t.trade_date === targetDate)
    .reduce((a, t) => a + Number(t.pnl || 0), 0)
    
  const dailyLimitPct = Number(account.daily_loss_limit_pct || 0)
  const dailyLossLimitDollars = (dailyLimitPct / 100) * startBal
  const dailyPctUsed = dailyLossLimitDollars > 0 ? Math.min(100, Math.max(0, (-todaysPnL / dailyLossLimitDollars) * 100)) : 0

  const profitTargetPct = Number(account.profit_target_pct || 0)
  const profitTargetDollars = (profitTargetPct / 100) * startBal
  const profitProgressPct = profitTargetDollars > 0 ? Math.min(100, Math.max(0, (stats.netPnL / profitTargetDollars) * 100)) : 0

  return {
    peakEquity,
    maxDrawdownDollars,
    drawdownFloor: floor,
    bufferRemaining,
    pctBufferUsed,
    breach,
    dailyLossLimitDollars,
    todaysPnL,
    dailyPctUsed,
    profitTargetDollars,
    profitProgressPct
  }
}

export function buildPnLCalendarMatrix(trades: Trade[], baseDateIso: string, weeks: number = 6): { [date: string]: number } {
  const dailyMap: { [date: string]: number } = {}
  trades.forEach((t) => { 
    dailyMap[t.trade_date] = (dailyMap[t.trade_date] || 0) + Number(t.pnl || 0) 
  })
  return dailyMap
}

export function isoDaysAgo(baseIso: string, n: number) {
  const dt = new Date(baseIso + "T12:00:00Z")
  dt.setUTCDate(dt.getUTCDate() - n)
  return dt.toISOString().slice(0, 10)
}

export function fmtMoney(n: number) {
  const sign = n < 0 ? "-" : ""
  return `${sign}$${Math.abs(Math.round(n)).toLocaleString()}`
}

export function fmtDate(d: string) {
  const dt = new Date(d + "T00:00:00")
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
