export function Sparkline({ points, color }: { points: number[], color: string }) {
  if (!points || points.length < 2) return null
  const w = 72, h = 24
  const min = Math.min(...points), max = Math.max(...points)
  const range = max - min || 1
  const step = w / (points.length - 1)
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${i * step},${h - ((p - min) / range) * h}`).join(" ")
  
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <path d={d} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
    </svg>
  )
}
