import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { DataProvider } from '@/lib/data-context'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Dashboard Pessoal - Verde Metálico',
  description: 'Dashboard inteligente com controle financeiro, tarefas, saúde e produtividade com tema verde metálico moderno',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-background scroll-smooth">
      <body className="font-sans antialiased bg-background">
        <DataProvider>
          <div className="relative min-h-screen">
            {/* Fundo animado com gradiente verde */}
            <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 animate-pulse" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-10 animate-pulse" />
            </div>
            {children}
          </div>
        </DataProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
