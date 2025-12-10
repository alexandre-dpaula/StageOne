'use client'

import { useState } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function ResendEmailsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleResendEmails = async () => {
    if (!confirm('Tem certeza que deseja reenviar emails para TODOS os participantes cadastrados?')) {
      return
    }

    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/resend-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao reenviar emails')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="glass border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/painel/admin" className="text-2xl text-primary hover:text-glow transition-all">
              <span className="font-normal">Stage</span><span className="font-bold">One</span>{' '}
              <span className="text-foreground">Admin</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link
            href="/painel/admin"
            className="text-primary hover:text-glow transition-colors inline-flex items-center gap-2 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar ao Painel
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Reenviar Emails de Confirmação</h1>
          <p className="text-placeholder mt-2">
            Reenvie emails de confirmação com QR Code para todos os participantes cadastrados
          </p>
        </div>

        <div className="glass rounded-xl p-6 mb-6">
          <div className="space-y-4">
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <h3 className="font-bold text-foreground mb-2">⚠️ Atenção</h3>
              <ul className="text-sm text-placeholder space-y-2">
                <li>• Esta ação irá reenviar emails para TODOS os participantes com tickets pagos</li>
                <li>• Certifique-se de que as variáveis SMTP estão configuradas no .env.local</li>
                <li>• O processo pode levar alguns minutos dependendo da quantidade de tickets</li>
                <li>• Cada participante receberá um email com seu QR Code único</li>
              </ul>
            </div>

            <Button onClick={handleResendEmails} isLoading={isLoading} className="w-full">
              {isLoading ? 'Enviando Emails...' : 'Reenviar Todos os Emails'}
            </Button>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                <strong>Erro:</strong> {error}
              </div>
            )}

            {result && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-3">
                <h3 className="font-bold text-foreground">Resultado do Envio</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-placeholder">Total de tickets:</span>
                    <span className="text-foreground font-medium">{result.results.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-placeholder">Emails enviados:</span>
                    <span className="text-primary font-bold">{result.results.sent} ✅</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-placeholder">Emails falharam:</span>
                    <span className="text-red-500 font-bold">{result.results.failed} ❌</span>
                  </div>
                </div>

                {result.results.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-bold text-foreground mb-2">Erros:</h4>
                    <ul className="text-xs text-placeholder space-y-1 max-h-40 overflow-y-auto">
                      {result.results.errors.map((err: string, index: number) => (
                        <li key={index} className="text-red-500">
                          • {err}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-sm text-primary font-medium mt-4">{result.message}</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="font-bold text-foreground mb-4">Configuração SMTP Necessária</h3>
          <div className="text-sm text-placeholder space-y-2">
            <p>Para enviar emails, certifique-se de que estas variáveis estão configuradas:</p>
            <div className="bg-card rounded-lg p-3 font-mono text-xs">
              <p>SMTP_HOST=smtp.gmail.com</p>
              <p>SMTP_PORT=587</p>
              <p>SMTP_USER=stageone2026@gmail.com</p>
              <p>SMTP_PASS=[senha]</p>
            </div>
            <p className="text-xs">
              <strong>Nota:</strong> Em desenvolvimento, verifique o arquivo .env.local. Em produção, configure no
              painel da Vercel.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
