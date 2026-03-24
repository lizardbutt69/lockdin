import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

function getTimeData() {
  const now = new Date()
  const year = now.getFullYear()
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  const daysInYear = isLeap ? 366 : 365
  const startOfYear = new Date(year, 0, 1)
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000) + 1
  const daysElapsed = dayOfYear
  const daysRemaining = daysInYear - dayOfYear
  const yearPct = dayOfYear / daysInYear

  const month = now.getMonth()
  const dayOfMonth = now.getDate()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthPct = dayOfMonth / daysInMonth
  const monthDaysLeft = daysInMonth - dayOfMonth

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const SHORT_MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

  const hoursLeft = 23 - now.getHours()
  const minsLeft = 59 - now.getMinutes()
  const dayPct = (now.getHours() * 60 + now.getMinutes()) / (24 * 60)

  return { year, daysInYear, daysElapsed, daysRemaining, yearPct, month, dayOfMonth, daysInMonth, monthPct, monthDaysLeft, monthName: MONTH_NAMES[month], shortMonths: SHORT_MONTHS, hoursLeft, minsLeft, dayPct }
}

// Arc SVG component
function ArcRing({ pct, size = 120, strokeWidth = 8, color = '#6366f1', trackColor = 'rgba(255,255,255,0.1)' }: {
  pct: number; size?: number; strokeWidth?: number; color?: string; trackColor?: string
}) {
  const r = (size - strokeWidth) / 2
  const cx = size / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - pct)

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      <motion.circle
        cx={cx} cy={cx} r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
      />
    </svg>
  )
}

export default function YearProgressCard({ name }: { name?: string }) {
  const [data, setData] = useState(getTimeData)

  // refresh every minute so clock stays live
  useEffect(() => {
    const id = setInterval(() => setData(getTimeData()), 60000)
    return () => clearInterval(id)
  }, [])

  const { year, daysInYear, daysElapsed, daysRemaining, yearPct, monthName, dayOfMonth, daysInMonth, monthPct, monthDaysLeft, shortMonths, month, dayPct } = data

  const yearPctDisplay = Math.floor(yearPct * 100)
  const monthPctDisplay = Math.floor(monthPct * 100)
  const dayPctDisplay = Math.floor(dayPct * 100)

  return (
    <div
      className="rounded-2xl overflow-hidden w-full"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        boxShadow: '0 4px 32px rgba(99,102,241,0.2), 0 1px 3px rgba(0,0,0,0.3)',
      }}
    >
      <div className="px-6 py-5">

        {/* ── Greeting ─────────────────────────────────────────── */}
        {name && (
          <div className="mb-4">
            <p className="font-['Space_Grotesk'] font-bold tracking-tight leading-none" style={{ color: '#ffffff', fontSize: 22 }}>
              Time to lock in, {name}.
            </p>
          </div>
        )}

        {/* ── Year section ─────────────────────────────────────── */}
        <div className="flex items-center gap-6">

          {/* Ring */}
          <div className="relative shrink-0">
            <ArcRing pct={yearPct} size={112} strokeWidth={7} color="#818cf8" trackColor="rgba(255,255,255,0.08)" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold font-['Space_Grotesk'] leading-none" style={{ color: '#e0e7ff' }}>
                {yearPctDisplay}%
              </span>
              <span className="text-[9px] tracking-widest uppercase mt-0.5" style={{ color: '#6366f1' }}>elapsed</span>
            </div>
          </div>

          {/* Year stats */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-['Space_Grotesk'] text-[11px] font-semibold tracking-widest uppercase" style={{ color: '#6366f1' }}>
                {year}
              </span>
            </div>
            <div className="flex items-end gap-4 mb-3">
              <div>
                <motion.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-['Space_Grotesk'] font-bold leading-none"
                  style={{ color: '#ffffff', fontSize: 42, letterSpacing: '-0.02em' }}
                >
                  {daysRemaining}
                </motion.span>
                <p className="text-xs mt-0.5 font-medium" style={{ color: '#94a3b8' }}>days remaining</p>
              </div>
              <div className="pb-1">
                <span className="font-['Space_Grotesk'] text-xl font-semibold" style={{ color: '#475569' }}>{daysElapsed}</span>
                <p className="text-[11px]" style={{ color: '#475569' }}>elapsed</p>
              </div>
            </div>

            {/* Month markers bar */}
            <div>
              <div className="flex gap-px mb-1.5 h-1.5">
                {shortMonths.map((m, i) => (
                  <motion.div
                    key={m}
                    className="flex-1 rounded-sm"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                    style={{
                      background: i < month ? '#4f46e5' : i === month ? '#818cf8' : 'rgba(255,255,255,0.08)',
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between">
                <span className="text-[9px] tracking-widest" style={{ color: '#475569' }}>JAN</span>
                <span className="text-[9px] tracking-widest" style={{ color: '#475569' }}>DEC</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Divider ───────────────────────────────────────────── */}
        <div className="my-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

        {/* ── Month + Day row ───────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">

          {/* Month */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold font-['Space_Grotesk'] tracking-wider uppercase" style={{ color: '#38bdf8' }}>
                {monthName}
              </span>
              <span className="text-xs font-bold" style={{ color: '#38bdf8' }}>{monthPctDisplay}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden mb-1.5" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${monthPctDisplay}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                style={{ background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)' }}
              />
            </div>
            <div className="flex justify-between text-[10px]" style={{ color: '#64748b' }}>
              <span>Day {dayOfMonth} of {daysInMonth}</span>
              <span>{monthDaysLeft} days left</span>
            </div>
          </div>

          {/* Today */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold font-['Space_Grotesk'] tracking-wider uppercase" style={{ color: '#34d399' }}>
                Today
              </span>
              <span className="text-xs font-bold" style={{ color: '#34d399' }}>{dayPctDisplay}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden mb-1.5" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${dayPctDisplay}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.6 }}
                style={{ background: 'linear-gradient(90deg, #10b981, #34d399)' }}
              />
            </div>
            <div className="flex justify-between text-[10px]" style={{ color: '#64748b' }}>
              <span>{data.hoursLeft}h {data.minsLeft}m left</span>
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
