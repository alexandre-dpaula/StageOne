'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface ReservaData {
  horas: number
  adicionais: {
    audiovisual: boolean
    cobertura: boolean
    coffeBreak: boolean
  }
  precoBase: number
  precoAdicionaisTotal: number
  precoTotal: number
  descontoPercentual: number
}

export default function CheckoutReservaPage() {
  const [reserva, setReserva] = useState<ReservaData | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    dataEvento: '',
    observacoes: '',
    // Dados de pagamento
    numeroCartao: '',
    nomeCartao: '',
    validadeCartao: '',
    cvv: '',
  })

  useEffect(() => {
    // Recuperar dados da reserva do localStorage
    const reservaStorage = localStorage.getItem('reserva')
    if (reservaStorage) {
      setReserva(JSON.parse(reservaStorage))
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui você processaria o pagamento
    alert('Reserva confirmada! Em breve você receberá um email de confirmação.')
    // Limpar localStorage
    localStorage.removeItem('reserva')
    // Redirecionar
    window.location.href = '/'
  }

  if (!reserva) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-placeholder mb-4">Nenhuma reserva encontrada</p>
          <Link href="/reserva" className="btn-primary">
            Fazer Reserva
          </Link>
        </div>
      </div>
    )
  }

  const precoAudiovisual = 499
  const precoCobertura = 999
  const precoCoffeBreak = 399

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-primary text-sm font-bold uppercase tracking-wider">
                Checkout
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Finalize sua <span className="text-primary text-glow">Reserva</span>
            </h1>
            <p className="text-lg text-placeholder max-w-2xl mx-auto">
              Preencha seus dados e complete o pagamento
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Formulário */}
              <div className="space-y-6">
                {/* Informações de Contato */}
                <div className="glass rounded-2xl p-8 border border-border/30 animate-slide-up">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Informações de Contato</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-2">Nome Completo *</label>
                      <input
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground focus:border-primary focus:outline-none"
                        placeholder="Seu nome completo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-foreground mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground focus:border-primary focus:outline-none"
                        placeholder="seu@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-foreground mb-2">Telefone *</label>
                      <input
                        type="tel"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground focus:border-primary focus:outline-none"
                        placeholder="(00) 00000-0000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-foreground mb-2">Data do Evento *</label>
                      <input
                        type="date"
                        name="dataEvento"
                        value={formData.dataEvento}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-foreground mb-2">Observações</label>
                      <textarea
                        name="observacoes"
                        value={formData.observacoes}
                        onChange={handleInputChange}
                        className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground focus:border-primary focus:outline-none resize-none"
                        rows={3}
                        placeholder="Informações adicionais sobre o evento..."
                      />
                    </div>
                  </div>
                </div>

                {/* Dados de Pagamento */}
                <div className="glass rounded-2xl p-8 border border-border/30 animate-slide-up">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Dados de Pagamento</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-2">Número do Cartão *</label>
                      <input
                        type="text"
                        name="numeroCartao"
                        value={formData.numeroCartao}
                        onChange={handleInputChange}
                        required
                        maxLength={19}
                        className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground focus:border-primary focus:outline-none"
                        placeholder="0000 0000 0000 0000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-foreground mb-2">Nome no Cartão *</label>
                      <input
                        type="text"
                        name="nomeCartao"
                        value={formData.nomeCartao}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground focus:border-primary focus:outline-none uppercase"
                        placeholder="NOME COMO NO CARTÃO"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-2">Validade *</label>
                        <input
                          type="text"
                          name="validadeCartao"
                          value={formData.validadeCartao}
                          onChange={handleInputChange}
                          required
                          maxLength={5}
                          className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground focus:border-primary focus:outline-none"
                          placeholder="MM/AA"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-foreground mb-2">CVV *</label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          required
                          maxLength={4}
                          className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground focus:border-primary focus:outline-none"
                          placeholder="000"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-2 mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <svg className="w-5 h-5 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <p className="text-sm text-placeholder">
                        Seus dados de pagamento estão protegidos e criptografados
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumo da Reserva */}
              <div className="space-y-6">
                <div className="glass rounded-2xl p-8 border border-border/30 animate-slide-up sticky top-24">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Resumo da Reserva</h2>

                  {/* Detalhamento */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center pb-3 border-b border-border/30">
                      <div>
                        <div className="text-foreground font-medium">Locação do Espaço</div>
                        <div className="text-sm text-placeholder">{reserva.horas} hora{reserva.horas > 1 ? 's' : ''} × R$ 299</div>
                      </div>
                      <div className="text-foreground font-bold">
                        R$ {Math.round(299 * reserva.horas).toLocaleString('pt-BR')}
                      </div>
                    </div>

                    {reserva.descontoPercentual > 0 && (
                      <div className="flex justify-between items-center pb-3 border-b border-border/30">
                        <div>
                          <div className="text-accent-green font-medium">Desconto</div>
                          <div className="text-sm text-placeholder">{reserva.descontoPercentual}% por reserva de {reserva.horas}h</div>
                        </div>
                        <div className="text-accent-green font-bold">
                          - R$ {Math.round((299 * reserva.horas) * (reserva.descontoPercentual / 100)).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    )}

                    {reserva.adicionais.audiovisual && (
                      <div className="flex justify-between items-center pb-3 border-b border-border/30">
                        <div>
                          <div className="text-foreground font-medium">Técnico Audiovisual</div>
                          <div className="text-sm text-placeholder">
                            {reserva.horas <= 4 ? 'Até 4h' : `4h + ${reserva.horas - 4}h extra (5% cada)`}
                          </div>
                        </div>
                        <div className="text-foreground font-bold">
                          R$ {Math.round(reserva.horas <= 4 ? precoAudiovisual : precoAudiovisual + (reserva.horas - 4) * (precoAudiovisual * 0.05)).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    )}

                    {reserva.adicionais.cobertura && (
                      <div className="flex justify-between items-center pb-3 border-b border-border/30">
                        <div>
                          <div className="text-foreground font-medium">Cobertura do Evento</div>
                          <div className="text-sm text-placeholder">
                            {reserva.horas <= 4 ? 'Até 4h' : `4h + ${reserva.horas - 4}h extra (5% cada)`}
                          </div>
                        </div>
                        <div className="text-foreground font-bold">
                          R$ {Math.round(reserva.horas <= 4 ? precoCobertura : precoCobertura + (reserva.horas - 4) * (precoCobertura * 0.05)).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    )}

                    {reserva.adicionais.coffeBreak && (
                      <div className="flex justify-between items-center pb-3 border-b border-border/30">
                        <div>
                          <div className="text-foreground font-medium">Coffee Break</div>
                          <div className="text-sm text-placeholder">Valor fixo</div>
                        </div>
                        <div className="text-foreground font-bold">
                          R$ {precoCoffeBreak.toLocaleString('pt-BR')}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center">
                      <div className="text-foreground text-lg font-bold">Total</div>
                      <div className="text-primary text-3xl font-bold">
                        R$ {Math.round(reserva.precoTotal).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>

                  {/* Botões */}
                  <button
                    type="submit"
                    className="btn-primary w-full text-lg mb-3"
                  >
                    Confirmar e Pagar
                  </button>
                  <Link
                    href="/reserva"
                    className="block w-full text-center glass text-foreground px-6 py-3 rounded-full font-bold transition-all hover:border-primary/50"
                  >
                    Voltar
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
