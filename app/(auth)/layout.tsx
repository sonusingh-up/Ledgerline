import { AmbientBackground } from '@/components/ui/AmbientBackground'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[var(--color-bg)] flex items-center justify-center font-body p-4 lg:p-8">
      {/* Dark Ambient Tech Backdrop */}
      <AmbientBackground />
      
      <div className="w-[420px] max-w-full relative z-10 flex flex-col gap-6">
        <div className="flex items-center gap-3 justify-center mb-2">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" 
            style={{ background: `linear-gradient(135deg, var(--color-accent), var(--color-profit))` }}
          >
            <span className="font-display font-bold text-white text-lg">L</span>
          </div>
          <span className="font-display text-2xl font-bold text-[var(--color-text)] tracking-tight">Ledgerline</span>
        </div>
        {children}
      </div>
    </div>
  )
}
