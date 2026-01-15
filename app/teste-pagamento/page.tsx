'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestePagamentoPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    customerName: 'João da Silva',
    customerEmail: 'joao@example.com',
    customerCpf: '123.456.789-00',
    customerPhone: '(11) 98765-4321',
    billingType: 'PIX',
    quantity: 1,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const supabase = createClient()

      // Verifica se está autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('Você precisa estar logado para testar pagamentos')
        setLoading(false)
        return
      }

      // Busca um evento publicado para teste
      const { data: events } = await supabase
        .from('events')
        .select('*, ticket_types:tickets_types(*)')
        .eq('is_published', true)
        .limit(1)

      if (!events || events.length === 0) {
        setError('Nenhum evento publicado encontrado. Crie um evento primeiro.')
        setLoading(false)
        return
      }

      const event = events[0]
      if (!event.ticket_types || event.ticket_types.length === 0) {
        setError('O evento não possui tipos de ingressos')
        setLoading(false)
        return
      }

      const ticketType = event.ticket_types[0]

      // Cria pagamento - USANDO API REAL ASAAS
      const response = await fetch('/api/payments/asaas/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketTypeId: ticketType.id,
          quantity: formData.quantity,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerCpf: formData.customerCpf,
          customerPhone: formData.customerPhone,
          billingType: formData.billingType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar pagamento')
      }

      setResult(data)
    } catch (err: any) {
      console.error('Erro:', err)
      setError(err.message || 'Erro ao processar pagamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          💳 Pagamento Asaas - Modo Produção
        </h1>

        <div className="glass rounded-2xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-foreground font-medium mb-2">
                Nome do Cliente
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-foreground font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, customerEmail: e.target.value })
                }
                className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-foreground font-medium mb-2">
                CPF
              </label>
              <input
                type="text"
                value={formData.customerCpf}
                onChange={(e) =>
                  setFormData({ ...formData, customerCpf: e.target.value })
                }
                className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-foreground font-medium mb-2">
                Telefone
              </label>
              <input
                type="text"
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, customerPhone: e.target.value })
                }
                className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground"
              />
            </div>

            <div>
              <label className="block text-foreground font-medium mb-2">
                Método de Pagamento
              </label>
              <select
                value={formData.billingType}
                onChange={(e) =>
                  setFormData({ ...formData, billingType: e.target.value })
                }
                className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground"
              >
                <option value="PIX">PIX</option>
                <option value="BOLETO">Boleto</option>
                <option value="CREDIT_CARD">Cartão de Crédito</option>
              </select>
            </div>

            <div>
              <label className="block text-foreground font-medium mb-2">
                Quantidade
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: parseInt(e.target.value) })
                }
                className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-background px-6 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processando...' : 'Criar Pagamento Teste'}
            </button>
          </form>
        </div>

        {error && (
          <div className="glass rounded-2xl p-6 mb-8 border-2 border-red-500">
            <h2 className="text-xl font-bold text-red-500 mb-2">❌ Erro</h2>
            <p className="text-foreground">{error}</p>
          </div>
        )}

        {result && (
          <div className="glass rounded-2xl p-6 mb-8 border-2 border-primary">
            <h2 className="text-xl font-bold text-primary mb-4">
              ✅ Pagamento Criado com Sucesso!
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-placeholder text-sm">ID do Pagamento</p>
                <p className="text-foreground font-mono">{result.payment.id}</p>
              </div>

              <div>
                <p className="text-placeholder text-sm">Valor</p>
                <p className="text-foreground font-bold text-2xl">
                  R$ {result.payment.value.toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-placeholder text-sm">Status</p>
                <p className="text-foreground">{result.payment.status}</p>
              </div>

              {result.payment.pix && (
                <div>
                  <p className="text-placeholder text-sm mb-2">QR Code PIX</p>
                  <img
                    src={`data:image/png;base64,${result.payment.pix.qrCode}`}
                    alt="QR Code PIX"
                    className="w-64 h-64 mx-auto bg-white p-4 rounded-lg"
                  />
                  <p className="text-xs text-placeholder mt-2 text-center">
                    Escaneie o QR Code acima para pagar
                  </p>
                  <div className="mt-4">
                    <p className="text-placeholder text-sm mb-2">Pix Copia e Cola</p>
                    <div className="bg-card p-3 rounded-lg border border-border">
                      <p className="text-foreground text-xs font-mono break-all">
                        {result.payment.pix.payload}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {result.payment.bankSlipUrl && (
                <div>
                  <a
                    href={result.payment.bankSlipUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-primary text-background px-6 py-3 rounded-lg font-bold transition-all hover:scale-105"
                  >
                    📄 Ver Boleto
                  </a>
                </div>
              )}

              <div>
                <a
                  href={result.payment.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-card text-foreground px-6 py-3 rounded-lg font-bold border border-border transition-all hover:scale-105"
                >
                  🧾 Ver Fatura
                </a>
              </div>


              <details className="mt-6">
                <summary className="cursor-pointer text-placeholder hover:text-foreground">
                  Ver JSON completo
                </summary>
                <pre className="mt-4 p-4 bg-card rounded-lg border border-border overflow-auto text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}

        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">
            📋 Instruções
          </h2>
          <ol className="space-y-2 text-foreground list-decimal list-inside">
            <li>Configure as variáveis de ambiente no arquivo .env.local</li>
            <li>
              API Key de Produção em:{' '}
              <a
                href="https://www.asaas.com/config/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://www.asaas.com/config/api
              </a>
            </li>
            <li>Configure o webhook em: https://www.asaas.com/config/webhook</li>
            <li>URL do webhook: https://stage-one-1.vercel.app/api/payments/asaas/webhook</li>
            <li>Preencha o formulário acima com dados reais para criar pagamento</li>
            <li>⚠️ ATENÇÃO: Este é um pagamento REAL, será cobrado!</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
