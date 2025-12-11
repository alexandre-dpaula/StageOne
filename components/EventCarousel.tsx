'use client'

import { useState, useRef } from 'react'
import { Event } from '@/types/database.types'
import EventCard from './EventCard'

interface EventCarouselProps {
  title: string
  events: Event[]
}

export default function EventCarousel({ title, events }: EventCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -800 : 800
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })

      setTimeout(() => {
        checkScroll()
      }, 300)
    }
  }

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  if (events.length === 0) return null

  return (
    <div className="mb-8 sm:mb-10 md:mb-12 group/carousel">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4 px-4 sm:px-6 md:px-12">
        {title}
      </h2>

      <div className="relative px-4 sm:px-6 md:px-12">
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground p-2 sm:p-3 rounded-r-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {events.map((event) => (
            <div key={event.id} className="flex-none w-[260px] sm:w-[280px] md:w-[320px] lg:w-[340px] snap-start">
              <EventCard event={event} />
            </div>
          ))}
        </div>

        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground p-2 sm:p-3 rounded-l-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
