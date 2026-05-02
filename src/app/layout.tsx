import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import Image from 'next/image'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WC2026 Group Stage Predictor',
  description: 'Predict the 2026 FIFA World Cup group stage standings',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-black`}>
        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/wc26-logo.webp"
                alt="FIFA World Cup 2026"
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
              <span className="text-sm font-bold uppercase tracking-widest text-white/70">
                Group Stage Predictor
              </span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/"
                className="rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Enter Picks
              </Link>
              <Link
                href="/leaderboard"
                className="rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Leaderboard
              </Link>
              <Link
                href="/prize"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gold-400/80 transition hover:bg-white/10 hover:text-gold-400"
              >
                Prize Pool
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
        <footer className="mt-16 border-t border-white/10 py-6 text-center text-xs text-white/20">
          FIFA World Cup 2026 · Group Stage Predictor
        </footer>
      </body>
    </html>
  )
}
