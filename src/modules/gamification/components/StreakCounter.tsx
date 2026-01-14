import { cn } from '@/shared/lib/utils'
import { GAMIFICATION_COLORS } from '../lib/xp-system'

interface StreakCounterProps {
  streak: number
  longestStreak?: number
  showLongest?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: {
    icon: 'text-lg',
    count: 'text-sm font-medium',
    label: 'text-xs',
  },
  md: {
    icon: 'text-2xl',
    count: 'text-lg font-bold',
    label: 'text-sm',
  },
  lg: {
    icon: 'text-4xl',
    count: 'text-2xl font-bold',
    label: 'text-base',
  },
}

export function StreakCounter({
  streak,
  longestStreak,
  showLongest = false,
  size = 'md',
  className,
}: StreakCounterProps) {
  const sizes = sizeClasses[size]
  const hasStreak = streak > 0

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(sizes.icon, !hasStreak && 'grayscale opacity-50')}
        role="img"
        aria-label="streak"
      >
        🔥
      </span>
      <div className="flex flex-col">
        <span
          className={sizes.count}
          style={{ color: hasStreak ? GAMIFICATION_COLORS.streak : undefined }}
        >
          {streak}
        </span>
        <span className={cn(sizes.label, 'text-muted-foreground')}>
          {streak === 1 ? 'day' : 'days'}
        </span>
      </div>
      {showLongest && longestStreak !== undefined && longestStreak > streak && (
        <div className="ml-2 flex flex-col border-l pl-2">
          <span className="text-xs text-muted-foreground">Best</span>
          <span className="text-sm font-medium text-muted-foreground">
            {longestStreak}
          </span>
        </div>
      )}
    </div>
  )
}
