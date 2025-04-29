// デッキIDを生成するためのユーティリティ関数

// 2桁の数字から文字へのマッピング
const DIGIT_PAIRS_TO_CHAR: Record<string, string> = {
  "00": "a",
  "01": "b",
  "02": "c",
  "03": "d",
  "04": "e",
  "10": "f",
  "11": "g",
  "12": "h",
  "13": "i",
  "14": "j",
  "20": "k",
  "21": "m",
  "22": "n",
  "23": "o",
  "24": "p",
  "30": "q",
  "31": "r",
  "32": "s",
  "33": "t",
  "34": "u",
  "40": "v",
  "41": "w",
  "42": "x",
  "43": "y",
  "44": "z",
}

// 文字から2桁の数字へのマッピング（逆引き用）
const CHAR_TO_DIGIT_PAIRS: Record<string, string> = {}
for (const [digits, char] of Object.entries(DIGIT_PAIRS_TO_CHAR)) {
  CHAR_TO_DIGIT_PAIRS[char] = digits
}

// デッキ全体からIDを生成する関数
export function generateDeckId(cardIds: string[]): string {
  // カードの出現回数をカウント（0-4枚）
  const cardCounts: number[] = Array(116).fill(0)

  cardIds.forEach((id) => {
    // カードIDから番号を抽出（例: "BT1-1" -> 1）
    const match = id.match(/(\d+)(?:p|sp)?$/)
    if (match) {
      const cardNumber = Number.parseInt(match[1], 10)
      if (cardNumber >= 1 && cardNumber <= 116) {
        cardCounts[cardNumber - 1]++
        // 4枚を超える場合は4枚に制限
        if (cardCounts[cardNumber - 1] > 4) {
          cardCounts[cardNumber - 1] = 4
        }
      }
    }
  })

  // 2桁ずつ組み合わせて文字に変換
  let encodedId = "bt" // 先頭に "bt" を付ける

  // 116枚のカードを2枚ずつペアにして処理
  for (let i = 0; i < 116; i += 2) {
    // 最後の1枚が余る場合（115枚目）
    if (i === 115) {
      // 最後の1枚は単独で処理
      const lastDigit = cardCounts[i].toString()
      // 最後の1桁は0-4の数字をそのまま使用
      encodedId += lastDigit
      break
    }

    // 2枚のカードの枚数を2桁の数字として結合
    const digitPair = `${cardCounts[i]}${cardCounts[i + 1]}`
    // 対応する文字に変換
    const char = DIGIT_PAIRS_TO_CHAR[digitPair]

    if (char) {
      encodedId += char
    } else {
      // マッピングにない組み合わせの場合（エラー処理）
      console.warn(`Invalid digit pair: ${digitPair} at index ${i}`)
      encodedId += "a" // デフォルト値
    }
  }

  return encodedId
}

// デッキIDからカードIDのリストを復元する関数
export function decodeDeckId(deckId: string, allCardIds: string[]): string[] {
  try {
    // 先頭の "bt" を削除
    if (deckId.startsWith("bt")) {
      deckId = deckId.substring(2)
    } else {
      console.warn("Deck ID does not start with 'bt'")
      return []
    }

    // 長さチェック - 58文字または59文字（最後の1枚が数字の場合）
    if (deckId.length < 58) {
      console.warn(`Deck ID is too short: ${deckId.length}, expected at least 58 characters`)
      return []
    }

    const cardCounts: number[] = []

    // 文字を2桁の数字に変換
    for (let i = 0; i < deckId.length; i++) {
      const char = deckId[i]

      // 最後の1文字が数字の場合（116枚目のカード）
      if (i === deckId.length - 1 && /[0-4]/.test(char)) {
        cardCounts.push(Number.parseInt(char, 10))
        break
      }

      const digitPair = CHAR_TO_DIGIT_PAIRS[char]

      if (digitPair) {
        // 2桁の数字を2つの数字に分解
        cardCounts.push(Number.parseInt(digitPair[0], 10))
        cardCounts.push(Number.parseInt(digitPair[1], 10))
      } else {
        console.warn(`Invalid character in deck ID: ${char} at position ${i}`)
        // エラーが発生した場合は0を追加
        cardCounts.push(0)
        cardCounts.push(0)
      }

      // 116枚分のカードを処理したら終了
      if (cardCounts.length >= 116) {
        break
      }
    }

    // カード枚数が足りない場合は0で埋める
    while (cardCounts.length < 116) {
      cardCounts.push(0)
    }

    // カード枚数をカードIDのリストに変換
    const result: string[] = []

    for (let i = 0; i < cardCounts.length; i++) {
      const count = cardCounts[i]
      const cardNumber = i + 1

      // 対応するカードIDを見つける
      const cardId = findCardIdByNumber(cardNumber, allCardIds)

      if (cardId && count > 0) {
        // 指定された枚数だけカードを追加
        for (let j = 0; j < count; j++) {
          result.push(cardId)
        }
      }
    }

    return result
  } catch (error) {
    console.error("Error decoding deck ID:", error)
    // エラーが発生した場合は空の配列を返す
    return []
  }
}

// カード番号からカードIDを見つける関数
function findCardIdByNumber(cardNumber: number, allCardIds: string[]): string | null {
  for (const cardId of allCardIds) {
    const match = cardId.match(/(\d+)(?:p|sp)?$/)
    if (match && Number.parseInt(match[1], 10) === cardNumber) {
      return cardId
    }
  }
  return null
}

// デッキIDをフォーマットする関数
export function formatDeckId(id: string): string {
  return id // ハイフンなしで元のIDをそのまま返す
}

// デバッグ用の関数：デッキIDの内容を解析して表示
export function analyzeDeckId(deckId: string): string {
  try {
    // 先頭の "bt" を削除
    if (deckId.startsWith("bt")) {
      deckId = deckId.substring(2)
    } else {
      return `デッキIDが "bt" で始まっていません: ${deckId}`
    }

    let result = "デッキID解析結果:\n"
    const cardCounts: number[] = []

    // 文字を2桁の数字に変換
    for (let i = 0; i < deckId.length; i++) {
      const char = deckId[i]

      // 最後の1文字が数字の場合（116枚目のカード）
      if (i === deckId.length - 1 && /[0-4]/.test(char)) {
        const count = Number.parseInt(char, 10)
        cardCounts.push(count)
        result += `カード116: ${count}枚\n`
        break
      }

      const digitPair = CHAR_TO_DIGIT_PAIRS[char]

      if (digitPair) {
        const cardIndex1 = cardCounts.length
        const cardIndex2 = cardCounts.length + 1
        const count1 = Number.parseInt(digitPair[0], 10)
        const count2 = Number.parseInt(digitPair[1], 10)

        cardCounts.push(count1)
        cardCounts.push(count2)

        result += `カード${cardIndex1 + 1}: ${count1}枚, カード${cardIndex2 + 1}: ${count2}枚\n`
      } else {
        result += `無効な文字: ${char} (位置: ${i})\n`
        // エラーが発生した場合は0を追加
        cardCounts.push(0)
        cardCounts.push(0)
      }

      // 116枚分のカードを処理したら終了
      if (cardCounts.length >= 116) {
        break
      }
    }

    // カード枚数の合計
    const totalCards = cardCounts.reduce((sum, count) => sum + count, 0)
    result += `\n合計カード枚数: ${totalCards}枚`

    return result
  } catch (error) {
    return `解析エラー: ${error}`
  }
}
