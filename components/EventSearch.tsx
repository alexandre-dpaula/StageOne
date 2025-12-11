'use client'

import { useState, useEffect } from 'react'
import { Event } from '@/types/database.types'
import Link from 'next/link'
import Image from 'next/image'

interface EventSearchProps {
  allEvents: Event[]
}

export default function EventSearch({ allEvents }: EventSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Event[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (searchQuery.length >= 3) {
      setIsSearching(true)
      const query = searchQuery.toLowerCase()

      const results = allEvents.filter((event) => {
        return (
          event.title.toLowerCase().includes(query) ||
          event.subtitle?.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.category.toLowerCase().includes(query) ||
          event.location_name.toLowerCase().includes(query)
        )
      })

      setSearchResults(results)
    } else {
      setIsSearching(false)
      setSearchResults([])
    }
  }, [searchQuery, allEvents])

  return (
    <div className="w-full max-w-3xl mx-auto relative px-2 sm:px-0">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 sm:pl-6 flex items-center pointer-events-none">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-placeholder" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar eventos por nome, categoria, localização..."
          className="w-full glass text-foreground pl-12 sm:pl-16 pr-12 sm:pr-6 py-4 sm:py-5 rounded-2xl font-medium text-sm sm:text-base md:text-lg transition-all duration-300 focus:border-primary/50 focus:shadow-glow-md outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 sm:pr-6 flex items-center text-placeholder hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isSearching && (
        <div className="absolute top-full left-2 right-2 sm:left-0 sm:right-0 mt-4 glass rounded-2xl border border-border/30 shadow-glow-lg max-h-[400px] sm:max-h-[500px] overflow-y-auto z-50 animate-fade-in">
          {searchResults.length > 0 ? (
            <div className="p-3 sm:p-4">
              <p className="text-placeholder text-xs sm:text-sm mb-3 sm:mb-4 px-2">
                {searchResults.length} {searchResults.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
              </p>
              <div className="space-y-2 sm:space-y-3">
                {searchResults.map((event) => (
                  <Link
                    key={event.id}
                    href={`/evento/${event.slug}`}
                    className="block glass rounded-xl p-3 sm:p-4 hover:border-primary/50 transition-all duration-300 hover:shadow-glow-md group"
                    onClick={() => setSearchQuery('')}
                  >
                    <div className="flex gap-3 sm:gap-4">
                      {/* Event Image */}
                      <div className="flex-shrink-0">
                        {event.cover_image || event.banner_url ? (
                          <Image
                            src={event.cover_image || event.banner_url!}
                            alt={event.title}
                            width={120}
                            height={80}
                            className="w-20 h-14 sm:w-28 sm:h-20 object-cover rounded-lg"
                            unoptimized
                          />
                        ) : (
                          <div className="w-20 h-14 sm:w-28 sm:h-20 bg-gradient-to-br from-primary/20 to-accent-blue/20 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Event Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
                          <h3 className="text-foreground font-bold text-sm sm:text-base group-hover:text-primary transition-colors line-clamp-1">
                            {event.title}
                          </h3>
                          <span className="flex-shrink-0 text-[10px] sm:text-xs font-bold text-primary bg-primary/10 border border-primary/30 rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 whitespace-nowrap">
                            {event.category}
                          </span>
                        </div>
                        <p className="text-placeholder text-xs sm:text-sm line-clamp-1 mb-1 sm:mb-2">
                          {event.subtitle || event.description}
                        </p>
                        <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-placeholder flex-wrap">
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="hidden sm:inline">{new Date(event.start_datetime).toLocaleDateString('pt-BR')}</span>
                            <span className="sm:hidden">{new Date(event.start_datetime).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                          </span>
                          <span className="flex items-center gap-1 line-clamp-1">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{event.location_name}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 text-center">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-placeholder/30 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-placeholder text-base sm:text-lg font-medium mb-2">
                Nenhum evento encontrado
              </p>
              <p className="text-placeholder/60 text-xs sm:text-sm">
                Tente usar outros termos de busca
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
