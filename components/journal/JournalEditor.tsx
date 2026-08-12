'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { JournalEntry, Trade } from '@/lib/types'
import { upsertJournalEntry, uploadJournalImage } from '@/actions/journal'
import { Save, Frown, Meh, Smile, Target, Zap, Clock, ImageIcon, X } from 'lucide-react'
import { fmtMoney } from '@/lib/calculations'
import Image from 'next/image'
import { ImageLightbox } from '@/components/ui/ImageLightbox'

interface JournalEditorProps {
  date: string
  initialEntry?: JournalEntry | null
  trades: Trade[]
  title?: string
}

export function JournalEditor({ date, initialEntry, trades, title }: JournalEditorProps) {
  const [content, setContent] = useState(initialEntry?.content || '')
  const [mood, setMood] = useState<number | null>(initialEntry?.mood || null)
  const [imageUrl, setImageUrl] = useState<string | null>(initialEntry?.image_url || null)
  const [file, setFile] = useState<File | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  // Reset local state if date or initialEntry changes from props
  useEffect(() => {
    setContent(initialEntry?.content || '')
    setMood(initialEntry?.mood || null)
    setImageUrl(initialEntry?.image_url || null)
    setFile(null)
    setSaveStatus('idle')
  }, [date, initialEntry])

  const handleSave = () => {
    setSaveStatus('idle')
    startTransition(async () => {
      let finalImageUrl = imageUrl
      
      // Upload file if selected
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        const res = await uploadJournalImage(formData)
        if (res.error) {
          setSaveStatus('error')
          return
        }
        if (res.publicUrl) {
          finalImageUrl = res.publicUrl
          setImageUrl(finalImageUrl) // update local state
          setFile(null) // clear file selection
        }
      }

      const res = await upsertJournalEntry(date, content, mood || undefined, finalImageUrl || undefined)
      if (res.error) {
        setSaveStatus('error')
      } else {
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  // Derived stats from the day's trades
  const netPnl = trades.reduce((acc, t) => acc + Number(t.pnl || 0), 0)
  const wins = trades.filter((t) => Number(t.pnl || 0) > 0).length

  // Mood options (1-5)
  const moods = [
    { value: 1, icon: Frown, label: 'Tilt / Frustrated', color: 'text-[var(--color-loss)] hover:bg-[var(--color-loss)]/10' },
    { value: 2, icon: Meh, label: 'Bored / Anxious', color: 'text-[var(--color-amber)] hover:bg-[var(--color-amber)]/10' },
    { value: 3, icon: Smile, label: 'Neutral / Okay', color: 'text-[var(--color-muted)] hover:bg-[var(--color-surface-hover)]' },
    { value: 4, icon: Target, label: 'Focused / Disciplined', color: 'text-[var(--color-profit)] hover:bg-[var(--color-profit)]/10' },
    { value: 5, icon: Zap, label: 'In the Zone', color: 'text-[#6E8CFA] hover:bg-[#6E8CFA]/10' },
  ]

  return (
    <div className="flex flex-col bg-[var(--color-surface-alt)]/80 backdrop-blur-md border border-[var(--color-border-soft)] rounded-2xl shadow-md overflow-hidden">
      
      {/* Editor Section */}
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-display text-base font-bold text-[var(--color-text)] m-0">
              {title || "Today's Journal"}
            </h3>
            <p className="text-xs font-mono text-[var(--color-muted)] mt-0.5">
              {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          
          <div className="flex items-center gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-1">
            {moods.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                title={m.label}
                className={`p-1.5 rounded-md transition-all ${
                  mood === m.value 
                    ? `bg-[var(--color-surface-alt)] ring-1 ring-[var(--color-border)] shadow-xs ${m.color.split(' ')[0]}` 
                    : `text-[var(--color-muted-dark)] ${m.color.split(' ')[1]}`
                }`}
              >
                <m.icon size={16} />
              </button>
            ))}
            <div className="w-[1px] h-4 bg-[var(--color-border-soft)] mx-1"></div>
            <label 
              title="Attach Image"
              className="p-1.5 rounded-md transition-all text-[var(--color-muted-dark)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] cursor-pointer"
            >
              <ImageIcon size={16} />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileSelect}
              />
            </label>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="How did the session go? Any mistakes? Were rules followed?"
            className="w-full min-h-[140px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3.5 text-sm text-[var(--color-text)] font-body outline-none focus-visible:border-[var(--color-accent)] transition-colors resize-y leading-relaxed"
          />
          
          {(file || imageUrl) && (
            <div className="mt-3 relative w-32 h-24 rounded-lg overflow-hidden border border-[var(--color-border)] group cursor-zoom-in" onClick={() => {
              if (file) setLightboxUrl(URL.createObjectURL(file))
              else if (imageUrl) setLightboxUrl(imageUrl)
            }}>
              {file ? (
                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
              ) : imageUrl ? (
                <Image src={imageUrl} alt="Attached" fill className="object-cover" />
              ) : null}
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setFile(null)
                  setImageUrl(null)
                }}
                className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs font-medium">
            {saveStatus === 'saved' && <span className="text-[var(--color-profit)]">✓ Saved to journal</span>}
            {saveStatus === 'error' && <span className="text-[var(--color-loss)]">✗ Error saving</span>}
          </div>
          <button
            onClick={handleSave}
            disabled={isPending || (!content && !mood)}
            className="flex items-center gap-2 bg-[#6E8CFA] hover:bg-[#5C7CFA] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {isPending ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </div>

      {/* Trades Review Section */}
      <div className="bg-[var(--color-surface)]/60 border-t border-[var(--color-border-soft)] p-4">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)] mb-3 flex items-center justify-between">
          <span>Session Trades</span>
          {trades.length > 0 && (
            <span className={`font-mono ${netPnl >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
              {netPnl >= 0 ? '+' : ''}{fmtMoney(netPnl)}
            </span>
          )}
        </h4>

        {trades.length === 0 ? (
          <div className="text-xs text-[var(--color-muted-dark)] flex items-center gap-2 italic">
            <Clock size={13} />
            No trades logged for this date.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {trades.map((t) => (
              <div key={t.id} className="flex items-center justify-between bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-xs">
                <div className="flex items-center gap-3">
                  <span className={`font-bold w-10 ${t.side === 'long' ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
                    {t.side.toUpperCase()}
                  </span>
                  <span className="font-mono font-medium text-[var(--color-text)] w-16 truncate">
                    {t.symbol}
                  </span>
                  {t.setup_tag && (
                    <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[var(--color-surface-alt)] border border-[var(--color-border)] text-[var(--color-muted)] text-[10px] truncate max-w-[80px]">
                      {t.setup_tag}
                    </span>
                  )}
                </div>
                
                <div className={`font-mono font-bold ${Number(t.pnl) >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
                  {Number(t.pnl) >= 0 ? '+' : ''}{fmtMoney(Number(t.pnl))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {lightboxUrl && (
        <ImageLightbox imageUrl={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}
    </div>
  )
}
