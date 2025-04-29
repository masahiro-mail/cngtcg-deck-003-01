import type { Card } from "@/types/card"

// SPの値を取得する関数（sp または ap から）
export const getSpValue = (card: Card): number => {
  if (card.sp) {
    const match = card.sp.match(/\d+/)
    if (match) {
      return Number.parseInt(match[0], 10)
    }
  }
  if (card.ap) {
    const match = card.ap.match(/\d+/)
    if (match) {
      return Number.parseInt(match[0], 10)
    }
  }
  return -1 // SPがない場合は-1を返す（ソート時に最後に来るようにするため）
}

// BPの値を取得する関数
export const getBpValue = (card: Card): number => {
  if (card.bp) {
    const match = card.bp.match(/\d+/)
    if (match) {
      return Number.parseInt(match[0], 10)
    }
  }
  return -1 // BPがない場合は-1を返す
}

// カードをソートする関数
export const sortCards = (cards: Card[], sortBy: string, sortOrder: "asc" | "desc"): Card[] => {
  // 新しい配列を作成してソート
  return [...cards].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name)
        break
      case "cost":
        comparison = (a.cost || 0) - (b.cost || 0)
        // コストが同じ場合は名前でソート（二次ソート）
        if (comparison === 0) {
          comparison = a.name.localeCompare(b.name)
        }
        break
      case "bp":
        const bpA = getBpValue(a)
        const bpB = getBpValue(b)
        comparison = bpA - bpB
        // BPが同じ場合はコストでソート（二次ソート）
        if (comparison === 0) {
          comparison = (a.cost || 0) - (b.cost || 0)
        }
        // コストも同じ場合は名前でソート（三次ソート）
        if (comparison === 0) {
          comparison = a.name.localeCompare(b.name)
        }
        break
      case "sp":
        const spA = getSpValue(a)
        const spB = getSpValue(b)
        comparison = spA - spB
        // SPが同じ場合はコストでソート（二次ソート）
        if (comparison === 0) {
          comparison = (a.cost || 0) - (b.cost || 0)
        }
        // コストも同じ場合は名前でソート（三次ソート）
        if (comparison === 0) {
          comparison = a.name.localeCompare(b.name)
        }
        break
      case "type":
        comparison = (a.type || "").localeCompare(b.type || "")
        // タイプが同じ場合はコストでソート（二次ソート）
        if (comparison === 0) {
          comparison = (a.cost || 0) - (b.cost || 0)
        }
        // コストも同じ場合は名前でソート（三次ソート）
        if (comparison === 0) {
          comparison = a.name.localeCompare(b.name)
        }
        break
      case "colorCost":
        const colorCostA = a.colorCost || 0
        const colorCostB = b.colorCost || 0
        comparison = colorCostA - colorCostB
        if (comparison === 0) {
          comparison = (a.cost || 0) - (b.cost || 0)
        }
        break
      case "colorlessCost":
        const colorlessCostA = a.colorlessCost || 0
        const colorlessCostB = b.colorlessCost || 0
        comparison = colorlessCostA - colorlessCostB
        if (comparison === 0) {
          comparison = (a.cost || 0) - (b.cost || 0)
        }
        break
      default:
        comparison = 0
    }

    return sortOrder === "asc" ? comparison : -comparison
  })
}
