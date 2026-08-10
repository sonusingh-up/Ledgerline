import { PropFirmTemplate } from './types'

export const PROP_FIRM_TEMPLATES: PropFirmTemplate[] = [
  { name: "FTMO", dailyLossLimitPct: 5, maxDrawdownPct: 10, profitTargetPct: 8, drawdownType: "static" },
  { name: "Topstep", dailyLossLimitPct: null, maxDrawdownPct: 6, profitTargetPct: 6, drawdownType: "trailing" },
  { name: "Apex Trader Funding", dailyLossLimitPct: null, maxDrawdownPct: 5, profitTargetPct: 8, drawdownType: "trailing" },
  { name: "FundedNext", dailyLossLimitPct: 5, maxDrawdownPct: 10, profitTargetPct: 8, drawdownType: "static" },
  { name: "Custom", dailyLossLimitPct: null, maxDrawdownPct: null, profitTargetPct: null, drawdownType: "static" },
]
