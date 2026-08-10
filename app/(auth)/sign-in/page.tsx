'use client'

import { useState } from 'react'
import { signIn } from '@/actions/auth'
import Link from 'next/link'
import { LogIn, ArrowRight } from 'lucide-react'

export default function SignIn() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const res = await signIn(email, password)
    if (res?.error) {
      setError(res.error)
      setLoading(false)
    }
  }

  const inputStyle = "w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg px-3.5 py-2.5 text-[var(--color-text)] font-body text-sm outline-none box-border focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] transition-all"
  const labelStyle = "text-xs font-medium text-[var(--color-muted)] block mb-1.5"

  return (
    <div className="bg-[var(--color-surface-alt)]/80 backdrop-blur-md border border-[var(--color-border-soft)] rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)] tracking-tight mb-1.5">
          Welcome back
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Track every trade. Stay inside the rules.
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
          <input type="password" name="password" required placeholder="••••••••" className={inputStyle} />
        </div>
        
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full mt-2 bg-[#6E8CFA] hover:bg-[#5C7CFA] text-white flex justify-center items-center gap-2 border-none rounded-lg py-3 font-body font-semibold text-sm cursor-pointer disabled:opacity-70 transition-all active:scale-98 shadow-md"
        >
          {loading ? (
            "Signing in..."
          ) : (
            <>
              Sign In <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
      
      <div className="text-center pt-4 border-t border-[var(--color-border-soft)] text-sm text-[var(--color-muted)]">
        Don't have an account? <Link href="/sign-up" className="text-[var(--color-accent)] font-semibold hover:text-[var(--color-accent)]/80 transition-colors">Create one</Link>
      </div>
    </div>
  )
}
