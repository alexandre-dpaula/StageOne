'use client'

import { useMemo } from 'react'

interface MonthlyData {
  month: string
  grossRevenue: number
  netRevenue: number
  serviceCosts: number
  stripeFees: number
  bookings: number
}

interface RevenueChartProps {
  data: MonthlyData[]
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { maxValue: 0, months: [] }

    const maxValue = Math.max(...data.map(d => d.grossRevenue))
    const months = data.map(d => ({
      ...d,
      monthLabel: new Date(d.month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    }))

    return { maxValue, months }
  }, [data])

  if (!data || data.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 border border-border/30">
        <h3 className="text-lg font-semibold text-foreground mb-4">Receita Mensal</h3>
        <div className="flex items-center justify-center h-64 text-placeholder">
          Sem dados disponíveis
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-6 border border-border/30">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Receita Mensal</h3>
          <p className="text-sm text-placeholder mt-1">Últimos 6 meses</p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-placeholder">Receita Bruta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-placeholder">Receita Líquida</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-placeholder pr-4 border-r border-border/30">
          <span>R$ {(chartData.maxValue).toLocaleString('pt-BR')}</span>
          <span>R$ {(chartData.maxValue * 0.75).toLocaleString('pt-BR')}</span>
          <span>R$ {(chartData.maxValue * 0.5).toLocaleString('pt-BR')}</span>
          <span>R$ {(chartData.maxValue * 0.25).toLocaleString('pt-BR')}</span>
          <span>R$ 0</span>
        </div>

        {/* Chart bars */}
        <div className="ml-16 h-full flex items-end justify-between gap-2">
          {chartData.months.map((month, index) => {
            const grossHeight = chartData.maxValue > 0
              ? (month.grossRevenue / chartData.maxValue) * 100
              : 0
            const netHeight = chartData.maxValue > 0
              ? (month.netRevenue / chartData.maxValue) * 100
              : 0

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full flex gap-1 h-full items-end">
                  {/* Gross Revenue Bar */}
                  <div
                    className="flex-1 bg-gradient-to-t from-primary to-primary/60 rounded-t-lg hover:from-primary/90 hover:to-primary/50 transition-all cursor-pointer relative group/bar"
                    style={{ height: `${grossHeight}%` }}
                  >
                    <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg px-2 py-1 text-xs whitespace-nowrap shadow-lg z-10 transition-opacity">
                      <div className="font-semibold text-primary">
                        R$ {month.grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-placeholder text-[10px]">Receita Bruta</div>
                    </div>
                  </div>

                  {/* Net Revenue Bar */}
                  <div
                    className="flex-1 bg-gradient-to-t from-blue-500 to-blue-500/60 rounded-t-lg hover:from-blue-500/90 hover:to-blue-500/50 transition-all cursor-pointer relative group/bar"
                    style={{ height: `${netHeight}%` }}
                  >
                    <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg px-2 py-1 text-xs whitespace-nowrap shadow-lg z-10 transition-opacity">
                      <div className="font-semibold text-blue-500">
                        R$ {month.netRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-placeholder text-[10px]">Receita Líquida</div>
                    </div>
                  </div>
                </div>

                {/* X-axis label */}
                <span className="text-[10px] text-placeholder font-medium uppercase">
                  {month.monthLabel}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/30">
        <div>
          <p className="text-xs text-placeholder mb-1">Total Bruto</p>
          <p className="text-lg font-bold text-foreground">
            R$ {data.reduce((sum, d) => sum + d.grossRevenue, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-xs text-placeholder mb-1">Total Líquido</p>
          <p className="text-lg font-bold text-blue-500">
            R$ {data.reduce((sum, d) => sum + d.netRevenue, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-xs text-placeholder mb-1">Custos de Serviço</p>
          <p className="text-lg font-bold text-orange-500">
            R$ {data.reduce((sum, d) => sum + d.serviceCosts, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-xs text-placeholder mb-1">Taxas Stripe</p>
          <p className="text-lg font-bold text-red-500">
            R$ {data.reduce((sum, d) => sum + d.stripeFees, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  )
}
