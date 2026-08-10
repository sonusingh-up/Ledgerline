'use client'

import { useState } from 'react'
import { signUp } from '@/actions/auth'
import Link from 'next/link'

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

  const inputStyle = "w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-[8px] p-[10px_12px] text-[var(--color-text)] font-body text-[13.5px] outline-none box-border mb-[14px] focus-visible:outline-[2px] focus-visible:outline-[var(--color-accent)]"

  if (success) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[14px] p-[28px] text-center">
        <h1 className="font-display text-[20px] font-semibold text-[var(--color-text)] m-[0_0_10px]">Check your email</h1>
        <p className="text-[13px] text-[var(--color-muted)] m-[0_0_22px]">We've sent a confirmation link to complete your registration.</p>
        <Link href="/sign-in" className="text-[var(--color-accent)] text-[13.5px] no-underline">Back to sign in</Link>
      </div>
    )
  }

  return (
    <>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[14px] p-[28px]">
        <h1 className="font-display text-[20px] font-semibold text-[var(--color-text)] m-[0_0_4px]">Create your account</h1>
        <p className="text-[13px] text-[var(--color-muted)] m-[0_0_22px]">Free 14-day trial. No card required.</p>
        
        {error && <div className="text-[var(--color-loss)] text-[13px] mb-[14px]">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <label className="text-[12px] text-[var(--color-muted)] block mb-[6px]">Email</label>
          <input type="email" name="email" required placeholder="you@example.com" className={inputStyle} />
          
          <label className="text-[12px] text-[var(--color-muted)] block mb-[6px]">Password</label>
          <input type="password" name="password" required placeholder="••••••••" minLength={6} className={`${inputStyle} mb-[20px]`} />
          
          <button type="submit" disabled={loading} className="w-full bg-[var(--color-accent)] text-[#0E1318] border-none rounded-[8px] py-[11px] font-body font-semibold text-[14px] cursor-pointer disabled:opacity-70 transition-opacity">
            {loading ? "Please wait…" : "Create account"}
          </button>
        </form>
        
        <div className="text-center mt-[18px] text-[12.5px] text-[var(--color-muted)]">
          Already have one? <Link href="/sign-in" className="text-[var(--color-accent)] no-underline">Sign in</Link>
        </div>
      </div>
    </>
  )
}
