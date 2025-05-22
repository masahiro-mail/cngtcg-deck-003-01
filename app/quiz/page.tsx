"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cards } from "@/data/cards"
import type { Card } from "@/types/card"
import { CheckCircle, XCircle, Trophy, HelpCircle, Brain, Award } from "lucide-react"

type QuizQuestion = {
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    generateQuizQuestions()
  }, [])

  const generateQuizQuestions = () => {
    setIsLoading(true)
    const generatedQuestions: QuizQuestion[] = []
    const questionTypes = [
      generateCostQuestion,
      generateColorCostQuestion,
      generateCardColorQuestion,
      generateBPQuestion,
      generateSPQuestion,
      generateAbilityQuestion,
      generateCardTypeQuestion,
      generateCardRarityQuestion,
      generateCardNameQuestion,
      generateFlavorTextQuestion,
    ]

    // シャッフルして10問選ぶ
    const shuffledTypes = [...questionTypes].sort(() => Math.random() - 0.5)
    for (let i = 0; i < 10; i++) {
      const questionGenerator = shuffledTypes[i % shuffledTypes.length]
      const question = questionGenerator()
      if (question) {
        generatedQuestions.push(question)
      }
    }

    setQuestions(generatedQuestions)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setCorrectAnswers(0)
    setQuizCompleted(false)
    setIsLoading(false)
  }

  const startQuiz = () => {
    setShowIntro(false)
  }

  const generateCostQuestion = (): QuizQuestion | null => {
    const randomCard = getRandomCard()
    if (!randomCard) return null

    const correctAnswer = randomCard.cost.toString()
    const options = generateUniqueOptions(correctAnswer, () => Math.floor(Math.random() * 10).toString(), 4)

    return {
      question: `「${randomCard.name}」のコストはいくつですか？`,
      options,
      correctAnswer,
      explanation: `「${randomCard.name}」のコストは${correctAnswer}です。`,
    }
  }

  const generateColorCostQuestion = (): QuizQuestion | null => {
    const cardsWithColorCost = cards.filter((card) => card.colorCost && card.colorCost > 0)
    if (cardsWithColorCost.length === 0) return generateCardColorQuestion()

    const randomCard = cardsWithColorCost[Math.floor(Math.random() * cardsWithColorCost.length)]
    const correctAnswer = randomCard.colorCost?.toString() || "0"
    const options = generateUniqueOptions(correctAnswer, () => Math.floor(Math.random() * 5).toString(), 4)

    return {
      question: `「${randomCard.name}」の色コストはいくつですか？`,
      options,
      correctAnswer,
      explanation: `「${randomCard.name}」の色コストは${correctAnswer}です。`,
    }
  }

  const generateCardColorQuestion = (): QuizQuestion | null => {
    const randomCard = getRandomCard()
    if (!randomCard) return null

    const correctAnswer = randomCard.color || "なし"
    const colors = ["赤", "青", "緑", "黄", "紫", "無色", "なし"]
    const options = generateUniqueOptions(correctAnswer, () => colors[Math.floor(Math.random() * colors.length)], 4)

    return {
      question: `「${randomCard.name}」の色は何ですか？`,
      options,
      correctAnswer,
      explanation: `「${randomCard.name}」の色は${correctAnswer}です。`,
    }
  }

  const generateBPQuestion = (): QuizQuestion | null => {
    const cardsWithBP = cards.filter((card) => card.bp !== undefined && card.bp !== null)
    if (cardsWithBP.length === 0) return generateSPQuestion()

    const randomCard = cardsWithBP[Math.floor(Math.random() * cardsWithBP.length)]
    const correctAnswer = randomCard.bp?.toString() || "0"
    const options = generateUniqueOptions(correctAnswer, () => (Math.floor(Math.random() * 10) * 1000).toString(), 4)

    return {
      question: `「${randomCard.name}」のBP（バトルポイント）はいくつですか？`,
      options,
      correctAnswer,
      explanation: `「${randomCard.name}」のBPは${correctAnswer}です。`,
    }
  }

  const generateSPQuestion = (): QuizQuestion | null => {
    const cardsWithSP = cards.filter((card) => card.sp !== undefined && card.sp !== null)
    if (cardsWithSP.length === 0) return generateAbilityQuestion()

    const randomCard = cardsWithSP[Math.floor(Math.random() * cardsWithSP.length)]
    const correctAnswer = randomCard.sp?.toString() || "0"
    const options = generateUniqueOptions(correctAnswer, () => (Math.floor(Math.random() * 10) * 1000).toString(), 4)

    return {
      question: `「${randomCard.name}」のSP（スケダチポイント）はいくつですか？`,
      options,
      correctAnswer,
      explanation: `「${randomCard.name}」のSPは${correctAnswer}です。`,
    }
  }

  const generateAbilityQuestion = (): QuizQuestion | null => {
    const cardsWithAbility = cards.filter((card) => card.ability && card.ability.length > 0)
    if (cardsWithAbility.length === 0) return generateCardTypeQuestion()

    const randomCard = cardsWithAbility[Math.floor(Math.random() * cardsWithAbility.length)]
    const correctAnswer = randomCard.ability || "なし"

    // 他のカードから能力をランダムに選ぶ
    const otherAbilities = cardsWithAbility
      .filter((card) => card.id !== randomCard.id && card.ability !== correctAnswer)
      .map((card) => card.ability)
      .filter((ability): ability is string => !!ability)

    const options = [correctAnswer]
    while (options.length < 4 && otherAbilities.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherAbilities.length)
      const ability = otherAbilities[randomIndex]
      if (!options.includes(ability)) {
        options.push(ability)
        otherAbilities.splice(randomIndex, 1)
      }
    }

    // 足りない場合はダミーの能力を追加
    const dummyAbilities = ["瞬速", "貫通", "防御", "回復", "強化", "弱体化", "破壊"]
    while (options.length < 4) {
      const dummyAbility = dummyAbilities[Math.floor(Math.random() * dummyAbilities.length)]
      if (!options.includes(dummyAbility)) {
        options.push(dummyAbility)
      }
    }

    return {
      question: `「${randomCard.name}」の能力は何ですか？`,
      options: options.sort(() => Math.random() - 0.5),
      correctAnswer,
      explanation: `「${randomCard.name}」の能力は「${correctAnswer}」です。`,
    }
  }

  const generateCardTypeQuestion = (): QuizQuestion | null => {
    const randomCard = getRandomCard()
    if (!randomCard) return null

    const correctAnswer = randomCard.type || "なし"
    const types = ["ユニット", "レイキ", "サポート", "イベント"]
    const options = generateUniqueOptions(correctAnswer, () => types[Math.floor(Math.random() * types.length)], 4)

    return {
      question: `「${randomCard.name}」のカードタイプは何ですか？`,
      options,
      correctAnswer,
      explanation: `「${randomCard.name}」のカードタイプは${correctAnswer}です。`,
    }
  }

  const generateCardRarityQuestion = (): QuizQuestion | null => {
    const cardsWithRarity = cards.filter((card) => card.rarity)
    if (cardsWithRarity.length === 0) return generateCardNameQuestion()

    const randomCard = cardsWithRarity[Math.floor(Math.random() * cardsWithRarity.length)]
    const correctAnswer = randomCard.rarity || "なし"
    const rarities = ["コモン", "アンコモン", "レア", "スーパーレア", "レジェンド", "なし"]
    const options = generateUniqueOptions(correctAnswer, () => rarities[Math.floor(Math.random() * rarities.length)], 4)

    return {
      question: `「${randomCard.name}」のレアリティは何ですか？`,
      options,
      correctAnswer,
      explanation: `「${randomCard.name}」のレアリティは${correctAnswer}です。`,
    }
  }

  const generateCardNameQuestion = (): QuizQuestion | null => {
    const randomCard = getRandomCard()
    if (!randomCard) return null

    // 説明文からカード名を当てる
    const correctAnswer = randomCard.name
    const otherCards = cards.filter((card) => card.id !== randomCard.id)
    const options = [correctAnswer]

    while (options.length < 4 && otherCards.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherCards.length)
      const cardName = otherCards[randomIndex].name
      if (!options.includes(cardName)) {
        options.push(cardName)
        otherCards.splice(randomIndex, 1)
      }
    }

    return {
      question: `次の説明に当てはまるカードの名前は？「${randomCard.description || randomCard.ability || randomCard.type}」`,
      options: options.sort(() => Math.random() - 0.5),
      correctAnswer,
      explanation: `正解は「${correctAnswer}」です。`,
    }
  }

  const generateFlavorTextQuestion = (): QuizQuestion | null => {
    const cardsWithEffect = cards.filter((card) => card.description && card.description.length > 0)
    if (cardsWithEffect.length === 0) return generateCardNameQuestion()

    const randomCard = cardsWithEffect[Math.floor(Math.random() * cardsWithEffect.length)]
    const correctAnswer = randomCard.description || "なし"

    // 他のカードから効果をランダムに選ぶ
    const otherEffects = cardsWithEffect
      .filter((card) => card.id !== randomCard.id && card.description !== correctAnswer)
      .map((card) => card.description)
      .filter((desc): desc is string => !!desc)

    const options = [correctAnswer]
    while (options.length < 4 && otherEffects.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherEffects.length)
      const effect = otherEffects[randomIndex]
      if (!options.includes(effect)) {
        options.push(effect)
        otherEffects.splice(randomIndex, 1)
      }
    }

    return {
      question: `「${randomCard.name}」のフレイバーテキストは何ですか？`,
      options: options.sort(() => Math.random() - 0.5),
      correctAnswer,
      explanation: `「${randomCard.name}」のフレイバーテキストは「${correctAnswer}」です。`,
    }
  }

  const getRandomCard = (): Card | null => {
    if (cards.length === 0) return null
    return cards[Math.floor(Math.random() * cards.length)]
  }

  const generateUniqueOptions = (correctAnswer: string, generateOption: () => string, count: number): string[] => {
    const options = [correctAnswer]
    let attempts = 0

    while (options.length < count && attempts < 100) {
      attempts++
      const option = generateOption()
      if (!options.includes(option)) {
        options.push(option)
      }
    }

    return options.sort(() => Math.random() - 0.5)
  }

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return

    setSelectedAnswer(answer)
    setIsAnswered(true)

    if (answer === questions[currentQuestionIndex].correctAnswer) {
      setCorrectAnswers((prev) => prev + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
    } else {
      setQuizCompleted(true)
    }
  }

  const handleRestartQuiz = () => {
    generateQuizQuestions()
    setShowIntro(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  if (showIntro) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
          {/* 表紙部分 */}
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 p-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 drop-shadow-md">CNPトレカクイズ</h1>
            <div className="flex justify-center space-x-4 mb-6">
              <Trophy className="h-12 w-12 text-black drop-shadow-md" />
              <Brain className="h-12 w-12 text-black drop-shadow-md" />
              <Award className="h-12 w-12 text-black drop-shadow-md" />
            </div>
            <p className="text-black text-lg md:text-xl max-w-xl mx-auto">
              あなたのCNPトレカの知識をテストしましょう！
            </p>
          </div>

          {/* ルール説明部分 */}
          <div className="p-6 md:p-8 bg-white dark:bg-gray-900">
            <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-800 dark:text-white">
              <HelpCircle className="mr-2 h-6 w-6 text-yellow-500" />
              ルール説明
            </h2>

            <div className="space-y-4 mb-8">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">クイズの内容</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  <li>全10問のクイズに挑戦します</li>
                  <li>各問題には4つの選択肢があり、正解は1つです</li>
                  <li>回答後に解説が表示されます</li>
                </ul>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">採点方法</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  <li>各問題に正解すると1ポイント獲得します</li>
                  <li>最終的な正解数に応じて評価が決まります</li>
                  <li>全問正解を目指しましょう！</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={startQuiz} className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-6 text-lg">
                クイズを始める
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (quizCompleted) {
    const score = Math.round((correctAnswers / questions.length) * 100)
    let message = ""

    if (score === 100) {
      message = "完璧！あなたはCNPトレカの達人です！"
    } else if (score >= 80) {
      message = "素晴らしい！あなたはCNPトレカに詳しいですね！"
    } else if (score >= 60) {
      message = "良い成績です！もう少し頑張りましょう！"
    } else if (score >= 40) {
      message = "まずまずの成績です。もっと練習しましょう！"
    } else {
      message = "もっとCNPトレカについて学びましょう！"
    }

    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">クイズ結果</h1>

          <div className="text-center mb-8">
            <div className="text-6xl font-bold mb-2 text-gray-800 dark:text-white">{score}%</div>
            <p className="text-xl text-gray-700 dark:text-gray-300">
              {correctAnswers} / {questions.length} 正解
            </p>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">{message}</p>
          </div>

          <div className="flex justify-center">
            <Button onClick={handleRestartQuiz} className="bg-yellow-500 hover:bg-yellow-600 text-black">
              もう一度挑戦する
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">CNPトレカクイズ</h1>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            問題 {currentQuestionIndex + 1} / {questions.length}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">{currentQuestion.question}</h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={isAnswered}
                className={`w-full text-left p-3 rounded-md transition-colors ${
                  selectedAnswer === option
                    ? option === currentQuestion.correctAnswer
                      ? "bg-green-500/20 border border-green-500"
                      : "bg-red-500/20 border border-red-500"
                    : isAnswered && option === currentQuestion.correctAnswer
                      ? "bg-green-500/20 border border-green-500"
                      : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700"
                }`}
              >
                <div className="flex items-center">
                  {isAnswered && option === currentQuestion.correctAnswer && (
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  )}
                  {isAnswered && selectedAnswer === option && option !== currentQuestion.correctAnswer && (
                    <XCircle className="mr-2 h-5 w-5 text-red-500" />
                  )}
                  <span className="text-gray-800 dark:text-gray-200">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {isAnswered && (
          <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">解説</h3>
            <p className="text-gray-700 dark:text-gray-300">{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="flex justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            正解: {correctAnswers} / {currentQuestionIndex + (isAnswered ? 1 : 0)}
          </div>
          {isAnswered && (
            <Button onClick={handleNextQuestion} className="bg-yellow-500 hover:bg-yellow-600 text-black">
              {currentQuestionIndex < questions.length - 1 ? "次の問題へ" : "結果を見る"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
