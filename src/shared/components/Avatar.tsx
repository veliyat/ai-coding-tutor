import { cn } from '@/shared/lib/utils'

interface AvatarProps {
  emoji?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-lg',
  md: 'h-10 w-10 text-xl',
  lg: 'h-16 w-16 text-3xl',
}

export function Avatar({ emoji = '😊', size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'rounded-full bg-muted flex items-center justify-center',
        sizeClasses[size],
        className
      )}
    >
      {emoji || '😊'}
    </div>
  )
}
