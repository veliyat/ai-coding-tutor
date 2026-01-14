import { useEffect, useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { getLevelInfo } from '../lib/xp-system'
import type { LevelUpData } from '../types'

interface LevelUpCelebrationProps {
  data: LevelUpData
  onDismiss: () => void
}

export function LevelUpCelebration({ data, onDismiss }: LevelUpCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const levelInfo = getLevelInfo(data.newLevel === 10 ? 15000 : data.newLevel * 1000)

  useEffect(() => {
    // Trigger animations
    const timer1 = setTimeout(() => setIsVisible(true), 100)
    const timer2 = setTimeout(() => setShowConfetti(true), 300)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
      onClick={onDismiss}
    >
      {/* Confetti particles - simple CSS version */}
      {showConfetti && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ['#F59E0B', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'][
                  i % 5
                ],
                width: '10px',
                height: '10px',
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
              }}
            />
          ))}
        </div>
      )}

      <div
        className={cn(
          'relative z-10 mx-4 max-w-sm rounded-2xl border bg-card p-8 text-center shadow-2xl transition-all duration-500',
          isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        )}
        onClick={(e) => e.stopPropagation()}
        style={{
          borderColor: `${levelInfo.color}40`,
          boxShadow: `0 0 60px ${levelInfo.color}30`,
        }}
      >
        {/* Stars decoration */}
        <div className="mb-4 flex justify-center gap-2 text-4xl">
          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>
            ⭐
          </span>
          <span className="animate-bounce" style={{ animationDelay: '100ms' }}>
            ⭐
          </span>
          <span className="animate-bounce" style={{ animationDelay: '200ms' }}>
            ⭐
          </span>
        </div>

        {/* Level up text */}
        <h2
          className="mb-2 text-3xl font-bold tracking-tight"
          style={{ color: levelInfo.color }}
        >
          LEVEL UP!
        </h2>

        {/* Level icon */}
        <div
          className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full text-6xl"
          style={{
            backgroundColor: `${levelInfo.color}20`,
            boxShadow: `0 0 30px ${levelInfo.color}40`,
          }}
        >
          {levelInfo.icon}
        </div>

        {/* Level info */}
        <p className="mb-1 text-lg text-muted-foreground">
          You're now Level {data.newLevel}
        </p>
        <p className="mb-6 text-2xl font-semibold" style={{ color: levelInfo.color }}>
          {data.newTitle}
        </p>

        {/* Dismiss button */}
        <Button onClick={onDismiss} size="lg" className="w-full">
          Awesome! Continue
        </Button>
      </div>

      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti-fall 3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
