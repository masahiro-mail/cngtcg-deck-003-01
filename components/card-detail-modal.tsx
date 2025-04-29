"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { GameCard } from "@/types/game-card"

interface CardDetailModalProps {
  card: GameCard | null
  isOpen: boolean
  onClose: () => void
}

export default function CardDetailModal({ card, isOpen, onClose }: CardDetailModalProps) {
  if (!card) return null

  // カードタイプに基づいたヘッダー色を取得
  const getHeaderColor = () => {
    if (card.type === "ユニット") {
      switch (card.color) {
        case "blue":
          return "bg-blue-600 text-white"
        case "red":
          return "bg-red-600 text-white"
        case "yellow":
          return "bg-yellow-600 text-white"
        case "green":
          return "bg-green-600 text-white"
        default:
          return "bg-gray-600 text-white"
      }
    } else if (card.type === "イベント") {
      return "bg-purple-600 text-white"
    } else if (card.type === "サポーター") {
      return "bg-teal-600 text-white"
    } else if (card.type === "reiki") {
      return "bg-gray-400 text-white" // レイキカードは表示しない
    }

    return "bg-gray-600 text-white"
  }

  // カードの色に基づいた背景色を取得
  const getCardBgColor = () => {
    switch (card.color) {
      case "blue":
        return "bg-blue-100"
      case "red":
        return "bg-red-100"
      case "yellow":
        return "bg-yellow-100"
      case "green":
        return "bg-green-100"
      default:
        return "bg-gray-100"
    }
  }

  // レイキカードの場合は表示しない
  if (card.type === "reiki") {
    return null
  }

  // レアリティのバッジ表示部分を修正
  const rarityBadgeClass =
    {
      C: "bg-gray-200 text-gray-800",
      R: "bg-blue-200 text-blue-800",
      RR: "bg-purple-200 text-purple-800",
      RRR: "bg-yellow-200 text-yellow-800",
      P: "bg-pink-200 text-pink-800",
    }[card.rarity] || "bg-gray-200 text-gray-800"

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className={`${getHeaderColor()} p-3 rounded-t-lg flex items-center`}>
            <span className="bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center mr-3 shadow-sm font-bold text-xl">
              {card.cost}
            </span>
            <div className="flex flex-col">
              <span>{card.name}</span>
              <div className="flex text-xs space-x-2">
                <span className="bg-white/20 px-2 py-0.5 rounded">色コスト: {card.colorCost || 0}</span>
                <span className="bg-white/20 px-2 py-0.5 rounded">無色コスト: {card.genericCost || 0}</span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* カード詳細モーダルにもスクロール機能を追加 */}
        <div className="p-4 bg-gray-50 rounded-b-lg max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-6">
            {/* カード画像 */}
            <div className="flex justify-center">
              <div
                className={`w-40 h-56 rounded-lg border-2 border-gray-300 overflow-hidden ${getCardBgColor()} flex items-center justify-center`}
              >
                <div className="text-center p-4">
                  <h3 className="font-bold">{card.name}</h3>
                  <p className="text-sm mt-2">{card.type}</p>
                  {card.faction && <p className="text-xs mt-2 text-gray-600">{card.faction}</p>}
                </div>
              </div>
            </div>

            {/* カード詳細 */}
            <div className="flex-1 space-y-4">
              {/* カードタイプ */}
              <div className="bg-gray-100 p-3 rounded-lg shadow-sm">
                <div className="text-lg font-bold text-gray-800">{card.type}</div>
              </div>

              {/* BP・SP情報（あれば表示） */}
              {(card.bp || card.sp) && (
                <div className="flex space-x-2">
                  {card.bp && (
                    <div className="bg-blue-100 p-2 rounded-lg shadow-sm flex-1">
                      <div className="text-sm font-medium text-blue-700">BP</div>
                      <div className="text-lg font-bold text-blue-800">{card.bp}</div>
                    </div>
                  )}
                  {card.sp && (
                    <div className="bg-red-100 p-2 rounded-lg shadow-sm flex-1">
                      <div className="text-sm font-medium text-red-700">SP</div>
                      <div className="text-lg font-bold text-red-800">{card.sp}</div>
                    </div>
                  )}
                </div>
              )}

              {/* レアリティ */}
              <div className={`${rarityBadgeClass} p-2 rounded-lg shadow-sm`}>
                <div className="text-sm font-medium">レアリティ</div>
                <div className="text-lg font-bold">{card.rarity}</div>
              </div>

              {/* 派閥情報 */}
              {card.faction && (
                <div className="bg-purple-100 p-3 rounded-lg shadow-sm">
                  <div className="text-sm font-medium text-purple-700 mb-1">派閥</div>
                  <div className="text-lg font-semibold text-purple-900">{card.faction}</div>
                </div>
              )}
            </div>
          </div>

          {/* 能力と説明 */}
          <div className="mt-6 space-y-4">
            {card.ability && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 shadow-sm">
                <h3 className="text-lg font-bold text-purple-800 mb-2">能力</h3>
                <p className="text-base text-purple-900">{card.ability}</p>
              </div>
            )}

            {card.description && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-2">フレーバーテキスト</h3>
                <p className="text-base text-gray-700">{card.description}</p>
              </div>
            )}
          </div>

          <div className="mt-4 text-right text-xs text-gray-500">カードID: {card.id}</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
