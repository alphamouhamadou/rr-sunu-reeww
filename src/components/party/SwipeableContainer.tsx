'use client'

import { useRef, useState, useCallback, useEffect, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SwipeableContainerProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
  enableGestures?: boolean
  threshold?: number
}

export function SwipeableContainer({
  children,
  onSwipeLeft,
  onSwipeRight,
  className,
  enableGestures = true,
  threshold = 100
}: SwipeableContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isSwiping, setIsSwiping] = useState(false)
  const [swipeOffset, setSwipeOffset] = useState(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enableGestures) return
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setIsSwiping(true)
  }, [enableGestures])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enableGestures || touchStart === null) return
    
    const currentTouch = e.targetTouches[0].clientX
    setTouchEnd(currentTouch)
    
    // Calculate offset for visual feedback
    const offset = currentTouch - touchStart
    setSwipeOffset(offset * 0.1) // Reduce the visual movement
  }, [enableGestures, touchStart])

  const handleTouchEnd = useCallback(() => {
    if (!enableGestures || touchStart === null || touchEnd === null) {
      setIsSwiping(false)
      setSwipeOffset(0)
      return
    }

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > threshold
    const isRightSwipe = distance < -threshold

    // Haptic feedback
    if ((isLeftSwipe || isRightSwipe) && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15)
    }

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft()
    }
    
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight()
    }

    setTouchStart(null)
    setTouchEnd(null)
    setIsSwiping(false)
    setSwipeOffset(0)
  }, [enableGestures, touchStart, touchEnd, threshold, onSwipeLeft, onSwipeRight])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      setTouchStart(null)
      setTouchEnd(null)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "transition-transform duration-200 ease-out",
        isSwiping && "transition-none",
        className
      )}
      style={{
        transform: swipeOffset !== 0 ? `translateX(${swipeOffset}px)` : undefined
      }}
    >
      {children}
      
      {/* Swipe indicators */}
      {isSwiping && touchStart !== null && touchEnd !== null && (
        <>
          {touchStart - touchEnd > threshold / 2 && onSwipeLeft && (
            <div className="fixed right-4 top-1/2 -translate-y-1/2 bg-[#008751]/80 text-white p-3 rounded-full shadow-lg animate-pulse z-50">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          )}
          {touchEnd - touchStart > threshold / 2 && onSwipeRight && (
            <div className="fixed left-4 top-1/2 -translate-y-1/2 bg-[#008751]/80 text-white p-3 rounded-full shadow-lg animate-pulse z-50">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Swipeable Card Component for lists
interface SwipeableCardProps {
  children: ReactNode
  leftAction?: {
    icon: ReactNode
    label: string
    onClick: () => void
    bgColor?: string
  }
  rightAction?: {
    icon: ReactNode
    label: string
    onClick: () => void
    bgColor?: string
  }
  className?: string
}

export function SwipeableCard({
  children,
  leftAction,
  rightAction,
  className
}: SwipeableCardProps) {
  const [offset, setOffset] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [isRevealed, setIsRevealed] = useState<'left' | 'right' | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return
    
    const diff = e.targetTouches[0].clientX - touchStart
    setOffset(diff)
  }

  const handleTouchEnd = () => {
    if (Math.abs(offset) > 80) {
      if (offset > 0 && rightAction) {
        setIsRevealed('right')
        setOffset(80)
      } else if (offset < 0 && leftAction) {
        setIsRevealed('left')
        setOffset(-80)
      } else {
        setOffset(0)
        setIsRevealed(null)
      }
    } else {
      setOffset(0)
      setIsRevealed(null)
    }
    setTouchStart(null)
  }

  const handleActionClick = (action: () => void) => {
    action()
    setOffset(0)
    setIsRevealed(null)
  }

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      {/* Background actions */}
      <div className="absolute inset-0 flex">
        {rightAction && (
          <div 
            className={cn(
              "flex items-center justify-start pl-4 flex-1",
              rightAction.bgColor || "bg-[#008751]"
            )}
            onClick={() => isRevealed === 'right' && handleActionClick(rightAction.onClick)}
          >
            <div className="text-white">
              {rightAction.icon}
              <span className="ml-2 text-sm font-medium">{rightAction.label}</span>
            </div>
          </div>
        )}
        {leftAction && (
          <div 
            className={cn(
              "flex items-center justify-end pr-4 flex-1",
              leftAction.bgColor || "bg-[#CE1126]"
            )}
            onClick={() => isRevealed === 'left' && handleActionClick(leftAction.onClick)}
          >
            <div className="text-white">
              <span className="mr-2 text-sm font-medium">{leftAction.label}</span>
              {leftAction.icon}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative bg-white dark:bg-gray-800 transition-transform touch-pan-y"
        style={{ transform: `translateX(${offset}px)` }}
      >
        {children}
      </div>
    </div>
  )
}
