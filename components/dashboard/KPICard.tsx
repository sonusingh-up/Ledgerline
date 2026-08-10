'use client'

import { Sparkline } from './Sparkline'
import { motion } from 'motion/react'

interface KPICardProps {
  label: string
  value: string
  sub?: string
  tone?: 'profit' | 'loss' | 'neutral'
  trend?: number[]
}

export function KPICard({ label, value, sub, tone = 'neutral', trend }: KPICardProps) {
  const colorVar = tone === 'profit' ? 'var(--color-profit)' : tone === 'loss' ? 'var(--color-loss)' : 'var(--color-text)'
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] p-[16px_18px] flex-[1_1_160px] min-w-[150px] shadow-[0_1px_2px_rgba(0,0,0,0.18)] transition-colors duration-150"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-body text-[12px] text-[var(--color-muted)] mb-2">{label}</div>
          <div className="font-mono text-[24px] font-semibold" style={{ color: colorVar }}>{value}</div>
        </div>
        {trend && <Sparkline points={trend} color={colorVar} />}
      </div>
      {sub && <div className="font-body text-[11.5px] text-[var(--color-muted-dark)] mt-[6px]">{sub}</div>}
    </motion.div>
  )
}

