import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date): string {
  const d = new Date(date)
  const day = d.getDate().toString().padStart(2, '0')
  const month = d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '')
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(date))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

export function generateQRToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

export function getEventStatus(startDate: string, endDate: string): 'upcoming' | 'ongoing' | 'past' {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (now < start) return 'upcoming'
  if (now > end) return 'past'
  return 'ongoing'
}

export function isEventFull(capacity: number, soldQuantity: number): boolean {
  return soldQuantity >= capacity
}

export function getAvailableSpots(totalQuantity: number, soldQuantity: number): number {
  return Math.max(0, totalQuantity - soldQuantity)
}
