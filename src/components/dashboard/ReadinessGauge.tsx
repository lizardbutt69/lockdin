interface ReadinessGaugeProps {
  score: number // 0–100
}

function getStatusColor(score: number) {
  if (score >= 80) return { color: '#16a34a', label: 'OPTIMAL',     glow: 'rgba(22,163,74,0.3)' }
  if (score >= 60) return { color: '#22c55e', label: 'STRONG',      glow: 'rgba(34,197,94,0.2)' }
  if (score >= 40) return { color: '#f59e0b', label: 'STABLE',      glow: 'rgba(245,158,11,0.3)' }
  if (score >= 20) return { color: '#f59e0b', label: 'LOW',         glow: 'rgba(245,158,11,0.2)' }
  return           { color: '#ef4444',        label: 'CRITICAL',    glow: 'rgba(239,68,68,0.3)' }
}

export default function ReadinessGauge({ score }: ReadinessGaugeProps) {
  const { color, label, glow } = getStatusColor(score)
  const clampedScore = Math.max(0, Math.min(100, score))

  // SVG arc parameters
  const r = 54
  const cx = 70
  const cy = 70
  const startAngle = -220
  const sweepAngle = 260
  const endAngle = startAngle + (sweepAngle * clampedScore) / 100

  function polarToXY(angle: number, radius: number) {
    const rad = (angle * Math.PI) / 180
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
  }

  function arcPath(start: number, end: number, radius: number) {
    const s = polarToXY(start, radius)
    const e = polarToXY(end, radius)
    const largeArc = Math.abs(end - start) > 180 ? 1 : 0
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`
  }

  const tickAngles = Array.from({ length: 11 }, (_, i) => startAngle + (sweepAngle * i) / 10)

  return (
    <div className="flex flex-col items-center">
      <div className="text-[11px] font-semibold tracking-wider mb-2 uppercase" style={{ color: 'var(--text-muted)' }}>
        Readiness Score
      </div>
      <div className="relative">
        <svg width="140" height="110" viewBox="0 0 140 110">
          {/* Background arc */}
          <path
            d={arcPath(startAngle, startAngle + sweepAngle, r)}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            strokeLinecap="butt"
          />
          {/* Filled arc */}
          {clampedScore > 0 && (
            <path
              d={arcPath(startAngle, endAngle, r)}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="butt"
              style={{ filter: `drop-shadow(0 0 4px ${glow})` }}
            />
          )}
          {/* Tick marks */}
          {tickAngles.map((angle, i) => {
            const inner = polarToXY(angle, r - 10)
            const outer = polarToXY(angle, r - 14)
            return (
              <line
                key={i}
                x1={inner.x} y1={inner.y}
                x2={outer.x} y2={outer.y}
                stroke={i % 5 === 0 ? '#9ca3af' : '#e5e7eb'}
                strokeWidth={i % 5 === 0 ? 2 : 1}
              />
            )
          })}
          {/* Center score */}
          <text x={cx} y={cy - 4} textAnchor="middle" fill={color} fontSize="28" fontFamily="'Inter'" fontWeight="700" style={{ filter: `drop-shadow(0 0 6px ${glow})` }}>
            {clampedScore}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fill="#9ca3af" fontSize="8" fontFamily="'Inter'" letterSpacing="2">
            / 100
          </text>
          {/* Min/Max labels */}
          <text x="18" y="105" fill="#d1d5db" fontSize="8" fontFamily="'Inter'">0</text>
          <text x="116" y="105" fill="#d1d5db" fontSize="8" fontFamily="'Inter'">100</text>
        </svg>
      </div>
      <div
        className="font-['Plus_Jakarta_Sans'] text-xs tracking-widest font-bold mt-1"
        style={{ color }}
      >
        {label}
      </div>
    </div>
  )
}
