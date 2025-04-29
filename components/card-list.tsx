"use client"

import type React from "react"

interface Card {
  id: number
  title: string
  description: string
}

interface CardListProps {
  cards: Card[]
  sortBy?: string
  sortOrder?: "asc" | "desc"
  onSort?: (sortBy: string, sortOrder: "asc" | "desc") => void
}

const CardList: React.FC<CardListProps> = ({ cards, sortBy, sortOrder, onSort }) => {
  const handleSort = (field: string) => {
    if (sortBy === field) {
      onSort?.(field, sortOrder === "asc" ? "desc" : "asc")
    } else {
      onSort?.(field, "asc")
    }
  }

  const SortIcon = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className="ml-2 h-4 w-4 dark:text-white text-black" // Updated className here
      >
        <path
          fillRule="evenodd"
          d="M3.293 9.707a1 1 0 011.414 0L10 14.586l5.293-4.879a1 1 0 111.414 1.414l-6 5.5a1 1 0 01-1.414 0l-6-5.5a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
        <path
          fillRule="evenodd"
          d="M3.293 4.293a1 1 0 011.414 0L10 9.172l5.293-4.879a1 1 0 111.414 1.414l-6 5.5a1 1 0 01-1.414 0l-6-5.5a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    )
  }

  return (
    <div>
      <ul>
        {cards.map((card) => (
          <li key={card.id}>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </li>
        ))}
      </ul>

      <div>
        <button onClick={() => handleSort("title")}>
          Sort by Title
          {sortBy === "title" && <SortIcon />}
        </button>
      </div>
    </div>
  )
}

export default CardList
