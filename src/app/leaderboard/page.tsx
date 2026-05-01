'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { scoreAndRankEntries } from '@/lib/scoring'
import type { Entry, Standing, StandingsMap, ScoredEntry } from '@/lib/types'

const REFRESH_INTERVAL = 60_000

function rankStyle(rank: number) {
  if (rank === 1) return 'bg-gold-400/10 border-gold-500/40'
  if (rank === 2) return 'bg-white/5 border-white/20'
  if (rank === 3) return 'bg-white/5 border-white/10'
  return 'border-white/5'
}

function rankBadge(rank: number) {
  if (rank === 1) return <span className="font-black text-gold-400">🥇 1</span>
  if (rank === 2) return <span className="font-black text-white/60">🥈 2</span>
  if (rank === 3) return <span className="font-black text-white/40">🥉 3</span>
  return <span className="font-medium text-white/30">{rank}</span>
}

function tournamentStarted(standings: StandingsMap): boolean {
  return Object.values(standings).some((s) => s.pos_1 !== null)
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<ScoredEntry[]>([])
  const [started, setStarted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? entries.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
    : entries

  const fetchData = useCallback(async () => {
    const [entriesRes, standingsRes] = await Promise.all([
      supabase.from('entries').select('*').order('created_at', { ascending: true }),
      supabase.from('standings').select('*'),
    ])

    if (entriesRes.error || standingsRes.error) return

    const standingsMap: StandingsMap = {}
    for (const row of (standingsRes.data as Standing[])) {
      standingsMap[row.group_letter] = row
    }

    const isStarted = tournamentStarted(standingsMap)
    setStarted(isStarted)

    const scored = scoreAndRankEntries(
      entriesRes.data as Entry[],
      standingsMap,
      '',
    )
    setEntries(scored)
    setLastRefresh(new Date())
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="text-gray-400">Loading leaderboard…</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-white">Leaderboard</h1>
          <p className="mt-1 text-sm text-white/40">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} · auto-refreshes every 60s
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/20 outline-none transition focus:border-gold-400 focus:ring-1 focus:ring-gold-400 sm:w-56"
          />
          {lastRefresh && (
            <p className="text-xs text-white/20">
              Last updated {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {!started && (
        <div className="rounded-xl border border-gold-500/20 bg-gold-500/5 px-6 py-4">
          <p className="font-bold uppercase tracking-wider text-gold-400">⏳ Competition not yet started</p>
          <p className="mt-1 text-sm text-white/40">
            Scores will appear once the tournament begins and results are entered.
          </p>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 py-16 text-center text-white/30">
          No entries yet. Be the first to{' '}
          <a href="/" className="text-gold-400 hover:underline">submit your predictions</a>!
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 py-12 text-center text-white/30">
          No entries match &ldquo;{search}&rdquo;
        </div>
      ) : (
        <>
          <div className="hidden rounded-xl border border-white/10 bg-white/5 sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/30">
                  <th className="py-3 pl-4 pr-2 text-left font-bold">Rank</th>
                  <th className="px-3 py-3 text-left font-bold">Name</th>
                  <th className="px-3 py-3 text-center font-bold">Points</th>
                  <th className="px-3 py-3 text-center font-bold">Perfect Groups</th>
                  <th className="py-3 pl-3 pr-4 text-left font-bold">Top Scorer Pick</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => {
                  const rank = entries.indexOf(entry) + 1
                  return (
                    <tr
                      key={entry.id}
                      className={`border-b border-white/5 last:border-0 ${rankStyle(rank)}`}
                    >
                      <td className="py-3 pl-4 pr-2">{rankBadge(rank)}</td>
                      <td className="px-3 py-3 font-bold text-white">{entry.name}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="rounded-full bg-gold-400/20 px-2.5 py-0.5 font-black text-gold-400">
                          {entry.score}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {entry.perfectGroups > 0 ? (
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold text-white">
                            ✨ {entry.perfectGroups}
                          </span>
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </td>
                      <td className="py-3 pl-3 pr-4 text-white/50">{entry.top_scorer}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 sm:hidden">
            {filtered.map((entry) => {
              const rank = entries.indexOf(entry) + 1
              return (
                <div
                  key={entry.id}
                  className={`rounded-xl border p-4 ${rankStyle(rank)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-sm">{rankBadge(rank)}</div>
                      <span className="font-bold text-white">{entry.name}</span>
                    </div>
                    <span className="rounded-full bg-gold-400/20 px-3 py-1 text-sm font-black text-gold-400">
                      {entry.score} pts
                    </span>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-white/30">
                    <span>
                      {entry.perfectGroups > 0
                        ? `✨ ${entry.perfectGroups} perfect group${entry.perfectGroups > 1 ? 's' : ''}`
                        : 'No perfect groups'}
                    </span>
                    <span>⚽ {entry.top_scorer}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-4">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-white/30">Scoring &amp; prizes</h3>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-white/30">
          <span>🏅 1 pt per correct position</span>
          <span>✨ +3 bonus for a perfect group</span>
          <span>🏆 Max 84 pts</span>
          <span>🥇 70% · 🥈 25% · 🥉 5%</span>
          <span>Tiebreaker 1: exact top scorer name match · Tiebreaker 2: whose pick scored more goals · Prize split if still tied</span>
        </div>
      </div>
    </div>
  )
}
