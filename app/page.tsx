import { redirect } from "next/navigation"

export default function Home() {
  redirect("/deck-builder")
  return null
}
