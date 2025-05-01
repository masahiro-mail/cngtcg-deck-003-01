"use client"

import { useState } from "react"
import { Minus, Plus } from "lucide-react"
import type { Card } from "@/types/card"
import CardComponent from "./card"

interface SwipeableCardProps {
  card: Card
  count: number
  onIncrement: () => void
  onDecrement: () => void
  onClick: () => void
}

export default function SwipeableCard({ card, count, onIncrement, onDecrement, onClick }: SwipeableCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative flex flex-col items-center mb-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setTimeout(() => setIsHovered(false), 1000)}
    >
      <div onClick={onClick} className="cursor-pointer w-full flex justify-center">
        <CardComponent card={card} isFaceUp={true} />
      </div>

      {/* カード枚数表示と増減ボタン - 下部のみに表示、カードの中央に配置 */}
      <div
        className="absolute bottom-0 flex items-center justify-between bg-gray-800 dark:bg-gray-900 text-white p-1 rounded-b-md"
        style={{ width: "90%", maxWidth: "120px" }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDecrement()
          }}
          disabled={count === 0}
          className={`flex items-center justify-center w-8 h-8 rounded-full ${
            count === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-700"
          }`}
        >
          <Minus size={16} />
        </button>
        <span className="text-sm font-medium">{count}</span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onIncrement()
          }}
          disabled={count >= 4}
          className={`flex items-center justify-center w-8 h-8 rounded-full ${
            count >= 4 ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-700"
          }`}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}
