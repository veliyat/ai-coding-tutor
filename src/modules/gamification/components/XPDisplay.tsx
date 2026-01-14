import { cn } from '@/shared/lib/utils'
import { GAMIFICATION_COLORS } from '../lib/xp-system'
import type { Level } from '../lib/xp-system'

interface XPDisplayProps {
  currentXP: number
  nextLevelXP: number
  progressPercent: number
  xpToNextLevel: number
  currentLevel: Level
  className?: string
  compact?: boolean
}

export function XPDisplay({
  currentXP,
  nextLevelXP,
  progressPercent,
  xpToNextLevel,
  currentLevel,
  className,
  compact = false,
}: XPDisplayProps) {
  const isMaxLevel = xpToNextLevel === 0

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className="text-sm font-medium" style={{ color: GAMIFICATION_COLORS.xp }}>
          {currentXP.toLocaleString()} XP
        </span>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium" style={{ color: GAMIFICATION_COLORS.xp }}>
          {currentXP.toLocaleString()} XP
        </span>
        {!isMaxLevel && (
          <span className="text-muted-foreground">
            {xpToNextLevel.toLocaleString()} to Level {currentLevel.level + 1}
          </span>
        )}
        {isMaxLevel && (
          <span className="text-muted-foreground">Max Level!</span>
        )}
      </div>

      <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: currentLevel.color,
            boxShadow: `0 0 8px ${currentLevel.color}80`,
          }}
        />
      </div>

      {!isMaxLevel && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Level {currentLevel.level}</span>
          <span>{nextLevelXP.toLocaleString()} XP</span>
        </div>
      )}
    </div>
  )
}
