import { createContext, useContext, useState, type ReactNode } from 'react'

const PIN_KEY = 'lockedin_journal_pin'

interface JournalLockContextType {
  isLocked: boolean
  hasPIN: boolean
  unlock: (pin: string) => boolean
  lock: () => void
  setPin: (pin: string) => void
  removePin: () => void
}

const JournalLockContext = createContext<JournalLockContextType | null>(null)

export function JournalLockProvider({ children }: { children: ReactNode }) {
  const [hasPIN, setHasPIN] = useState(() => !!localStorage.getItem(PIN_KEY))
  const [isLocked, setIsLocked] = useState(() => !!localStorage.getItem(PIN_KEY))

  function unlock(pin: string): boolean {
    const stored = localStorage.getItem(PIN_KEY)
    if (pin === stored) {
      setIsLocked(false)
      return true
    }
    return false
  }

  function lock() {
    if (hasPIN) setIsLocked(true)
  }

  function setPin(pin: string) {
    localStorage.setItem(PIN_KEY, pin)
    setHasPIN(true)
    setIsLocked(false)
  }

  function removePin() {
    localStorage.removeItem(PIN_KEY)
    setHasPIN(false)
    setIsLocked(false)
  }

  return (
    <JournalLockContext.Provider value={{ isLocked, hasPIN, unlock, lock, setPin, removePin }}>
      {children}
    </JournalLockContext.Provider>
  )
}

export function useJournalLock() {
  const ctx = useContext(JournalLockContext)
  if (!ctx) throw new Error('useJournalLock must be inside JournalLockProvider')
  return ctx
}
