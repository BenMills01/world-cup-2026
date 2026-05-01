'use client'

const POSITIONS = [
  { key: 'pos_1' as const, label: '1st', emoji: '🥇' },
  { key: 'pos_2' as const, label: '2nd', emoji: '🥈' },
  { key: 'pos_3' as const, label: '3rd', emoji: '🥉' },
  { key: 'pos_4' as const, label: '4th', emoji: '4️⃣' },
]

export interface GroupValues {
  pos_1: string
  pos_2: string
  pos_3: string
  pos_4: string
}

interface GroupCardProps {
  letter: string
  teams: readonly string[]
  values: GroupValues
  onChange: (pos: 'pos_1' | 'pos_2' | 'pos_3' | 'pos_4', value: string) => void
  mode: 'entry' | 'admin'
  lastUpdated?: string
  onSave?: () => void
  saving?: boolean
}

function isComplete(values: GroupValues, teams: readonly string[]): boolean {
  const filled = [values.pos_1, values.pos_2, values.pos_3, values.pos_4]
  if (filled.some((v) => !v)) return false
  const unique = new Set(filled)
  return unique.size === 4 && filled.every((v) => teams.includes(v as string))
}

export default function GroupCard({
  letter,
  teams,
  values,
  onChange,
  mode,
  lastUpdated,
  onSave,
  saving,
}: GroupCardProps) {
  const complete = isComplete(values, teams)
  const chosen = [values.pos_1, values.pos_2, values.pos_3, values.pos_4].filter(Boolean)

  const borderClass =
    mode === 'entry' && complete
      ? 'border-gold-500/60 shadow-gold-500/10 shadow-lg'
      : 'border-white/10'

  return (
    <div
      className={`rounded-xl border bg-white/5 p-4 transition-all duration-200 ${borderClass}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black uppercase tracking-wider text-white">
            Group {letter}
          </h3>
          <p className="mt-0.5 text-xs text-white/30">{teams.join(' · ')}</p>
        </div>
        {mode === 'entry' && complete && (
          <span className="rounded-full bg-gold-500/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-gold-400">
            ✓
          </span>
        )}
      </div>

      <div className="space-y-2">
        {POSITIONS.map(({ key, label, emoji }) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-8 text-sm">{emoji}</span>
            <span className="w-7 text-xs font-bold text-white/30">{label}</span>
            <select
              value={values[key]}
              onChange={(e) => onChange(key, e.target.value)}
              className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-sm text-white outline-none transition focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
            >
              <option value="">— Select —</option>
              {teams.map((team) => {
                const takenByOther = chosen.includes(team) && values[key] !== team
                return (
                  <option key={team} value={team} disabled={takenByOther}>
                    {team}{takenByOther ? ' ✗' : ''}
                  </option>
                )
              })}
            </select>
          </div>
        ))}
      </div>

      {mode === 'admin' && (
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-white/30">
            {lastUpdated
              ? `Updated ${new Date(lastUpdated).toLocaleString()}`
              : 'Not yet set'}
          </span>
          <button
            onClick={onSave}
            disabled={saving || !complete}
            className="rounded-lg bg-gold-400 px-3 py-1.5 text-sm font-bold uppercase tracking-wider text-black transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}
    </div>
  )
}
