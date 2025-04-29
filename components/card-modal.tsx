"use client"
import type { Card } from "@/types/card"
import { X, Plus, Minus } from "lucide-react"
import { useTheme } from "next-themes"

interface CardModalProps {
  card: Card | null
  closeModal: () => void
  addCardToDeck?: (card: Card) => void
  deckCount?: number
  onIncrement?: () => void
  onDecrement?: () => void
}

export default function CardModal({
  card,
  closeModal,
  addCardToDeck,
  deckCount = 0,
  onIncrement,
  onDecrement,
}: CardModalProps) {
  const { theme, resolvedTheme } = useTheme()
  const isDark = theme === "dark" || resolvedTheme === "dark"

  if (!card) {
    return null
  }

  // カードの色に基づいたテーマカラーを取得
  const getCardThemeColors = () => {
    if (!card) return { main: "", light: "", border: "", text: "" }

    switch (card.color) {
      case "blue":
        return {
          main: isDark ? "bg-gradient-to-br from-blue-900 to-blue-800" : "bg-gradient-to-br from-blue-600 to-blue-500",
          light: isDark ? "bg-gradient-to-br from-blue-800 to-blue-700" : "bg-gradient-to-br from-blue-500 to-blue-400",
          lighter: isDark ? "bg-blue-900/30" : "bg-blue-50",
          border: isDark ? "border-blue-700" : "border-blue-300",
          text: isDark ? "text-blue-400" : "text-blue-600",
          textLight: isDark ? "text-blue-300" : "text-blue-700",
          shadow: isDark ? "shadow-blue-900/50" : "shadow-blue-500/30",
        }
      case "red":
        return {
          main: isDark ? "bg-gradient-to-br from-red-900 to-red-800" : "bg-gradient-to-br from-red-600 to-red-500",
          light: isDark ? "bg-gradient-to-br from-red-800 to-red-700" : "bg-gradient-to-br from-red-500 to-red-400",
          lighter: isDark ? "bg-red-900/30" : "bg-red-50",
          border: isDark ? "border-red-700" : "border-red-300",
          text: isDark ? "text-red-400" : "text-red-600",
          textLight: isDark ? "text-red-300" : "text-red-700",
          shadow: isDark ? "shadow-red-900/50" : "shadow-red-500/30",
        }
      case "green":
        return {
          main: isDark
            ? "bg-gradient-to-br from-green-900 to-green-800"
            : "bg-gradient-to-br from-green-600 to-green-500",
          light: isDark
            ? "bg-gradient-to-br from-green-800 to-green-700"
            : "bg-gradient-to-br from-green-500 to-green-400",
          lighter: isDark ? "bg-green-900/30" : "bg-green-50",
          border: isDark ? "border-green-700" : "border-green-300",
          text: isDark ? "text-green-400" : "text-green-600",
          textLight: isDark ? "text-green-300" : "text-green-700",
          shadow: isDark ? "shadow-green-900/50" : "shadow-green-500/30",
        }
      case "yellow":
        return {
          main: isDark
            ? "bg-gradient-to-br from-yellow-800 to-amber-700"
            : "bg-gradient-to-br from-yellow-500 to-amber-400",
          light: isDark
            ? "bg-gradient-to-br from-yellow-700 to-amber-600"
            : "bg-gradient-to-br from-yellow-400 to-amber-300",
          lighter: isDark ? "bg-yellow-800/30" : "bg-yellow-50",
          border: isDark ? "border-yellow-700" : "border-yellow-300",
          text: isDark ? "text-yellow-400" : "text-yellow-600",
          textLight: isDark ? "text-yellow-300" : "text-yellow-700",
          shadow: isDark ? "shadow-yellow-900/50" : "shadow-yellow-500/30",
        }
      case "purple":
        return {
          main: isDark
            ? "bg-gradient-to-br from-purple-900 to-purple-800"
            : "bg-gradient-to-br from-purple-600 to-purple-500",
          light: isDark
            ? "bg-gradient-to-br from-purple-800 to-purple-700"
            : "bg-gradient-to-br from-purple-500 to-purple-400",
          lighter: isDark ? "bg-purple-900/30" : "bg-purple-50",
          border: isDark ? "border-purple-700" : "border-purple-300",
          text: isDark ? "text-purple-400" : "text-purple-600",
          textLight: isDark ? "text-purple-300" : "text-purple-700",
          shadow: isDark ? "shadow-purple-900/50" : "shadow-purple-500/30",
        }
      default:
        return {
          main: isDark ? "bg-gradient-to-br from-blue-900 to-blue-800" : "bg-gradient-to-br from-blue-600 to-blue-500",
          light: isDark ? "bg-gradient-to-br from-blue-800 to-blue-700" : "bg-gradient-to-br from-blue-500 to-blue-400",
          lighter: isDark ? "bg-blue-900/30" : "bg-blue-50",
          border: isDark ? "border-blue-700" : "border-blue-300",
          text: isDark ? "text-blue-400" : "text-blue-600",
          textLight: isDark ? "text-blue-300" : "text-blue-700",
          shadow: isDark ? "shadow-blue-900/50" : "shadow-blue-500/30",
        }
    }
  }

  const colors = getCardThemeColors()

  // カードの色に基づいた色クラスを取得
  const getColorClass = (color: string | undefined) => {
    switch (color) {
      case "blue":
        return isDark ? "bg-gradient-to-br from-blue-500 to-blue-600" : "bg-gradient-to-br from-blue-400 to-blue-500"
      case "red":
        return isDark ? "bg-gradient-to-br from-red-500 to-red-600" : "bg-gradient-to-br from-red-400 to-red-500"
      case "yellow":
        return isDark
          ? "bg-gradient-to-br from-yellow-500 to-yellow-600"
          : "bg-gradient-to-br from-yellow-400 to-yellow-500"
      case "green":
        return isDark
          ? "bg-gradient-to-br from-green-500 to-green-600"
          : "bg-gradient-to-br from-green-400 to-green-500"
      case "purple":
        return isDark
          ? "bg-gradient-to-br from-purple-500 to-purple-600"
          : "bg-gradient-to-br from-purple-400 to-purple-500"
      default:
        return isDark ? "bg-gradient-to-br from-gray-500 to-gray-600" : "bg-gradient-to-br from-gray-400 to-gray-500"
    }
  }

  // レアリティに基づいたスタイルを取得
  const getRarityStyles = () => {
    if (!card || !card.rarity) {
      return isDark
        ? "bg-gradient-to-br from-gray-600 to-gray-700 text-white"
        : "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800"
    }
    switch (card.rarity) {
      case "C":
        return isDark
          ? "bg-gradient-to-br from-gray-600 to-gray-700 text-white"
          : "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800"
      case "R":
        return isDark
          ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
          : "bg-gradient-to-br from-blue-300 to-blue-400 text-blue-800"
      case "RR":
        return isDark
          ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white"
          : "bg-gradient-to-br from-purple-300 to-purple-400 text-purple-800"
      case "RRR":
        return isDark
          ? "bg-gradient-to-br from-red-600 to-red-700 text-white"
          : "bg-gradient-to-br from-red-300 to-red-400 text-red-800"
      case "SR":
        return isDark
          ? "bg-gradient-to-br from-red-600 to-red-700 text-white"
          : "bg-gradient-to-br from-red-300 to-red-400 text-red-800"
      default:
        return isDark
          ? "bg-gradient-to-br from-gray-600 to-gray-700 text-white"
          : "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800"
    }
  }

  // 効果分類を表示する関数
  const formatEffectType = () => {
    if (!card.effectType || card.effectType.length === 0) return null
    return <div className={`text-sm font-bold mb-2 ${colors.text}`}>{card.effectType.join("/")}</div>
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        className={`${isDark ? "bg-gray-900" : "bg-white"} border ${colors.border} rounded-lg overflow-hidden max-w-2xl w-full shadow-2xl transition-all duration-300 transform scale-100 hover:scale-[1.01]`}
        style={{
          boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2), 0 0 0 1px ${isDark ? "rgba(30, 41, 59, 0.7)" : "rgba(255, 255, 255, 0.1)"}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className={`${colors.main} px-4 py-3 flex justify-between items-center shadow-md`}>
          <h2 className="text-xl font-bold text-white drop-shadow-md">{card.name}</h2>
          <button onClick={closeModal} className="text-white hover:text-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex">
          {/* 左側: カード基本情報 */}
          <div className={`w-1/4 ${colors.main} p-4 flex flex-col`}>
            <div className={`${colors.light} p-3 rounded-lg mb-4 text-center shadow-md`}>
              <div className="text-white font-bold text-lg drop-shadow-sm">{card.name}</div>
            </div>

            <div className={`${colors.light} p-2 rounded-lg mb-2 text-center shadow-md`}>
              <span className="text-white font-bold drop-shadow-sm">{card.type}</span>
            </div>

            {card.rarity && (
              <div className={`${getRarityStyles()} p-2 rounded-lg text-center text-sm mb-auto shadow-md`}>
                {card.rarity}
              </div>
            )}
          </div>

          {/* 右側: カード詳細情報 */}
          <div className={`w-3/4 ${isDark ? "bg-gray-900" : "bg-gray-50"} p-4`}>
            {/* バトル情報 */}
            {(card.bp || card.sp) && (
              <div className="mb-4">
                <div className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"} mb-2`}>
                  バトル情報
                </div>
                <div className="flex space-x-4">
                  {card.bp && card.bp !== "0" && card.bp !== "-" && (
                    <div className="flex items-center">
                      <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"} mr-2`}>
                        バトルポイント (BP):
                      </span>
                      <span className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-3 py-1 rounded-md font-bold shadow-md">
                        {card.bp}
                      </span>
                    </div>
                  )}
                  {card.sp && card.sp !== "0" && card.sp !== "-" && (
                    <div className="flex items-center">
                      <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"} mr-2`}>
                        助太刀ポイント (AP):
                      </span>
                      <span className="bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-1 rounded-md font-bold shadow-md">
                        {card.sp}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* コスト情報 */}
            <div className="mb-4">
              <div className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"} mb-2`}>コスト情報</div>
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"} mr-2`}>総コスト:</span>
                  <span
                    className={`${isDark ? "bg-gradient-to-br from-gray-700 to-gray-800" : "bg-gradient-to-br from-gray-600 to-gray-700"} text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md`}
                  >
                    {card.cost}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"} mr-2`}>色コスト:</span>
                  <div
                    className={`w-8 h-8 rounded-full ${getColorClass(card.color)} flex items-center justify-center text-white font-bold shadow-md`}
                  >
                    {card.colorCost || 0}
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"} mr-2`}>無色コスト:</span>
                  <div
                    className={`${isDark ? "bg-gradient-to-br from-gray-600 to-gray-700" : "bg-gradient-to-br from-gray-500 to-gray-600"} text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md`}
                  >
                    {card.colorlessCost || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* 収録パック */}
            {card.pack && (
              <div className={`${colors.lighter} border ${colors.border} rounded-lg p-2 mb-4 shadow-md`}>
                <div className={`text-sm ${colors.text} mb-1 font-semibold`}>収録パック</div>
                <div className={`text-sm ${colors.textLight}`}>{card.pack}</div>
              </div>
            )}

            {/* 能力 */}
            {card.ability && (
              <div className={`${colors.lighter} border ${colors.border} rounded-lg p-3 mb-4 shadow-md`}>
                <div className={`text-sm ${colors.text} mb-1 font-semibold`}>能力</div>
                {formatEffectType()}
                <div className={`${isDark ? "text-gray-200" : "text-gray-800"}`}>{card.ability}</div>
              </div>
            )}

            {/* フレイバーテキスト */}
            {card.description && (
              <div
                className={`${isDark ? "bg-gray-800/70" : "bg-gray-100"} border ${isDark ? "border-gray-700" : "border-gray-300"} rounded-lg p-3 mb-4 shadow-md`}
              >
                <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"} mb-1 font-semibold`}>
                  フレイバーテキスト
                </div>
                <div className={`${isDark ? "text-gray-300" : "text-gray-700"} italic`}>{card.description}</div>
              </div>
            )}

            {/* カード枚数と増減ボタン */}
            <div className="mt-4 flex justify-center items-center">
              <div
                className={`flex items-center space-x-4 ${isDark ? "bg-gray-800/80" : "bg-gray-200/80"} px-6 py-3 rounded-lg shadow-md`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDecrement && onDecrement()
                  }}
                  disabled={!onDecrement || deckCount === 0}
                  className={`p-1 rounded-full ${
                    !onDecrement || deckCount === 0
                      ? isDark
                        ? "bg-gray-700 text-gray-500"
                        : "bg-gray-300 text-gray-400"
                      : isDark
                        ? "bg-gradient-to-br from-red-900 to-red-800 text-red-300 hover:from-red-800 hover:to-red-700"
                        : "bg-gradient-to-br from-red-200 to-red-300 text-red-600 hover:from-red-300 hover:to-red-400"
                  } cursor-${!onDecrement || deckCount === 0 ? "not-allowed" : "pointer"} shadow-md transition-all duration-200`}
                >
                  <Minus size={20} />
                </button>
                <span className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"} w-6 text-center`}>
                  {deckCount}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onIncrement && onIncrement()
                  }}
                  disabled={!onIncrement || deckCount >= 4}
                  className={`p-1 rounded-full ${
                    !onIncrement || deckCount >= 4
                      ? isDark
                        ? "bg-gray-700 text-gray-500"
                        : "bg-gray-300 text-gray-400"
                      : isDark
                        ? "bg-gradient-to-br from-green-900 to-green-800 text-green-300 hover:from-green-800 hover:to-green-700"
                        : "bg-gradient-to-br from-green-200 to-green-300 text-green-600 hover:from-green-300 hover:to-green-400"
                  } cursor-${!onIncrement || deckCount >= 4 ? "not-allowed" : "pointer"} shadow-md transition-all duration-200`}
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div
          className={`px-4 py-2 ${isDark ? "bg-gray-900/90 border-gray-800" : "bg-gray-100/90 border-gray-200"} border-t flex justify-between items-center`}
        >
          <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            カードID: <span className={`${isDark ? "text-gray-300" : "text-gray-700"} font-mono`}>{card.id}</span>
          </div>
          {card.illustrator && (
            <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              イラスト:{" "}
              <span className={`${isDark ? "text-gray-300" : "text-gray-700"} italic`}>{card.illustrator}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
