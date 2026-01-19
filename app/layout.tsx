import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Base Sign In Demo',
  description: 'Sign in with Base authentication demo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
