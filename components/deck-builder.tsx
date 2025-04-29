"use client"

import { useState, useEffect } from "react"
import type { Card } from "@/types/card"
import CardComponent from "./card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shuffle } from "lucide-react"

interface DeckBuilderProps {
  cards: Card[]
}

export default function DeckBuilder({ cards }: DeckBuilderProps) {
  const [selectedColor, setSelectedColor] = useState<"blue" | "red" | "yellow" | "green">("blue")
  const [deck, setDeck] = useState<Card[]>([])
  const [filteredCards, setFilteredCards] = useState<Card[]>([])

  // 色に基づいてカードをフィルタリング
  useEffect(() => {
    const filtered = cards.filter((card) => card.color === selectedColor)
    setFilteredCards(filtered)
  }, [selectedColor, cards])

  // 50枚のデッキを自動生成
  const generateDeck = () => {
    const colorCards = cards.filter((card) => card.color === selectedColor)

    // デッキの構成比率を決定
    // ユニット：60%、イベント：30%、サポーター：10%
    const unitCards = colorCards.filter((card) => card.type === "ユニット")
    const eventCards = colorCards.filter((card) => card.type === "イベント")
    const supporterCards = colorCards.filter((card) => card.type === "サポーター")

    // コスト別の分布を考慮
    // 低コスト(1-3)：50%、中コスト(4-6)：40%、高コスト(7-9)：10%
    const lowCostUnits = unitCards.filter((card) => card.cost <= 3)
    const midCostUnits = unitCards.filter((card) => card.cost > 3 && card.cost <= 6)
    const highCostUnits = unitCards.filter((card) => card.cost > 6)

    // デッキを構築
    let newDeck: Card[] = []

    // ユニットカードを追加（30枚）
    const addCards = (cards: Card[], count: number) => {
      const shuffled = [...cards].sort(() => Math.random() - 0.5)
      return shuffled.slice(0, Math.min(count, shuffled.length))
    }

    newDeck = [
      ...addCards(lowCostUnits, 15),
      ...addCards(midCostUnits, 12),
      ...addCards(highCostUnits, 3),
      ...addCards(eventCards, 15),
      ...addCards(supporterCards, 5),
    ]

    // 50枚になるようにシャッフルして切り詰める
    newDeck = newDeck.sort(() => Math.random() - 0.5).slice(0, 50)

    setDeck(newDeck)
  }

  // デッキをシャッフル
  const shuffleDeck = () => {
    setDeck([...deck].sort(() => Math.random() - 0.5))
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">デッキビルダー</h2>

      {/* 色選択タブ */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">デッキの色を選択</h3>
        <Tabs defaultValue="blue" onValueChange={(value) => setSelectedColor(value as any)}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger
              value="blue"
              className="bg-blue-100 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              青（水/CNP）
            </TabsTrigger>
            <TabsTrigger
              value="red"
              className="bg-red-100 data-[state=active]:bg-red-500 data-[state=active]:text-white"
            >
              赤（火/カグツチ）
            </TabsTrigger>
            <TabsTrigger
              value="yellow"
              className="bg-yellow-100 data-[state=active]:bg-yellow-500 data-[state=active]:text-white"
            >
              黄（光/ミッドガン）
            </TabsTrigger>
            <TabsTrigger
              value="green"
              className="bg-green-100 data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              緑（森/メテオラス）
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blue" className="p-4 bg-blue-50 rounded-lg">
            <p>
              青属性は水や氷の力を操り、カードドローや相手ユニットの退場に優れています。リーリーやルナなどのCNPキャラクターが多く含まれます。
            </p>
          </TabsContent>
          <TabsContent value="red" className="p-4 bg-red-50 rounded-lg">
            <p>
              赤属性は火や岩の力を操り、高いBP値と攻撃力に優れています。ナルカミやマカミなどのCNPキャラクターや、カグツチの住人が含まれます。
            </p>
          </TabsContent>
          <TabsContent value="yellow" className="p-4 bg-yellow-50 rounded-lg">
            <p>
              黄属性は光や電気の力を操り、手札操作やコスト軽減に優れています。トワやセツナなどのCNPキャラクターや、ミッドガンの住人が含まれます。
            </p>
          </TabsContent>
          <TabsContent value="green" className="p-4 bg-green-50 rounded-lg">
            <p>
              緑属性は森や自然の力を操り、ユニットの移動やゲージ操作に優れています。オロチやヤーマなどのCNPキャラクターや、メテオラスの住人が含まれます。
            </p>
          </TabsContent>
        </Tabs>
      </div>

      {/* デッキ生成ボタン */}
      <div className="flex justify-center gap-4 mb-8">
        <Button onClick={generateDeck} className="bg-indigo-600 hover:bg-indigo-700" size="lg">
          {selectedColor}色の50枚デッキを自動生成
        </Button>

        {deck.length > 0 && (
          <Button onClick={shuffleDeck} variant="outline" size="lg" className="flex items-center gap-2">
            <Shuffle size={16} />
            デッキをシャッフル
          </Button>
        )}
      </div>

      {/* 生成されたデッキ */}
      {deck.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">生成されたデッキ（{deck.length}枚）</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
            {deck.map((card, index) => (
              <div key={`${card.id}-${index}`} className="cursor-pointer">
                <CardComponent card={card} isFaceUp={true} />
              </div>
            ))}
          </div>

          {/* デッキ統計 */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-semibold mb-2">タイプ別</h4>
              <div className="flex justify-between">
                <span>ユニット:</span>
                <span>{deck.filter((card) => card.type === "ユニット").length}枚</span>
              </div>
              <div className="flex justify-between">
                <span>イベント:</span>
                <span>{deck.filter((card) => card.type === "イベント").length}枚</span>
              </div>
              <div className="flex justify-between">
                <span>サポーター:</span>
                <span>{deck.filter((card) => card.type === "サポーター").length}枚</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-semibold mb-2">コスト別</h4>
              <div className="flex justify-between">
                <span>低コスト(1-3):</span>
                <span>{deck.filter((card) => card.cost <= 3).length}枚</span>
              </div>
              <div className="flex justify-between">
                <span>中コスト(4-6):</span>
                <span>{deck.filter((card) => card.cost > 3 && card.cost <= 6).length}枚</span>
              </div>
              <div className="flex justify-between">
                <span>高コスト(7-9):</span>
                <span>{deck.filter((card) => card.cost > 6).length}枚</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-semibold mb-2">平均コスト</h4>
              <div className="text-xl font-bold text-center">
                {(deck.reduce((sum, card) => sum + card.cost, 0) / deck.length).toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 利用可能なカード一覧 */}
      <div>
        <h3 className="text-xl font-semibold mb-4">
          {selectedColor}色の利用可能なカード（{filteredCards.length}枚）
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
          {filteredCards.map((card) => (
            <div key={card.id} className="cursor-pointer">
              <CardComponent card={card} isFaceUp={true} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
