'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function ReservaPage() {
  const [horas, setHoras] = useState(1)
  const [adicionais, setAdicionais] = useState({
    audiovisual: false,
    cobertura: false,
    coffeBreak: false,
  })
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null)

  const precoHora = 299
  const precoAudiovisual = 499
  const precoCobertura = 999
  const precoCoffeBreak = 399

  // Calcular desconto por hora (3% por hora acima de 2h, máximo 15%)
  const calcularDesconto = (horas: number) => {
    if (horas <= 2) return 0
    const horasDesconto = horas - 2
    const desconto = Math.min(horasDesconto * 3, 15)
    return desconto
  }

  // Calcular preço base com desconto
  const calcularPrecoBase = () => {
    const subtotal = precoHora * horas
    const desconto = calcularDesconto(horas)
    const valorDesconto = subtotal * (desconto / 100)
    return subtotal - valorDesconto
  }

  // Calcular preço de adicionais
  const calcularAdicionais = () => {
    let total = 0

    if (adicionais.audiovisual) {
      if (horas <= 4) {
        total += precoAudiovisual
      } else {
        const horasExtras = horas - 4
        const acrescimo = horasExtras * (precoAudiovisual * 0.05)
        total += precoAudiovisual + acrescimo
      }
    }

    if (adicionais.cobertura) {
      if (horas <= 4) {
        total += precoCobertura
      } else {
        const horasExtras = horas - 4
        const acrescimo = horasExtras * (precoCobertura * 0.05)
        total += precoCobertura + acrescimo
      }
    }

    if (adicionais.coffeBreak) {
      total += precoCoffeBreak
    }

    return total
  }

  const precoBase = calcularPrecoBase()
  const precoAdicionaisTotal = calcularAdicionais()
  const precoTotal = precoBase + precoAdicionaisTotal
  const descontoPercentual = calcularDesconto(horas)

  const handleConfirmarReserva = () => {
    // Montar dados da reserva para enviar ao checkout
    const reservaData = {
      horas,
      adicionais,
      precoBase,
      precoAdicionaisTotal,
      precoTotal,
      descontoPercentual,
    }

    // Salvar no localStorage para usar no checkout
    localStorage.setItem('reserva', JSON.stringify(reservaData))

    // Redirecionar para checkout
    window.location.href = '/checkout-reserva'
  }

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
                Faça sua Reserva
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Reserve seu <span className="text-primary text-glow">Espaço</span>
            </h1>
            <p className="text-lg text-placeholder max-w-2xl mx-auto">
              Configure sua reserva e veja o preço em tempo real
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formulário */}
            <div className="glass rounded-2xl p-8 border border-border/30 animate-slide-up">
              <h2 className="text-2xl font-bold text-foreground mb-6">Configure sua Reserva</h2>

              {/* Horas */}
              <div className="mb-8">
                <label className="block text-foreground font-bold mb-3">
                  Número de Horas *
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setHoras(Math.max(1, horas - 1))}
                    className="w-12 h-12 glass rounded-full flex items-center justify-center text-foreground hover:border-primary/50 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <div className="flex-1 text-center">
                    <div className="text-4xl font-bold text-primary">{horas}</div>
                    <div className="text-sm text-placeholder">hora{horas > 1 ? 's' : ''}</div>
                  </div>
                  <button
                    onClick={() => setHoras(horas + 1)}
                    className="w-12 h-12 glass rounded-full flex items-center justify-center text-foreground hover:border-primary/50 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                {descontoPercentual > 0 && (
                  <div className="mt-3 text-center">
                    <span className="inline-flex items-center gap-2 bg-accent-green/10 border border-accent-green/30 text-accent-green px-3 py-1 rounded-full text-sm font-bold">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {descontoPercentual}% de desconto aplicado!
                    </span>
                  </div>
                )}
              </div>

              {/* Adicionais */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-foreground mb-4">Adicionais</h3>

                {/* Técnico Audiovisual */}
                <div className="glass rounded-xl mb-3 overflow-hidden border border-border/30 hover:border-primary/30 transition-all">
                  <label className="flex items-start gap-3 p-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adicionais.audiovisual}
                      onChange={(e) => setAdicionais({ ...adicionais, audiovisual: e.target.checked })}
                      className="mt-1 w-5 h-5 accent-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-bold text-foreground">Técnico de Audiovisual</div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            setExpandedInfo(expandedInfo === 'audiovisual' ? null : 'audiovisual')
                          }}
                          className="text-primary hover:text-primary/80"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                      <div className="text-sm text-placeholder">
                        R$ 499 (até 4h) - 5% por hora adicional
                      </div>
                    </div>
                    <div className="text-primary font-bold">
                      R$ {adicionais.audiovisual ? Math.round(horas <= 4 ? precoAudiovisual : precoAudiovisual + (horas - 4) * (precoAudiovisual * 0.05)) : 0}
                    </div>
                  </label>
                  {expandedInfo === 'audiovisual' && (
                    <div className="px-4 pb-4 pt-2 border-t border-border/30 bg-card/30">
                      <p className="text-sm text-placeholder leading-relaxed">
                        Profissional responsável por operar e garantir toda a parte técnica do evento: som, microfones, TV/Projetor, iluminação e suporte imediato durante o treinamento.
                      </p>
                    </div>
                  )}
                </div>

                {/* Cobertura */}
                <div className="glass rounded-xl mb-3 overflow-hidden border border-border/30 hover:border-primary/30 transition-all">
                  <label className="flex items-start gap-3 p-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adicionais.cobertura}
                      onChange={(e) => setAdicionais({ ...adicionais, cobertura: e.target.checked })}
                      className="mt-1 w-5 h-5 accent-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-bold text-foreground">Cobertura do Evento</div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            setExpandedInfo(expandedInfo === 'cobertura' ? null : 'cobertura')
                          }}
                          className="text-primary hover:text-primary/80"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                      <div className="text-sm text-placeholder">
                        R$ 999 (até 4h) - 5% por hora adicional
                      </div>
                    </div>
                    <div className="text-primary font-bold">
                      R$ {adicionais.cobertura ? Math.round(horas <= 4 ? precoCobertura : precoCobertura + (horas - 4) * (precoCobertura * 0.05)) : 0}
                    </div>
                  </label>
                  {expandedInfo === 'cobertura' && (
                    <div className="px-4 pb-4 pt-2 border-t border-border/30 bg-card/30">
                      <p className="text-sm text-placeholder leading-relaxed">
                        Registro profissional do seu evento com fotos e/ou vídeos, capturando momentos importantes, bastidores e materiais que podem ser usados em marketing, redes sociais ou entrega pós-evento.
                      </p>
                    </div>
                  )}
                </div>

                {/* Coffee Break */}
                <div className="glass rounded-xl overflow-hidden border border-border/30 hover:border-primary/30 transition-all">
                  <label className="flex items-start gap-3 p-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adicionais.coffeBreak}
                      onChange={(e) => setAdicionais({ ...adicionais, coffeBreak: e.target.checked })}
                      className="mt-1 w-5 h-5 accent-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-bold text-foreground">Coffee Break</div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            setExpandedInfo(expandedInfo === 'coffeBreak' ? null : 'coffeBreak')
                          }}
                          className="text-primary hover:text-primary/80"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                      <div className="text-sm text-placeholder">
                        R$ 399 (valor fixo)
                      </div>
                    </div>
                    <div className="text-primary font-bold">
                      R$ {adicionais.coffeBreak ? precoCoffeBreak : 0}
                    </div>
                  </label>
                  {expandedInfo === 'coffeBreak' && (
                    <div className="px-4 pb-4 pt-2 border-t border-border/30 bg-card/30">
                      <p className="text-sm text-placeholder leading-relaxed">
                        Serviço de coffee break simples e elegante para participantes, incluindo itens como café, chás, água, biscoitos e snacks.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Resumo do Pedido */}
            <div className="space-y-6">
              <div className="glass rounded-2xl p-8 border border-border/30 animate-slide-up sticky top-24">
                <h2 className="text-2xl font-bold text-foreground mb-6">Resumo da Reserva</h2>

                {/* Detalhamento */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center pb-3 border-b border-border/30">
                    <div>
                      <div className="text-foreground font-medium">Locação do Espaço</div>
                      <div className="text-sm text-placeholder">{horas} hora{horas > 1 ? 's' : ''} × R$ 299</div>
                    </div>
                    <div className="text-foreground font-bold">
                      R$ {Math.round(precoHora * horas).toLocaleString('pt-BR')}
                    </div>
                  </div>

                  {descontoPercentual > 0 && (
                    <div className="flex justify-between items-center pb-3 border-b border-border/30">
                      <div>
                        <div className="text-accent-green font-medium">Desconto</div>
                        <div className="text-sm text-placeholder">{descontoPercentual}% por reserva de {horas}h</div>
                      </div>
                      <div className="text-accent-green font-bold">
                        - R$ {Math.round((precoHora * horas) * (descontoPercentual / 100)).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  )}

                  {adicionais.audiovisual && (
                    <div className="flex justify-between items-center pb-3 border-b border-border/30">
                      <div>
                        <div className="text-foreground font-medium">Técnico Audiovisual</div>
                        <div className="text-sm text-placeholder">
                          {horas <= 4 ? 'Até 4h' : `4h + ${horas - 4}h extra (5% cada)`}
                        </div>
                      </div>
                      <div className="text-foreground font-bold">
                        R$ {Math.round(horas <= 4 ? precoAudiovisual : precoAudiovisual + (horas - 4) * (precoAudiovisual * 0.05)).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  )}

                  {adicionais.cobertura && (
                    <div className="flex justify-between items-center pb-3 border-b border-border/30">
                      <div>
                        <div className="text-foreground font-medium">Cobertura do Evento</div>
                        <div className="text-sm text-placeholder">
                          {horas <= 4 ? 'Até 4h' : `4h + ${horas - 4}h extra (5% cada)`}
                        </div>
                      </div>
                      <div className="text-foreground font-bold">
                        R$ {Math.round(horas <= 4 ? precoCobertura : precoCobertura + (horas - 4) * (precoCobertura * 0.05)).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  )}

                  {adicionais.coffeBreak && (
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
                      R$ {Math.round(precoTotal).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <button
                  onClick={handleConfirmarReserva}
                  className="btn-primary w-full text-lg mb-3"
                >
                  Ir para Checkout
                </button>
                <Link
                  href="/"
                  className="block w-full text-center glass text-foreground px-6 py-3 rounded-full font-bold transition-all hover:border-primary/50"
                >
                  Voltar
                </Link>
              </div>

              {/* Informações Importantes */}
              <div className="glass rounded-2xl p-6 border border-border/30">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Informações Importantes
                </h3>
                <ul className="space-y-2 text-sm text-placeholder">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Desconto progressivo a partir de 3h: 3% por hora adicional (máximo 15%)
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Adicionais incluem até 4h, após isso 5% por hora extra
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Coffee Break tem valor fixo independente das horas
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirmação em até 24h úteis
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
