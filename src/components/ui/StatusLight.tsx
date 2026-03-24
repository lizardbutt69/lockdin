interface StatusLightProps {
  status: 'green' | 'amber' | 'red'
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = { sm: 'w-2 h-2', md: 'w-3 h-3', lg: 'w-4 h-4' }
const colorMap = {
  green: 'bg-[#00ff41] status-pulse-green',
  amber: 'bg-[#ff9500] status-pulse-amber',
  red: 'bg-[#ff2d2d] status-pulse-red',
}

export default function StatusLight({ status, size = 'md' }: StatusLightProps) {
  return (
    <span
      className={`inline-block rounded-full ${sizeMap[size]} ${colorMap[status]}`}
    />
  )
}
