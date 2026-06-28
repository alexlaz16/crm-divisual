import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Laguna CRM',
  description: 'CRM moderno para Laguna Country Club',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
