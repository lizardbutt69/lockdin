import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Mode = 'work' | 'short' | 'long'

const MODES: Record<Mode, { label: string; minutes: number; color: string; bg: string; border: string }> = {
  work:  { label: 'Focus',       minutes: 25, color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
  short: { label: 'Short Break', minutes: 5,  color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
  long:  { label: 'Long Break',  minutes: 15, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
}

function beep() {
  try {
    const ctx = new AudioContext()
    // Three ascending notes: C5 → E5 → G5
    const notes = [523, 659, 784]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      const start = ctx.currentTime + i * 0.18
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.35, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5)
      osc.start(start)
      osc.stop(start + 0.5)
    })
  } catch { /* ignore if audio blocked */ }
}

const RADIUS = 36
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface PomodoroTimerProps {
  compact?: boolean
}

export default function PomodoroTimer({ compact = false }: PomodoroTimerProps) {
  const [mode, setMode] = useState<Mode>('work')
  const [secondsLeft, setSecondsLeft] = useState(MODES.work.minutes * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const cfg = MODES[mode]
  const totalSeconds = cfg.minutes * 60
  const progress = secondsLeft / totalSeconds
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const secs = String(secondsLeft % 60).padStart(2, '0')

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    setRunning(false)
  }, [])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          beep()
          stop()
          if (mode === 'work') setSessions(n => n + 1)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, mode, stop])

  function switchMode(m: Mode) {
    stop()
    setMode(m)
    setSecondsLeft(MODES[m].minutes * 60)
  }

  function toggle() {
    if (secondsLeft === 0) {
      setSecondsLeft(totalSeconds)
      setRunning(true)
    } else {
      setRunning(v => !v)
    }
  }

  function reset() {
    stop()
    setSecondsLeft(totalSeconds)
  }

  // ── Compact sidebar version ──
  if (compact) {
    const progressPct = ((totalSeconds - secondsLeft) / totalSeconds) * 100
    return (
      <div className="px-3 py-2.5 space-y-2" style={{ border: '1px solid var(--border-default)', borderRadius: 10, background: 'var(--bg-input)' }}>
        {/* Top row: icon + label + time + controls */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
            {mode === 'work' ? <Brain className="w-2.5 h-2.5" style={{ color: cfg.color }} /> : <Coffee className="w-2.5 h-2.5" style={{ color: cfg.color }} />}
          </div>
          <span className="text-xs font-semibold tabular-nums flex-1 font-['Space_Grotesk']" style={{ color: cfg.color }}>
            {mins}:{secs}
          </span>
          {sessions > 0 && (
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{sessions}×</span>
          )}
          <button onClick={reset} className="p-1 rounded transition-colors" style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            title="Reset">
            <RotateCcw className="w-3 h-3" />
          </button>
          <button
            onClick={toggle}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-white transition-all"
            style={{ background: cfg.color }}
          >
            {running ? <><Pause className="w-2.5 h-2.5" />Pause</> : <><Play className="w-2.5 h-2.5" />{secondsLeft === 0 ? 'Restart' : 'Start'}</>}
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: 'linear' }}
            style={{ background: cfg.color }}
          />
        </div>

        {/* Mode pills */}
        <div className="flex gap-1">
          {(Object.keys(MODES) as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className="flex-1 py-0.5 rounded text-[10px] font-medium transition-all"
              style={{
                background: mode === m ? cfg.bg : 'transparent',
                color: mode === m ? MODES[m].color : 'var(--text-muted)',
                border: `1px solid ${mode === m ? cfg.border : 'transparent'}`,
              }}
            >
              {m === 'work' ? 'Focus' : m === 'short' ? 'Short' : 'Long'}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Full version ──
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
            {mode === 'work' ? <Brain className="w-3 h-3" style={{ color: cfg.color }} /> : <Coffee className="w-3 h-3" style={{ color: cfg.color }} />}
          </div>
          <span className="text-sm font-semibold font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>Pomodoro</span>
        </div>
        {sessions > 0 && (
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
            {sessions} session{sessions !== 1 ? 's' : ''} done
          </span>
        )}
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Mode tabs */}
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-subtle)' }}>
          {(Object.keys(MODES) as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className="flex-1 py-1 rounded-md text-[11px] font-medium transition-all"
              style={{
                background: mode === m ? 'var(--bg-card)' : 'transparent',
                color: mode === m ? MODES[m].color : 'var(--text-tertiary)',
                boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                fontWeight: mode === m ? 600 : 400,
              }}
            >
              {MODES[m].label}
            </button>
          ))}
        </div>

        {/* Timer ring */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
              {/* Track */}
              <circle cx="44" cy="44" r={RADIUS} fill="none" stroke="var(--bg-subtle)" strokeWidth="6" />
              {/* Progress */}
              <motion.circle
                cx="44" cy="44" r={RADIUS}
                fill="none"
                stroke={cfg.color}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 0.5, ease: 'linear' }}
              />
            </svg>
            {/* Time label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${mins}:${secs}`}
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 1 }}
                  className="text-xl font-bold font-['Space_Grotesk'] tabular-nums"
                  style={{ color: cfg.color, lineHeight: 1 }}
                >
                  {mins}:{secs}
                </motion.span>
              </AnimatePresence>
              {running && (
                <span className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {cfg.label}
                </span>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={reset}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggle}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all"
              style={{ background: cfg.color, minWidth: 96 }}
            >
              {running ? <><Pause className="w-3.5 h-3.5" />Pause</> : <><Play className="w-3.5 h-3.5" />{secondsLeft === 0 ? 'Restart' : 'Start'}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
