'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const REFRESH_INTERVAL = 60_000
const ENTRY_FEE = 11
const POOL_PER_ENTRY = 10

const PRIZES = [
  { place: '1st', emoji: '🥇', pct: 0.70, color: 'text-gold-400', bg: 'bg-gold-400/10 border-gold-500/30' },
  { place: '2nd', emoji: '🥈', pct: 0.25, color: 'text-white/70', bg: 'bg-white/5 border-white/10' },
  { place: '3rd', emoji: '🥉', pct: 0.05, color: 'text-white/40', bg: 'bg-white/5 border-white/10' },
]

function formatGBP(amount: number) {
  return `£${amount.toFixed(2).replace(/\.00$/, '')}`
}

export default function PrizePage() {
  const [entryCount, setEntryCount] = useState<number | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchCount = useCallback(async () => {
    const { count } = await supabase
      .from('entries')
      .select('*', { count: 'exact', head: true })
    if (count !== null) setEntryCount(count)
    setLastRefresh(new Date())
  }, [])

  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchCount])

  const pool = (entryCount ?? 0) * POOL_PER_ENTRY

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-4">
      <div className="text-center">
        <h1 className="text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
          Prize Pool
        </h1>
        <p className="mt-2 text-white/40">Updates live as entries come in</p>
      </div>

      {/* Total pool */}
      <div className="rounded-2xl border border-gold-500/30 bg-gold-400/5 p-8 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-gold-400/60">Total pool</p>
        {entryCount === null ? (
          <p className="mt-2 text-5xl font-black text-white/20">—</p>
        ) : (
          <>
            <p className="mt-2 text-6xl font-black text-gold-400">{formatGBP(pool)}</p>
            <p className="mt-2 text-white/40">
              {entryCount} {entryCount === 1 ? 'entry' : 'entries'} × £{POOL_PER_ENTRY}
            </p>
          </>
        )}
      </div>

      {/* Prize breakdown */}
      <div className="space-y-3">
        {PRIZES.map(({ place, emoji, pct, color, bg }) => {
          const amount = pool * pct
          return (
            <div
              key={place}
              className={`flex items-center justify-between rounded-xl border p-5 ${bg}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{emoji}</span>
                <div>
                  <p className={`text-lg font-black uppercase tracking-wider ${color}`}>{place} place</p>
                  <p className="text-sm text-white/30">{(pct * 100).toFixed(0)}% of pool</p>
                </div>
              </div>
              <p className={`text-3xl font-black ${color}`}>
                {entryCount === null ? '—' : formatGBP(amount)}
              </p>
            </div>
          )
        })}
      </div>

      {/* Entry count progress feel */}
      {entryCount !== null && entryCount > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
          <p className="text-sm text-white/40">
            Every new entry adds <span className="font-bold text-white">£{POOL_PER_ENTRY}</span> to the pool
          </p>
          {entryCount < 10 && (
            <p className="mt-1 text-sm text-white/30">
              {10 - entryCount} more {10 - entryCount === 1 ? 'entry' : 'entries'} until the pool hits {formatGBP(10 * POOL_PER_ENTRY)}
            </p>
          )}
        </div>
      )}

      {/* Admin fee note */}
      <p className="text-center text-xs text-white/20">
        £{ENTRY_FEE - POOL_PER_ENTRY} per entry goes to admin · £{POOL_PER_ENTRY} per entry goes into the prize pool
      </p>

      {lastRefresh && (
        <p className="text-center text-xs text-white/20">
          Last updated {lastRefresh.toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}
