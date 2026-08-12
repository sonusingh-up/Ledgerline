'use client'

import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'
import { fmtMoney } from '@/lib/calculations'
import { Trophy, CheckCircle2 } from 'lucide-react'

export function DrawdownGauge({ 
  pctUsed, 
  dollarsRemaining, 
  breach,
  dailyPctUsed,
  dailyLossLimitDollars,
  todaysPnL,
  profitProgressPct = 0
}: { 
  pctUsed: number, 
  dollarsRemaining: number, 
  breach: boolean,
  dailyPctUsed?: number,
  dailyLossLimitDollars?: number,
  todaysPnL?: number,
  profitProgressPct?: number
}) {
  const isTargetHit = profitProgressPct >= 100

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative bg-[var(--color-surface-alt)]/70 backdrop-blur-md border ${
        isTargetHit 
          ? 'border-[var(--color-profit)]/60 shadow-[0_0_30px_rgba(79,168,138,0.2)]' 
          : 'border-[var(--color-border-soft)] shadow-md'
      } rounded-2xl p-5 flex flex-col overflow-hidden transition-all duration-500 hover:shadow-lg`}
    >
      {/* Celebratory ShaderGradient Background (fades in when 100% profit target is hit) */}
      <AnimatePresence>
        {isTargetHit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute inset-0 rounded-[14px] overflow-hidden pointer-events-none z-0"
          >
            <ShaderGradientCanvas
              fov={45}
              pixelDensity={1}
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            >
              <ShaderGradient
                {...({
                  animate: 'on',
                  axesHelper: 'off',
                  brightness: 0.9,
                  cAzimuthAngle: 180,
                  cDistance: 3.6,
                  cPolarAngle: 90,
                  cameraZoom: 1,
                  color1: '#4FA88A', // Emerald profit
                  color2: '#D9A441', // Gold victory
                  color3: '#151B22', // Deep dark surface
                  destination: 'onCanvas',
                  embedMode: 'off',
                  envPreset: 'city',
                  format: 'gif',
                  fov: 45,
                  frameRate: 10,
                  gizmoHelper: 'hide',
                  grain: 'on',
                  grainBlending: 0.2,
                  lightType: '3d',
                  pixelDensity: 1,
                  positionX: -1.4,
                  positionY: 0,
                  positionZ: 0,
                  range: 'disabled',
                  rangeEnd: 40,
                  rangeStart: 0,
                  reflection: 0.1,
                  rotationX: 0,
                  rotationY: 10,
                  rotationZ: 50,
                  shader: 'defaults',
                  type: 'plane',
                  uAmplitude: 1,
                  uDensity: 1.3,
                  uFrequency: 5.5,
                  uSpeed: 0.05, // Slow celebratory movement
                  cSpeed: 0.05,
                  uStrength: 4,
                  uTime: 0,
                  wireframe: false,
                } as any)}
              />
            </ShaderGradientCanvas>

            {/* Subtle glow overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-alt)] via-transparent to-transparent opacity-80" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Content (z-10 overlay) */}
      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-[16px]">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[var(--color-muted)] font-medium">Prop Firm Compliance</span>
            {isTargetHit && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-profit)]/20 text-[var(--color-profit)] border border-[var(--color-profit)]/40 animate-pulse">
                <Trophy size={12} /> Target Passed!
              </span>
            )}
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-muted-dark)]">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
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

        <div className="flex flex-col gap-[16px] border-t border-[var(--color-border-soft)] pt-[20px] mt-auto">
          
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
                <span className="font-mono text-[var(--color-text)] font-semibold flex items-center gap-1">
                  {profitProgressPct.toFixed(1)}%
                  {isTargetHit && <CheckCircle2 size={13} className="text-[var(--color-profit)]" />}
                </span>
              </div>
              <div className="w-full h-[4px] bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    isTargetHit ? 'bg-gradient-to-r from-[var(--color-profit)] to-[var(--color-amber)]' : 'bg-[var(--color-profit)]'
                  }`} 
                  style={{ width: `${Math.max(0, Math.min(100, profitProgressPct))}%` }} 
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </motion.div>
  )
}
