'use client'

import { useEffect, useState } from 'react'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { X } from 'lucide-react'

export default function PushNotificationPrompt() {
  const { notificationPermission, requestPermission } = usePushNotifications()
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if user already dismissed the prompt
    const hasSeenPrompt = localStorage.getItem('push-notification-prompt-seen')

    if (!hasSeenPrompt && notificationPermission === 'default') {
      // Show prompt after 3 seconds
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [notificationPermission])

  const handleEnable = async () => {
    await requestPermission()
    setShowPrompt(false)
    localStorage.setItem('push-notification-prompt-seen', 'true')
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem('push-notification-prompt-seen', 'true')
  }

  if (!showPrompt || dismissed || notificationPermission !== 'default') {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-slide-up">
      <div className="bg-card border border-primary/20 rounded-xl shadow-2xl p-6 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-placeholder hover:text-foreground transition-colors"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🔔</span>
          </div>
          <div>
            <h3 className="text-foreground font-bold text-lg mb-1">
              Ativar Notificações?
            </h3>
            <p className="text-placeholder text-sm">
              Receba alertas instantâneos quando seus ingressos forem confirmados e novidades sobre seus eventos.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleEnable}
            className="flex-1 py-3 rounded-lg font-bold text-sm transition-all duration-300 hover:shadow-glow hover:scale-105"
            style={{ backgroundColor: '#C4F82A', color: '#0A0B0D' }}
          >
            Ativar
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 py-3 rounded-lg font-bold text-sm bg-card border border-border hover:border-primary/30 text-foreground transition-all duration-300"
          >
            Agora Não
          </button>
        </div>
      </div>
    </div>
  )
}
