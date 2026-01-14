import { cn } from '@/shared/lib/utils'
import { GAMIFICATION_COLORS } from '../lib/xp-system'
import type { Achievement } from '../types'

interface AchievementCardProps {
  achievement: Achievement
  isUnlocked: boolean
  earnedAt?: string
  size?: 'sm' | 'md'
  className?: string
}

export function AchievementCard({
  achievement,
  isUnlocked,
  earnedAt,
  size = 'md',
  className,
}: AchievementCardProps) {
  const isSm = size === 'sm'

  return (
    <div
      className={cn(
        'relative rounded-lg border bg-card transition-all',
        isUnlocked
          ? 'border-primary/20 shadow-sm'
          : 'border-muted opacity-60 grayscale',
        isSm ? 'p-3' : 'p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex items-center justify-center rounded-full',
            isSm ? 'h-10 w-10 text-xl' : 'h-12 w-12 text-2xl'
          )}
          style={{
            backgroundColor: isUnlocked
              ? `${GAMIFICATION_COLORS.achievement}20`
              : undefined,
          }}
        >
          <span role="img" aria-hidden="true">
            {achievement.icon}
          </span>
        </div>

        <div className="flex-1 space-y-1">
          <h4 className={cn('font-medium', isSm ? 'text-sm' : 'text-base')}>
            {achievement.title}
          </h4>
          <p
            className={cn(
              'text-muted-foreground',
              isSm ? 'text-xs' : 'text-sm'
            )}
          >
            {achievement.description}
          </p>

          {isUnlocked && earnedAt && (
            <p className="text-xs text-muted-foreground">
              Earned {new Date(earnedAt).toLocaleDateString()}
            </p>
          )}

          {!isUnlocked && achievement.xp_reward > 0 && (
            <p
              className="text-xs font-medium"
              style={{ color: GAMIFICATION_COLORS.xp }}
            >
              +{achievement.xp_reward} XP
            </p>
          )}
        </div>
      </div>

      {isUnlocked && (
        <div
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs"
          style={{ backgroundColor: GAMIFICATION_COLORS.success }}
        >
          <span className="text-white">✓</span>
        </div>
      )}
    </div>
  )
}
