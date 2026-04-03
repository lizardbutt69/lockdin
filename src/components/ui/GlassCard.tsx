import type { ReactNode } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

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
  green: { accent: '#22c55e', border: '#86efac', ring: 'rgba(34,197,94,0.12)', darkAccent: '#4ade80', darkBorder: 'rgba(74,222,128,0.30)', darkRing: 'rgba(74,222,128,0.10)' },
  amber: { accent: '#f59e0b', border: '#fcd34d', ring: 'rgba(245,158,11,0.12)', darkAccent: '#fbbf24', darkBorder: 'rgba(251,191,36,0.30)', darkRing: 'rgba(251,191,36,0.10)' },
  red:   { accent: '#ef4444', border: '#fca5a5', ring: 'rgba(239,68,68,0.12)',  darkAccent: '#f87171', darkBorder: 'rgba(248,113,113,0.30)', darkRing: 'rgba(248,113,113,0.10)' },
  blue:  { accent: '#3b82f6', border: '#93c5fd', ring: 'rgba(59,130,246,0.12)', darkAccent: '#60a5fa', darkBorder: 'rgba(96,165,250,0.30)', darkRing: 'rgba(96,165,250,0.10)' },
}

export default function GlassCard({
  children,
  className = '',
  headerLabel,
  status = 'green',
  onClick,
  active = false,
}: GlassCardProps) {
  const { theme } = useTheme()
  const s = STATUS[status]
  const isDark = theme === 'dark'

  const accent = isDark ? s.darkAccent : s.accent
  const border = isDark ? s.darkBorder : s.border
  const ring   = isDark ? s.darkRing   : s.ring

  return (
    <div
      className={`glass-card relative overflow-hidden transition-all duration-200 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        borderRadius: 'var(--radius-card)',
        border: `1px solid ${active ? border : 'var(--border-default)'}`,
        boxShadow: active
          ? `0 0 0 3px ${ring}, var(--shadow-card)`
          : 'var(--shadow-card)',
      }}
      onClick={onClick}
    >
      {/* Colored top accent line when active */}
      {active && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5 z-10"
          style={{
            background: isDark
              ? `linear-gradient(90deg, transparent, ${accent}, transparent)`
              : accent,
            borderRadius: '14px 14px 0 0',
            opacity: isDark ? 0.9 : 1,
          }}
        />
      )}

      {/* Header label */}
      {headerLabel && (
        <div
          className="px-4 py-2.5 flex items-center gap-2"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          {active && (
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: accent,
                boxShadow: isDark ? `0 0 6px ${accent}` : 'none',
              }}
            />
          )}
          <span
            className="text-[11px] font-semibold tracking-wide uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
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
