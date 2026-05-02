import type { Entry, StandingsMap, ScoredEntry } from './types'

export function scoreEntry(entry: Entry, standings: StandingsMap): number {
  let total = 0
  for (const letter of 'ABCDEFGHIJKL'.split('')) {
    const s = standings[letter]
    if (!s) continue
    let groupPoints = 0
    const l = letter.toLowerCase()
    if (entry[`group_${l}_1`] === s.pos_1) groupPoints++
    if (entry[`group_${l}_2`] === s.pos_2) groupPoints++
    if (entry[`group_${l}_3`] === s.pos_3) groupPoints++
    if (entry[`group_${l}_4`] === s.pos_4) groupPoints++
    if (groupPoints === 4) groupPoints += 3
    total += groupPoints
  }
  return total
}

export function countPerfectGroups(entry: Entry, standings: StandingsMap): number {
  let count = 0
  for (const letter of 'ABCDEFGHIJKL'.split('')) {
    const s = standings[letter]
    if (!s) continue
    const l = letter.toLowerCase()
    if (
      entry[`group_${l}_1`] === s.pos_1 &&
      entry[`group_${l}_2`] === s.pos_2 &&
      entry[`group_${l}_3`] === s.pos_3 &&
      entry[`group_${l}_4`] === s.pos_4
    ) count++
  }
  return count
}

export function scoreAndRankEntries(
  entries: Entry[],
  standings: StandingsMap,
  actualTopScorer: string,
): ScoredEntry[] {
  const scored: ScoredEntry[] = entries.map((e) => ({
    ...e,
    score: scoreEntry(e, standings),
    perfectGroups: countPerfectGroups(e, standings),
  }))

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (b.perfectGroups !== a.perfectGroups) return b.perfectGroups - a.perfectGroups
    const aExact = a.top_scorer === actualTopScorer ? 1 : 0
    const bExact = b.top_scorer === actualTopScorer ? 1 : 0
    return bExact - aExact
    // tiebreaker 3 (whose top scorer scored more goals) requires manual adjudication
  })

  return scored
}
