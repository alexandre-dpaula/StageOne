import type { Metadata } from 'next'
import './globals.css'
import PushNotificationPrompt from '@/components/PushNotificationPrompt'

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stageone.app'

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'StageOne™ - Plataforma de Eventos e Treinamentos',
    template: '%s | StageOne™',
  },
  description: 'Plataforma completa para criação, gestão e venda de treinamentos presenciais.',
  keywords: [
    'StageOne™',
    'eventos',
    'treinamentos',
    'imersões',
    'marketing',
    'gestão de eventos',
    'plataforma de eventos',
  ],
  authors: [{ name: 'StageOne™' }],
  openGraph: {
    title: 'StageOne™ - Plataforma de Eventos e Treinamentos',
    description: 'Crie e gerencie seus treinamentos presenciais com inscrições online, check-in e muito mais.',
    url: appUrl,
    siteName: 'StageOne™',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/og-image.s.jpg',
        width: 1200,
        height: 630,
        alt: 'Bem-vindo ao StageOne™',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StageOne™ - Plataforma de Eventos e Treinamentos',
    description: 'Gestão completa de eventos e treinamentos presenciais.',
    images: ['/og-image.s.jpg'],
  },
  // Icons are automatically handled by Next.js from app/icon.svg and app/apple-icon.svg
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
        <PushNotificationPrompt />
      </body>
    </html>
  )
}
