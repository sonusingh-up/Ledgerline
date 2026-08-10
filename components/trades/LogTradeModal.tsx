'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle } from 'lucide-react'
import { createTrade, uploadTradeScreenshot } from '@/actions/trades'
import { ScreenshotUpload } from './ScreenshotUpload'

const QUICK_TAGS = ['Breakout', 'Pullback', 'Reversal', 'News', 'Range', 'VWAP', 'LiquidityGrab']

// Typical max-move thresholds (as a % of entry price) before triggering a fat-finger warning
const SYMBOL_MOVE_THRESHOLDS: Record<string, number> = {
  // FX majors: ~5% is extreme (normal daily is 0.5-1%)
  EURUSD: 0.05, GBPUSD: 0.05, USDJPY: 0.05, AUDUSD: 0.05, USDCAD: 0.05, NZDUSD: 0.05,
  // Metals: ~10% is extreme
  XAUUSD: 0.10, XAGUSD: 0.15,
  // Crypto: ~25% is extreme (volatile)
  BTCUSD: 0.25, ETHUSD: 0.30, SOLUSD: 0.35,
  // Indices: ~8% is extreme
  US30: 0.08, NAS100: 0.10, SPX: 0.08,
}

function getMovePctThreshold(symbol: string): number {
  const sym = symbol.toUpperCase()
  if (SYMBOL_MOVE_THRESHOLDS[sym]) return SYMBOL_MOVE_THRESHOLDS[sym]
  // Fallback heuristics by asset class
  if (sym.startsWith('XAU') || sym.startsWith('XAG')) return 0.10
  if (sym.includes('BTC') || sym.includes('ETH') || sym.includes('SOL')) return 0.25
  if (sym.includes('US30') || sym.includes('NAS') || sym.includes('SPX') || sym.includes('NDX')) return 0.08
  // Default FX-like threshold
  return 0.05
}

export function LogTradeModal({
  onClose,
  accountId,
  accountType,
}: {
  onClose: () => void
  accountId: string
  accountType: 'prop' | 'retail'
}) {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    symbol: 'EURUSD',
    side: 'long',
    entry: '',
    exit: '',
    size: '1.0',
    tag: 'Breakout',
    notes: '',
  })
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const update = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    // Reset dismissed state when user changes entry/exit/symbol
    if (k === 'entry' || k === 'exit' || k === 'symbol') {
      setDismissed(false)
    }
  }

  // Fat-finger warning: compute whether the entry/exit move looks implausibly large
  const fatFingerWarning = useMemo(() => {
    const entry = parseFloat(form.entry)
    const exit = parseFloat(form.exit)
    if (!entry || !exit || entry === 0) return null

    const movePct = Math.abs(exit - entry) / entry
    const threshold = getMovePctThreshold(form.symbol)

    if (movePct > threshold) {
      const moveBps = (movePct * 100).toFixed(1)
      const threshBps = (threshold * 100).toFixed(0)
      return `Entry → Exit is a ${moveBps}% move (>${threshBps}% typical max for ${form.symbol.toUpperCase()}). This looks like a large move — please double-check for typos.`
    }
    return null
  }, [form.entry, form.exit, form.symbol])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    // If there's a fat-finger warning and user hasn't dismissed it, show it first
    if (fatFingerWarning && !dismissed) {
      setDismissed(true)
      return // Don't submit yet — user needs to click again to confirm
    }

    setLoading(true)

    const entry = parseFloat(form.entry) || 0
    const exit = form.exit ? parseFloat(form.exit) : null
    const size = parseFloat(form.size) || 1
    let assetType: 'fx' | 'metal' | 'index' | 'crypto' | 'stock' | 'futures' | 'other' = 'fx'
    const sym = form.symbol.toUpperCase()
    if (sym.startsWith('XAU') || sym.startsWith('XAG') || sym.includes('GOLD')) assetType = 'metal'
    else if (sym.includes('BTC') || sym.includes('ETH') || sym.includes('SOL')) assetType = 'crypto'
    else if (sym.includes('US30') || sym.includes('NAS') || sym.includes('SPX')) assetType = 'index'
    else if (sym.includes('USD') || sym.includes('EUR') || sym.includes('GBP') || sym.includes('JPY')) assetType = 'fx'
    else assetType = 'other'

    const tradeRes = await createTrade({
      account_id: accountId,
      trade_date: form.date,
      symbol: form.symbol,
      asset_type: assetType as any,
      side: form.side as 'long' | 'short',
      entry_price: entry,
      exit_price: exit,
      size,
      setup_tag: form.tag,
      notes: form.notes,
      account_type: accountType,
    })

    if (tradeRes.error) {
      // Add a simple window alert or better error handling
      alert(tradeRes.error)
      setLoading(false)
      return
    }

    if (file && tradeRes.tradeId) {
      const formData = new FormData()
      formData.append('tradeId', tradeRes.tradeId)
      formData.append('file', file)
      await uploadTradeScreenshot(formData)
    }

    setLoading(false)
    onClose()
  }

  const inputStyle =
    'w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg p-2.5 text-[var(--color-text)] font-mono text-xs outline-none box-border focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]'
  const labelStyle = 'text-xs font-medium text-[var(--color-muted)] block mb-1 font-body'

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="w-[480px] max-w-full max-h-[90vh] overflow-y-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl relative z-[10000]"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-[var(--color-border)]">
            <h2 className="font-display text-base font-bold text-[var(--color-text)] m-0">
              Log Executed Trade
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelStyle}>Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => update('date', e.target.value)}
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className={labelStyle}>Symbol / Pair</label>
                <input
                  type="text"
                  list="trading-pairs"
                  value={form.symbol}
                  onChange={(e) => update('symbol', e.target.value.toUpperCase())}
                  className={inputStyle}
                  required
                  placeholder="EURUSD"
                />
                <datalist id="trading-pairs">
                  <option value="EURUSD" />
                  <option value="GBPUSD" />
                  <option value="USDJPY" />
                  <option value="XAUUSD" />
                  <option value="BTCUSD" />
                  <option value="ETHUSD" />
                  <option value="US30" />
                  <option value="NAS100" />
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelStyle}>Side</label>
                <select
                  value={form.side}
                  onChange={(e) => update('side', e.target.value)}
                  className={inputStyle}
                >
                  <option value="long">Long</option>
                  <option value="short">Short</option>
                </select>
              </div>

              <div>
                <label className={labelStyle}>Entry Price</label>
                <input
                  required
                  type="number"
                  step="any"
                  value={form.entry}
                  onChange={(e) => update('entry', e.target.value)}
                  className={inputStyle}
                  placeholder="1.0850"
                />
              </div>

              <div>
                <label className={labelStyle}>Exit Price</label>
                <input
                  type="number"
                  step="any"
                  value={form.exit}
                  onChange={(e) => update('exit', e.target.value)}
                  className={`${inputStyle} ${fatFingerWarning && !dismissed ? 'border-[var(--color-amber)]' : ''}`}
                  placeholder="1.0910"
                />
              </div>
            </div>

            {/* Fat-finger Warning Banner */}
            {fatFingerWarning && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[var(--color-amber)]/10 border border-[var(--color-amber)]/30 text-xs text-[var(--color-amber)]">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">Possible fat-finger entry</span>
                  <span className="text-[var(--color-muted)] leading-relaxed">{fatFingerWarning}</span>
                  {dismissed && (
                    <span className="text-[var(--color-accent)] font-medium mt-0.5">Click "Save" again to confirm this is correct.</span>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelStyle}>Position Size (Lots)</label>
                <input
                  required
                  type="number"
                  step="any"
                  value={form.size}
                  onChange={(e) => update('size', e.target.value)}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>Setup Tag</label>
                <input
                  type="text"
                  value={form.tag}
                  onChange={(e) => update('tag', e.target.value)}
                  className={inputStyle}
                  placeholder="Breakout"
                />
              </div>
            </div>

            {/* Quick Setup Tag Chips */}
            <div>
              <label className={labelStyle}>Quick Tags</label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => update('tag', t)}
                    className={`text-[11px] px-2.5 py-1 rounded-md border font-medium transition-all ${
                      form.tag === t
                        ? 'bg-[#6E8CFA] text-white border-[#6E8CFA] shadow-xs'
                        : 'bg-[var(--color-surface-alt)] text-[var(--color-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelStyle}>Journal Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                rows={3}
                placeholder="Market context, emotions, compliance check, exit reason..."
                className={`${inputStyle} font-body resize-y`}
              />
            </div>

            <ScreenshotUpload file={file} setFile={setFile} />

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold text-xs py-3 rounded-lg transition-all shadow-md active:scale-98 disabled:opacity-70 mt-2 ${
                fatFingerWarning && dismissed
                  ? 'bg-[var(--color-amber)] hover:bg-[var(--color-amber)]/90 text-[#0E1318]'
                  : 'bg-[#6E8CFA] hover:bg-[#5C7CFA] text-white'
              }`}
            >
              {loading
                ? 'Saving Trade...'
                : fatFingerWarning && dismissed
                  ? 'Confirm & Save Trade'
                  : 'Save Executed Trade'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  )
}
