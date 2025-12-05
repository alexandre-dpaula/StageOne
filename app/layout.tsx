import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StageOne - Plataforma de Eventos e Treinamentos',
  description: 'Plataforma completa para gestão de eventos presenciais e treinamentos',
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
      </body>
    </html>
  )
}
