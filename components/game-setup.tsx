"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Info, AlertCircle, User, Bot } from "lucide-react"
import type { Card as CardType } from "@/types/card"
import { cards } from "@/data/cards"

// デッキIDからデッキを復元する関数
const loadDeckById = (deckId: string): CardType[] => {
  // ローカルストレージからデッキを取得
  const savedDecks = JSON.parse(localStorage.getItem("cnpDecks") || "{}")
  const deckData = savedDecks[deckId]

  if (!deckData) {
    // デッキが見つからない場合はランダムなデッキを生成
    console.warn(`Deck with ID ${deckId} not found, generating random deck`)
    return generateRandomDeck()
  }

  return deckData.cards
    .map((cardId: string) => {
      const card = cards.find((c) => c.id === cardId)
      if (!card) {
        console.warn(`Card with ID ${cardId} not found`)
        return null
      }
      return card
    })
    .filter((card): card is CardType => card !== null)
}

// ランダムなデッキを生成する関数
const generateRandomDeck = (): CardType[] => {
  const shuffledCards = [...cards].sort(() => Math.random() - 0.5)
  return shuffledCards.slice(0, 50)
}

// レイキカードを生成する関数
const createReikiCard = (color: string, index: number): CardType => {
  return {
    id: `reiki-${color}-${index}`,
    name: `レイキ/${color === "red" ? "赤" : color === "blue" ? "青" : color === "yellow" ? "黄" : "緑"}`,
    type: "ユニット",
    color: color as "blue" | "red" | "yellow" | "green",
    cost: 0,
    description: "レイキカード",
  }
}

interface GameSetupProps {
  onGameStart: (gameConfig: {
    opponentType: string
    deck: CardType[]
    reikiDeck: CardType[]
    initialHand: CardType[]
    gaugeCards: CardType[]
    remainingDeck: CardType[]
  }) => void
}

export default function GameSetup({ onGameStart }: GameSetupProps) {
  const [step, setStep] = useState<number>(1)
  const [opponentType, setOpponentType] = useState<string>("human")
  const [deckId, setDeckId] = useState<string>("")
  const [deck, setDeck] = useState<CardType[]>([])
  const [reikiColors, setReikiColors] = useState<{
    blue: number
    red: number
    yellow: number
    green: number
  }>({
    blue: 4,
    red: 4,
    yellow: 4,
    green: 3,
  })
  const [initialHand, setInitialHand] = useState<CardType[]>([])
  const [selectedCardsForMulligan, setSelectedCardsForMulligan] = useState<number[]>([])
  const [error, setError] = useState<string>("")

  // レイキデッキの合計枚数を計算
  const totalReikiCards = Object.values(reikiColors).reduce((sum, count) => sum + count, 0)

  // レイキカラーの増減処理
  const handleReikiColorChange = (color: string, increment: boolean) => {
    if (increment && totalReikiCards >= 15) return
    if (!increment && reikiColors[color as keyof typeof reikiColors] <= 0) return

    setReikiColors((prev) => ({
      ...prev,
      [color]: prev[color as keyof typeof reikiColors] + (increment ? 1 : -1),
    }))
  }

  // デッキIDからデッキをロードする
  const loadDeck = () => {
    try {
      const loadedDeck = loadDeckById(deckId.trim() || Math.random().toString(36).substring(2, 10))
      if (loadedDeck.length !== 50) {
        setError("デッキは50枚である必要があります")
        return
      }
      setDeck(loadedDeck)
      setError("")
      setStep(3)
    } catch (err) {
      setError("デッキの読み込みに失敗しました")
      console.error(err)
    }
  }

  // 初期手札を生成する
  const generateInitialHand = () => {
    if (deck.length !== 50) {
      setError("デッキは50枚である必要があります")
      return
    }

    // デッキをシャッフル
    const shuffledDeck = [...deck].sort(() => Math.random() - 0.5)

    // 最初の5枚を初期手札として取得
    const hand = shuffledDeck.slice(0, 5)
    setInitialHand(hand)
    setStep(4)
  }

  // マリガン（手札交換）の処理
  const handleMulligan = () => {
    if (selectedCardsForMulligan.length === 0) {
      // 交換するカードがない場合はそのまま次のステップへ
      prepareGameStart(
        initialHand,
        deck.filter((card) => !initialHand.includes(card)),
      )
      return
    }

    // 交換するカードを除いた手札
    const keptCards = initialHand.filter((_, index) => !selectedCardsForMulligan.includes(index))

    // デッキから初期手札を除いたカード
    let remainingDeck = deck.filter((card) => !initialHand.includes(card))

    // シャッフル
    remainingDeck = [...remainingDeck].sort(() => Math.random() - 0.5)

    // 新しいカードを引く
    const newCards = remainingDeck.slice(0, selectedCardsForMulligan.length)

    // 残りのデッキ
    const updatedRemainingDeck = remainingDeck.slice(selectedCardsForMulligan.length)

    // 新しい手札
    const newHand = [...keptCards, ...newCards]

    // ゲーム開始準備
    prepareGameStart(newHand, updatedRemainingDeck)
  }

  // ゲーム開始準備
  const prepareGameStart = (hand: CardType[], remainingCards: CardType[]) => {
    // レイキデッキの作成
    const reikiDeck: CardType[] = []
    Object.entries(reikiColors).forEach(([color, count]) => {
      for (let i = 0; i < count; i++) {
        reikiDeck.push(createReikiCard(color, i))
      }
    })

    // レイキデッキをシャッフル
    const shuffledReikiDeck = [...reikiDeck].sort(() => Math.random() - 0.5)

    // 残りのデッキをシャッフル
    const shuffledRemainingDeck = [...remainingCards].sort(() => Math.random() - 0.5)

    // ゲージカード6枚を取得
    const gaugeCards = shuffledRemainingDeck.slice(0, 6)

    // 最終的な残りのデッキ
    const finalRemainingDeck = shuffledRemainingDeck.slice(6)

    // ゲーム開始
    onGameStart({
      opponentType,
      deck: deck,
      reikiDeck: shuffledReikiDeck,
      initialHand: hand,
      gaugeCards: gaugeCards,
      remainingDeck: finalRemainingDeck,
    })
  }

  // マリガン用のカード選択処理
  const toggleCardSelection = (index: number) => {
    if (selectedCardsForMulligan.includes(index)) {
      setSelectedCardsForMulligan(selectedCardsForMulligan.filter((i) => i !== index))
    } else {
      setSelectedCardsForMulligan([...selectedCardsForMulligan, index])
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center mb-2">ゲームセットアップ</h2>
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 text-sm">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? "bg-blue-500" : "bg-gray-200"}`}></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              2
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? "bg-blue-500" : "bg-gray-200"}`}></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              3
            </div>
            <div className={`w-16 h-1 ${step >= 4 ? "bg-blue-500" : "bg-gray-200"}`}></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 4 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              4
            </div>
          </div>
        </div>
      </div>

      {/* ステップ1: 対戦相手の選択 */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>対戦相手の選択</CardTitle>
            <CardDescription>対戦相手のタイプを選択してください</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={opponentType} onValueChange={setOpponentType} className="space-y-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="human" id="human" />
                <Label htmlFor="human" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-5 w-5" />
                  対人戦（vs 人）
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="com" id="com" disabled />
                <Label htmlFor="com" className="flex items-center cursor-not-allowed text-gray-400">
                  <Bot className="mr-2 h-5 w-5" />
                  対COM戦（作成中）
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={() => setStep(2)}>次へ</Button>
          </CardFooter>
        </Card>
      )}

      {/* ステップ2: デッキIDの入力 */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>デッキの選択</CardTitle>
            <CardDescription>デッキビルダーで作成したデッキIDを入力してください</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="デッキID（例: R1a2b3c4d）"
                  value={deckId}
                  onChange={(e) => setDeckId(e.target.value)}
                />
                <Button onClick={loadDeck}>読込</Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>エラー</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>ヒント</AlertTitle>
                <AlertDescription>
                  デッキビルダーでデッキを作成し、保存すると発行されるデッキIDを入力してください。
                  IDがない場合は空欄のまま「読込」ボタンを押すとランダムなデッキが生成されます。
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              戻る
            </Button>
            <Button onClick={loadDeck}>次へ</Button>
          </CardFooter>
        </Card>
      )}

      {/* ステップ3: レイキデッキの構築 */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>レイキデッキの構築</CardTitle>
            <CardDescription>レイキデッキ15枚を4色の中から選んでください</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-100 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-blue-800 flex items-center">
                      <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                      青レイキ
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleReikiColorChange("blue", false)}
                        disabled={reikiColors.blue <= 0}
                      >
                        -
                      </Button>
                      <span className="w-6 text-center">{reikiColors.blue}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleReikiColorChange("blue", true)}
                        disabled={totalReikiCards >= 15}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-blue-700">水属性のレイキ</div>
                </div>

                <div className="bg-red-100 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-red-800 flex items-center">
                      <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                      赤レイキ
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleReikiColorChange("red", false)}
                        disabled={reikiColors.red <= 0}
                      >
                        -
                      </Button>
                      <span className="w-6 text-center">{reikiColors.red}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleReikiColorChange("red", true)}
                        disabled={totalReikiCards >= 15}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-red-700">火属性のレイキ</div>
                </div>

                <div className="bg-yellow-100 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-yellow-800 flex items-center">
                      <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                      黄レイキ
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleReikiColorChange("yellow", false)}
                        disabled={reikiColors.yellow <= 0}
                      >
                        -
                      </Button>
                      <span className="w-6 text-center">{reikiColors.yellow}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleReikiColorChange("yellow", true)}
                        disabled={totalReikiCards >= 15}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-yellow-700">光属性のレイキ</div>
                </div>

                <div className="bg-green-100 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-green-800 flex items-center">
                      <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                      緑レイキ
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleReikiColorChange("green", false)}
                        disabled={reikiColors.green <= 0}
                      >
                        -
                      </Button>
                      <span className="w-6 text-center">{reikiColors.green}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleReikiColorChange("green", true)}
                        disabled={totalReikiCards >= 15}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-green-700">森属性のレイキ</div>
                </div>
              </div>

              <div className="flex justify-center items-center">
                <div className={`text-xl font-bold ${totalReikiCards === 15 ? "text-green-600" : "text-red-600"}`}>
                  合計: {totalReikiCards} / 15枚
                </div>
              </div>

              {totalReikiCards !== 15 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>注意</AlertTitle>
                  <AlertDescription>レイキデッキは合計15枚である必要があります</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              戻る
            </Button>
            <Button onClick={generateInitialHand} disabled={totalReikiCards !== 15}>
              次へ
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* ステップ4: マリガン（手札交換） */}
      {step === 4 && initialHand.length === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>マリガン（手札交換）</CardTitle>
            <CardDescription>交換したいカードを選択してください</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap justify-center gap-4">
                {initialHand.map((card, index) => (
                  <div
                    key={`${card.id}-${index}`}
                    className={`relative cursor-pointer ${selectedCardsForMulligan.includes(index) ? "opacity-50" : ""}`}
                    onClick={() => toggleCardSelection(index)}
                  >
                    <div className="w-[120px] h-[168px] border-2 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex flex-col">
                      <div className="px-1 py-0.5 flex justify-between items-center bg-white bg-opacity-80">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold text-xs">{card.cost}</span>
                        </div>
                        <div className="text-[10px] font-medium px-1 rounded bg-white shadow-sm">{card.type}</div>
                      </div>
                      <div className="flex-grow p-1 flex items-center justify-center">
                        <div className="text-center font-bold text-sm">{card.name}</div>
                      </div>
                      <div className="bg-white bg-opacity-80 p-1 text-xs">
                        {card.type === "ユニット" && (
                          <div className="flex justify-between">
                            {card.bp && <div>BP: {card.bp}</div>}
                            {card.ap && <div>AP: {card.ap}</div>}
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedCardsForMulligan.includes(index) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">交換</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>マリガンについて</AlertTitle>
                <AlertDescription>
                  交換したいカードをクリックして選択してください。選択したカードは新しいカードと交換されます。
                  交換しない場合はそのまま「確定」ボタンを押してください。
                </AlertDescription>
              </Alert>

              <div className="flex justify-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <div className="font-semibold text-blue-800 mb-1">選択中のカード</div>
                  <div className="text-center text-xl font-bold">{selectedCardsForMulligan.length} / 5枚</div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)}>
              戻る
            </Button>
            <Button onClick={handleMulligan}>確定</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
