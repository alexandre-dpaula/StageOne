'use client'

import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  color?: 'primary' | 'blue' | 'green' | 'orange' | 'purple'
}

export default function StatsCard({
  title,
  value,
  change,
  changeLabel = 'vs mês anterior',
  icon: Icon,
  trend,
  color = 'primary'
}: StatsCardProps) {
  const colorClasses = {
    primary: 'text-primary bg-primary/10 border-primary/30',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
    green: 'text-green-500 bg-green-500/10 border-green-500/30',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/30',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/30'
  }

  const getTrendColor = () => {
    if (!trend) return ''
    if (trend === 'up') return 'text-green-500'
    if (trend === 'down') return 'text-red-500'
    return 'text-placeholder'
  }

  const getTrendIcon = () => {
    if (!trend || !change) return null
    if (trend === 'up') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    }
    if (trend === 'down') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      )
    }
    return null
  }

  return (
    <div className="glass rounded-2xl p-6 border border-border/30 hover:border-primary/30 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-placeholder text-sm font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {value}
          </p>

          {typeof change !== 'undefined' && (
            <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="font-semibold">
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
              <span className="text-placeholder text-xs ml-1">{changeLabel}</span>
            </div>
          )}
        </div>

        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${colorClasses[color]} group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
