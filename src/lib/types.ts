import type { GroupLetter } from './groups'

export type { GroupLetter }

export interface Entry {
  id: string
  name: string
  [key: string]: string | number | null
  top_scorer: string
  total_goals: number
  created_at: string
}

export interface Standing {
  group_letter: GroupLetter
  pos_1: string | null
  pos_2: string | null
  pos_3: string | null
  pos_4: string | null
  updated_at: string
}

export type StandingsMap = Record<string, Standing>

export interface ScoredEntry extends Entry {
  score: number
  perfectGroups: number
}
