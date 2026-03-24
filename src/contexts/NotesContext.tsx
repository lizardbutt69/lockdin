import { createContext, useContext, type ReactNode } from 'react'
import { useNotes, type Note } from '../hooks/useNotes'

interface NotesContextValue {
  notes: Note[]
  active: Note[]
  archived: Note[]
  loading: boolean
  addNote: (content: string) => Promise<void>
  updateNote: (id: string, updates: Partial<Pick<Note, 'content' | 'is_completed' | 'is_archived'>>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
}

const NotesContext = createContext<NotesContextValue | null>(null)

export function NotesProvider({ children }: { children: ReactNode }) {
  const notes = useNotes()
  return <NotesContext.Provider value={notes}>{children}</NotesContext.Provider>
}

export function useNotesContext() {
  const ctx = useContext(NotesContext)
  if (!ctx) throw new Error('useNotesContext must be used within NotesProvider')
  return ctx
}
