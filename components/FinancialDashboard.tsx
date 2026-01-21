'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface FinancialDashboardProps {
  event: any
  financials: any
  withdrawals: any[]
  user: any
}

export default function FinancialDashboard({
  event,
  financials,
  withdrawals,
  user,
}: FinancialDashboardProps) {
  const router = useRouter()
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  // Check if Stripe Connect is setup
  const isStripeConnected =
    user.stripe_account_id &&
    user.stripe_account_status === 'ACTIVE' &&
    user.stripe_payouts_enabled

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Informe um valor válido')
      return
    }

    const amount = parseFloat(withdrawAmount)
    const available = Number(financials?.available_balance || 0)

    if (amount > available) {
      alert('Valor maior que o saldo disponível')
      return
    }

    if (!confirm(`Confirma o saque de R$ ${amount.toFixed(2)}?`)) {
      return
    }

    setWithdrawing(true)
    try {
      const response = await fetch('/api/withdrawals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          amount,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao solicitar saque')
      }

      alert('Saque solicitado com sucesso! O valor será transferido em breve.')
      setShowWithdrawModal(false)
      setWithdrawAmount('')
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Erro ao solicitar saque')
    } finally {
      setWithdrawing(false)
    }
  }

  const handleStripeOnboard = async () => {
    try {
      const response = await fetch('/api/stripe/connect/onboard', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao iniciar configuração')
      }

      window.location.href = data.url
    } catch (error: any) {
      alert(error.message || 'Erro ao configurar Stripe Connect')
    }
  }

  const totalRevenue = Number(financials?.total_ticket_sales || 0)
  const ticketsSold = Number(financials?.tickets_sold_count || 0)
  const totalCosts = Number(financials?.total_costs || 0)
  const netAmount = Number(financials?.net_amount || 0)
  const availableBalance = Number(financials?.available_balance || 0)
  const withdrawnAmount = Number(financials?.withdrawn_amount || 0)
  const canWithdraw = financials?.can_withdraw || false

  return (
    <div className="space-y-6">
      {/* Stripe Connect Warning */}
      {!isStripeConnected && (
        <div className="glass rounded-2xl p-6 border-2 border-orange-500/30 bg-orange-500/5">
          <div className="flex items-start gap-4">
            <svg className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-foreground font-bold mb-2">Configure sua conta de recebimento</h3>
              <p className="text-placeholder text-sm mb-4">
                Para receber os valores das vendas, você precisa conectar sua conta Stripe. É rápido e seguro!
              </p>
              <button
                onClick={handleStripeOnboard}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-background rounded-lg font-bold transition-all"
              >
                Configurar Stripe Connect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="glass rounded-2xl p-6 border border-border/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-placeholder text-sm">Vendas Brutas</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
          </p>
          <p className="text-xs text-placeholder mt-1">{ticketsSold} ingressos vendidos</p>
        </div>

        {/* Total Costs */}
        <div className="glass rounded-2xl p-6 border border-border/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-red-500/10">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
            <p className="text-placeholder text-sm">Custos Totais</p>
          </div>
          <p className="text-2xl font-bold text-red-500">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCosts)}
          </p>
          <p className="text-xs text-placeholder mt-1">Sala, serviços e taxas</p>
        </div>

        {/* Net Amount */}
        <div className="glass rounded-2xl p-6 border border-border/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-placeholder text-sm">Valor Líquido</p>
          </div>
          <p className="text-2xl font-bold text-green-500">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(netAmount)}
          </p>
          <p className="text-xs text-placeholder mt-1">Vendas - Custos</p>
        </div>

        {/* Available Balance */}
        <div className="glass rounded-2xl p-6 border-2 border-primary/30 bg-primary/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-placeholder text-sm">Saldo Disponível</p>
          </div>
          <p className="text-3xl font-bold text-primary">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(availableBalance)}
          </p>
          {withdrawnAmount > 0 && (
            <p className="text-xs text-placeholder mt-1">
              Já sacado: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(withdrawnAmount)}
            </p>
          )}
        </div>
      </div>

      {/* Withdraw Section */}
      <div className="glass rounded-2xl p-6 border border-border/30">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Solicitar Saque
        </h2>

        {!isStripeConnected ? (
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 text-sm text-placeholder">
            Configure sua conta Stripe Connect acima para poder solicitar saques
          </div>
        ) : !canWithdraw ? (
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-foreground font-semibold mb-1">Saque ainda não disponível</p>
            <p className="text-sm text-placeholder">
              {financials?.withdrawal_available_at ? (
                <>
                  Aguarde até{' '}
                  {format(new Date(financials.withdrawal_available_at), "dd 'de' MMMM 'às' HH:mm", {
                    locale: ptBR,
                  })}{' '}
                  (48h após o evento)
                </>
              ) : (
                'O saque estará disponível 48 horas após o término do evento'
              )}
            </p>
          </div>
        ) : availableBalance <= 0 ? (
          <div className="p-4 rounded-lg bg-gray-500/10 border border-gray-500/30 text-sm text-placeholder">
            Sem saldo disponível para saque no momento
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-foreground font-semibold mb-1">Saque disponível!</p>
              <p className="text-sm text-placeholder">
                Você pode solicitar o saque de até{' '}
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(availableBalance)}
              </p>
            </div>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="w-full px-6 py-4 bg-primary hover:bg-primary/90 text-background rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Solicitar Saque
            </button>
          </div>
        )}
      </div>

      {/* Cost Breakdown */}
      <div className="glass rounded-2xl p-6 border border-border/30">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Detalhamento de Custos
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-placeholder">Aluguel da Sala</span>
            <span className="font-semibold text-foreground">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                Number(financials?.room_cost || 0)
              )}
            </span>
          </div>
          {Number(financials?.audiovisual_cost || 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-placeholder">Audiovisual</span>
              <span className="font-semibold text-foreground">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  Number(financials.audiovisual_cost)
                )}
              </span>
            </div>
          )}
          {Number(financials?.coffee_break_cost || 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-placeholder">Coffee Break</span>
              <span className="font-semibold text-foreground">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  Number(financials.coffee_break_cost)
                )}
              </span>
            </div>
          )}
          {Number(financials?.coverage_cost || 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-placeholder">Cobertura</span>
              <span className="font-semibold text-foreground">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  Number(financials.coverage_cost)
                )}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-placeholder">Taxa da Plataforma (3%)</span>
            <span className="font-semibold text-foreground">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                Number(financials?.platform_fee || 0)
              )}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-placeholder">Taxas Stripe (~4%)</span>
            <span className="font-semibold text-foreground">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                Number(financials?.stripe_processing_fees || 0)
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Withdrawal History */}
      {withdrawals && withdrawals.length > 0 && (
        <div className="glass rounded-2xl p-6 border border-border/30">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Histórico de Saques
          </h2>
          <div className="space-y-3">
            {withdrawals.map((withdrawal: any) => (
              <div
                key={withdrawal.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-background"
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      Number(withdrawal.amount)
                    )}
                  </p>
                  <p className="text-xs text-placeholder">
                    {format(new Date(withdrawal.requested_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    withdrawal.status === 'COMPLETED'
                      ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                      : withdrawal.status === 'PROCESSING'
                      ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30'
                      : withdrawal.status === 'FAILED'
                      ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                      : 'bg-orange-500/10 text-orange-500 border border-orange-500/30'
                  }`}
                >
                  {withdrawal.status === 'COMPLETED'
                    ? 'CONCLUÍDO'
                    : withdrawal.status === 'PROCESSING'
                    ? 'PROCESSANDO'
                    : withdrawal.status === 'FAILED'
                    ? 'FALHOU'
                    : 'PENDENTE'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 max-w-md w-full border border-border/30">
            <h3 className="text-xl font-bold text-foreground mb-4">Solicitar Saque</h3>
            <p className="text-placeholder text-sm mb-4">
              Saldo disponível:{' '}
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(availableBalance)}
            </p>
            <div className="mb-4">
              <label className="block text-foreground text-sm mb-2">Valor a sacar (R$)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
                min="0.01"
                max={availableBalance}
                step="0.01"
                disabled={withdrawing}
              />
              <button
                onClick={() => setWithdrawAmount(availableBalance.toFixed(2))}
                className="mt-2 text-xs text-primary hover:underline"
                type="button"
              >
                Sacar valor total
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleWithdraw}
                disabled={withdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-background rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {withdrawing ? 'Processando...' : 'Confirmar Saque'}
              </button>
              <button
                onClick={() => {
                  setShowWithdrawModal(false)
                  setWithdrawAmount('')
                }}
                disabled={withdrawing}
                className="px-6 py-3 bg-background hover:bg-card text-foreground rounded-lg font-bold transition-all border border-border"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
