import type { ReactNode } from 'react'
import GlassCard from './GlassCard'

interface TacticalCardProps {
  children: ReactNode
  className?: string
  headerLabel?: string
  status?: 'green' | 'amber' | 'red'
  onClick?: () => void
  active?: boolean
}

export default function TacticalCard({
  children,
  className = '',
  headerLabel,
  status = 'green',
  onClick,
  active = false,
}: TacticalCardProps) {
  return (
    <GlassCard
      className={className}
      headerLabel={headerLabel}
      status={status}
      onClick={onClick}
      active={active}
    >
      {children}
    </GlassCard>
  )
}
