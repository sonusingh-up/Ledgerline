'use client'

import { useState } from 'react'
import { signIn } from '@/actions/auth'
import Link from 'next/link'

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

  const inputStyle = "w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-[8px] p-[10px_12px] text-[var(--color-text)] font-body text-[13.5px] outline-none box-border mb-[14px] focus-visible:outline-[2px] focus-visible:outline-[var(--color-accent)]"

  return (
    <>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[14px] p-[28px]">
        <h1 className="font-display text-[20px] font-semibold text-[var(--color-text)] m-[0_0_4px]">Sign in</h1>
        <p className="text-[13px] text-[var(--color-muted)] m-[0_0_22px]">Track every trade. Stay inside the rules.</p>
        
        {error && <div className="text-[var(--color-loss)] text-[13px] mb-[14px]">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <label className="text-[12px] text-[var(--color-muted)] block mb-[6px]">Email</label>
          <input type="email" name="email" required placeholder="you@example.com" className={inputStyle} />
          
          <label className="text-[12px] text-[var(--color-muted)] block mb-[6px]">Password</label>
          <input type="password" name="password" required placeholder="••••••••" className={`${inputStyle} mb-[20px]`} />
          
          <button type="submit" disabled={loading} className="w-full bg-[var(--color-accent)] text-[#0E1318] border-none rounded-[8px] py-[11px] font-body font-semibold text-[14px] cursor-pointer disabled:opacity-70 transition-opacity">
            {loading ? "Please wait…" : "Sign in"}
          </button>
        </form>
        
        <div className="text-center mt-[18px] text-[12.5px] text-[var(--color-muted)]">
          No account? <Link href="/sign-up" className="text-[var(--color-accent)] no-underline">Create one</Link>
        </div>
      </div>
    </>
  )
}
