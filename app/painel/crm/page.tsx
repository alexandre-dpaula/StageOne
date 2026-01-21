'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Eye,
  FileText,
  Settings,
  LogOut,
  BarChart3,
  Activity
} from 'lucide-react'
import StatsCard from '@/components/admin/StatsCard'
import RevenueChart from '@/components/admin/RevenueChart'
import Link from 'next/link'

interface DashboardData {
  metrics: any
  stats: {
    totalEvents: number
    totalBookings: number
    totalUsers: number
    recentEvents: number
  }
  monthlyRevenue: any[]
  topEvents: any[]
  recentEvents: any[]
  growthRates: {
    revenue: number
    events: number
    currentMonth: {
      revenue: number
      events: number
    }
    lastMonth: {
      revenue: number
      events: number
    }
  }
}

export default function CRMDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [adminName, setAdminName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/dashboard')

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push('/login?redirect=/painel/crm')
          return
        }
        throw new Error('Erro ao carregar dados do dashboard')
      }

      const result = await response.json()
      setData(result.data)
      setAdminName(result.admin?.name || 'Administrador')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-placeholder animate-pulse">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 border border-red-500/30 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Erro ao Carregar</h2>
            <p className="text-placeholder mb-6">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="btn-primary px-6 py-3"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const totalRevenue = data?.metrics?.overview?.total_revenue || 0
  const revenueGrowth = data?.growthRates?.revenue || 0
  const eventsGrowth = data?.growthRates?.events || 0

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="glass border-b border-border/30 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  <span className="font-normal">Stage</span><span className="font-bold">One</span> CRM
                </h1>
                <p className="text-[10px] text-placeholder uppercase tracking-wider">Admin Dashboard</p>
              </div>
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">{adminName}</p>
                <p className="text-xs text-placeholder">Administrador</p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/painel/admin"
                  className="w-10 h-10 glass rounded-full flex items-center justify-center border border-border/30 hover:border-primary/50 transition-colors"
                  title="Painel Admin"
                >
                  <Settings className="w-5 h-5 text-placeholder hover:text-primary transition-colors" />
                </Link>

                <Link
                  href="/"
                  className="w-10 h-10 glass rounded-full flex items-center justify-center border border-border/30 hover:border-red-500/50 transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5 text-placeholder hover:text-red-500 transition-colors" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-placeholder">
            Bem-vindo de volta, {adminName}! Aqui está um resumo da plataforma.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Receita Total"
            value={formatCurrency(totalRevenue)}
            change={revenueGrowth}
            icon={DollarSign}
            trend={revenueGrowth > 0 ? 'up' : revenueGrowth < 0 ? 'down' : 'neutral'}
            color="primary"
          />

          <StatsCard
            title="Total de Eventos"
            value={data?.stats.totalEvents || 0}
            change={eventsGrowth}
            icon={Calendar}
            trend={eventsGrowth > 0 ? 'up' : eventsGrowth < 0 ? 'down' : 'neutral'}
            color="blue"
          />

          <StatsCard
            title="Total de Reservas"
            value={data?.stats.totalBookings || 0}
            icon={FileText}
            color="green"
          />

          <StatsCard
            title="Usuários Únicos"
            value={data?.stats.totalUsers || 0}
            icon={Users}
            color="purple"
          />
        </div>

        {/* Revenue Chart */}
        <div className="mb-8">
          <RevenueChart data={data?.monthlyRevenue || []} />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Events */}
          <div className="glass rounded-2xl p-6 border border-border/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Top 5 Eventos por Receita</h3>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>

            <div className="space-y-3">
              {data?.topEvents && data.topEvents.length > 0 ? (
                data.topEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-card transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{event.title}</p>
                        <p className="text-xs text-placeholder">{event.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">
                        {formatCurrency(event.revenue)}
                      </p>
                      <p className="text-xs text-placeholder">{event.bookings} reservas</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-placeholder">
                  Nenhum evento com vendas ainda
                </div>
              )}
            </div>
          </div>

          {/* Recent Events */}
          <div className="glass rounded-2xl p-6 border border-border/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Eventos Recentes</h3>
              <Activity className="w-5 h-5 text-blue-500" />
            </div>

            <div className="space-y-3">
              {data?.recentEvents && data.recentEvents.length > 0 ? (
                data.recentEvents.map((event: any) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-card transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{event.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          event.is_published
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-orange-500/10 text-orange-500'
                        }`}>
                          {event.is_published ? 'Publicado' : 'Rascunho'}
                        </span>
                        <span className="text-xs text-placeholder">{event.category}</span>
                      </div>
                    </div>
                    <Link
                      href={`/eventos/${event.slug}`}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                      title="Ver evento"
                    >
                      <Eye className="w-4 h-4 text-placeholder hover:text-primary" />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-placeholder">
                  Nenhum evento recente
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass rounded-2xl p-6 border border-border/30">
          <h3 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/painel/admin"
              className="glass border border-border/30 hover:border-primary/50 rounded-xl p-4 text-center transition-all hover:scale-105"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">Gerenciar Eventos</p>
            </Link>

            <Link
              href="/painel/admin/cupons"
              className="glass border border-border/30 hover:border-blue-500/50 rounded-xl p-4 text-center transition-all hover:scale-105"
            >
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-sm font-semibold text-foreground">Cupons</p>
            </Link>

            <Link
              href="/painel/admin/reservas"
              className="glass border border-border/30 hover:border-green-500/50 rounded-xl p-4 text-center transition-all hover:scale-105"
            >
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm font-semibold text-foreground">Reservas</p>
            </Link>

            <button
              onClick={fetchDashboardData}
              className="glass border border-border/30 hover:border-purple-500/50 rounded-xl p-4 text-center transition-all hover:scale-105"
            >
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Activity className="w-6 h-6 text-purple-500" />
              </div>
              <p className="text-sm font-semibold text-foreground">Atualizar</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
