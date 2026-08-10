import { fmtMoney } from '@/lib/calculations'

export function DrawdownGauge({ pctUsed, dollarsRemaining, breach }: { pctUsed: number, dollarsRemaining: number, breach: boolean }) {
  const size = 168, stroke = 12
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const arcFraction = 0.75
  const arcLen = circumference * arcFraction
  const rotate = 135
  const clamped = Math.min(Math.max(pctUsed, 0), 100)
  const progressLen = (clamped / 100) * arcLen
  
  const color = breach ? 'var(--color-loss)' : clamped > 70 ? 'var(--color-amber)' : 'var(--color-profit)'

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(${rotate} ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border-soft)" strokeWidth={stroke}
            strokeDasharray={`${arcLen} ${circumference}`} strokeLinecap="round" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={`${progressLen} ${circumference}`} strokeLinecap="round"
            strokeOpacity={progressLen === 0 ? 0 : 1}
            style={{ transition: "stroke-dasharray 0.4s ease" }} />
        </g>
        <text x="50%" y="47%" textAnchor="middle" className="font-mono text-[26px] font-semibold" fill={color}>
          {clamped.toFixed(0)}%
        </text>
        <text x="50%" y="62%" textAnchor="middle" className="font-body text-[10.5px]" fill="var(--color-muted)">
          BUFFER USED
        </text>
      </svg>
      <div className="font-mono text-[13px] text-[var(--color-text)] mt-[2px] text-center">
        {fmtMoney(dollarsRemaining)}{" "}
        <span className="text-[var(--color-muted-dark)] font-body text-[11.5px]">remaining before breach</span>
      </div>
    </div>
  )
}
