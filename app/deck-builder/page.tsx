"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { cards } from "@/data/cards"
import CardModal from "@/components/card-modal"
import SwipeableCard from "@/components/swipeable-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Search,
  Filter,
  Save,
  Trash2,
  Upload,
  ArrowUpDown,
  Code,
  Database,
  AlertTriangle,
  Grid,
  List,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import type { Card } from "@/types/card"
import { generateDeckId, decodeDeckId } from "@/utils/deck-id-generator"
import { analyzeDeck, loadDecksFromStorage, getRecommendedDecks } from "@/utils/deck-utils"
import { sortCards } from "@/utils/card-sort"
import SavedDeckItem from "@/components/saved-deck-item"
import DeckStats from "@/components/deck-stats"

// 効果分類の一覧を取得
const getEffectTypes = () => {
  const effectTypes = new Set<string>()
  cards.forEach((card) => {
    if (card.effectType && card.effectType.length > 0) {
      card.effectType.forEach((effect) => effectTypes.add(effect))
    }
  })
  return Array.from(effectTypes).sort()
}

// 収録パックの一覧を取得
const getPacks = () => {
  const packs = new Set<string>()
  cards.forEach((card) => {
    if (card.pack) {
      packs.add(card.pack)
    }
  })
  return Array.from(packs).sort()
}

// レアリティの一覧を取得
const getRarities = () => {
  const rarities = new Set<string>()
  cards.forEach((card) => {
    if (card.rarity) {
      // レアリティをC、R、RR、RRRのみに制限
      if (["C", "R", "RR", "RRR"].includes(card.rarity)) {
        rarities.add(card.rarity)
      }
    }
  })
  return Array.from(rarities).sort()
}

export default function DeckBuilderPage() {
  const [availableCards, setAvailableCards] = useState<Card[]>(cards)
  const [deck, setDeck] = useState<Card[]>([])
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [cardType, setCardType] = useState<string>("all")
  const [cardColor, setCardColor] = useState<string>("all")
  const [cardRarity, setCardRarity] = useState<string>("all")
  const [cardEffectType, setCardEffectType] = useState<string>("all")
  const [cardPack, setCardPack] = useState<string>("all")
  const [deckId, setDeckId] = useState<string>("")
  const [customDeckId, setCustomDeckId] = useState<string>("")
  const [deckName, setDeckName] = useState<string>("")
  const [savedDecks, setSavedDecks] = useState<
    Record<string, { name: string; cards: string[]; createdAt: string; isRecommended?: boolean }>
  >({})
  const [importDeckId, setImportDeckId] = useState<string>("")
  const [cardCounts, setCardCounts] = useState<Record<string, number>>({})
  const [sortBy, setSortBy] = useState<string>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [deckAnalysis, setDeckAnalysis] = useState<string>("")
  const [isDecodedDeck, setIsDecodedDeck] = useState<boolean>(false)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [idError, setIdError] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "cards">("cards")
  const [deckFilter, setDeckFilter] = useState<string>("all")
  const [deckSearchTerm, setDeckSearchTerm] = useState("")
  const [showSavedDecks, setShowSavedDecks] = useState(true)

  // 効果分類、収録パック、レアリティの一覧
  const effectTypes = useMemo(() => getEffectTypes(), [])
  const packs = useMemo(() => getPacks(), [])
  const rarities = useMemo(() => getRarities(), [])

  // カードIDのリストをメモ化
  const allCardIds = useMemo(() => cards.map((card) => card.id), [])

  // ソート順切り替え関数
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  // デッキIDからデッキを復元
  const loadDeckById = (deckId: string): Card[] => {
    // まずローカルストレージから探す
    const savedDecks = loadDecksFromStorage()
    const deckData = savedDecks[deckId]

    if (deckData) {
      // ローカルストレージに存在する場合
      return deckData.cards
        .map((cardId) => {
          const card = cards.find((c) => c.id === cardId)
          if (!card) return null
          return card
        })
        .filter((card): card is Card => card !== null)
    } else {
      // ローカルストレージに存在しない場合、IDからデコードする
      try {
        const cardIds = decodeDeckId(deckId, allCardIds)
        if (cardIds.length === 0) return []

        return cardIds
          .map((cardId) => {
            const card = cards.find((c) => c.id === cardId)
            if (!card) return null
            return card
          })
          .filter((card): card is Card => card !== null)
      } catch (error) {
        console.error("Failed to decode deck ID:", error)
        return []
      }
    }
  }

  // 保存済みデッキを削除する関数
  const deleteSavedDeck = (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // クリックイベントの伝播を停止

    if (confirm(`デッキ「${savedDecks[id]?.name || "Unnamed Deck"}」を削除してもよろしいですか？`)) {
      const updatedDecks = { ...savedDecks }
      delete updatedDecks[id]
      localStorage.setItem("cnpDecks", JSON.stringify(updatedDecks))
      setSavedDecks(updatedDecks)

      // 削除したデッキが現在表示中のデッキの場合、表示をクリア
      if (id === deckId) {
        clearDeck()
      }
    }
  }

  // 保存済みデッキを読み込む
  useEffect(() => {
    const decks = loadDecksFromStorage()

    // 推奨デッキを取得
    const recommendedDecks = getRecommendedDecks(allCardIds)

    // 既存のデッキと公式推奨デッキをマージ
    const mergedDecks = { ...decks }

    // 公式推奨デッキを追加（既存のデッキがある場合は上書きしない）
    Object.entries(recommendedDecks).forEach(([id, deck]) => {
      if (!mergedDecks[id]) {
        mergedDecks[id] = deck
      }
    })

    setSavedDecks(mergedDecks)

    // URLからデッキIDを取得（例: ?deck=abc123）
    const params = new URLSearchParams(window.location.search)
    const urlDeckId = params.get("deck")

    if (urlDeckId) {
      // URLにデッキIDがある場合はそのデッキを読み込む
      loadSavedDeck(urlDeckId)
    } else {
      // 最後に使用したデッキIDをローカルストレージから取得
      const lastUsedDeckId = localStorage.getItem("lastUsedDeckId")
      if (lastUsedDeckId && mergedDecks[lastUsedDeckId]) {
        loadSavedDeck(lastUsedDeckId)
      }
    }
  }, [allCardIds])

  // カードをフィルタリングする関数
  useEffect(() => {
    let result = [...cards]

    // 検索語でフィルタリング
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (card) =>
          card.name.toLowerCase().includes(term) ||
          (card.description && card.description.toLowerCase().includes(term)) ||
          (card.ability && card.ability.toLowerCase().includes(term)) ||
          (card.faction && card.faction.toLowerCase().includes(term)),
      )
    }

    // タイプでフィルタリング
    if (cardType !== "all") {
      result = result.filter((card) => card.type === cardType)
    }

    // 色でフィルタリング
    if (cardColor !== "all") {
      if (cardColor === "deck") {
        // デッキに含まれるカードのみ表示
        const deckCardIds = deck.map((card) => card.id)
        result = result.filter((card) => deckCardIds.includes(card.id))
      } else {
        result = result.filter((card) => card.color === cardColor)
      }
    }

    // レアリティでフィルタリング
    if (cardRarity !== "all") {
      result = result.filter((card) => card.rarity === cardRarity)
    }

    // 効果分類でフィルタリング
    if (cardEffectType !== "all") {
      result = result.filter((card) => card.effectType && card.effectType.includes(cardEffectType))
    }

    // 収録パックでフィルタリング
    if (cardPack !== "all") {
      result = result.filter((card) => card.pack === cardPack)
    }

    // SRをRRRに変換
    result = result.map((card) => {
      if (card.rarity === "SR") {
        return { ...card, rarity: "RRR" }
      }
      return card
    })

    // 外部のソート関数を使用して、フィルタリング後のカードをソート
    const sortedResult = sortCards(result, sortBy, sortOrder)

    // ソート結果を設定
    setAvailableCards(sortedResult)
  }, [searchTerm, cardType, cardColor, cardRarity, cardEffectType, cardPack, sortBy, sortOrder, deck])

  // デッキが変更されたときに分析情報を更新
  useEffect(() => {
    if (deck.length > 0) {
      setDeckAnalysis(analyzeDeck(deck))
    } else {
      setDeckAnalysis("")
    }
  }, [deck])

  const handleCardClick = (card: Card) => {
    setSelectedCard(card)
  }

  const closeModal = () => {
    setSelectedCard(null)
  }

  // カードをデッキに追加する関数
  const addCardToDeck = (card: Card) => {
    // 同じカードは4枚までの制限
    const cardCount = cardCounts[card.id] || 0
    if (cardCount >= 4) {
      return
    }

    // デッキは50枚までの制限を削除
    setDeck([...deck, card])
    setCardCounts({
      ...cardCounts,
      [card.id]: cardCount + 1,
    })
    setSelectedCard(null)
  }

  // カードをデッキから削除する関数
  const removeCardFromDeck = (card: Card) => {
    const cardCount = cardCounts[card.id] || 0
    if (cardCount > 0) {
      const cardIndex = deck.findIndex((c) => c.id === card.id)
      if (cardIndex !== -1) {
        const newDeck = [...deck]
        newDeck.splice(cardIndex, 1)
        setDeck(newDeck)
        setCardCounts({
          ...cardCounts,
          [card.id]: cardCount - 1,
        })
      }
    }
  }

  const clearDeck = () => {
    setDeck([])
    setDeckId("")
    setCustomDeckId("")
    setDeckName("")
    setCardCounts({})
    setDeckAnalysis("")
    setIsDecodedDeck(false)

    // 最後に使用したデッキIDを削除
    localStorage.removeItem("lastUsedDeckId")

    // URLからデッキIDを削除
    const url = new URL(window.location.href)
    url.searchParams.delete("deck")
    window.history.replaceState({}, "", url.toString())
  }

  // openSaveDialogの関数で、デッキ名の設定をしない
  const openSaveDialog = () => {
    // 自動生成されたIDを設定
    const generatedId = generateDeckId(deck.map((card) => card.id))
    setCustomDeckId(generatedId)
    // デッキ名のデフォルト値を設定
    setDeckName("My Deck")
    setIsSaveDialogOpen(true)
  }

  // saveDeckの関数を修正して、50枚未満でも保存可能に
  const saveDeck = () => {
    // 50枚未満の場合は警告を表示するが、保存は可能
    if (deck.length !== 50) {
      const warningMessage =
        deck.length < 50
          ? `デッキは${deck.length}枚です。50枚未満ですが、保存しますか？`
          : `デッキは${deck.length}枚です。50枚を超えていますが、保存しますか？`

      if (!confirm(warningMessage)) {
        return
      }
    }

    // 自動生成されたIDを取得
    const generatedId = generateDeckId(deck.map((card) => card.id))

    // カスタムIDが入力されている場合のみバリデーション
    const finalDeckId = customDeckId.trim() || generatedId

    // 既存のIDかチェック
    const existingDecks = loadDecksFromStorage()
    if (existingDecks[finalDeckId] && finalDeckId !== deckId) {
      setIdError("このIDは既に使用されています")
      return
    }

    // デッキ名を使用
    const finalDeckName = deckName.trim() || `デッキ ${Object.keys(savedDecks).length + 1}`

    // ローカルストレージに保存
    const updatedDecks = { ...savedDecks }
    updatedDecks[finalDeckId] = {
      cards: deck.map((card) => card.id),
      name: finalDeckName,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem("cnpDecks", JSON.stringify(updatedDecks))

    // 最後に使用したデッキIDを保存
    localStorage.setItem("lastUsedDeckId", finalDeckId)

    // URLにはデッキIDを追加しない（表示しない）
    const url = new URL(window.location.href)
    url.searchParams.delete("deck")
    window.history.replaceState({}, "", url.toString())

    // 状態を更新
    setSavedDecks(updatedDecks)
    setDeckId(finalDeckId)
    setIsSaveDialogOpen(false)
    setIdError("")
    setIsDecodedDeck(false)

    // コピー用のテキストを作成してクリップボードにコピー
    navigator.clipboard
      .writeText(finalDeckId)
      .then(() => {
        alert(
          `デッキ名「${finalDeckName}」のIDを発行しました！${deck.length !== 50 ? `\n※注意: このデッキは${deck.length}枚です（標準は50枚）` : ""}`,
        )
      })
      .catch((err) => {
        console.error("コピーに失敗しました", err)
        alert(
          `デッキ名「${finalDeckName}」のIDを発行しました！${deck.length !== 50 ? `\n※注意: このデッキは${deck.length}枚です（標準は50枚）` : ""}`,
        )
      })
  }

  const importDeck = () => {
    const deckIdToImport = importDeckId.trim()
    if (!deckIdToImport) {
      return
    }

    // ローカルストレージから読み込むか、IDからデコードする
    let loadedDeck: Card[] = []
    let isLocalDeckFound = false

    // まずローカルストレージから探す
    const savedDecks = loadDecksFromStorage()
    if (savedDecks[deckIdToImport]) {
      isLocalDeckFound = true
      loadedDeck = savedDecks[deckIdToImport].cards
        .map((cardId) => {
          const card = cards.find((c) => c.id === cardId)
          if (!card) return null
          return card
        })
        .filter((card): card is Card => card !== null)
    } else {
      // ローカルストレージに無い場合はIDからデコード
      try {
        const cardIds = decodeDeckId(deckIdToImport, allCardIds)

        if (cardIds.length === 0) {
          alert("デッキIDからカードを復元できませんでした。")
          return
        }

        loadedDeck = cardIds
          .map((cardId) => {
            const card = cards.find((c) => c.id === cardId)
            if (!card) return null
            return card
          })
          .filter((card): card is Card => card !== null)
      } catch (error) {
        console.error("Failed to decode deck ID:", error)
        alert("デッキIDの解析に失敗しました。")
        return
      }
    }

    if (loadedDeck.length === 0) {
      alert("指定されたIDのデッキが見つかりませんでした。")
      return
    }

    setDeck(loadedDeck)
    setDeckId(deckIdToImport)
    setCustomDeckId(deckIdToImport)
    setIsDecodedDeck(!isLocalDeckFound)
    setImportDeckId("")
    setCardColor("deck") // デッキカードでフィルター

    // デッキ名を設定
    if (isLocalDeckFound) {
      setDeckName(savedDecks[deckIdToImport].name)
    } else {
      // 復元されたデッキの場合、名前入力ダイアログを表示
      const defaultName = "復元されたデッキ"
      const deckNameInput = prompt("デッキ名を入力してください", defaultName)
      setDeckName(deckNameInput || defaultName)
    }

    // カード枚数を計算
    const counts: Record<string, number> = {}
    loadedDeck.forEach((card) => {
      counts[card.id] = (counts[card.id] || 0) + 1
    })
    setCardCounts(counts)

    // デッキ分析
    setDeckAnalysis(analyzeDeck(loadedDeck))

    // 最後に使用したデッキIDを保存
    localStorage.setItem("lastUsedDeckId", deckIdToImport)

    // URLにデッキIDを追加（ブックマーク可能に）
    const url = new URL(window.location.href)
    url.searchParams.set("deck", deckIdToImport)
    window.history.replaceState({}, "", url.toString())
  }

  // loadSavedDeck 関数を修正して、デッキカードでフィルターするように変更
  const loadSavedDeck = (id: string) => {
    const loadedDeck = loadDeckById(id)
    if (loadedDeck.length === 0) return

    setDeck(loadedDeck)
    setDeckId(id)
    setCustomDeckId(id)
    setIsDecodedDeck(false)
    setCardColor("deck") // デッキカードでフィルター

    // デッキ名を設定
    if (savedDecks[id]) {
      setDeckName(savedDecks[id].name)
    }

    // カード枚数を計算
    const counts: Record<string, number> = {}
    loadedDeck.forEach((card) => {
      counts[card.id] = (counts[card.id] || 0) + 1
    })
    setCardCounts(counts)

    // デッキ分析
    setDeckAnalysis(analyzeDeck(loadedDeck))

    // 最後に使用したデッキIDを保存
    localStorage.setItem("lastUsedDeckId", id)

    // URLにデッキIDを追加（ブックマーク可能に）
    const url = new URL(window.location.href)
    url.searchParams.set("deck", id)
    window.history.replaceState({}, "", url.toString())
  }

  const handleSortOrderChange = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      // If the same sort order is selected, toggle the direction
      toggleSortOrder()
    } else {
      // If a different sort order is selected, update the sort order and set the direction to ascending
      setSortBy(newSortBy)
      setSortOrder("asc")
    }
  }

  // カードの枚数をカウント（デッキ内の各カードの枚数）
  const countCardsByName = () => {
    const counts: Record<string, { card: Card; count: number }> = {}

    deck.forEach((card) => {
      if (!counts[card.name]) {
        counts[card.name] = { card, count: 0 }
      }
      counts[card.name].count++
    })

    return Object.values(counts).sort((a, b) => a.card.name.localeCompare(b.card.name))
  }

  // デッキをフィルタリングする関数
  const filterDecks = (
    decks: Record<string, { name: string; cards: string[]; createdAt: string; isRecommended?: boolean }>,
  ) => {
    let filtered = { ...decks }

    // フィルタータイプでフィルタリング
    if (deckFilter !== "all") {
      filtered = Object.entries(filtered).reduce(
        (acc, [id, deck]) => {
          // 推奨デッキのフィルタリング
          if (deckFilter === "recommended" && deck.isRecommended) {
            acc[id] = deck
          }
          // 自分のデッキのフィルタリング（推奨デッキでないもの）
          else if (deckFilter === "my" && !deck.isRecommended) {
            acc[id] = deck
          }
          // 青属性のデッキのフィルタリング
          else if (deckFilter === "blue" && deck.name.includes("🟦")) {
            acc[id] = deck
          }
          // 赤属性のデッキのフィルタリング
          else if (deckFilter === "red" && deck.name.includes("🟥")) {
            acc[id] = deck
          }
          // 黄属性のデッキのフィルタリング
          else if (deckFilter === "yellow" && deck.name.includes("🟨")) {
            acc[id] = deck
          }
          // 緑属性のデッキのフィルタリング
          else if (deckFilter === "green" && deck.name.includes("🟩")) {
            acc[id] = deck
          }
          return acc
        },
        {} as Record<string, { name: string; cards: string[]; createdAt: string; isRecommended?: boolean }>,
      )
    }

    // 検索語でフィルタリング
    if (deckSearchTerm) {
      const term = deckSearchTerm.toLowerCase()
      filtered = Object.entries(filtered).reduce(
        (acc, [id, deck]) => {
          if (deck.name.toLowerCase().includes(term) || id.toLowerCase().includes(term)) {
            acc[id] = deck
          }
          return acc
        },
        {} as Record<string, { name: string; cards: string[]; createdAt: string; isRecommended?: boolean }>,
      )
    }

    return filtered
  }

  // フィルタリングされたデッキを取得
  const filteredDecks = useMemo(() => {
    return filterDecks(savedDecks)
  }, [savedDecks, deckFilter, deckSearchTerm])

  return (
    <div className="min-h-screen tech-pattern p-4 dark:bg-gray-900 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側: デッキ情報 */}
          <div className="lg:col-span-1 bg-white dark:bg-black border border-gray-200 dark:border-blue-900 rounded-lg shadow-lg p-4 dark:neon-border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-blue-400 flex items-center">
                <Database className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                デッキ ({deck.length > 50 ? <span className="text-red-600">{deck.length}</span> : deck.length}/50)
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearDeck}
                  disabled={deck.length === 0}
                  className="bg-white dark:bg-red-900 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-200"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  クリア
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openSaveDialog}
                  className="bg-white dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900 hover:text-yellow-700 dark:hover:text-yellow-200"
                >
                  <Save className="h-4 w-4 mr-1" />
                  ID発行
                </Button>
              </div>
            </div>

            {isDecodedDeck && (
              <Alert className="mb-4 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300">
                <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-600 dark:text-blue-400">復元されたデッキ</AlertTitle>
                <AlertDescription>
                  このデッキはIDから復元されました。保存するには「ID発行」ボタンを押してください。
                </AlertDescription>
              </Alert>
            )}

            {deck.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-blue-300 border border-dashed border-gray-300 dark:border-blue-800 rounded-lg">
                <Code className="h-12 w-12 mx-auto mb-2 text-gray-400 dark:text-blue-500 opacity-50" />
                <p>カードをクリックしてデッキに追加してください</p>
              </div>
            ) : (
              <DeckStats deck={deck} deckAnalysis={deckAnalysis} />
            )}

            {/* デッキインポート */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-blue-300 mb-2 flex items-center">
                <Upload className="h-4 w-4 mr-1 text-green-600 dark:text-green-400" />
                デッキをインポート
              </h3>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="デッキIDを入力"
                  value={importDeckId}
                  onChange={(e) => setImportDeckId(e.target.value)}
                  className="flex-grow bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                />
                <Button onClick={importDeck} className="bg-green-600 hover:bg-green-700 text-white">
                  <Upload className="h-4 w-4 mr-1" />
                  インポート
                </Button>
              </div>
            </div>

            {/* 保存済みデッキ */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-blue-800">
              <div className="flex justify-between items-center mb-2">
                <h3
                  className="text-sm font-semibold text-gray-700 dark:text-blue-300 flex items-center cursor-pointer"
                  onClick={() => setShowSavedDecks(!showSavedDecks)}
                >
                  <Save className="h-4 w-4 mr-1 text-yellow-600 dark:text-yellow-400" />
                  保存デッキ
                  {showSavedDecks ? (
                    <ChevronUp className="h-4 w-4 ml-1 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-1 text-gray-500 dark:text-gray-400" />
                  )}
                </h3>
              </div>

              {showSavedDecks && (
                <div className="space-y-3">
                  {/* デッキ検索 */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="デッキを検索..."
                      className="pl-9 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm h-8"
                      value={deckSearchTerm}
                      onChange={(e) => setDeckSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* デッキタイプフィルター */}
                  <div>
                    <Label
                      htmlFor="deckType"
                      className="block text-xs font-medium text-gray-700 dark:text-blue-300 mb-1"
                    >
                      タイプ
                    </Label>
                    <Select value={deckFilter} onValueChange={setDeckFilter}>
                      <SelectTrigger className="w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 h-8 text-sm">
                        <SelectValue placeholder="すべてのタイプ" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                        <SelectItem value="all">すべてのタイプ</SelectItem>
                        <SelectItem value="recommended">推奨デッキ</SelectItem>
                        <SelectItem value="my">自分のデッキ</SelectItem>
                        <SelectItem value="blue">青属性デッキ</SelectItem>
                        <SelectItem value="red">赤属性デッキ</SelectItem>
                        <SelectItem value="yellow">黄属性デッキ</SelectItem>
                        <SelectItem value="green">緑属性デッキ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* デッキリスト */}
                  {Object.keys(filteredDecks).length === 0 ? (
                    <p className="text-gray-500 dark:text-blue-300 text-sm py-2">保存されたデッキはありません</p>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto pr-1">
                      <ul className="space-y-2">
                        {Object.entries(filteredDecks)
                          .sort(([, a], [, b]) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map(([id, data]) => (
                            <SavedDeckItem
                              key={id}
                              id={id}
                              data={data}
                              isActive={id === deckId}
                              onLoadDeck={loadSavedDeck}
                              onDeleteDeck={deleteSavedDeck}
                            />
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 中央: カードリスト */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-black border border-gray-200 dark:border-blue-900 rounded-lg shadow-lg p-4 mb-6 dark:neon-border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-blue-400 flex items-center">
                  <Grid className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  カードリスト ({availableCards.length}枚)
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-white dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-200"
                  >
                    <Filter className="h-4 w-4 mr-1" />
                    フィルター
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === "grid" ? "cards" : "grid")}
                    className="bg-white dark:bg-green-900 border-green-200 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 hover:text-green-700 dark:hover:text-green-200"
                  >
                    {viewMode === "grid" ? <List className="h-4 w-4 mr-1" /> : <Grid className="h-4 w-4 mr-1" />}
                    {viewMode === "grid" ? "カード表示" : "グリッド表示"}
                  </Button>
                </div>
              </div>

              {/* 検索バーとフィルター */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="カードを検索..."
                    className="pl-10 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {/* タイプフィルター */}
                    <div>
                      <Label htmlFor="cardType" className="block text-sm font-medium text-gray-700 dark:text-blue-300">
                        タイプ
                      </Label>
                      <Select value={cardType} onValueChange={setCardType}>
                        <SelectTrigger className="w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          <SelectValue placeholder="すべてのタイプ" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          <SelectItem value="all">すべてのタイプ</SelectItem>
                          <SelectItem value="ユニット">ユニット</SelectItem>
                          <SelectItem value="イベント">イベント</SelectItem>
                          <SelectItem value="サポーター">サポーター</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 色フィルター */}
                    <div>
                      <Label htmlFor="cardColor" className="block text-sm font-medium text-gray-700 dark:text-blue-300">
                        色
                      </Label>
                      <Select value={cardColor} onValueChange={setCardColor}>
                        <SelectTrigger className="w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          <SelectValue placeholder="すべての色" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          <SelectItem value="all">すべての色</SelectItem>
                          <SelectItem value="red">赤</SelectItem>
                          <SelectItem value="blue">青</SelectItem>
                          <SelectItem value="green">緑</SelectItem>
                          <SelectItem value="yellow">黄</SelectItem>
                          <SelectItem value="purple">紫</SelectItem>
                          <SelectItem value="deck">デッキのカード</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* レアリティフィルター */}
                    <div>
                      <Label
                        htmlFor="cardRarity"
                        className="block text-sm font-medium text-gray-700 dark:text-blue-300"
                      >
                        レアリティ
                      </Label>
                      <Select value={cardRarity} onValueChange={setCardRarity}>
                        <SelectTrigger className="w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          <SelectValue placeholder="すべてのレアリティ" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          <SelectItem value="all">すべてのレアリティ</SelectItem>
                          {rarities.map((rarity) => (
                            <SelectItem key={rarity} value={rarity}>
                              {rarity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 効果分類フィルター */}
                    <div>
                      <Label
                        htmlFor="cardEffectType"
                        className="block text-sm font-medium text-gray-700 dark:text-blue-300"
                      >
                        効果分類
                      </Label>
                      <Select value={cardEffectType} onValueChange={setCardEffectType}>
                        <SelectTrigger className="w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          <SelectValue placeholder="すべての効果分類" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          <SelectItem value="all">すべての効果分類</SelectItem>
                          {effectTypes.map((effectType) => (
                            <SelectItem key={effectType} value={effectType}>
                              {effectType}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 収録パックフィルター */}
                    <div>
                      <Label htmlFor="cardPack" className="block text-sm font-medium text-gray-700 dark:text-blue-300">
                        収録パック
                      </Label>
                      <Select value={cardPack} onValueChange={setCardPack}>
                        <SelectTrigger className="w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          <SelectValue placeholder="すべての収録パック" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          <SelectItem value="all">すべての収録パック</SelectItem>
                          {packs.map((pack) => (
                            <SelectItem key={pack} value={pack}>
                              {pack}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* ソート */}
              <div className="flex items-center justify-start space-x-4 mb-4">
                <Label htmlFor="sort" className="text-sm font-medium text-gray-700 dark:text-blue-300">
                  ソート順:
                </Label>
                <Select value={sortBy} onValueChange={handleSortOrderChange}>
                  <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                    <SelectValue placeholder="名前" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                    <SelectItem value="name">
                      名前 {sortBy === "name" && (sortOrder === "asc" ? " (昇順)" : " (降順)")}
                    </SelectItem>
                    <SelectItem value="cost">
                      コスト {sortBy === "cost" && (sortOrder === "asc" ? " (昇順)" : " (降順)")}
                    </SelectItem>
                    <SelectItem value="bp">
                      BP {sortBy === "bp" && (sortOrder === "asc" ? " (昇順)" : " (降順)")}
                    </SelectItem>
                    <SelectItem value="sp">
                      SP {sortBy === "sp" && (sortOrder === "asc" ? " (昇順)" : " (降順)")}
                    </SelectItem>
                    <SelectItem value="type">
                      タイプ {sortBy === "type" && (sortOrder === "asc" ? " (昇順)" : " (降順)")}
                    </SelectItem>
                    <SelectItem value="colorCost">
                      色コスト {sortBy === "colorCost" && (sortOrder === "asc" ? " (昇順)" : " (降順)")}
                    </SelectItem>
                    <SelectItem value="colorlessCost">
                      無色コスト {sortBy === "colorlessCost" && (sortOrder === "asc" ? " (昇順)" : " (降順)")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={toggleSortOrder} className="bg-white dark:bg-gray-800">
                  <ArrowUpDown className="ml-2 h-4 w-4 dark:text-white text-black" />
                </Button>
              </div>

              {/* カードリスト表示 */}
              {viewMode === "grid" ? (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg h-[500px] overflow-auto">
                  <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "100%", width: "100%" }}>
                    <table className="w-full border-collapse bg-white dark:bg-gray-800">
                      <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-700">
                        <tr>
                          {/* 列の順番を変更: 枚数/操作/カード名/色/コスト/色コスト/無色コスト/タイプ/BP/AP/効果分類/効果テキスト/レア/収録パック */}
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            枚数
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            操作
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            カード名
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            色
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            コスト
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            色コスト
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            無色コスト
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            タイプ
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            BP
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            SP
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            効果分類
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            効果テキスト
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            レア
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            収録パック
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {availableCards.map((card) => (
                          <tr
                            key={card.id}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 py-2 cursor-pointer"
                            onClick={() => handleCardClick(card)}
                          >
                            <td className="p-2 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              {cardCounts[card.id] || 0}
                            </td>
                            <td className="p-2 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeCardFromDeck(card)
                                  }}
                                  className="p-1 bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-700"
                                  disabled={!cardCounts[card.id]}
                                >
                                  <Minus size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    addCardToDeck(card)
                                  }}
                                  className="p-1 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-700"
                                  disabled={cardCounts[card.id] >= 4}
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              {card.name}
                            </td>
                            <td className="px-4 py-3 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              <div
                                className={`w-6 h-6 rounded-full ${
                                  card.color === "blue"
                                    ? "bg-blue-500"
                                    : card.color === "red"
                                      ? "bg-red-500"
                                      : card.color === "yellow"
                                        ? "bg-yellow-500"
                                        : card.color === "green"
                                          ? "bg-green-500"
                                          : "bg-purple-500"
                                }`}
                              ></div>
                            </td>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              {card.cost}
                            </td>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              {card.colorCost || 0}
                            </td>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              {card.colorlessCost || 0}
                            </td>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              {card.type}
                            </td>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              {card.bp || "-"}
                            </td>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              {card.sp || card.ap || "-"}
                            </td>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              {card.effectType ? card.effectType.join(", ") : "-"}
                            </td>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 max-w-[300px] truncate">
                              {card.ability || "-"}
                            </td>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              {card.rarity || "-"}
                            </td>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              {card.pack || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="grid gap-2 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {availableCards.map((card) => (
                    <SwipeableCard
                      key={card.id}
                      card={card}
                      count={cardCounts[card.id] || 0}
                      onIncrement={() => {
                        const currentCount = cardCounts[card.id] || 0
                        if (currentCount < 4) {
                          // 50枚制限を削除
                          setDeck([...deck, card])
                          setCardCounts({
                            ...cardCounts,
                            [card.id]: currentCount + 1,
                          })
                        }
                      }}
                      onDecrement={() => {
                        const currentCount = cardCounts[card.id] || 0
                        if (currentCount > 0) {
                          const cardIndex = deck.findIndex((c) => c.id === card.id)
                          if (cardIndex !== -1) {
                            const newDeck = [...deck]
                            newDeck.splice(cardIndex, 1)
                            setDeck(newDeck)
                            setCardCounts({
                              ...cardCounts,
                              [card.id]: currentCount - 1,
                            })
                          }
                        }
                      }}
                      onClick={() => handleCardClick(card)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* カード詳細モーダル */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          closeModal={closeModal}
          deckCount={cardCounts[selectedCard.id] || 0}
          onIncrement={() => {
            const currentCount = cardCounts[selectedCard.id] || 0
            if (currentCount < 4) {
              setDeck([...deck, selectedCard])
              setCardCounts({
                ...cardCounts,
                [selectedCard.id]: currentCount + 1,
              })
            }
          }}
          onDecrement={() => {
            const currentCount = cardCounts[selectedCard.id] || 0
            if (currentCount > 0) {
              const cardIndex = deck.findIndex((c) => c.id === selectedCard.id)
              if (cardIndex !== -1) {
                const newDeck = [...deck]
                newDeck.splice(cardIndex, 1)
                setDeck(newDeck)
                setCardCounts({
                  ...cardCounts,
                  [selectedCard.id]: currentCount - 1,
                })
              }
            }
          }}
        />
      )}

      {/* 保存ダイアログ */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">デッキIDを発行</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-gray-700 dark:text-gray-300">
                デッキID
              </Label>
              <Input
                type="text"
                id="deckId"
                value={customDeckId}
                onChange={(e) => setCustomDeckId(e.target.value)}
                className="col-span-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-gray-700 dark:text-gray-300">
                デッキ名
              </Label>
              <Input
                type="text"
                id="name"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                className="col-span-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>
            {deck.length !== 50 && (
              <Alert className="bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertTitle className="text-yellow-600 dark:text-yellow-400">注意</AlertTitle>
                <AlertDescription>このデッキは{deck.length}枚です（標準は50枚です）</AlertDescription>
              </Alert>
            )}
          </div>
          {idError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>{idError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button type="submit" onClick={saveDeck}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
