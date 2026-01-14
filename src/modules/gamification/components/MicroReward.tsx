import { useEffect, useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { GAMIFICATION_COLORS } from '../lib/xp-system'
import type { MicroReward as MicroRewardType } from '../types'

interface MicroRewardProps {
  reward: MicroRewardType
  onDismiss: (id: string) => void
  index?: number
}

export function MicroReward({ reward, onDismiss, index = 0 }: MicroRewardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setIsVisible(true), 50)

    // Start exit animation before auto-dismiss
    const exitTimer = setTimeout(() => {
      setIsLeaving(true)
    }, 2500)

    // Actually dismiss after exit animation
    const dismissTimer = setTimeout(() => {
      onDismiss(reward.id)
    }, 3000)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(exitTimer)
      clearTimeout(dismissTimer)
    }
  }, [reward.id, onDismiss])

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-center gap-2 rounded-lg border bg-card px-4 py-2 shadow-lg transition-all duration-300',
        isVisible && !isLeaving
          ? 'translate-y-0 opacity-100'
          : 'translate-y-2 opacity-0'
      )}
      style={{
        transform: `translateY(${index * -8}px)`,
        borderColor: `${GAMIFICATION_COLORS.xp}40`,
      }}
    >
      {reward.icon && (
        <span className="text-lg" role="img" aria-hidden="true">
          {reward.icon}
        </span>
      )}
      <span
        className="font-bold"
        style={{ color: GAMIFICATION_COLORS.xp }}
      >
        +{reward.xp} XP
      </span>
      <span className="text-sm text-muted-foreground">{reward.message}</span>
    </div>
  )
}

interface MicroRewardStackProps {
  rewards: MicroRewardType[]
  onDismiss: (id: string) => void
}

export function MicroRewardStack({ rewards, onDismiss }: MicroRewardStackProps) {
  if (rewards.length === 0) return null

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2">
      {rewards.slice(0, 3).map((reward, index) => (
        <MicroReward
          key={reward.id}
          reward={reward}
          onDismiss={onDismiss}
          index={index}
        />
      ))}
    </div>
  )
}
