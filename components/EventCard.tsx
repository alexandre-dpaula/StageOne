import Link from 'next/link'
import Image from 'next/image'
import { Event, TicketType } from '@/types/database.types'
import { formatDateShort, formatCurrency } from '@/lib/utils'

interface EventCardProps {
  event: Event & { ticket_types?: TicketType[] }
  badge?: string
}

export default function EventCard({ event, badge }: EventCardProps) {
  // Calcula o menor preço dos ingressos ativos
  const lowestPrice = event.ticket_types?.filter(t => t.is_active)
    .reduce((min, ticket) => ticket.price < min ? ticket.price : min, Infinity)

  const displayPrice: number = lowestPrice === Infinity ? 99 : lowestPrice ?? 99

  return (
    <Link href={`/evento/${event.slug}`} className="group block h-full">
      <div className="relative overflow-hidden rounded-2xl glass border border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-glow-sm h-full flex flex-col">
        <div className="relative overflow-hidden aspect-[4/3] flex-shrink-0">
          {event.cover_image || event.banner_url ? (
            <Image
              src={event.cover_image || event.banner_url!}
              alt={event.title}
              width={0}
              height={0}
              sizes="(max-width: 768px) 100vw, 420px"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/20 to-accent-blue/20">
              <svg className="w-16 h-16 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
          )}

          {badge && (
            <div className="absolute top-3 right-3 btn-primary px-3 py-1 text-xs shadow-glow-sm">
              {badge}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-foreground text-sm line-clamp-2">{event.description}</p>
            </div>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1 bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold text-primary uppercase">{event.category}</span>
            </div>
            <span className="text-xs text-placeholder">{formatDateShort(event.start_datetime)}</span>
          </div>

          <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {event.title}
          </h3>

          <div className="flex-grow">
            {event.subtitle && (
              <p className="text-sm text-placeholder line-clamp-2">{event.subtitle}</p>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
            <span className="text-xs text-placeholder">Sessão 01</span>
            <span className="text-primary font-bold">{formatCurrency(displayPrice)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
