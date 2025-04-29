"use client"

import { useState } from "react"
import type { Card } from "@/types/card"
import CardComponent from "./card"
import CardModal from "./card-modal"
import { Shuffle } from "lucide-react"

interface CardDeckProps {
  cards: Card[]
}

export default function CardDeck({ cards }: CardDeckProps) {
  const [revealedCards, setRevealedCards] = useState<Card[]>([])
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [remainingCards, setRemainingCards] = useState<Card[]>(cards)

  const handleDeckClick = () => {
    if (remainingCards.length === 0) return

    // デッキから一番上のカードを取り出す
    const nextCard = remainingCards[0]
    const newRemainingCards = remainingCards.slice(1)

    // 表示されたカードリストに追加
    setRevealedCards([...revealedCards, nextCard])
    setRemainingCards(newRemainingCards)
  }

  const handleCardClick = (card: Card) => {
    setSelectedCard(card)
  }

  const closeModal = () => {
    setSelectedCard(null)
  }

  const shuffleDeck = () => {
    // デッキをシャッフル
    const allCards = [...revealedCards, ...remainingCards]
    const shuffled = [...allCards].sort(() => Math.random() - 0.5)

    setRevealedCards([])
    setRemainingCards(shuffled)
  }

  return (
    <div className="flex flex-col items-center">
      {/* 表示されたカード */}
      {revealedCards.length > 0 && (
        <div className="mb-8 w-full">
          <h2 className="text-xl font-semibold mb-4 text-center">表示されたカード</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center">
            {revealedCards.map((card, index) => (
              <div key={`${card.id}-${index}`} onClick={() => handleCardClick(card)} className="cursor-pointer">
                <CardComponent card={card} isFaceUp={true} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* デッキ */}
      <div className="mt-8 flex flex-col items-center">
        {remainingCards.length > 0 ? (
          <div className="flex flex-col items-center">
            <div className="relative cursor-pointer mb-4" onClick={handleDeckClick}>
              <div className="relative">
                {/* デッキの重なり効果 */}
                {[...Array(Math.min(5, remainingCards.length))].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-lg border-2 border-gray-300 bg-gradient-to-br from-indigo-600 to-purple-700 shadow-md"
                    style={{
                      width: "120px",
                      height: "168px",
                      top: `${-i * 2}px`,
                      left: `${-i * 2}px`,
                      zIndex: -i,
                    }}
                  />
                ))}

                {/* 一番上のカード */}
                <div className="relative z-10">
                  <CardComponent card={remainingCards[0]} isFaceUp={false} />
                </div>
              </div>
              <p className="text-center mt-2 font-medium">残り{remainingCards.length}枚（タップしてカードを引く）</p>
            </div>

            <button
              onClick={shuffleDeck}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <Shuffle size={16} />
              デッキをシャッフル
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-medium mb-4">デッキは空です</p>
            <button
              onClick={shuffleDeck}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <Shuffle size={16} />
              カードを全てデッキに戻す
            </button>
          </div>
        )}
      </div>

      {/* カード拡大モーダル */}
      {selectedCard && <CardModal card={selectedCard} onClose={closeModal} />}
    </div>
  )
}
