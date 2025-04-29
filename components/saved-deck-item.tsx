"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface SavedDeckItemProps {
  id: string
  data: {
    name: string
    cards: string[]
    createdAt: string
    isRecommended?: boolean
  }
  isActive: boolean
  onLoadDeck: (id: string) => void
  onDeleteDeck: (id: string, e: React.MouseEvent) => void
}

export default function SavedDeckItem({ id, data, isActive, onLoadDeck, onDeleteDeck }: SavedDeckItemProps) {
  // データが存在しない場合は何も表示しない
  if (!data) {
    return null
  }

  return (
    <div
      className={`p-2 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? "bg-blue-100 dark:bg-blue-900 dark:bg-opacity-50 border border-blue-300 dark:border-blue-500"
          : "bg-white dark:bg-blue-900 dark:bg-opacity-20 border border-gray-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-600"
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="font-medium text-gray-800 dark:text-blue-300 flex-grow" onClick={() => onLoadDeck(id)}>
          {data?.name || "Unnamed Deck"}
          {data?.isRecommended && (
            <span className="ml-2 text-xs bg-yellow-500 text-black px-1 py-0.5 rounded">推奨</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500 dark:text-blue-500">
            {data?.createdAt ? new Date(data.createdAt).toLocaleDateString() : "-"}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-30"
            onClick={(e) => onDeleteDeck(id, e)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div
        className="text-xs font-mono text-amber-600 dark:text-yellow-400 mt-1 truncate hover:text-amber-700 dark:hover:text-yellow-300"
        onClick={() => onLoadDeck(id)}
        title={id}
      >
        ID: {id}
      </div>
    </div>
  )
}
