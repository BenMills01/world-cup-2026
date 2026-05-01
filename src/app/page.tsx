'use client'

import { useState, useEffect } from 'react'
import GroupCard, { type GroupValues } from '@/components/GroupCard'
import { GROUPS, GROUP_LETTERS } from '@/lib/groups'
import { supabase } from '@/lib/supabase'

type Picks = Record<string, string>

const SUBMITTED_KEY = 'wc2026_submitted'

function buildPicks(picks: Picks): Record<string, string> {
  const result: Record<string, string> = {}
  for (const letter of GROUP_LETTERS) {
    const l = letter.toLowerCase()
    result[`group_${l}_1`] = picks[`${letter}_pos_1`] || ''
    result[`group_${l}_2`] = picks[`${letter}_pos_2`] || ''
    result[`group_${l}_3`] = picks[`${letter}_pos_3`] || ''
    result[`group_${l}_4`] = picks[`${letter}_pos_4`] || ''
  }
  return result
}

function validatePicks(picks: Picks): string | null {
  for (const letter of GROUP_LETTERS) {
    const vals = [
      picks[`${letter}_pos_1`],
      picks[`${letter}_pos_2`],
      picks[`${letter}_pos_3`],
      picks[`${letter}_pos_4`],
    ]
    if (vals.some((v) => !v)) return `Group ${letter} is not complete.`
    const unique = new Set(vals)
    if (unique.size !== 4) return `Group ${letter} has duplicate teams.`
  }
  return null
}

export default function EntryPage() {
  const [picks, setPicks] = useState<Picks>({})
  const [name, setName] = useState('')
  const [topScorer, setTopScorer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(SUBMITTED_KEY)) {
      setAlreadySubmitted(true)
    }
  }, [])

  function handleGroupChange(
    letter: string,
    pos: 'pos_1' | 'pos_2' | 'pos_3' | 'pos_4',
    value: string,
  ) {
    setPicks((prev) => ({ ...prev, [`${letter}_${pos}`]: value }))
  }

  function getGroupValues(letter: string): GroupValues {
    return {
      pos_1: picks[`${letter}_pos_1`] || '',
      pos_2: picks[`${letter}_pos_2`] || '',
      pos_3: picks[`${letter}_pos_3`] || '',
      pos_4: picks[`${letter}_pos_4`] || '',
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) { setError('Please enter your name.'); return }
    if (!topScorer.trim()) { setError('Please enter a top scorer prediction.'); return }

    const pickError = validatePicks(picks)
    if (pickError) { setError(pickError); return }

    setSubmitting(true)
    const flat = buildPicks(picks)
    const { error: dbError } = await supabase.from('entries').insert([
      { name: name.trim(), top_scorer: topScorer.trim(), total_goals: 0, ...flat },
    ])

    if (dbError) {
      setError('Failed to submit: ' + dbError.message)
      setSubmitting(false)
      return
    }

    localStorage.setItem(SUBMITTED_KEY, '1')
    setSubmitted(true)
  }

  if (submitted || alreadySubmitted) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-12 text-center">
        <div className="text-6xl">🏆</div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">
          {submitted ? 'Picks locked in!' : 'Already entered!'}
        </h1>
        <p className="text-white/50">
          {submitted
            ? `Thanks, ${name}. Your predictions are locked in.`
            : 'Your predictions are already recorded. Check the leaderboard!'}
        </p>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-left">
          <h2 className="mb-3 font-bold uppercase tracking-wider text-gold-400">Scoring &amp; prizes</h2>
          <ul className="space-y-2 text-sm text-white/70">
            <li>🏅 <strong className="text-white">1 point</strong> per correct position within a group</li>
            <li>✨ <strong className="text-white">+3 bonus points</strong> for a perfect group (all 4 correct)</li>
            <li>🏆 <strong className="text-white">Maximum 84 points</strong> across 12 groups</li>
          </ul>
          <div className="mt-3 flex gap-2 text-xs">
            <span className="rounded bg-gold-400/20 px-2 py-1 font-black text-gold-400">🥇 70%</span>
            <span className="rounded bg-white/10 px-2 py-1 font-black text-white/60">🥈 25%</span>
            <span className="rounded bg-white/10 px-2 py-1 font-black text-white/40">🥉 5%</span>
          </div>
          <div className="mt-3 space-y-1 text-xs text-white/30">
            <p><span className="text-white/50">Tiebreaker 1:</span> exact top scorer name match wins.</p>
            <p><span className="text-white/50">Tiebreaker 2:</span> whoever&apos;s predicted top scorer scored more goals wins.</p>
            <p>If still tied, the prize is split equally.</p>
          </div>
        </div>
        <a
          href="/leaderboard"
          className="inline-block rounded-lg bg-gold-400 px-6 py-3 font-bold uppercase tracking-wider text-black transition hover:bg-gold-300"
        >
          View Leaderboard →
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
          Group Stage Predictor
        </h1>
        <p className="mt-2 text-white/50">FIFA World Cup 2026 · USA, Canada &amp; Mexico</p>
      </div>

      {/* Info panel */}
      <div className="mx-auto max-w-4xl grid gap-4 sm:grid-cols-3">
        {/* How to enter */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-3 text-xs font-black uppercase tracking-widest text-gold-400">How to enter</h2>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex gap-2"><span className="text-gold-400 shrink-0">1.</span>Fill in your predicted final standings for all 12 groups below.</li>
            <li className="flex gap-2"><span className="text-gold-400 shrink-0">2.</span>Add your name and a top scorer prediction.</li>
            <li className="flex gap-2"><span className="text-gold-400 shrink-0">3.</span>Hit submit — your picks are locked in immediately.</li>
            <li className="flex gap-2"><span className="text-gold-400 shrink-0">4.</span>Pay your £11 entry fee using the bank details opposite.</li>
          </ul>
          <p className="mt-3 text-xs text-white/30">Both your entry and payment must be received before the first game kicks off. Picks cannot be changed once submitted.</p>
        </div>

        {/* Scoring */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-3 text-xs font-black uppercase tracking-widest text-gold-400">Scoring &amp; prizes</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Correct position in a group</span>
              <span className="font-black text-white">1 pt</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Perfect group — all 4 correct</span>
              <span className="font-black text-white">+3 pts</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-2">
              <span className="text-white/70">Maximum score</span>
              <span className="font-black text-gold-400">84 pts</span>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-1.5 text-xs">
            <div className="rounded bg-gold-400/20 px-2 py-1.5 text-center font-black text-gold-400">🥇 70%</div>
            <div className="rounded bg-white/10 px-2 py-1.5 text-center font-black text-white/60">🥈 25%</div>
            <div className="rounded bg-white/10 px-2 py-1.5 text-center font-black text-white/40">🥉 5%</div>
          </div>
          <div className="mt-3 space-y-1 text-xs text-white/30">
            <p><span className="text-white/50">Tiebreaker 1:</span> exact top scorer name match.</p>
            <p><span className="text-white/50">Tiebreaker 2:</span> whose pick scored more goals.</p>
            <p>Still tied? Prize is split equally.</p>
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-xl border border-gold-500/20 bg-gold-500/5 p-5">
          <h2 className="mb-3 text-xs font-black uppercase tracking-widest text-gold-400">Entry fee — £11</h2>
          <p className="mb-3 text-sm text-white/70">Send payment by bank transfer:</p>
          <div className="space-y-2 rounded-lg border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-white/40 shrink-0">Name</span>
              <span className="text-white text-right">Benjamin Mills</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-white/40 shrink-0">Sort code</span>
              <span className="text-white">01-03-90</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-white/40 shrink-0">Account</span>
              <span className="text-white">34060278</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-white/30">Use your name as the payment reference. Entry is only confirmed once payment is received.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GROUP_LETTERS.map((letter) => (
            <GroupCard
              key={letter}
              letter={letter}
              teams={GROUPS[letter]}
              values={getGroupValues(letter)}
              onChange={(pos, val) => handleGroupChange(letter, pos, val)}
              mode="entry"
            />
          ))}
        </div>

        <div className="mx-auto max-w-2xl rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 font-bold uppercase tracking-wider text-gold-400">Your details</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/60">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/20 outline-none transition focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/60">
                Top scorer prediction
                <span className="ml-1 text-xs text-white/30">(tiebreaker — exact match wins)</span>
              </label>
              <input
                type="text"
                value={topScorer}
                onChange={(e) => setTopScorer(e.target.value)}
                placeholder="e.g. Kylian Mbappé"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/20 outline-none transition focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-lg bg-gold-400 px-6 py-3 font-bold uppercase tracking-wider text-black transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit my predictions'}
          </button>
        </div>
      </form>
    </div>
  )
}
