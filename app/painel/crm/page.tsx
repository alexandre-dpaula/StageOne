'use client'

import { useEffect, useState, useMemo, useCallback, memo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
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
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  LayoutDashboard,
  ShoppingBag,
  PieChart as PieChartIcon,
  UserSquare2,
  Mail,
  Star,
  HelpCircle,
  Search,
  ChevronRight,
  ChevronLeft,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  UserPlus,
  Package,
  Archive,
  Target,
  Palette,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Bell,
  CreditCard,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'

// Lazy load dos gráficos para melhor performance
const PieChart = dynamic(() => import('recharts').then(mod => ({ default: mod.PieChart })), { ssr: false })
const Pie = dynamic(() => import('recharts').then(mod => ({ default: mod.Pie })), { ssr: false })
const Cell = dynamic(() => import('recharts').then(mod => ({ default: mod.Cell })), { ssr: false })
const LineChart = dynamic(() => import('recharts').then(mod => ({ default: mod.LineChart })), { ssr: false })
const Line = dynamic(() => import('recharts').then(mod => ({ default: mod.Line })), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.XAxis })), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.YAxis })), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(mod => ({ default: mod.Tooltip })), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })), { ssr: false })
const Legend = dynamic(() => import('recharts').then(mod => ({ default: mod.Legend })), { ssr: false })

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

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar_url?: string
  created_at: string
}

interface Notification {
  id: string
  type: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  message: string
  timestamp: string
  actionUrl?: string
  metadata?: any
}

// Cores para os gráficos (tema escuro com verde accent)
const COLORS = ['#A3E635', '#22C55E', '#84CC16', '#65A30D', '#4D7C0F']

export default function CRMDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [adminName, setAdminName] = useState('')
  const [error, setError] = useState('')
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeMenu, setActiveMenu] = useState('overview')
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [recipientSearch, setRecipientSearch] = useState('')

  // IMPORTANT: All hooks must be declared BEFORE any conditional returns
  // Memoiza formatação de moeda para melhor performance
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }, [])

  // Memoiza cálculos pesados para evitar recalcular em cada render
  const totalRevenue = useMemo(() => data?.metrics?.overview?.total_revenue || 0, [data])
  const revenueGrowth = useMemo(() => data?.growthRates?.revenue || 0, [data])
  const eventsGrowth = useMemo(() => data?.growthRates?.events || 0, [data])
  const currentMonthRevenue = useMemo(() => data?.growthRates?.currentMonth?.revenue || 0, [data])

  // Dados para o gráfico de pizza (eventos por categoria) - Memoizado
  const eventsByCategory = useMemo(() => {
    return data?.topEvents?.reduce((acc: any[], event: any) => {
      const existing = acc.find(item => item.name === event.category)
      if (existing) {
        existing.value += 1
        existing.revenue += event.revenue
      } else {
        acc.push({
          name: event.category || 'Sem categoria',
          value: 1,
          revenue: event.revenue
        })
      }
      return acc
    }, []) || []
  }, [data?.topEvents])

  // Calcular meta trimestral (3x receita mensal atual)
  const quarterlyGoal = useMemo(() => currentMonthRevenue * 3, [currentMonthRevenue])

  // Contatos dos gerentes (primeiros 5 usuários) - Memoizado
  const managers = useMemo(() => users.slice(0, 5), [users])

  // Função para formatar tempo relativo - Memoizada
  const getRelativeTime = useCallback((timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Agora mesmo'
    if (diffMins < 60) return `Há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`
    if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    if (diffDays === 1) return 'Ontem'
    if (diffDays < 7) return `Há ${diffDays} dias`
    return time.toLocaleDateString('pt-BR')
  }, [])

  useEffect(() => {
    fetchDashboardData()
    fetchUsers()
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true)
      const response = await fetch('/api/admin/notifications')
      if (response.ok) {
        const result = await response.json()
        setNotifications(result.notifications || [])
      }
    } catch (err) {
      console.error('Erro ao buscar notificações:', err)
    } finally {
      setLoadingNotifications(false)
    }
  }

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

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const result = await response.json()
        setUsers(result.users || [])
      }
    } catch (err) {
      console.error('Erro ao buscar usuários:', err)
    }
  }

  const openEmailModal = (user: User) => {
    setSelectedUser(user)
    setEmailSubject('')
    setEmailMessage('')
    setEmailModalOpen(true)
  }

  const closeEmailModal = () => {
    setEmailModalOpen(false)
    setSelectedUser(null)
    setEmailSubject('')
    setEmailMessage('')
  }

  const sendEmail = async () => {
    if (!selectedUser || !emailSubject || !emailMessage) {
      alert('Por favor, preencha todos os campos')
      return
    }

    try {
      setSendingEmail(true)
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedUser.email,
          toName: selectedUser.name,
          subject: emailSubject,
          message: emailMessage
        })
      })

      if (response.ok) {
        alert('Email enviado com sucesso!')
        closeEmailModal()
      } else {
        throw new Error('Erro ao enviar email')
      }
    } catch (err) {
      alert('Erro ao enviar email. Tente novamente.')
    } finally {
      setSendingEmail(false)
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

  // Função para obter ícone e cores baseado no tipo e prioridade da notificação
  const getNotificationStyle = (notification: Notification) => {
    const styles = {
      critical: {
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        iconColor: 'text-red-500',
        badge: 'bg-red-500'
      },
      high: {
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        iconColor: 'text-orange-500',
        badge: 'bg-orange-500'
      },
      medium: {
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        iconColor: 'text-yellow-500',
        badge: 'bg-yellow-500'
      },
      low: {
        bgColor: 'bg-lime-500/10',
        borderColor: 'border-lime-500/30',
        iconColor: 'text-lime-500',
        badge: 'bg-lime-500'
      }
    }

    const icons = {
      event_reminder: Clock,
      approval_needed: CheckCircle,
      withdrawal_ready: DollarSign,
      payment_pending: CreditCard,
      ticket_sale: ShoppingCart,
      user_signup: UserPlus,
      message: MessageSquare
    }

    const Icon = icons[notification.type as keyof typeof icons] || Bell

    return {
      ...styles[notification.priority],
      Icon
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full glass border-r border-border/30 z-50 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}>
        <div className="flex flex-col h-full p-4">
          {/* User Profile */}
          <div className="mb-6">
            <div className="flex items-center gap-3 p-3 rounded-xl glass border border-border/30">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/30">
                <span className="text-sm font-bold text-primary">
                  {adminName?.charAt(0).toUpperCase()}
                </span>
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{adminName}</p>
                  <p className="text-xs text-placeholder truncate">Administrador</p>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          {sidebarOpen && (
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-placeholder" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-3 py-2 glass rounded-lg border border-border/30 text-sm text-foreground placeholder:text-placeholder focus:border-primary focus:outline-none"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs text-placeholder glass rounded border border-border/30">
                  ⌘K
                </kbd>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-6 overflow-y-auto">
            {/* Dashboards Section */}
            <div>
              <p className="text-xs font-semibold text-placeholder uppercase tracking-wider mb-3 px-3">
                {sidebarOpen ? 'Dashboards' : '•'}
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveMenu('overview')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    activeMenu === 'overview'
                      ? 'bg-primary text-background font-semibold'
                      : 'text-placeholder hover:text-foreground hover:bg-card'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm">Overview</span>}
                </button>

                <Link
                  href="/painel/admin"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-placeholder hover:text-foreground hover:bg-card transition-all"
                >
                  <ShoppingBag className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm">eCommerce</span>}
                  {sidebarOpen && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>

                <button
                  onClick={() => setActiveMenu('analytics')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-placeholder hover:text-foreground hover:bg-card transition-all"
                >
                  <PieChartIcon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm">Analytics</span>}
                  {sidebarOpen && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>

                <button
                  onClick={() => setActiveMenu('customers')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-placeholder hover:text-foreground hover:bg-card transition-all"
                >
                  <UserSquare2 className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm">Customers</span>}
                  {sidebarOpen && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              </div>
            </div>

            {/* Settings Section */}
            <div>
              <p className="text-xs font-semibold text-placeholder uppercase tracking-wider mb-3 px-3">
                {sidebarOpen ? 'Settings' : '•'}
              </p>
              <div className="space-y-1">
                <Link
                  href="/painel/crm/messages"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-placeholder hover:text-foreground hover:bg-card transition-all"
                >
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm">Messages</span>}
                  {sidebarOpen && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>

                <button
                  onClick={() => setRightPanelOpen(!rightPanelOpen)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-placeholder hover:text-foreground hover:bg-card transition-all relative"
                >
                  <Bell className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm">Notificações</span>}
                  {notifications.length > 0 && (
                    <span className={`${sidebarOpen ? 'ml-auto' : 'absolute -top-1 -right-1'} w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white`}>
                      {notifications.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveMenu('reviews')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-placeholder hover:text-foreground hover:bg-card transition-all"
                >
                  <Star className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm">Customer Reviews</span>}
                  {sidebarOpen && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>

                <Link
                  href="/painel/admin"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-placeholder hover:text-foreground hover:bg-card transition-all"
                >
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm">Settings</span>}
                  {sidebarOpen && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>

                <button
                  onClick={() => setActiveMenu('help')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-placeholder hover:text-foreground hover:bg-card transition-all"
                >
                  <HelpCircle className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm">Help Centre</span>}
                  {sidebarOpen && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="pt-4 border-t border-border/30 space-y-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 px-3 py-2 group">
              <BarChart3 className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
              {sidebarOpen && (
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  <span className="font-normal">Stage</span><span className="font-bold">One</span><sup className="text-[0.5em] top-[-0.3em] relative ml-0.5">™</sup>
                </span>
              )}
            </Link>

            {/* Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg glass border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all group"
              title={sidebarOpen ? "Recolher Menu" : "Expandir Menu"}
            >
              {sidebarOpen ? (
                <>
                  <ChevronLeft className="w-4 h-4 text-placeholder group-hover:text-primary transition-colors" />
                  <span className="text-xs text-placeholder group-hover:text-primary transition-colors">Recolher</span>
                </>
              ) : (
                <ChevronRight className="w-4 h-4 text-placeholder group-hover:text-primary transition-colors" />
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Bar */}
        <div className="glass border-b border-border/30 sticky top-0 z-40 backdrop-blur-xl">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-placeholder">Bem-vindo de volta, {adminName}!</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-10 h-10 glass rounded-full flex items-center justify-center border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                title={sidebarOpen ? "Recolher Menu" : "Expandir Menu"}
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="w-5 h-5 text-placeholder group-hover:text-primary transition-colors" />
                ) : (
                  <PanelLeftOpen className="w-5 h-5 text-placeholder group-hover:text-primary transition-colors" />
                )}
              </button>

              <button
                onClick={() => setRightPanelOpen(!rightPanelOpen)}
                className="w-10 h-10 glass rounded-full flex items-center justify-center border border-border/30 hover:border-primary/50 transition-colors relative"
                title="Notificações"
              >
                <Activity className="w-5 h-5 text-placeholder" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                  {notifications.length}
                </span>
              </button>

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

      {/* Dashboard Content */}
      <div className={`max-w-[1600px] mx-auto px-6 py-8 transition-all duration-300 ${rightPanelOpen ? 'mr-80' : 'mr-0'}`}>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Net Revenue */}
          <div className="glass rounded-2xl p-6 border border-border/30 bg-gradient-to-br from-primary/5 to-transparent hover:scale-105 transition-transform">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              {revenueGrowth !== 0 && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                  revenueGrowth > 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}>
                  {revenueGrowth > 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-xs font-bold ${
                    revenueGrowth > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {Math.abs(revenueGrowth).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-placeholder mb-1">Receita Total</p>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
          </div>

          {/* ARR (Annual Recurring Revenue) */}
          <div className="glass rounded-2xl p-6 border border-border/30 bg-gradient-to-br from-blue-500/5 to-transparent hover:scale-105 transition-transform">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <p className="text-sm text-placeholder mb-1">ARR (Projeção Anual)</p>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(totalRevenue * 12)}</p>
          </div>

          {/* Quarterly Goal */}
          <div className="glass rounded-2xl p-6 border border-border/30 bg-gradient-to-br from-green-500/5 to-transparent hover:scale-105 transition-transform">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <p className="text-sm text-placeholder mb-1">Meta Trimestral</p>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(quarterlyGoal)}</p>
          </div>

          {/* New Orders */}
          <div className="glass rounded-2xl p-6 border border-border/30 bg-gradient-to-br from-purple-500/5 to-transparent hover:scale-105 transition-transform">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-purple-500" />
              </div>
              {eventsGrowth !== 0 && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                  eventsGrowth > 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}>
                  {eventsGrowth > 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-xs font-bold ${
                    eventsGrowth > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {Math.abs(eventsGrowth).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-placeholder mb-1">Novos Pedidos</p>
            <p className="text-3xl font-bold text-foreground">{data?.stats.totalBookings || 0}</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart - Sales Overview */}
          <div className="glass rounded-2xl p-6 border border-border/30">
            <h3 className="text-lg font-semibold text-foreground mb-6">Visão Geral de Vendas</h3>
            <div className="h-[300px] flex items-center justify-center">
              {eventsByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventsByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {eventsByCategory.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                      formatter={(value: any, name: any, props: any) => [
                        `${value} eventos - ${formatCurrency(props.payload.revenue)}`,
                        name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-placeholder">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhum dado de vendas disponível</p>
                </div>
              )}
            </div>
            {/* Legend */}
            {eventsByCategory.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-3">
                {eventsByCategory.map((entry: any, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-placeholder truncate">{entry.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Line Chart - Revenue Over Time */}
          <div className="glass rounded-2xl p-6 border border-border/30">
            <h3 className="text-lg font-semibold text-foreground mb-6">Receita ao Longo do Tempo</h3>
            <div className="h-[300px]">
              {data?.monthlyRevenue && data.monthlyRevenue.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="month"
                      stroke="#71717a"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      stroke="#71717a"
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                      formatter={(value: any) => [formatCurrency(value), 'Receita']}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#A3E635"
                      strokeWidth={3}
                      dot={{ fill: '#A3E635', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-placeholder">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Nenhum dado de receita disponível</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Events Table */}
          <div className="lg:col-span-2 glass rounded-2xl p-6 border border-border/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Top Eventos por Receita</h3>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-placeholder uppercase tracking-wider">#</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-placeholder uppercase tracking-wider">Evento</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-placeholder uppercase tracking-wider">Categoria</th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-placeholder uppercase tracking-wider">Vendas</th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-placeholder uppercase tracking-wider">Receita</th>
                    <th className="text-center py-3 px-2 text-xs font-semibold text-placeholder uppercase tracking-wider">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.topEvents && data.topEvents.length > 0 ? (
                    data.topEvents.slice(0, 10).map((event, index) => (
                      <tr key={event.id} className="border-b border-border/10 hover:bg-card/50 transition-colors">
                        <td className="py-4 px-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">#{index + 1}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <p className="text-sm font-semibold text-foreground">{event.title}</p>
                        </td>
                        <td className="py-4 px-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                            {event.category}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <p className="text-sm text-placeholder">{event.bookings} vendas</p>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <p className="text-sm font-bold text-primary">{formatCurrency(event.revenue)}</p>
                        </td>
                        <td className="py-4 px-2 text-center">
                          <Link
                            href={`/eventos/${event.slug}`}
                            className="inline-flex items-center justify-center w-8 h-8 hover:bg-primary/10 rounded-lg transition-colors"
                            title="Ver evento"
                          >
                            <Eye className="w-4 h-4 text-placeholder hover:text-primary" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-placeholder">
                        Nenhum evento com vendas ainda
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Total Users */}
              <div className="glass rounded-xl p-4 border border-border/30">
                <div className="flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mb-2">
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-xs text-placeholder mb-1">Usuários</p>
                  <p className="text-xl font-bold text-foreground">{data?.stats.totalUsers || 0}</p>
                </div>
              </div>

              {/* Total Events */}
              <div className="glass rounded-xl p-4 border border-border/30">
                <div className="flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center mb-2">
                    <Calendar className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-xs text-placeholder mb-1">Eventos</p>
                  <p className="text-xl font-bold text-foreground">{data?.stats.totalEvents || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Notifications & Activities */}
      <aside className={`fixed right-0 top-0 h-full glass border-l border-border/30 z-40 transition-all duration-300 overflow-y-auto ${
        rightPanelOpen ? 'w-80' : 'w-0'
      }`}>
        <div className="p-6 space-y-6">
          {/* Notifications Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Notificações</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-placeholder">{notifications.length}</span>
                <Bell className="w-5 h-5 text-primary" />
              </div>
            </div>

            {loadingNotifications ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-placeholder">Carregando...</p>
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notif) => {
                  const style = getNotificationStyle(notif)
                  const IconComponent = style.Icon

                  return (
                    <Link
                      key={notif.id}
                      href={notif.actionUrl || '#'}
                      className={`flex items-start gap-3 p-3 rounded-lg glass border ${style.borderColor} ${style.bgColor} hover:bg-card/50 transition-all cursor-pointer group`}
                    >
                      {/* Badge de Prioridade */}
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full ${style.bgColor} flex items-center justify-center flex-shrink-0 border ${style.borderColor}`}>
                          <IconComponent className={`w-5 h-5 ${style.iconColor}`} />
                        </div>
                        {notif.priority === 'critical' && (
                          <div className={`absolute -top-1 -right-1 w-3 h-3 ${style.badge} rounded-full animate-pulse`}></div>
                        )}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                            {notif.title}
                          </p>
                          {notif.priority === 'critical' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 font-bold uppercase">
                              Urgente
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground mb-1 line-clamp-2">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-placeholder" />
                          <p className="text-xs text-placeholder">
                            {getRelativeTime(notif.timestamp)}
                          </p>
                        </div>
                      </div>

                      {/* Seta de ação */}
                      <ChevronRight className="w-4 h-4 text-placeholder opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-placeholder">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Nenhuma notificação</p>
              </div>
            )}
          </div>

          {/* Palestrantes & Usuários */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Palestrantes & Usuários</h3>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {users.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => openEmailModal(user)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-card/50 transition-colors cursor-pointer glass border border-border/30"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/30">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-primary">
                          {user.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-placeholder truncate">
                        {user.email}
                      </p>
                    </div>

                    {/* Role Badge */}
                    <div className="flex-shrink-0">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${
                        user.role === 'ADMIN'
                          ? 'bg-red-500/10 text-red-500'
                          : user.role === 'PALESTRANTE'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {user.role}
                      </span>
                    </div>

                    {/* Online Status */}
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-placeholder">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Nenhum usuário encontrado</p>
                </div>
              )}
            </div>
          </div>

          {/* Contacts Section */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Contatos dos Gerentes</h3>
            <div className="space-y-2">
              {managers.map((manager, index) => (
                <div
                  key={manager.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                    index === 2 ? 'bg-primary/20 border border-primary/30' : 'hover:bg-card/50'
                  }`}
                  onClick={() => openEmailModal(manager)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/30">
                      {manager.avatar_url ? (
                        <img
                          src={manager.avatar_url}
                          alt={manager.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-primary">
                          {manager.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{manager.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {index === 2 && (
                      <>
                        <button className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors">
                          <Mail className="w-4 h-4 text-primary" />
                        </button>
                        <button className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center hover:bg-green-500/30 transition-colors">
                          <Phone className="w-4 h-4 text-green-500" />
                        </button>
                      </>
                    )}
                    <button className="text-placeholder hover:text-foreground">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Email Modal */}
      {emailModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass rounded-2xl border border-border/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 glass border-b border-border/30 p-6 backdrop-blur-xl z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  {/* User Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/30">
                    {selectedUser.avatar_url ? (
                      <img
                        src={selectedUser.avatar_url}
                        alt={selectedUser.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-primary">
                        {selectedUser.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Enviar Email</h3>
                    <p className="text-sm text-placeholder">Para: {selectedUser.name}</p>
                  </div>
                </div>
                <button
                  onClick={closeEmailModal}
                  className="w-10 h-10 rounded-full hover:bg-red-500/10 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-placeholder hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Recipient Selector with Dropdown */}
              <div className="relative">
                <p className="text-xs text-placeholder mb-2">Destinatário</p>
                <div className="relative">
                  <input
                    type="text"
                    value={recipientSearch || selectedUser.email}
                    onChange={(e) => {
                      setRecipientSearch(e.target.value)
                      setShowUserDropdown(true)
                    }}
                    onFocus={() => setShowUserDropdown(true)}
                    placeholder="Digite ou selecione um destinatário"
                    className="w-full px-4 py-3 pr-24 glass rounded-xl border border-border/30 text-foreground placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${
                      selectedUser.role === 'ADMIN'
                        ? 'bg-red-500/10 text-red-500'
                        : selectedUser.role === 'PALESTRANTE'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {selectedUser.role}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="text-placeholder hover:text-primary transition-colors"
                    >
                      <ChevronRight className={`w-5 h-5 transition-transform ${showUserDropdown ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Dropdown de Usuários */}
                {showUserDropdown && (
                  <>
                    {/* Overlay para fechar o dropdown */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserDropdown(false)}
                    />

                    <div className="absolute top-full left-0 right-0 mt-2 z-20 glass rounded-xl border border-border/30 max-h-64 overflow-y-auto shadow-2xl">
                      <div className="p-2">
                        {users
                          .filter(user => {
                            const searchTerm = recipientSearch || selectedUser.email
                            return user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   user.name.toLowerCase().includes(searchTerm.toLowerCase())
                          })
                          .map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => {
                                setSelectedUser(user)
                                setRecipientSearch('')
                                setShowUserDropdown(false)
                              }}
                              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-all text-left group"
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/30 group-hover:from-primary/40 group-hover:to-primary/20 transition-colors">
                                {user.avatar_url ? (
                                  <img
                                    src={user.avatar_url}
                                    alt={user.name}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-bold text-primary">
                                    {user.name?.charAt(0).toUpperCase() || '?'}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">
                                  {user.name}
                                </p>
                                <p className="text-xs text-placeholder truncate">
                                  {user.email}
                                </p>
                              </div>
                              <span className={`text-[10px] px-2 py-1 rounded-full font-semibold flex-shrink-0 ${
                                user.role === 'ADMIN'
                                  ? 'bg-red-500/10 text-red-500'
                                  : user.role === 'PALESTRANTE'
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-blue-500/10 text-blue-500'
                              }`}>
                                {user.role}
                              </span>
                            </button>
                          ))
                        }
                        {users.filter(user => {
                          const searchTerm = recipientSearch || selectedUser.email
                          return user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 user.name.toLowerCase().includes(searchTerm.toLowerCase())
                        }).length === 0 && (
                          <div className="p-4 text-center text-placeholder text-sm">
                            Nenhum usuário encontrado
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Subject Input */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Assunto do Email
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Ex: Novidades sobre seu evento"
                  className="w-full px-4 py-3 glass rounded-xl border border-border/30 text-foreground placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Mensagem
                </label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Digite sua mensagem aqui..."
                  rows={10}
                  className="w-full px-4 py-3 glass rounded-xl border border-border/30 text-foreground placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
                <p className="text-xs text-placeholder mt-2">
                  A mensagem será enviada com o template visual da StageOne™
                </p>
              </div>

              {/* Email Preview */}
              <div className="glass rounded-xl border border-border/30 p-4">
                <p className="text-xs font-semibold text-placeholder uppercase tracking-wider mb-3">
                  Prévia do Email
                </p>
                <div className="bg-white rounded-lg p-6 space-y-4">
                  {/* Preview Header */}
                  <div className="border-b border-gray-200 pb-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                      <span className="font-normal">Stage</span><span className="font-bold">One</span><sup className="text-xs">™</sup>
                    </h1>
                  </div>

                  {/* Preview Subject */}
                  {emailSubject && (
                    <h2 className="text-xl font-bold text-gray-900">{emailSubject}</h2>
                  )}

                  {/* Preview Message */}
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {emailMessage || 'Sua mensagem aparecerá aqui...'}
                  </div>

                  {/* Preview Footer */}
                  <div className="border-t border-gray-200 pt-4 text-sm text-gray-500">
                    <p>Atenciosamente,</p>
                    <p className="font-semibold text-gray-900">Equipe StageOne™</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 glass border-t border-border/30 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <button
                  onClick={closeEmailModal}
                  disabled={sendingEmail}
                  className="flex-1 px-6 py-3 rounded-full border border-border/30 text-foreground font-semibold hover:bg-card transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={sendEmail}
                  disabled={sendingEmail || !emailSubject || !emailMessage}
                  className="flex-1 px-6 py-3 rounded-full bg-primary text-background font-bold hover:shadow-glow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingEmail ? 'Enviando...' : 'Enviar Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}
