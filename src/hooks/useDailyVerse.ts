import { useState, useEffect } from 'react'

const MENS_VERSES = [
  'Joshua 1:9', 'Proverbs 27:17', '1 Corinthians 16:13', 'Micah 6:8',
  'Philippians 4:13', 'Romans 8:28', 'Isaiah 40:31', 'Proverbs 3:5-6',
  '1 Timothy 4:12', 'Matthew 5:9', 'Romans 12:2', 'Galatians 6:9',
  'Colossians 3:23', 'Psalm 46:1', '2 Timothy 1:7', '1 Peter 5:7',
  'Proverbs 4:23', 'John 15:13', 'Romans 5:8', 'Hebrews 12:1',
  'James 4:7', 'Psalm 34:18', 'Matthew 6:33', 'Proverbs 16:3',
  'Ecclesiastes 4:9', 'Daniel 1:8', 'Nehemiah 8:10', 'Mark 10:45',
  'Romans 15:13', 'Ephesians 6:10', 'Colossians 3:14', '1 Thessalonians 5:11',
  '2 Corinthians 12:9', 'Psalm 1:1-3', 'Proverbs 13:20', 'Matthew 22:37-39',
  'Romans 12:18', '1 Corinthians 9:24', 'Ephesians 4:32', 'Philippians 4:6-7',
  '2 Timothy 2:22', '1 Peter 4:10', 'Proverbs 22:1', 'Psalm 119:105',
  'Romans 8:1', 'James 1:19-20', 'Ecclesiastes 9:10', 'Proverbs 11:14',
  'Ephesians 5:25', 'Luke 22:26', 'James 1:2-4', 'Psalm 23:1',
]

export function getDailyVerse(): string {
  const start = new Date(new Date().getFullYear(), 0, 0)
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86400000)
  return MENS_VERSES[dayOfYear % MENS_VERSES.length]
}

export interface VerseData {
  text: string
  reference: string
}

export function useDailyVerse() {
  const [verse, setVerse] = useState<VerseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  async function fetchVerse(ref: string) {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`https://bible-api.com/${encodeURIComponent(ref)}?translation=kjv`)
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      setVerse({ text: data.text?.trim(), reference: data.reference })
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchVerse(getDailyVerse()) }, [])

  return { verse, loading, error, refetch: () => fetchVerse(getDailyVerse()) }
}
