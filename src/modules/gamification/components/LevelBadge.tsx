import { cn } from '@/shared/lib/utils'
import type { Level } from '../lib/xp-system'

interface LevelBadgeProps {
  level: Level
  size?: 'sm' | 'md' | 'lg'
  showTitle?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
}

const containerSizes = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
}

export function LevelBadge({
  level,
  size = 'md',
  showTitle = false,
  className,
}: LevelBadgeProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full',
          containerSizes[size]
        )}
        style={{
          backgroundColor: `${level.color}20`,
          boxShadow: `0 0 12px ${level.color}40`,
        }}
      >
        <span className={sizeClasses[size]} role="img" aria-label={level.title}>
          {level.icon}
        </span>
      </div>
      {showTitle && (
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Level {level.level}</span>
          <span className="font-medium" style={{ color: level.color }}>
            {level.title}
          </span>
        </div>
      )}
    </div>
  )
}
