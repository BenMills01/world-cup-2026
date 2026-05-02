'use client'

import { useState, useEffect } from 'react'

const DEADLINE = new Date('2026-06-11T18:00:00Z')

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    function tick() {
      const diff = DEADLINE.getTime() - Date.now()
      if (diff <= 0) { setExpired(true); return }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return { timeLeft, expired }
}

export default function Countdown() {
  const { timeLeft, expired } = useCountdown()

  if (expired) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-3 text-center">
        <p className="font-bold uppercase tracking-wider text-red-400">Entries are now closed</p>
      </div>
    )
  }

  if (!timeLeft) return null

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Mins', value: timeLeft.minutes },
    { label: 'Secs', value: timeLeft.seconds },
  ]

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-4">
      <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-white/40">
        Deadline — 11 June 2026, 7pm BST
      </p>
      <div className="flex justify-center gap-3">
        {units.map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center">
            <span className="w-16 rounded-lg bg-black/40 py-2 text-center text-2xl font-black tabular-nums text-white">
              {String(value).padStart(2, '0')}
            </span>
            <span className="mt-1 text-xs text-white/30">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
