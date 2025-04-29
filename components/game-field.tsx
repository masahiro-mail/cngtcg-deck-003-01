"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { cards } from "@/data/cards"
import { Shuffle, RotateCcw, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CardDetailModal from "./card-detail-modal"

// カードタイプの定義
const CARD_TYPES = {
  REIKI: "reiki",
  UNIT: "ユニット",
  EVENT: "イベント",
  SUPPORTER: "サポーター",
}

// カードの色の定義
const CARD_COLORS = {
  RED: "red",
  BLUE: "blue",
  GREEN: "green",
  YELLOW: "yellow",
}

// ゲーム用のカード型定義
interface GameCard {
  id: string
  name: string
  type: string
  color: string
  cost: number
  bp?: string
  ap?: string
  ability?: string
  description?: string
  faction?: string
  illustrator?: string
  imageUrl?: string
  isRevealed: boolean
  isRested: boolean
}

// カードIDから画像ファイル名を取得する関数
const getCardImageUrl = (id: string) => {
  if (id) {
    // BT1-005 から 5 を取得
    const match = id.match(/\d+$/)
    if (match) {
      const cardNumber = Number.parseInt(match[0], 10)

      // パラレル・スーパーパラレルカードの処理
      if (id.endsWith("p")) {
        return `/card-images/${cardNumber}p.png`
      } else if (id.endsWith("sp")) {
        return `/card-images/${cardNumber}sp.png`
      }
      return `/card-images/${cardNumber}.png`
    }

    // レイキカードの画像処理
    if (id.startsWith("reiki-")) {
      const color = id.split("-")[1]
      return `/card-images/reiki-${color}.png`
    }
  }

  // デフォルトのプレースホルダー
  return "/placeholder.svg?height=120&width=80"
}

// カードコンポーネント
const Card = ({
  card,
  isRevealed,
  onClick,
  onDoubleClick,
  isSelected,
  isRested,
  disableRest = false,
  cardBackStyle = "back01.png",
  forceReveal = false, // アタックエリア用に強制的に表示するフラグ
  forceHide = false, // トラッシュエリア用に強制的に裏面表示するフラグ
}: {
  card: GameCard
  isRevealed: boolean
  onClick: () => void
  onDoubleClick?: () => void
  isSelected: boolean
  isRested: boolean
  disableRest?: boolean
  cardBackStyle?: string
  forceReveal?: boolean
  forceHide?: boolean
}) => {
  const [showDetail, setShowDetail] = useState(false)

  // カードのスタイルを決定
  const cardStyle: React.CSSProperties = {}
  let bgColorClass = "bg-gray-200"
  let borderColorClass = "border-gray-300"

  // 表示状態の決定（forceRevealとforceHideを考慮）
  const displayRevealed = forceReveal ? true : forceHide ? false : isRevealed

  if (!displayRevealed) {
    // カード裏面のスタイル
    bgColorClass = "bg-white"
    borderColorClass = "border-gray-300"
  } else {
    // カード表面のスタイル
    if (card.type === CARD_TYPES.REIKI) {
      switch (card.color) {
        case CARD_COLORS.RED:
          bgColorClass = "bg-red-100"
          borderColorClass = "border-red-500"
          break
        case CARD_COLORS.BLUE:
          bgColorClass = "bg-blue-100"
          borderColorClass = "border-blue-500"
          break
        case CARD_COLORS.GREEN:
          bgColorClass = "bg-green-100"
          borderColorClass = "border-green-500"
          break
        case CARD_COLORS.YELLOW:
          bgColorClass = "bg-yellow-100"
          borderColorClass = "border-yellow-500"
          break
      }
    } else {
      // ユニットやイベントカードのスタイル
      switch (card.color) {
        case CARD_COLORS.RED:
          borderColorClass = "border-red-500"
          bgColorClass = "bg-red-50"
          break
        case CARD_COLORS.BLUE:
          borderColorClass = "border-blue-500"
          bgColorClass = "bg-blue-50"
          break
        case CARD_COLORS.GREEN:
          borderColorClass = "border-green-500"
          bgColorClass = "bg-green-50"
          break
        case CARD_COLORS.YELLOW:
          borderColorClass = "border-yellow-500"
          bgColorClass = "bg-yellow-50"
          break
      }
    }
  }

  // 選択状態のスタイル
  if (isSelected) {
    borderColorClass = "border-blue-500"
    cardStyle.boxShadow = "0 0 0 4px #3b82f6, 0 2px 4px rgba(0, 0, 0, 0.2)"
    cardStyle.transform = "scale(1.05)"
  }

  // 横向き（レスト状態）か縦向き（アクティブ状態）かを設定
  const rotation = !disableRest && isRested ? "rotate-90" : ""

  return (
    <div
      className={`relative w-20 h-28 m-1 rounded-lg border-2 ${borderColorClass} ${bgColorClass} ${rotation} flex flex-col items-center justify-between cursor-pointer shadow-md transition-all`}
      style={cardStyle}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setShowDetail(true)}
      onMouseLeave={() => setShowDetail(false)}
    >
      {displayRevealed ? (
        // カード表面
        <>
          {card.type !== CARD_TYPES.REIKI && (
            <div className="w-full bg-black bg-opacity-20 text-white text-xs font-bold p-1 rounded-t-lg">
              {card.cost && <span>コスト: {card.cost}</span>}
            </div>
          )}
          <div className="flex-1 w-full flex items-center justify-center p-1">
            <div className="relative w-full h-full rounded-md overflow-hidden">
              <img
                src={card.id ? getCardImageUrl(card.id) : card.imageUrl || "/placeholder.svg?height=120&width=80"}
                alt={card.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.log(`Image load error for ${card.id}`, e)
                  ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=120&width=80"
                }}
              />
            </div>
          </div>
          {card.type !== CARD_TYPES.REIKI && (
            <div className="w-full bg-black bg-opacity-20 text-white text-xs p-1 rounded-b-lg">
              <div className="font-bold truncate">{card.name}</div>
              {card.type === "イベント" || card.type === "サポーター" ? (
                <div className="text-xs">{card.type}</div>
              ) : (
                card.bp && <div className="text-xs">BP: {card.bp}</div>
              )}
            </div>
          )}
        </>
      ) : (
        // カード裏面
        <div className="w-full h-full rounded-lg overflow-hidden">
          <img
            src={card.type === CARD_TYPES.REIKI ? "/card-images/reiki-back.png" : `/card-images/${cardBackStyle}`}
            alt="カード裏面"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* カード詳細ポップアップ */}
      {showDetail && displayRevealed && card.type !== CARD_TYPES.REIKI && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-xl p-4 w-64 border-2 border-gray-300"
          style={{
            transform: "translate(-50%, -100%)",
            top: "0",
            left: "50%",
            marginTop: "-10px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-lg font-bold mb-2">{card.name}</div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="text-sm">
              タイプ: <span className="font-semibold">{card.type}</span>
            </div>
            <div className="text-sm">
              コスト: <span className="font-semibold">{card.cost}</span>
            </div>
            {card.bp && (
              <div className="text-sm">
                BP: <span className="font-semibold">{card.bp}</span>
              </div>
            )}
            {card.ap && (
              <div className="text-sm">
                AP: <span className="font-semibold">{card.ap}</span>
              </div>
            )}
          </div>
          {card.ability && (
            <div className="mb-2">
              <div className="text-sm font-semibold">能力:</div>
              <div className="text-xs bg-gray-100 p-2 rounded">{card.ability}</div>
            </div>
          )}
          {card.description && (
            <div>
              <div className="text-sm font-semibold">説明:</div>
              <div className="text-xs italic">{card.description}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// エリアコンポーネント
const Area = ({
  id,
  name,
  cards,
  onCardClick,
  onAreaClick,
  selectedCard,
  cardLimit,
  className,
  disableCardRest = false,
  cardBackStyle = "back01.png",
  compact = false,
  isTrash = false,
  isAttack = false,
  isGauge = false,
}: {
  id: string
  name: string
  cards: GameCard[]
  onCardClick: (areaId: string, cardIndex: number) => void
  onAreaClick: (id: string) => void
  selectedCard: { areaId: string; cardIndex: number } | null
  cardLimit?: number
  className?: string
  disableCardRest?: boolean
  cardBackStyle?: string
  compact?: boolean
  isTrash?: boolean
  isAttack?: boolean
  isGauge?: boolean
}) => {
  const canAddCard = !cardLimit || cards.length < cardLimit

  // トラッシュエリアやコンパクト表示の場合、カードを重ねて表示
  const renderCards = () => {
    if (isTrash || (compact && !isGauge)) {
      if (cards.length === 0) {
        return <div className="flex justify-center items-center h-28 text-gray-400">なし</div>
      }

      return (
        <div className="relative h-28 w-20 mx-auto">
          {/* 枚数表示 */}
          {cards.length > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-10">
              {cards.length}
            </div>
          )}

          {/* 重なったカード表示 */}
          {cards.slice(0, Math.min(3, cards.length)).map((_, index) => (
            <div
              key={index}
              className="absolute rounded-lg border-2 border-gray-300 bg-white shadow-sm"
              style={{
                width: "80px",
                height: "112px",
                top: `${index * 2}px`,
                left: `${index * 2}px`,
                zIndex: index,
              }}
              onClick={(e) => {
                e.stopPropagation()
                onCardClick(id, cards.length - 1)
              }}
            >
              {index === 0 && (
                <img
                  src={
                    isTrash
                      ? `/card-images/${cardBackStyle}`
                      : isAttack
                        ? getCardImageUrl(cards[cards.length - 1].id)
                        : `/card-images/${cardBackStyle}`
                  }
                  alt={isTrash ? "カード裏面" : isAttack ? cards[cards.length - 1].name : "カード裏面"}
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
            </div>
          ))}
        </div>
      )
    }

    // ゲージエリアの場合、横に並べて表示
    if (isGauge) {
      if (cards.length === 0) {
        return <div className="flex justify-center items-center h-28 text-gray-400">なし</div>
      }

      return (
        <div className="flex justify-center space-x-2">
          {cards.map((card, index) => (
            <div
              key={index}
              className="w-20 h-28 rounded-lg border-2 border-gray-300 bg-white shadow-sm overflow-hidden"
              onClick={(e) => {
                e.stopPropagation()
                onCardClick(id, index)
              }}
            >
              <img src={`/card-images/${cardBackStyle}`} alt="カード裏面" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )
    }

    // 通常表示
    return (
      <div className="flex flex-wrap justify-center p-2 min-h-32 items-start">
        {cards.map((card, index) => (
          <Card
            key={`${id}-card-${index}`}
            card={card}
            isRevealed={card.isRevealed}
            isRested={card.isRested}
            onClick={(e) => {
              e.stopPropagation()
              onCardClick(id, index)
            }}
            onDoubleClick={(e) => {
              e.stopPropagation()
              onCardClick(id, index)
              setTimeout(() => onCardClick(id, index), 10)
            }}
            isSelected={selectedCard && selectedCard.areaId === id && selectedCard.cardIndex === index}
            disableRest={disableCardRest}
            cardBackStyle={cardBackStyle}
            forceReveal={isAttack}
            forceHide={isTrash}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`border-2 rounded-lg ${selectedCard && canAddCard ? "border-blue-500 bg-blue-100" : "border-gray-300"} ${className || ""}`}
      onClick={() => onAreaClick(id)}
    >
      <div className="text-center font-bold p-1 bg-gray-200 rounded-t-lg">{name}</div>
      {renderCards()}
    </div>
  )
}

// レイキエリアコンポーネント（カードを使わない表示）
const ReikiArea = ({
  id,
  name,
  cards,
  onCardClick,
  onAreaClick,
  selectedCard,
  className,
}: {
  id: string
  name: string
  cards: GameCard[]
  onCardClick: (areaId: string, cardIndex: number) => void
  onAreaClick: (id: string) => void
  selectedCard: { areaId: string; cardIndex: number } | null
  className?: string
}) => {
  // 色ごとにアクティブ/使用済みレイキをカウント
  const countReiki = () => {
    const counts = {
      red: { active: 0, used: 0 },
      blue: { active: 0, used: 0 },
      yellow: { active: 0, used: 0 },
      green: { active: 0, used: 0 },
    }

    cards.forEach((card) => {
      const colorKey = card.color as keyof typeof counts
      if (colorKey in counts) {
        if (card.isRested) {
          counts[colorKey].used++
        } else {
          counts[colorKey].active++
        }
      }
    })

    return counts
  }

  const reikiCounts = countReiki()

  // レイキカードを追加する関数
  const addReikiCard = (color: string) => {
    // 既存のレイキカードから同じ色のアクティブなカードを探す
    const activeReikiIndex = cards.findIndex((card) => card.color === color && !card.isRested)

    if (activeReikiIndex !== -1) {
      // アクティブなレイキカードを使用済みにする
      onCardClick(id, activeReikiIndex)
    }
  }

  return (
    <div
      className={`border-2 rounded-lg ${selectedCard ? "border-blue-500 bg-blue-100" : "border-gray-300"} ${className || ""}`}
      onClick={() => onAreaClick(id)}
    >
      <div className="text-center font-bold p-1 bg-gray-200 rounded-t-lg">{name}</div>
      <div className="p-2">
        <div className="grid grid-cols-2 gap-2">
          {/* アクティブレイキ */}
          <div className="border rounded-lg p-2 bg-green-50 border-green-300">
            <h3 className="text-center font-bold text-green-700 mb-1 text-sm">アクティブ</h3>
            <div className="flex flex-wrap gap-1 justify-center">
              {reikiCounts.red.active > 0 && (
                <button
                  className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xs"
                  onClick={() => addReikiCard("red")}
                >
                  {reikiCounts.red.active}
                </button>
              )}
              {reikiCounts.blue.active > 0 && (
                <button
                  className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs"
                  onClick={() => addReikiCard("blue")}
                >
                  {reikiCounts.blue.active}
                </button>
              )}
              {reikiCounts.yellow.active > 0 && (
                <button
                  className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-xs"
                  onClick={() => addReikiCard("yellow")}
                >
                  {reikiCounts.yellow.active}
                </button>
              )}
              {reikiCounts.green.active > 0 && (
                <button
                  className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs"
                  onClick={() => addReikiCard("green")}
                >
                  {reikiCounts.green.active}
                </button>
              )}
              {Object.values(reikiCounts).every((c) => c.active === 0) && (
                <div className="text-center text-gray-400 text-xs">なし</div>
              )}
            </div>
          </div>

          {/* 使用済みレイキ */}
          <div className="border rounded-lg p-2 bg-red-50 border-red-300">
            <h3 className="text-center font-bold text-red-700 mb-1 text-sm">使用済</h3>
            <div className="flex flex-wrap gap-1 justify-center">
              {reikiCounts.red.used > 0 && (
                <div className="w-6 h-6 rounded-full bg-red-300 flex items-center justify-center text-white font-bold text-xs">
                  {reikiCounts.red.used}
                </div>
              )}
              {reikiCounts.blue.used > 0 && (
                <div className="w-6 h-6 rounded-full bg-blue-300 flex items-center justify-center text-white font-bold text-xs">
                  {reikiCounts.blue.used}
                </div>
              )}
              {reikiCounts.yellow.used > 0 && (
                <div className="w-6 h-6 rounded-full bg-yellow-300 flex items-center justify-center text-white font-bold text-xs">
                  {reikiCounts.yellow.used}
                </div>
              )}
              {reikiCounts.green.used > 0 && (
                <div className="w-6 h-6 rounded-full bg-green-300 flex items-center justify-center text-white font-bold text-xs">
                  {reikiCounts.green.used}
                </div>
              )}
              {Object.values(reikiCounts).every((c) => c.used === 0) && (
                <div className="text-center text-gray-400 text-xs">なし</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ゲームフィールドコンポーネント
const GameField = ({
  initialConfig = null,
  onRestart = () => {},
}: {
  initialConfig?: {
    opponentType: string
    deck: GameCard[]
    reikiDeck: GameCard[]
    initialHand: GameCard[]
    gaugeCards: GameCard[]
    remainingDeck: GameCard[]
  } | null
  onRestart?: () => void
}) => {
  // 状態管理
  const [deck, setDeck] = useState<GameCard[]>([])
  const [reikiDeck, setReikiDeck] = useState<GameCard[]>([])
  const [hand, setHand] = useState<GameCard[]>([])
  const [unitArea, setUnitArea] = useState<GameCard[]>([])
  const [supporterArea, setSupporterArea] = useState<GameCard[]>([])
  const [attackArea1, setAttackArea1] = useState<GameCard[]>([])
  const [attackArea2, setAttackArea2] = useState<GameCard[]>([])
  const [attackArea3, setAttackArea3] = useState<GameCard[]>([])
  const [assistArea1, setAssistArea1] = useState<GameCard[]>([]) // スケダチエリア1
  const [assistArea2, setAssistArea2] = useState<GameCard[]>([]) // スケダチエリア2
  const [assistArea3, setAssistArea3] = useState<GameCard[]>([]) // スケダチエリア3
  const [gaugeArea1, setGaugeArea1] = useState<GameCard[]>([])
  const [gaugeArea2, setGaugeArea2] = useState<GameCard[]>([])
  const [gaugeArea3, setGaugeArea3] = useState<GameCard[]>([])
  const [reikiArea, setReikiArea] = useState<GameCard[]>([])
  const [trashArea, setTrashArea] = useState<GameCard[]>([])

  // 選択中のカード情報
  const [selectedCard, setSelectedCard] = useState<{ areaId: string; cardIndex: number } | null>(null)

  // 選択中のデッキの色
  const [selectedColor, setSelectedColor] = useState<string>(CARD_COLORS.RED)

  // デッキの裏面スタイル
  const [cardBackStyle, setCardBackStyle] = useState<string>("back01.png")

  // ゲームが開始されたかどうか
  const [gameStarted, setGameStarted] = useState(false)

  // ゲームログ
  const [gameLogs, setGameLogs] = useState<string[]>([])

  // 最後にクリックしたカードの情報
  const [lastClickedCard, setLastClickedCard] = useState<{ areaId: string; cardIndex: number; time: number } | null>(
    null,
  )

  // カード詳細モーダル
  const [detailCard, setDetailCard] = useState<GameCard | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // カードデータの初期化
  useEffect(() => {
    // ランダムなカード裏面の選択
    const backStyles = ["back01.png", "back02.png", "back03.png"]
    const randomBackStyle = backStyles[Math.floor(Math.random() * backStyles.length)]
    setCardBackStyle(randomBackStyle)

    // 初期化時はゲーム開始状態をリセット
    if (!initialConfig) {
      setGameStarted(false)
      return
    }

    // 初期設定がある場合は直接ゲームを開始
    if (initialConfig) {
      // レイキデッキをシャッフル
      const shuffledReikiDeck = shuffleArray(
        initialConfig.reikiDeck.map((card) => ({
          ...card,
          isRevealed: false,
          isRested: false,
        })),
      )
      setReikiDeck(shuffledReikiDeck)

      // 手札の設定
      setHand(
        initialConfig.initialHand.map((card) => ({
          ...card,
          isRevealed: true,
          isRested: false,
        })),
      )

      // 残りのデッキの設定
      setDeck(
        initialConfig.remainingDeck.map((card) => ({
          ...card,
          isRevealed: false,
          isRested: false,
        })),
      )

      // ゲージエリアの初期化
      if (initialConfig.gaugeCards && initialConfig.gaugeCards.length >= 6) {
        const gaugeCards = initialConfig.gaugeCards.map((card) => ({
          ...card,
          isRevealed: false,
          isRested: false,
        }))

        setGaugeArea1(gaugeCards.slice(0, 2))
        setGaugeArea2(gaugeCards.slice(2, 4))
        setGaugeArea3(gaugeCards.slice(4, 6))
      }

      // その他のエリアをクリア
      setUnitArea([])
      setSupporterArea([])
      setAttackArea1([])
      setAttackArea2([])
      setAttackArea3([])
      setAssistArea1([])
      setAssistArea2([])
      setAssistArea3([])
      setReikiArea([])
      setTrashArea([])

      // 選択をリセット
      setSelectedCard(null)

      // ゲーム開始状態にする
      setGameStarted(true)

      // ログに追加
      setGameLogs(["ゲームを開始しました"])
    }
  }, [initialConfig])

  // ゲームの初期化
  const initializeGame = (deckColor: string) => {
    // デッキの作成
    const newDeck = createDeck(50, deckColor)
    setDeck(newDeck)

    // レイキデッキの作成（デッキと同じ色）
    const newReikiDeck = createReikiDeck(15, deckColor)
    setReikiDeck(newReikiDeck)

    // 手札の初期化
    const initialHand = drawCards(newDeck, 5)
    setHand(initialHand.drawnCards)
    setDeck(initialHand.remainingDeck)

    // ゲージエリアの初期化（裏向きで）
    const gauge1 = drawCards(initialHand.remainingDeck, 2)
    setGaugeArea1(gauge1.drawnCards.map((card) => ({ ...card, isRevealed: false })))

    const gauge2 = drawCards(gauge1.remainingDeck, 2)
    setGaugeArea2(gauge2.drawnCards.map((card) => ({ ...card, isRevealed: false })))

    const gauge3 = drawCards(gauge2.remainingDeck, 2)
    setGaugeArea3(gauge3.drawnCards.map((card) => ({ ...card, isRevealed: false })))

    setDeck(gauge3.remainingDeck)

    // 選択をリセット
    setSelectedCard(null)

    // その他のエリアをクリア
    setUnitArea([])
    setSupporterArea([])
    setAttackArea1([])
    setAttackArea2([])
    setAttackArea3([])
    setAssistArea1([])
    setAssistArea2([])
    setAssistArea3([])
    setReikiArea([])
    setTrashArea([])

    // ゲーム開始状態にする
    setGameStarted(true)

    // ログに追加
    setGameLogs([`${deckColor}色のデッキでゲームを開始しました`])
  }

  // 特定の色のデッキを作成
  const createDeck = (count: number, deckColor: string) => {
    // 既存のカードデータから指定された色のカードをフィルタリング
    const filteredCards = cards.filter((card) => card.color === deckColor)

    // デッキを作成
    const deck: GameCard[] = []

    // カードが足りない場合は繰り返し使用
    for (let i = 0; i < count; i++) {
      const cardIndex = i % filteredCards.length
      const originalCard = filteredCards[cardIndex]

      deck.push({
        ...originalCard,
        isRevealed: false,
        isRested: false,
      })
    }

    // デッキをシャッフル
    return shuffleArray(deck)
  }

  // 配列をシャッフルする関数
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  // レイキデッキの作成（特定の色のみ）
  const createReikiDeck = (count: number, deckColor: string) => {
    const deck: GameCard[] = []

    // レイキの色分布を決定
    const colorDistribution = {
      red: Math.floor(count * 0.3),
      blue: Math.floor(count * 0.3),
      yellow: Math.floor(count * 0.2),
      green: Math.floor(count * 0.2),
    }

    // 残りを主要色に追加
    const total = Object.values(colorDistribution).reduce((sum, c) => sum + c, 0)
    colorDistribution[deckColor as keyof typeof colorDistribution] += count - total

    // 各色のレイキを作成
    Object.entries(colorDistribution).forEach(([color, amount]) => {
      for (let i = 0; i < amount; i++) {
        deck.push({
          id: `reiki-${color}-${i}`,
          name: `レイキ/${color === "red" ? "赤" : color === "blue" ? "青" : color === "yellow" ? "黄" : "緑"}`,
          type: CARD_TYPES.REIKI,
          color: color as "red" | "blue" | "yellow" | "green",
          cost: 0,
          isRevealed: false,
          isRested: false,
        })
      }
    })

    return shuffleArray(deck)
  }

  // カードをドローする
  const drawCards = (sourceDeck: GameCard[], count: number) => {
    if (sourceDeck.length === 0) return { drawnCards: [], remainingDeck: [] }

    const maxCount = Math.min(count, sourceDeck.length)
    const newDeck = [...sourceDeck]
    const drawnCards: GameCard[] = []

    for (let i = 0; i < maxCount; i++) {
      if (newDeck.length > 0) {
        const card = { ...newDeck.pop()!, isRevealed: true }
        drawnCards.push(card)
      }
    }

    return { drawnCards, remainingDeck: newDeck }
  }

  // エリアIDから表示名を取得する関数
  const getAreaName = (areaId: string): string => {
    switch (areaId) {
      case "hand":
        return "手札"
      case "unitArea":
        return "ユニットエリア"
      case "supporterArea":
        return "サポーターエリア"
      case "attackArea1":
        return "アタックエリア1"
      case "attackArea2":
        return "アタックエリア2"
      case "attackArea3":
        return "アタックエリア3"
      case "assistArea1":
        return "スケダチエリア1"
      case "assistArea2":
        return "スケダチエリア2"
      case "assistArea3":
        return "スケダチエリア3"
      case "gaugeArea1":
        return "ゲージエリア1"
      case "gaugeArea2":
        return "ゲージエリア2"
      case "gaugeArea3":
        return "ゲージエリア3"
      case "reikiArea":
        return "レイキエリア"
      case "trashArea":
        return "トラッシュエリア"
      case "deck":
        return "デッキ"
      case "reikiDeck":
        return "レイキデッキ"
      default:
        return areaId
    }
  }

  // カードをクリックした時の処理
  const handleCardClick = (areaId: string, cardIndex: number) => {
    // ダブルクリック処理
    const now = Date.now()
    if (
      lastClickedCard &&
      lastClickedCard.areaId === areaId &&
      lastClickedCard.cardIndex === cardIndex &&
      now - lastClickedCard.time < 300
    ) {
      // ダブルクリック検出
      // レイキエリアの使用済みカードはダブルクリックでも状態変更しない
      if (areaId === "reikiArea" && reikiArea[cardIndex].isRested) {
        setLastClickedCard(null)
        return
      }

      // 手札エリアはダブルクリックでも状態変更しない
      if (areaId === "hand") {
        setLastClickedCard(null)
        return
      }

      // カードのレスト/アクティブ状態を切り替え
      let updatedCards: GameCard[]
      let setStateFunction: React.Dispatch<React.SetStateAction<GameCard[]>>
      let areaName = ""

      // エリアに応じた状態とセッター関数を取得
      switch (areaId) {
        case "unitArea":
          updatedCards = [...unitArea]
          setStateFunction = setUnitArea
          areaName = "ユニットエリア"
          break
        case "supporterArea":
          updatedCards = [...supporterArea]
          setStateFunction = setSupporterArea
          areaName = "サポーターエリア"
          break
        case "attackArea1":
          updatedCards = [...attackArea1]
          setStateFunction = setAttackArea1
          areaName = "アタックエリア1"
          break
        case "attackArea2":
          updatedCards = [...attackArea2]
          setStateFunction = setAttackArea2
          areaName = "アタックエリア2"
          break
        case "attackArea3":
          updatedCards = [...attackArea3]
          setStateFunction = setAttackArea3
          areaName = "アタックエリア3"
          break
        case "assistArea1":
          updatedCards = [...assistArea1]
          setStateFunction = setAssistArea1
          areaName = "スケダチエリア1"
          break
        case "assistArea2":
          updatedCards = [...assistArea2]
          setStateFunction = setAssistArea2
          areaName = "スケダチエリア2"
          break
        case "assistArea3":
          updatedCards = [...assistArea3]
          setStateFunction = setAssistArea3
          areaName = "スケダチエリア3"
          break
        case "reikiArea":
          updatedCards = [...reikiArea]
          setStateFunction = setReikiArea
          areaName = "レイキエリア"
          break
        default:
          setLastClickedCard(null)
          return
      }

      // カードをレスト状態にする（アクティブ→レストの一方向のみ）
      if (!updatedCards[cardIndex].isRested) {
        updatedCards[cardIndex] = {
          ...updatedCards[cardIndex],
          isRested: true,
        }

        // ログに追加
        const cardName = updatedCards[cardIndex].name
        const newState = "レスト状態"
        setGameLogs((prev) => [`${cardName}を${areaName}で${newState}に変更しました`, ...prev])

        // 状態を更新
        setStateFunction(updatedCards)
      }

      setSelectedCard(null)
      setLastClickedCard(null)
      return
    }

    // 通常のクリック処理
    setLastClickedCard({ areaId, cardIndex, time: now })

    // デッキやゲージエリアの特殊ケース処理
    if (areaId === "deck") {
      // デッキからカードを引く
      if (deck.length > 0) {
        const newCard = { ...deck[deck.length - 1], isRevealed: true }
        setHand([...hand, newCard])
        setDeck(deck.slice(0, -1))

        // ログに追加
        setGameLogs((prev) => [`${newCard.name}をデッキから手札に加えました`, ...prev])
      }
      return
    }

    if (areaId === "reikiDeck") {
      // レイキデッキからカードをレイキエリアに配置
      if (reikiDeck.length > 0) {
        const newCard = { ...reikiDeck[reikiDeck.length - 1], isRevealed: true }
        setReikiArea([...reikiArea, newCard])
        setReikiDeck(reikiDeck.slice(0, -1))

        // ログに追加
        setGameLogs((prev) => [`レイキをレイキデッキからレイキエリアに加えました`, ...prev])
      }
      return
    }

    // ゲージエリアのカードをクリックした場合、手札に追加
    if (areaId === "gaugeArea1") {
      if (gaugeArea1.length > cardIndex) {
        const card = { ...gaugeArea1[cardIndex], isRevealed: true }
        setHand([...hand, card])
        setGaugeArea1(gaugeArea1.filter((_, i) => i !== cardIndex))

        // ログに追加
        setGameLogs((prev) => [`${card.name}をゲージエリア1から手札に加えました`, ...prev])
      }
      return
    }

    if (areaId === "gaugeArea2") {
      if (gaugeArea2.length > cardIndex) {
        const card = { ...gaugeArea2[cardIndex], isRevealed: true }
        setHand([...hand, card])
        setGaugeArea2(gaugeArea2.filter((_, i) => i !== cardIndex))

        // ログに追加
        setGameLogs((prev) => [`${card.name}をゲージエリア2から手札に加えました`, ...prev])
      }
      return
    }

    if (areaId === "gaugeArea3") {
      if (gaugeArea3.length > cardIndex) {
        const card = { ...gaugeArea3[cardIndex], isRevealed: true }
        setHand([...hand, card])
        setGaugeArea3(gaugeArea3.filter((_, i) => i !== cardIndex))

        // ログに追加
        setGameLogs((prev) => [`${card.name}をゲージエリア3から手札に加えました`, ...prev])
      }
      return
    }

    // レイキエリアの特殊処理（ワンタップで使用済みに）
    if (areaId === "reikiArea") {
      const updatedReikiCards = [...reikiArea]
      // アクティブなレイキのみレスト状態に変更可能（使用済みレイキはアクティブにできない）
      if (!updatedReikiCards[cardIndex].isRested) {
        updatedReikiCards[cardIndex] = {
          ...updatedReikiCards[cardIndex],
          isRested: true,
        }
        setReikiArea(updatedReikiCards)

        // ログに追加
        setGameLogs((prev) => [`レイキを使用しました`, ...prev])
      } else {
        // 既にレスト状態のカードを選択
        setSelectedCard({
          areaId,
          cardIndex,
        })
      }
      return
    }

    // 選択中のカードと同じカードをクリックした場合
    if (selectedCard && selectedCard.areaId === areaId && selectedCard.cardIndex === cardIndex) {
      // 手札エリアの場合は回転しない
      if (areaId === "hand") {
        setSelectedCard(null)
        return
      }

      // カードのレスト/アクティブ状態を切り替え
      let updatedCards: GameCard[]
      let setStateFunction: React.Dispatch<React.SetStateAction<GameCard[]>>

      // エリアに応じた状態とセッター関数を取得
      switch (areaId) {
        case "unitArea":
          updatedCards = [...unitArea]
          setStateFunction = setUnitArea
          break
        case "supporterArea":
          updatedCards = [...supporterArea]
          setStateFunction = setSupporterArea
          break
        case "attackArea1":
          updatedCards = [...attackArea1]
          setStateFunction = setAttackArea1
          break
        case "attackArea2":
          updatedCards = [...attackArea2]
          setStateFunction = setAttackArea2
          break
        case "attackArea3":
          updatedCards = [...attackArea3]
          setStateFunction = setAttackArea3
          break
        case "assistArea1":
          updatedCards = [...assistArea1]
          setStateFunction = setAssistArea1
          break
        case "assistArea2":
          updatedCards = [...assistArea2]
          setStateFunction = setAssistArea2
          break
        case "assistArea3":
          updatedCards = [...assistArea3]
          setStateFunction = setAssistArea3
          break
        default:
          setSelectedCard(null)
          return
      }

      // カードをレスト状態にする（アクティブ→レストの一方向のみ）
      if (!updatedCards[cardIndex].isRested) {
        updatedCards[cardIndex] = {
          ...updatedCards[cardIndex],
          isRested: true,
        }

        // ログに追加
        const cardName = updatedCards[cardIndex].name
        const areaName = getAreaName(areaId)
        setGameLogs((prev) => [`${cardName}を${areaName}でレスト状態に変更しました`, ...prev])

        // 状態を更新
        setStateFunction(updatedCards)
      }

      setSelectedCard(null)
    } else {
      // エリアとカードインデックスを保存
      setSelectedCard({
        areaId,
        cardIndex,
      })
    }
  }

  // エリアをクリックした時の処理
  const handleAreaClick = (targetAreaId: string) => {
    // 選択中のカードがない場合は何もしない
    if (!selectedCard) return

    // 同じエリア内での移動は無視
    if (selectedCard.areaId === targetAreaId) {
      setSelectedCard(null)
      return
    }

    // スケダチエリアへの移動制限
    if (targetAreaId === "assistArea1" && attackArea1.length === 0) {
      setSelectedCard(null)
      return
    }
    if (targetAreaId === "assistArea2" && attackArea2.length === 0) {
      setSelectedCard(null)
      return
    }
    if (targetAreaId === "assistArea3" && attackArea3.length === 0) {
      setSelectedCard(null)
      return
    }

    // 各エリアの状態を取得
    let sourceCards: GameCard[] = []
    let targetCards: GameCard[] = []
    let setSourceCards: React.Dispatch<React.SetStateAction<GameCard[]>> = () => {}
    let setTargetCards: React.Dispatch<React.SetStateAction<GameCard[]>> = () => {}

    switch (selectedCard.areaId) {
      case "hand":
        sourceCards = hand
        setSourceCards = setHand
        break
      case "unitArea":
        sourceCards = unitArea
        setSourceCards = setUnitArea
        break
      case "supporterArea":
        sourceCards = supporterArea
        setSourceCards = setSupporterArea
        break
      case "attackArea1":
        sourceCards = attackArea1
        setSourceCards = setAttackArea1
        break
      case "attackArea2":
        sourceCards = attackArea2
        setSourceCards = setAttackArea2
        break
      case "attackArea3":
        sourceCards = attackArea3
        setSourceCards = setAttackArea3
        break
      case "assistArea1":
        sourceCards = assistArea1
        setSourceCards = setAssistArea1
        break
      case "assistArea2":
        sourceCards = assistArea2
        setSourceCards = setAssistArea2
        break
      case "assistArea3":
        sourceCards = assistArea3
        setSourceCards = setAssistArea3
        break
      case "reikiArea":
        sourceCards = reikiArea
        setSourceCards = setReikiArea
        break
      default:
        setSelectedCard(null)
        return
    }

    switch (targetAreaId) {
      case "hand":
        targetCards = hand
        setTargetCards = setHand
        break
      case "unitArea":
        targetCards = unitArea
        setTargetCards = setUnitArea
        break
      case "supporterArea":
        targetCards = supporterArea
        setTargetCards = setSupporterArea
        break
      case "attackArea1":
        targetCards = attackArea1
        setTargetCards = setAttackArea1
        // アタックエリアは1枚のみ
        if (attackArea1.length >= 1) {
          setSelectedCard(null)
          return
        }
        break
      case "attackArea2":
        targetCards = attackArea2
        setTargetCards = setAttackArea2
        // アタックエリアは1枚のみ
        if (attackArea2.length >= 1) {
          setSelectedCard(null)
          return
        }
        break
      case "attackArea3":
        targetCards = attackArea3
        setTargetCards = setAttackArea3
        // アタックエリアは1枚のみ
        if (attackArea3.length >= 1) {
          setSelectedCard(null)
          return
        }
        break
      case "assistArea1":
        targetCards = assistArea1
        setTargetCards = setAssistArea1
        break
      case "assistArea2":
        targetCards = assistArea2
        setTargetCards = setAssistArea2
        break
      case "assistArea3":
        targetCards = assistArea3
        setTargetCards = setAssistArea3
        break
      case "reikiArea":
        targetCards = reikiArea
        setTargetCards = setReikiArea
        break
      case "trashArea":
        targetCards = trashArea
        setTargetCards = setTrashArea
        break
      default:
        setSelectedCard(null)
        return
    }

    // カード移動
    const card = { ...sourceCards[selectedCard.cardIndex], isRevealed: true }

    // 手札からの移動の場合、レスト状態をリセット
    if (selectedCard.areaId === "hand") {
      card.isRested = false
    }

    // ユニットエリアからアタックエリアへの移動の場合、自動的にレスト状態にする
    if (
      selectedCard.areaId === "unitArea" &&
      (targetAreaId === "attackArea1" || targetAreaId === "attackArea2" || targetAreaId === "attackArea3")
    ) {
      card.isRested = true
    }

    setTargetCards([...targetCards, card])
    setSourceCards(sourceCards.filter((_, i) => i !== selectedCard.cardIndex))

    // 選択解除
    setSelectedCard(null)

    // ログに追加
    const cardName = card.name
    const sourceAreaName = getAreaName(selectedCard.areaId)
    const targetAreaName = getAreaName(targetAreaId)
    setGameLogs((prev) => [`${cardName}を${sourceAreaName}から${targetAreaName}に移動しました`, ...prev])
  }

  // 手札カードのクリック処理
  const handleHandCardClick = (cardIndex: number) => {
    if (selectedCard && selectedCard.areaId === "hand" && selectedCard.cardIndex === cardIndex) {
      // 同じカードを再度クリックすると選択解除
      setSelectedCard(null)
    } else {
      // カードを選択
      setSelectedCard({
        areaId: "hand",
        cardIndex,
      })
    }
  }

  // アクティブフェイズ - すべてのレスト状態のカードをアクティブにする
  const activateAllCards = () => {
    // すべてのエリアのレスト状態のカードをアクティブにする
    setUnitArea(unitArea.map((card) => ({ ...card, isRested: false })))
    setSupporterArea(supporterArea.map((card) => ({ ...card, isRested: false })))
    setAttackArea1(attackArea1.map((card) => ({ ...card, isRested: false })))
    setAttackArea2(attackArea2.map((card) => ({ ...card, isRested: false })))
    setAttackArea3(attackArea3.map((card) => ({ ...card, isRested: false })))
    setAssistArea1(assistArea1.map((card) => ({ ...card, isRested: false })))
    setAssistArea2(assistArea2.map((card) => ({ ...card, isRested: false })))
    setAssistArea3(assistArea3.map((card) => ({ ...card, isRested: false })))
    setReikiArea(reikiArea.map((card) => ({ ...card, isRested: false })))

    // ログに追加
    setGameLogs((prev) => ["アクティブフェイズ: すべてのカードをアクティブ状態にしました", ...prev])
  }

  // 色選択の処理
  const handleColorChange = (color: string) => {
    setSelectedColor(color)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* ゲーム開始前の色選択画面 */}
      {!gameStarted ? (
        <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4 text-center">デッキの色を選択してゲームを開始</h3>
          <Tabs defaultValue={selectedColor} onValueChange={handleColorChange}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger
                value={CARD_COLORS.RED}
                className="bg-red-100 data-[state=active]:bg-red-500 data-[state=active]:text-white"
              >
                赤（火/カグツチ）
              </TabsTrigger>
              <TabsTrigger
                value={CARD_COLORS.BLUE}
                className="bg-blue-100 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                青（水/CNP）
              </TabsTrigger>
              <TabsTrigger
                value={CARD_COLORS.YELLOW}
                className="bg-yellow-100 data-[state=active]:bg-yellow-500 data-[state=active]:text-white"
              >
                黄（光/ミッドガン）
              </TabsTrigger>
              <TabsTrigger
                value={CARD_COLORS.GREEN}
                className="bg-green-100 data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                緑（森/メテオラス）
              </TabsTrigger>
            </TabsList>

            <TabsContent value={CARD_COLORS.RED} className="p-4 bg-red-50 rounded-lg">
              <p>
                赤属性は火や岩の力を操り、高いBP値と攻撃力に優れています。ナルカミやマカミなどのCNPキャラクターや、カグツチの住人が含まれます。
              </p>
            </TabsContent>
            <TabsContent value={CARD_COLORS.BLUE} className="p-4 bg-blue-50 rounded-lg">
              <p>
                青属性は水や氷の力を操り、カードドローや相手ユニットの退場に優れています。リーリーやルナなどのCNPキャラクターが多く含まれます。
              </p>
            </TabsContent>
            <TabsContent value={CARD_COLORS.YELLOW} className="p-4 bg-yellow-50 rounded-lg">
              <p>
                黄属性は光や電気の力を操り、手札操作やコスト軽減に優れています。トワやセツナなどのCNPキャラクターや、ミッドガンの住人が含まれます。
              </p>
            </TabsContent>
            <TabsContent value={CARD_COLORS.GREEN} className="p-4 bg-green-50 rounded-lg">
              <p>
                緑属性は森や自然の力を操り、ユニットの移動やゲージ操作に優れています。オロチやヤーマなどのCNPキャラクターや、メテオラスの住人が含まれます。
              </p>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg"
              onClick={() => initializeGame(selectedColor)}
            >
              <Play className="mr-2 h-5 w-5" />
              ゲームを開始する
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-12 gap-4 mb-4">
            {/* 上部：拠点エリア */}
            <div className="col-span-12">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-200 p-2 rounded-lg">
                  <div className="text-center font-bold mb-2">拠点1</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Area
                      id="attackArea1"
                      name="アタックエリア"
                      cards={attackArea1}
                      onCardClick={handleCardClick}
                      onAreaClick={handleAreaClick}
                      selectedCard={selectedCard}
                      cardLimit={1}
                      cardBackStyle={cardBackStyle}
                      isAttack={true}
                    />
                    <Area
                      id="assistArea1"
                      name="スケダチエリア"
                      cards={assistArea1}
                      onCardClick={handleCardClick}
                      onAreaClick={handleAreaClick}
                      selectedCard={selectedCard}
                      cardBackStyle={cardBackStyle}
                    />
                  </div>
                  <div className="mt-2">
                    <Area
                      id="gaugeArea1"
                      name="ゲージエリア"
                      cards={gaugeArea1}
                      onCardClick={handleCardClick}
                      onAreaClick={handleAreaClick}
                      selectedCard={selectedCard}
                      cardLimit={2}
                      cardBackStyle={cardBackStyle}
                      isGauge={true}
                    />
                  </div>
                </div>

                <div className="bg-gray-200 p-2 rounded-lg">
                  <div className="text-center font-bold mb-2">拠点2</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Area
                      id="attackArea2"
                      name="アタックエリア"
                      cards={attackArea2}
                      onCardClick={handleCardClick}
                      onAreaClick={handleAreaClick}
                      selectedCard={selectedCard}
                      cardLimit={1}
                      cardBackStyle={cardBackStyle}
                      isAttack={true}
                    />
                    <Area
                      id="assistArea2"
                      name="スケダチエリア"
                      cards={assistArea2}
                      onCardClick={handleCardClick}
                      onAreaClick={handleAreaClick}
                      selectedCard={selectedCard}
                      cardBackStyle={cardBackStyle}
                    />
                  </div>
                  <div className="mt-2">
                    <Area
                      id="gaugeArea2"
                      name="ゲージエリア"
                      cards={gaugeArea2}
                      onCardClick={handleCardClick}
                      onAreaClick={handleAreaClick}
                      selectedCard={selectedCard}
                      cardLimit={2}
                      cardBackStyle={cardBackStyle}
                      isGauge={true}
                    />
                  </div>
                </div>

                <div className="bg-gray-200 p-2 rounded-lg">
                  <div className="text-center font-bold mb-2">拠点3</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Area
                      id="attackArea3"
                      name="アタックエリア"
                      cards={attackArea3}
                      onCardClick={handleCardClick}
                      onAreaClick={handleAreaClick}
                      selectedCard={selectedCard}
                      cardLimit={1}
                      cardBackStyle={cardBackStyle}
                      isAttack={true}
                    />
                    <Area
                      id="assistArea3"
                      name="スケダチエリア"
                      cards={assistArea3}
                      onCardClick={handleCardClick}
                      onAreaClick={handleAreaClick}
                      selectedCard={selectedCard}
                      cardBackStyle={cardBackStyle}
                    />
                  </div>
                  <div className="mt-2">
                    <Area
                      id="gaugeArea3"
                      name="ゲージエリア"
                      cards={gaugeArea3}
                      onCardClick={handleCardClick}
                      onAreaClick={handleAreaClick}
                      selectedCard={selectedCard}
                      cardLimit={2}
                      cardBackStyle={cardBackStyle}
                      isGauge={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 mb-4">
            {/* 中央：サポーター、ユニット、デッキエリア */}
            <div className="col-span-3">
              <Area
                id="supporterArea"
                name="サポーターエリア / イベントエリア"
                cards={supporterArea}
                onCardClick={handleCardClick}
                onAreaClick={handleAreaClick}
                selectedCard={selectedCard}
                className="h-64"
                cardBackStyle={cardBackStyle}
              />
            </div>

            <div className="col-span-6">
              <Area
                id="unitArea"
                name="ユニットエリア"
                cards={unitArea}
                onCardClick={handleCardClick}
                onAreaClick={handleAreaClick}
                selectedCard={selectedCard}
                className="h-64"
                cardBackStyle={cardBackStyle}
              />
            </div>

            <div className="col-span-3">
              <div className="grid grid-cols-1 gap-4 h-64">
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-1">
                    <Area
                      id="trashArea"
                      name="トラッシュエリア"
                      cards={trashArea}
                      onCardClick={handleCardClick}
                      onAreaClick={handleAreaClick}
                      selectedCard={selectedCard}
                      isTrash={true}
                      compact={true}
                      cardBackStyle={cardBackStyle}
                      className="h-full"
                    />
                  </div>
                  <div className="col-span-1">
                    <div
                      onClick={() => handleCardClick("deck", 0)}
                      className="cursor-pointer bg-blue-100 rounded-lg border-2 border-gray-300 flex flex-col items-center justify-center h-full"
                    >
                      <div className="text-center font-bold mb-2">デッキ置き場</div>
                      <div className="relative">
                        <div className="w-16 h-24 bg-white rounded-lg shadow-md flex items-center justify-center overflow-hidden">
                          <img
                            src={`/card-images/${cardBackStyle}`}
                            alt="デッキ裏面"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {deck.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-1">
                    <ReikiArea
                      id="reikiArea"
                      name="レイキエリア"
                      cards={reikiArea}
                      onCardClick={handleCardClick}
                      onAreaClick={handleAreaClick}
                      selectedCard={selectedCard}
                      className="h-full"
                    />
                  </div>
                  <div className="col-span-1">
                    <div
                      onClick={() => handleCardClick("reikiDeck", 0)}
                      className="cursor-pointer bg-red-100 rounded-lg border-2 border-gray-300 flex flex-col items-center justify-center h-full"
                    >
                      <div className="text-center font-bold mb-2">レイキデッキ</div>
                      <div className="relative">
                        <div className="w-16 h-24 bg-white rounded-lg shadow-md flex items-center justify-center overflow-hidden">
                          <img
                            src="/card-images/reiki-back.png"
                            alt="レイキ裏面"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {reikiDeck.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-200 p-4 rounded-lg">
            {/* 手札エリア */}
            <div className="flex justify-between items-center mb-2">
              <div className="font-bold">手札</div>
              <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">{hand.length} 枚</div>
            </div>
            <div className="flex flex-wrap justify-center">
              {hand.map((card, index) => (
                <Card
                  key={`hand-card-${index}`}
                  card={card}
                  isRevealed={true}
                  isRested={false}
                  onClick={() => handleHandCardClick(index)}
                  onDoubleClick={() => {
                    handleHandCardClick(index)
                    setTimeout(() => handleHandCardClick(index), 10)
                  }}
                  isSelected={selectedCard && selectedCard.areaId === "hand" && selectedCard.cardIndex === index}
                  disableRest={true}
                  cardBackStyle={cardBackStyle}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 text-center space-x-2">
            <Button
              className="bg-blue-500 hover:bg-blue-700 text-white"
              onClick={() => {
                setGameStarted(false)
                onRestart()
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              ゲームをリセット
            </Button>

            <Button className="bg-green-500 hover:bg-green-700 text-white" onClick={activateAllCards}>
              <Shuffle className="mr-2 h-4 w-4" />
              アクティブフェイズ
            </Button>

            {selectedCard && (
              <Button className="bg-red-500 hover:bg-red-700 text-white" onClick={() => setSelectedCard(null)}>
                選択解除
              </Button>
            )}
          </div>

          {selectedCard && (
            <div className="mt-2 text-center text-sm text-gray-600">
              カードを選択中です。配置したい場所をクリックするか、同じカードを再度クリックして縦/横向きを切り替えられます。
            </div>
          )}

          {/* ゲームログ */}
          <div className="mt-4 bg-gray-800 text-white p-4 rounded-lg max-h-40 overflow-y-auto">
            <h3 className="text-lg font-bold mb-2">ゲームログ</h3>
            <ul className="space-y-1">
              {gameLogs.map((log, index) => (
                <li key={index} className="text-sm">
                  {log}
                </li>
              ))}
            </ul>
          </div>

          {/* カード詳細モーダル */}
          <CardDetailModal card={detailCard} isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} />
        </>
      )}
    </div>
  )
}

export default GameField
