export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center font-body p-5">
      <div className="w-[380px] max-w-full">
        <div className="flex items-center gap-[9px] mb-[34px] justify-center">
          <div className="w-[28px] h-[28px] rounded-[7px]" style={{ background: `linear-gradient(135deg, var(--color-accent), var(--color-profit))` }} />
          <span className="font-display text-[18px] font-bold text-[var(--color-text)]">Ledgerline</span>
        </div>
        {children}
      </div>
    </div>
  )
}
