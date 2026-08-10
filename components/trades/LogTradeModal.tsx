'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createTrade } from '@/actions/trades'

export function LogTradeModal({ onClose, accountId, accountType }: { onClose: () => void, accountId: string, accountType: 'prop' | 'retail' }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    symbol: "EURUSD",
    side: "long",
    entry: "",
    exit: "",
    size: "1.0",
    tag: "Breakout",
    notes: ""
  })

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const entry = parseFloat(form.entry) || 0
    const exit = form.exit ? parseFloat(form.exit) : null
    const size = parseFloat(form.size) || 1
    const assetType = form.symbol.includes("USD") ? "fx" : "other"

    await createTrade({
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
      account_type: accountType
    })
    
    setLoading(false)
    onClose()
  }

  const inputStyle = "w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-[7px] p-[9px_10px] text-[var(--color-text)] font-mono text-[13px] outline-none box-border focus-visible:outline-[2px] focus-visible:outline-[var(--color-accent)]"
  const labelStyle = "text-[11.5px] text-[var(--color-muted)] block mb-[5px] font-body"

  return (
    <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="w-[460px] max-w-full max-h-[90vh] overflow-y-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[14px] p-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      >
        <div className="flex justify-between items-center mb-[18px]">
          <h2 className="font-display text-[17px] font-semibold text-[var(--color-text)] m-0">Log a trade</h2>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-[var(--color-muted)]"><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="grid grid-cols-2 gap-[12px] mb-[12px]">
            <div>
              <label className={labelStyle}>Date</label>
              <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className={inputStyle} required />
            </div>
            <div>
              <label className={labelStyle}>Symbol</label>
              <input type="text" list="trading-pairs" value={form.symbol} onChange={(e) => update("symbol", e.target.value.toUpperCase())} className={inputStyle} required placeholder="EURUSD" />
              <datalist id="trading-pairs">
                <optgroup label="Forex Majors">
                  <option value="EURUSD" />
                  <option value="GBPUSD" />
                  <option value="USDJPY" />
                  <option value="USDCHF" />
                  <option value="USDCAD" />
                  <option value="AUDUSD" />
                  <option value="NZDUSD" />
                </optgroup>
                <optgroup label="Forex Minors/Crosses">
                  <option value="EURGBP" />
                  <option value="EURJPY" />
                  <option value="EURAUD" />
                  <option value="EURCAD" />
                  <option value="EURCHF" />
                  <option value="EURNZD" />
                  <option value="GBPJPY" />
                  <option value="GBPAUD" />
                  <option value="GBPCAD" />
                  <option value="GBPCHF" />
                  <option value="GBPNZD" />
                  <option value="AUDJPY" />
                  <option value="AUDCAD" />
                  <option value="AUDCHF" />
                  <option value="AUDNZD" />
                  <option value="CADJPY" />
                  <option value="CADCHF" />
                  <option value="CHFJPY" />
                  <option value="NZDJPY" />
                  <option value="NZDCAD" />
                  <option value="NZDCHF" />
                </optgroup>
                <optgroup label="Crypto">
                  <option value="BTCUSD" />
                  <option value="ETHUSD" />
                  <option value="SOLUSD" />
                  <option value="XRPUSD" />
                  <option value="ADAUSD" />
                  <option value="DOGEUSD" />
                  <option value="DOTUSD" />
                  <option value="AVAXUSD" />
                  <option value="LINKUSD" />
                  <option value="MATICUSD" />
                </optgroup>
                <optgroup label="Commodities & Metals">
                  <option value="XAUUSD" />
                  <option value="XAGUSD" />
                  <option value="XPTUSD" />
                  <option value="XPDUSD" />
                  <option value="USOIL" />
                  <option value="UKOIL" />
                  <option value="NGAS" />
                </optgroup>
              </datalist>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-[12px] mb-[12px]">
            <div>
              <label className={labelStyle}>Side</label>
              <select value={form.side} onChange={(e) => update("side", e.target.value)} className={inputStyle}>
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>
            <div>
              <label className={labelStyle}>Entry price</label>
              <input required type="number" step="any" value={form.entry} onChange={(e) => update("entry", e.target.value)} className={inputStyle} placeholder="1.0850" />
            </div>
            <div>
              <label className={labelStyle}>Exit price</label>
              <input type="number" step="any" value={form.exit} onChange={(e) => update("exit", e.target.value)} className={inputStyle} placeholder="1.0910" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-[12px] mb-[12px]">
            <div>
              <label className={labelStyle}>Size (lots)</label>
              <input required type="number" step="any" value={form.size} onChange={(e) => update("size", e.target.value)} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Setup tag</label>
              <select value={form.tag} onChange={(e) => update("tag", e.target.value)} className={inputStyle}>
                <option value="Breakout">Breakout</option>
                <option value="Pullback">Pullback</option>
                <option value="Reversal">Reversal</option>
                <option value="News">News</option>
                <option value="Range">Range</option>
              </select>
            </div>
          </div>
          <label className={labelStyle}>Notes</label>
          <textarea 
            value={form.notes} 
            onChange={(e) => update("notes", e.target.value)} 
            rows={3} 
            placeholder="What was your read on the market? Did you follow your plan?"
            className={`${inputStyle} font-body resize-y mb-[18px]`} 
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[var(--color-accent)] text-[#0E1318] border-none rounded-[8px] py-[11px] font-body font-semibold text-[14px] cursor-pointer disabled:opacity-70"
          >
            {loading ? "Saving..." : "Save trade"}
          </button>
        </form>
      </div>
    </div>
  )
}
