export interface GameCard {
  id: string
  name: string
  type: string
  cost: number
  bp?: string
  sp?: string
  ability?: string
  description?: string
  faction?: string
  illustrator?: string
  imageUrl?: string
  color: string
  rarity?: string
  cardNumber?: string
  colorBalance?: string
  colorCost?: number
  genericCost?: number
  colorlessCost?: number
  effectType?: string[]
  pack?: string
}
