'use client'

import { useState, useEffect, useCallback } from 'react'
import GroupCard, { type GroupValues } from '@/components/GroupCard'
import { GROUPS, GROUP_LETTERS } from '@/lib/groups'
import { supabase } from '@/lib/supabase'
import type { Standing } from '@/lib/types'

type StandingsState = Record<string, GroupValues>
type SaveState = Record<string, boolean>
type TimestampState = Record<string, string>

interface EntryRow {
  id: string
  name: string
  paid: boolean
  created_at: string
}

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    })
    if (res.ok) {
      onAuth()
    } else {
      setError('Incorrect password.')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-64 items-center justify-center">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white/5 p-6">
        <h1 className="mb-1 font-black uppercase tracking-wider text-white">Admin access</h1>
        <p className="mb-4 text-sm text-white/40">Enter the admin password to manage standings.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-white/20 outline-none transition focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading || !pw}
            className="w-full rounded-lg bg-gold-400 py-2.5 font-bold uppercase tracking-wider text-black transition hover:bg-gold-300 disabled:opacity-50"
          >
            {loading ? 'Checking…' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [standings, setStandings] = useState<StandingsState>({})
  const [timestamps, setTimestamps] = useState<TimestampState>({})
  const [saving, setSaving] = useState<SaveState>({})
  const [entries, setEntries] = useState<EntryRow[]>([])
  const [togglingPaid, setTogglingPaid] = useState<SaveState>({})
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchStandings = useCallback(async () => {
    setLoading(true)
    const [standingsRes, entriesRes] = await Promise.all([
      supabase.from('standings').select('*'),
      supabase.from('entries').select('id, name, paid, created_at').order('created_at', { ascending: true }),
    ])
    if (standingsRes.data) {
      const s: StandingsState = {}
      const t: TimestampState = {}
      for (const row of standingsRes.data as Standing[]) {
        s[row.group_letter] = {
          pos_1: row.pos_1 || '',
          pos_2: row.pos_2 || '',
          pos_3: row.pos_3 || '',
          pos_4: row.pos_4 || '',
        }
        t[row.group_letter] = row.updated_at
      }
      setStandings(s)
      setTimestamps(t)
    }
    if (entriesRes.data) setEntries(entriesRes.data as EntryRow[])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authed) fetchStandings()
  }, [authed, fetchStandings])

  function handleChange(
    letter: string,
    pos: 'pos_1' | 'pos_2' | 'pos_3' | 'pos_4',
    value: string,
  ) {
    setStandings((prev) => ({
      ...prev,
      [letter]: { ...(prev[letter] || { pos_1: '', pos_2: '', pos_3: '', pos_4: '' }), [pos]: value },
    }))
  }

  async function saveGroup(letter: string) {
    const vals = standings[letter]
    if (!vals) return
    setSaving((prev) => ({ ...prev, [letter]: true }))
    const now = new Date().toISOString()
    const { error } = await supabase.from('standings').upsert({
      group_letter: letter,
      pos_1: vals.pos_1 || null,
      pos_2: vals.pos_2 || null,
      pos_3: vals.pos_3 || null,
      pos_4: vals.pos_4 || null,
      updated_at: now,
    })
    if (!error) {
      setTimestamps((prev) => ({ ...prev, [letter]: now }))
      showToast(`Group ${letter} saved!`)
    } else {
      showToast(`Error: ${error.message}`)
    }
    setSaving((prev) => ({ ...prev, [letter]: false }))
  }

  async function saveAll() {
    for (const letter of GROUP_LETTERS) {
      await saveGroup(letter)
    }
    showToast('All groups saved!')
  }

  async function togglePaid(entry: EntryRow) {
    setTogglingPaid((prev) => ({ ...prev, [entry.id]: true }))
    const { error } = await supabase
      .from('entries')
      .update({ paid: !entry.paid })
      .eq('id', entry.id)
    if (!error) {
      setEntries((prev) => prev.map((e) => e.id === entry.id ? { ...e, paid: !e.paid } : e))
      showToast(`${entry.name} marked as ${!entry.paid ? 'paid' : 'unpaid'}`)
    } else {
      showToast(`Error: ${error.message}`)
    }
    setTogglingPaid((prev) => ({ ...prev, [entry.id]: false }))
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Update Standings</h1>
          <p className="mt-1 text-sm text-white/40">
            Set actual group stage results. Changes are reflected on the leaderboard immediately.
          </p>
        </div>
        <button
          onClick={saveAll}
          className="shrink-0 rounded-lg bg-gold-400 px-4 py-2 font-bold uppercase tracking-wider text-black transition hover:bg-gold-300"
        >
          Save All Groups
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-white/30">Loading…</div>
      ) : (
        <>
          {/* Payment tracker */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-black uppercase tracking-wider text-gold-400">Payment tracker</h2>
              <span className="text-sm text-white/40">
                {entries.filter((e) => e.paid).length} / {entries.length} paid
              </span>
            </div>
            {entries.length === 0 ? (
              <p className="text-sm text-white/30">No entries yet.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${entry.paid ? 'bg-green-400' : 'bg-red-500'}`} />
                      <span className="text-sm font-medium text-white">{entry.name}</span>
                      <span className="text-xs text-white/30">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => togglePaid(entry)}
                      disabled={togglingPaid[entry.id]}
                      className={`rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 ${
                        entry.paid
                          ? 'bg-white/10 text-white/50 hover:bg-red-500/20 hover:text-red-400'
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      }`}
                    >
                      {togglingPaid[entry.id] ? '…' : entry.paid ? 'Paid ✓' : 'Unpaid'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Standings */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GROUP_LETTERS.map((letter) => (
              <GroupCard
                key={letter}
                letter={letter}
                teams={GROUPS[letter]}
                values={standings[letter] || { pos_1: '', pos_2: '', pos_3: '', pos_4: '' }}
                onChange={(pos, val) => handleChange(letter, pos, val)}
                mode="admin"
                lastUpdated={timestamps[letter]}
                onSave={() => saveGroup(letter)}
                saving={saving[letter]}
              />
            ))}
          </div>
        </>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-gold-500/30 bg-black px-4 py-3 text-sm font-bold uppercase tracking-wider text-gold-400 shadow-xl backdrop-blur">
          ✓ {toast}
        </div>
      )}
    </div>
  )
}
