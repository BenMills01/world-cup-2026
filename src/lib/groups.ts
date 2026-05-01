export const GROUPS = {
  A: ['Mexico', 'South Africa', 'Korea Republic', 'Czechia'],
  B: ['Canada', 'Bosnia-Herzegovina', 'Qatar', 'Switzerland'],
  C: ['Brazil', 'Morocco', 'Haiti', 'Scotland'],
  D: ['USA', 'Paraguay', 'Australia', 'Turkiye'],
  E: ['Germany', 'Curacao', "Cote d'Ivoire", 'Ecuador'],
  F: ['Netherlands', 'Japan', 'Sweden', 'Tunisia'],
  G: ['Belgium', 'Egypt', 'IR Iran', 'New Zealand'],
  H: ['Spain', 'Cabo Verde', 'Saudi Arabia', 'Uruguay'],
  I: ['France', 'Senegal', 'Iraq', 'Norway'],
  J: ['Argentina', 'Algeria', 'Austria', 'Jordan'],
  K: ['Portugal', 'Congo DR', 'Uzbekistan', 'Colombia'],
  L: ['England', 'Croatia', 'Ghana', 'Panama'],
} as const

export type GroupLetter = keyof typeof GROUPS
export const GROUP_LETTERS = Object.keys(GROUPS) as GroupLetter[]
