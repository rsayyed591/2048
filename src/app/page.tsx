import Game2048 from "@/components/Game2048"
import { GithubIcon } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#121212] p-24">
      <Game2048 />
      <footer className="w-full py-4 text-center mt-auto">
        <p className="text-indigo-200">Made By Rehan</p>
        <a
          href="https://github.com/rsayyed591/memory-game"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 text-red-500 hover:text-red-400 transition-colors"
        >
          <GithubIcon className="w-4 h-4" />
          @rsayyed591
        </a>
      </footer>
    </main>
  )
}

