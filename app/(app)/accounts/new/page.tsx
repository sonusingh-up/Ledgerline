'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAccount } from '@/actions/accounts'
import { PROP_FIRM_TEMPLATES } from '@/lib/propFirmTemplates'
import Link from 'next/link'

export default function NewAccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [type, setType] = useState<'retail' | 'prop'>('retail')
  const [templateIdx, setTemplateIdx] = useState(0)
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const label = formData.get('label') as string
    const startBalance = parseFloat(formData.get('start_balance') as string)
    
    const data: any = {
      label,
      account_type: type,
      start_balance: startBalance,
    }
    
    if (type === 'prop') {
      const isCustom = templateIdx === PROP_FIRM_TEMPLATES.length - 1
      const template = PROP_FIRM_TEMPLATES[templateIdx]
      
      data.prop_firm_name = isCustom ? (formData.get('prop_firm_name') as string || 'Custom') : template.name
      data.daily_loss_limit_pct = parseFloat(formData.get('daily_loss_limit_pct') as string) || null
      data.max_drawdown_pct = parseFloat(formData.get('max_drawdown_pct') as string) || null
      data.profit_target_pct = parseFloat(formData.get('profit_target_pct') as string) || null
      data.drawdown_type = formData.get('drawdown_type') as string
    }
    
    const res = await createAccount(data)
    
    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else {
      router.push('/accounts')
    }
  }

  const inputStyle = "w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-[8px] p-[10px_12px] text-[var(--color-text)] font-body text-[13.5px] outline-none box-border focus-visible:outline-[2px] focus-visible:outline-[var(--color-accent)]"
  const labelStyle = "text-[12px] text-[var(--color-muted)] block mb-[6px]"

  return (
    <div className="p-[24px] max-w-[600px]">
      <div className="flex items-center gap-[12px] mb-[20px]">
        <h1 className="font-display text-[20px] font-semibold m-0">New Account</h1>
        <Link href="/accounts" className="text-[13px] text-[var(--color-muted)] no-underline hover:text-[var(--color-text)]">Cancel</Link>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[14px] p-[28px]">
        {error && <div className="text-[var(--color-loss)] text-[13px] mb-[14px]">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-[20px]">
          <div>
            <label className={labelStyle}>Account Label</label>
            <input type="text" name="label" required placeholder="e.g. Personal or FTMO 100K" className={inputStyle} />
          </div>
          
          <div>
            <label className={labelStyle}>Account Type</label>
            <div className="flex bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-[8px] p-[4px]">
              <button 
                type="button" 
                onClick={() => setType('retail')}
                className={`flex-1 p-[8px] text-[13px] rounded-[6px] cursor-pointer transition-colors border-none font-medium ${type === 'retail' ? 'bg-[var(--color-surface)] shadow text-[var(--color-text)]' : 'bg-transparent text-[var(--color-muted)]'}`}
              >
                Retail
              </button>
              <button 
                type="button" 
                onClick={() => setType('prop')}
                className={`flex-1 p-[8px] text-[13px] rounded-[6px] cursor-pointer transition-colors border-none font-medium ${type === 'prop' ? 'bg-[var(--color-surface)] shadow text-[var(--color-text)]' : 'bg-transparent text-[var(--color-muted)]'}`}
              >
                Prop Firm
              </button>
            </div>
          </div>
          
          <div>
            <label className={labelStyle}>Starting Balance ($)</label>
            <input type="number" name="start_balance" required min="0" step="any" placeholder="100000" className={inputStyle} />
          </div>

          {type === 'prop' && (
            <div className="border-t border-[var(--color-border-soft)] pt-[20px] mt-[4px] flex flex-col gap-[20px]">
              <div className="bg-[var(--color-accent-dim)] text-[var(--color-accent)] p-[12px_16px] rounded-[8px] text-[12.5px] font-medium leading-relaxed">
                Rule presets are a starting point — confirm exact terms with your firm before relying on this for compliance.
              </div>
              
              <div>
                <label className={labelStyle}>Prop Firm Template</label>
                <select 
                  value={templateIdx} 
                  onChange={(e) => setTemplateIdx(Number(e.target.value))} 
                  className={inputStyle}
                >
                  {PROP_FIRM_TEMPLATES.map((t, i) => (
                    <option key={t.name} value={i}>{t.name}</option>
                  ))}
                </select>
              </div>

              {templateIdx === PROP_FIRM_TEMPLATES.length - 1 && (
                <div>
                  <label className={labelStyle}>Custom Firm Name</label>
                  <input type="text" name="prop_firm_name" placeholder="MyPropFirm" className={inputStyle} />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-[16px]">
                <div>
                  <label className={labelStyle}>Daily Loss Limit (%)</label>
                  <input type="number" name="daily_loss_limit_pct" step="any" defaultValue={PROP_FIRM_TEMPLATES[templateIdx].dailyLossLimitPct || ''} className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>Max Drawdown (%)</label>
                  <input type="number" name="max_drawdown_pct" step="any" defaultValue={PROP_FIRM_TEMPLATES[templateIdx].maxDrawdownPct || ''} className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>Profit Target (%)</label>
                  <input type="number" name="profit_target_pct" step="any" defaultValue={PROP_FIRM_TEMPLATES[templateIdx].profitTargetPct || ''} className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>Drawdown Type</label>
                  <select name="drawdown_type" defaultValue={PROP_FIRM_TEMPLATES[templateIdx].drawdownType} className={inputStyle}>
                    <option value="static">Static / Fixed</option>
                    <option value="trailing">Trailing</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          <button type="submit" disabled={loading} className="w-full bg-[var(--color-accent)] text-[#0E1318] border-none rounded-[8px] py-[11px] font-body font-semibold text-[14px] cursor-pointer disabled:opacity-70 transition-opacity mt-[8px]">
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  )
}
