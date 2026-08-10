'use client'

import { useState } from 'react'
import { signUp } from '@/actions/auth'
import Link from 'next/link'
import { UserPlus, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function SignUp() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const res = await signUp(email, password)
    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  const inputStyle = "w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg px-3.5 py-2.5 text-[var(--color-text)] font-body text-sm outline-none box-border focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] transition-all"
  const labelStyle = "text-xs font-medium text-[var(--color-muted)] block mb-1.5"

  if (success) {
    return (
      <div className="bg-[var(--color-surface-alt)]/80 backdrop-blur-md border border-[var(--color-border-soft)] rounded-2xl p-8 shadow-xl flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 bg-[var(--color-profit)]/15 text-[var(--color-profit)] rounded-full flex items-center justify-center mb-2">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-[var(--color-text)] tracking-tight mb-2">Check your email</h1>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed max-w-[280px]">
            We've sent a secure confirmation link to your email to complete registration.
          </p>
        </div>
        <Link 
          href="/sign-in" 
          className="mt-4 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 text-[var(--color-text)] text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[var(--color-surface-alt)]/80 backdrop-blur-md border border-[var(--color-border-soft)] rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)] tracking-tight mb-1.5">
          Create an account
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Free 14-day trial. No card required.
        </p>
      </div>
      
      {error && (
        <div className="bg-[var(--color-loss)]/10 border border-[var(--color-loss)]/30 text-[var(--color-loss)] text-xs px-4 py-3 rounded-lg text-center font-medium">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className={labelStyle}>Email Address</label>
          <input type="email" name="email" required placeholder="you@example.com" className={inputStyle} />
        </div>
        
        <div>
          <label className={labelStyle}>Password</label>
          <input type="password" name="password" required placeholder="••••••••" minLength={6} className={inputStyle} />
        </div>
        
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full mt-2 bg-[#6E8CFA] hover:bg-[#5C7CFA] text-white flex justify-center items-center gap-2 border-none rounded-lg py-3 font-body font-semibold text-sm cursor-pointer disabled:opacity-70 transition-all active:scale-98 shadow-md"
        >
          {loading ? (
            "Creating account..."
          ) : (
            <>
              Sign Up <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
      
      <div className="text-center pt-4 border-t border-[var(--color-border-soft)] text-sm text-[var(--color-muted)]">
        Already have one? <Link href="/sign-in" className="text-[var(--color-accent)] font-semibold hover:text-[var(--color-accent)]/80 transition-colors">Sign in</Link>
      </div>
    </div>
  )
}
