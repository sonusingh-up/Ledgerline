import { fmtMoney } from '@/lib/calculations'

export function DrawdownGauge({ 
  pctUsed, 
  dollarsRemaining, 
  breach,
  dailyPctUsed,
  dailyLossLimitDollars,
  todaysPnL,
  profitProgressPct
}: { 
  pctUsed: number, 
  dollarsRemaining: number, 
  breach: boolean,
  dailyPctUsed?: number,
  dailyLossLimitDollars?: number,
  todaysPnL?: number,
  profitProgressPct?: number
}) {
  
  return (
    <div className="bg-[var(--color-surface-alt)] border border-[var(--color-border-soft)] rounded-[14px] p-[24px] flex flex-col shadow-sm">
      <div className="flex justify-between items-center mb-[16px]">
        <span className="text-[13px] text-[var(--color-muted)]">Prop Firm Compliance</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-muted-dark)]"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </div>
      
      <div className="flex flex-col gap-[6px] mb-[24px]">
        <span className="text-[12px] text-[var(--color-muted-dark)]">Max Drawdown Buffer</span>
        <div className="flex items-baseline gap-[6px]">
          <span className="font-display text-[26px] font-bold text-white leading-none">{fmtMoney(dollarsRemaining)}</span>
          <span className="text-[14px] text-[var(--color-muted-dark)] font-mono leading-none">/ {pctUsed.toFixed(1)}% used</span>
        </div>
        {breach ? (
          <span className="self-start text-[11px] px-[8px] py-[3px] bg-[rgba(196,97,74,0.15)] text-[var(--color-loss)] rounded-[4px] mt-[4px]">Account breached</span>
        ) : (
          <span className="self-start text-[11px] px-[8px] py-[3px] bg-[rgba(79,168,138,0.15)] text-[var(--color-profit)] rounded-[4px] mt-[4px]">Currently in profit / safe</span>
        )}
      </div>

      <div className="flex flex-col gap-[16px] border-t border-[var(--color-border-soft)] pt-[20px]">
        
        {dailyLossLimitDollars !== undefined && todaysPnL !== undefined && (
          <div className="flex flex-col gap-[8px]">
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-[var(--color-muted)]">Today's P&L / Limit</span>
              <span className="font-mono text-[var(--color-text)]">
                <span className={todaysPnL >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}>{fmtMoney(todaysPnL)}</span>
                <span className="text-[var(--color-muted-dark)]"> / -{fmtMoney(dailyLossLimitDollars)}</span>
              </span>
            </div>
            <div className="w-full h-[4px] bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out ${dailyPctUsed! > 70 ? 'bg-[var(--color-loss)]' : 'bg-[var(--color-accent)]'}`} 
                style={{ width: `${Math.max(0, Math.min(100, dailyPctUsed || 0))}%` }} 
              />
            </div>
          </div>
        )}

        {profitProgressPct !== undefined && (
          <div className="flex flex-col gap-[8px]">
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-[var(--color-muted)]">Profit Target</span>
              <span className="font-mono text-[var(--color-text)]">{profitProgressPct.toFixed(1)}%</span>
            </div>
            <div className="w-full h-[4px] bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-[var(--color-profit)] transition-all duration-500 ease-out" 
                style={{ width: `${Math.max(0, Math.min(100, profitProgressPct))}%` }} 
              />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
