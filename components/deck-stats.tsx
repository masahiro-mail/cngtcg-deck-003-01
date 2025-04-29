import type { Card } from "@/types/card"
import ReikiCurveChart from "@/components/reiki-curve-chart"

interface DeckStatsProps {
  deck: Card[]
  deckAnalysis: string
}

export default function DeckStats({ deck, deckAnalysis }: DeckStatsProps) {
  // デッキの統計情報を計算
  const deckStats = {
    types: {
      ユニット: deck.filter((card) => card.type === "ユニット").length,
      イベント: deck.filter((card) => card.type === "イベント").length,
      サポーター: deck.filter((card) => card.type === "サポーター").length,
    },
    costs: {
      low: deck.filter((card) => card.cost <= 3).length,
      mid: deck.filter((card) => card.cost > 3 && card.cost <= 6).length,
      high: deck.filter((card) => card.cost > 6).length,
    },
    colors: {
      blue: deck.filter((card) => card.color === "blue").length,
      red: deck.filter((card) => card.color === "red").length,
      yellow: deck.filter((card) => card.color === "yellow").length,
      green: deck.filter((card) => card.color === "green").length,
    },
    avgCost: deck.length > 0 ? (deck.reduce((sum, card) => sum + card.cost, 0) / deck.length).toFixed(1) : "0.0",
  }

  // コストごとのカード枚数を計算（レイキカーブ用）
  const costDistribution = Array(11).fill(0)
  deck.forEach((card) => {
    if (card.cost <= 10) {
      costDistribution[card.cost]++
    } else {
      // コスト10以上は全て10として扱う
      costDistribution[10]++
    }
  })

  return (
    <>
      {/* デッキ分析 */}
      {deckAnalysis && (
        <div className="mb-4 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold mb-2 text-blue-700 dark:text-blue-400">デッキ分析</h3>
          <div className="text-sm text-blue-600 dark:text-blue-300 whitespace-pre-line">{deckAnalysis}</div>
        </div>
      )}

      {/* レイキカーブ */}
      <div className="mb-4 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-semibold mb-2 text-blue-700 dark:text-blue-400">レイキカーブ</h3>
        <ReikiCurveChart costDistribution={costDistribution} />
      </div>

      {/* デッキ統計 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold mb-2 text-blue-700 dark:text-blue-400">タイプ別</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-600 dark:text-blue-300">ユニット:</span>
              <span className="text-yellow-600 dark:text-yellow-400">{deckStats.types.ユニット}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600 dark:text-blue-300">イベント:</span>
              <span className="text-yellow-600 dark:text-yellow-400">{deckStats.types.イベント}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600 dark:text-blue-300">サポーター:</span>
              <span className="text-yellow-600 dark:text-yellow-400">{deckStats.types.サポーター}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold mb-2 text-blue-700 dark:text-blue-400">コスト別</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-600 dark:text-blue-300">低(1-3):</span>
              <span className="text-yellow-600 dark:text-yellow-400">{deckStats.costs.low}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600 dark:text-blue-300">中(4-6):</span>
              <span className="text-yellow-600 dark:text-yellow-400">{deckStats.costs.mid}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600 dark:text-blue-300">高(7+):</span>
              <span className="text-yellow-600 dark:text-yellow-400">{deckStats.costs.high}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
        <h3 className="text-sm font-semibold mb-2 text-blue-700 dark:text-blue-400">色別</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="flex items-center text-blue-600 dark:text-blue-300">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>青:
            </span>
            <span className="text-yellow-600 dark:text-yellow-400">{deckStats.colors.blue}</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center text-blue-600 dark:text-blue-300">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>赤:
            </span>
            <span className="text-yellow-600 dark:text-yellow-400">{deckStats.colors.red}</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center text-blue-600 dark:text-blue-300">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>黄:
            </span>
            <span className="text-yellow-600 dark:text-yellow-400">{deckStats.colors.yellow}</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center text-blue-600 dark:text-blue-300">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>緑:
            </span>
            <span className="text-yellow-600 dark:text-yellow-400">{deckStats.colors.green}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
        <h3 className="text-sm font-semibold mb-2 text-blue-700 dark:text-blue-400">平均コスト</h3>
        <div className="text-2xl font-bold text-center text-yellow-600 dark:text-yellow-400">{deckStats.avgCost}</div>
      </div>
    </>
  )
}
