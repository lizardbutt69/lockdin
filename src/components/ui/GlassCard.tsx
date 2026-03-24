import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  headerLabel?: string
  status?: 'green' | 'amber' | 'red' | 'blue'
  onClick?: () => void
  active?: boolean
  noPadding?: boolean
}

const STATUS = {
  green: { accent: '#22c55e', border: '#86efac', ring: 'rgba(34,197,94,0.12)' },
  amber: { accent: '#f59e0b', border: '#fcd34d', ring: 'rgba(245,158,11,0.12)' },
  red:   { accent: '#ef4444', border: '#fca5a5', ring: 'rgba(239,68,68,0.12)'  },
  blue:  { accent: '#3b82f6', border: '#93c5fd', ring: 'rgba(59,130,246,0.12)' },
}

export default function GlassCard({
  children,
  className = '',
  headerLabel,
  status = 'green',
  onClick,
  active = false,
}: GlassCardProps) {
  const s = STATUS[status]

  return (
    <div
      className={`relative overflow-hidden transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md' : ''} ${className}`}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-card)',
        border: `1px solid ${active ? s.border : 'var(--border-default)'}`,
        boxShadow: active
          ? `0 0 0 3px ${s.ring}, 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)`
          : 'var(--shadow-card)',
      }}
      onClick={onClick}
    >
      {/* Colored top accent line when active */}
      {active && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: s.accent, borderRadius: '12px 12px 0 0' }}
        />
      )}

      {/* Header label */}
      {headerLabel && (
        <div
          className="px-4 py-2.5 flex items-center gap-2"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          {active && (
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.accent }} />
          )}
          <span className="text-[11px] font-semibold tracking-wide uppercase"
            style={{ color: 'var(--text-muted)' }}>
            {headerLabel}
          </span>
        </div>
      )}

      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
