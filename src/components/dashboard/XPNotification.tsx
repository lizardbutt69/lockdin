import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Trophy, Flame, Star } from 'lucide-react'

export interface XPNotificationData {
  id: string
  amount: number
  source: string
  description?: string
  levelUp?: boolean
}

interface XPNotificationProps {
  notification: XPNotificationData | null
  onDismiss: () => void
}

export default function XPNotification({ notification, onDismiss }: XPNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (notification) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onDismiss, 300) // Wait for animation
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification, onDismiss])

  if (!notification) return null

  const getIcon = () => {
    if (notification.levelUp) return <Trophy className="w-5 h-5" style={{ color: '#fbbf24' }} />
    if (notification.source === 'streak_bonus') return <Flame className="w-5 h-5" style={{ color: '#f97316' }} />
    if (notification.source === 'perfect_day') return <Star className="w-5 h-5" style={{ color: '#fbbf24' }} />
    return <Zap className="w-5 h-5" style={{ color: '#22c55e' }} />
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: notification.levelUp 
                  ? 'rgba(251,191,36,0.15)' 
                  : 'rgba(34,197,94,0.15)',
              }}
            >
              {getIcon()}
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {notification.levelUp ? (
                  <span className="text-amber-500">🎉 Level Up!</span>
                ) : (
                  <>+{notification.amount} XP</>
                )}
              </div>
              {notification.description && (
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {notification.description}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}