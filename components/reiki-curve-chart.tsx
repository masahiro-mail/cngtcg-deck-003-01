"use client"

interface ReikiCurveChartProps {
  costDistribution: number[]
}

export default function ReikiCurveChart({ costDistribution }: ReikiCurveChartProps) {
  // 最大のカード枚数を取得（グラフのスケール設定用）
  const maxCardCount = Math.max(...costDistribution, 1) // 最低1にして0除算を防ぐ

  return (
    <div className="w-full h-48">
      <div className="bg-gray-100 dark:bg-black border border-gray-300 dark:border-blue-800 p-2 rounded-lg h-full">
        <div className="text-xs text-gray-600 dark:text-blue-400 mb-1">コスト別カード枚数</div>

        {/* Y軸ラベル（カード枚数） */}
        <div className="flex h-[calc(100%-24px)]">
          <div className="flex flex-col justify-between text-xs text-gray-600 dark:text-blue-500 font-medium pr-1 w-5">
            <span>{maxCardCount}</span>
            <span>{Math.round(maxCardCount * 0.5)}</span>
            <span>0</span>
          </div>

          {/* グラフ本体 */}
          <div className="flex-1 flex items-end">
            {costDistribution.map((count, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                {/* バー */}
                <div
                  className={`w-5 ${count > 0 ? "bg-gradient-to-t from-blue-400 to-blue-200 dark:from-blue-600 dark:to-blue-400" : ""}`}
                  style={{
                    height: `${Math.max((count / maxCardCount) * 100, count > 0 ? 5 : 0)}%`,
                  }}
                ></div>

                {/* X軸ラベル */}
                <div className="text-xs text-gray-600 dark:text-blue-500 mt-1">{i === 10 ? "10+" : i}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
