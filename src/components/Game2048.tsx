// ts-ignore
"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
// import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import Confetti from "react-confetti"
import useWindowSize from "react-use/lib/useWindowSize"

type Tile = {
  id: number
  value: number
  mergedFrom?: Tile[]
}

type Grid = (Tile | null)[][]

const GRID_SIZE = 4
const CELL_SIZE = 20
// const CELL_GAP = 2

const Game2048 = () => {
  const [grid, setGrid] = useState<Grid>([])
  const [score, setScore] = useState(0)
  const [isWon, setIsWon] = useState(false)
  const [gameOver, setGameOver] = useState(false)  // Renamed state
//   const { toast } = useToast()
  const { width, height } = useWindowSize()
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    resetGame()
  }, [])

  const resetGame = () => {
    const newGrid = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(null))
    addRandomTile(newGrid)
    addRandomTile(newGrid)
    setGrid(newGrid)
    setScore(0)
    setIsWon(false)
    setGameOver(false)  // Reset state on game reset
  }

  const addRandomTile = useCallback((grid: Grid) => {
    const availableCells = []
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (!grid[i][j]) {
          availableCells.push({ i, j })
        }
      }
    }
    if (availableCells.length > 0) {
      const { i, j } = availableCells[Math.floor(Math.random() * availableCells.length)]
      grid[i][j] = { id: Math.random(), value: Math.random() < 0.9 ? 2 : 4 }
    }
  }, [])

const moveTiles = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      let moved = false
      let scoreIncrease = 0
      const newGrid: Grid = JSON.parse(JSON.stringify(grid)).map((row: (Tile | null)[]) =>
        row.map((tile: Tile | null) => (tile ? { ...tile, mergedFrom: undefined } : null))
      )      
  
      const move = (i: number, j: number, di: number, dj: number) => {
        const tile = newGrid[i][j]
        if (!tile) return // Check that tile is not null
      
        let newI = i + di
        let newJ = j + dj
        while (newI >= 0 && newI < GRID_SIZE && newJ >= 0 && newJ < GRID_SIZE) {
          const nextTile = newGrid[newI][newJ]
          if (!nextTile) {
            // Move the tile
            newGrid[newI][newJ] = tile
            newGrid[i][j] = null
            i = newI
            j = newJ
            moved = true
          } else if (nextTile.value === tile.value && !nextTile.mergedFrom) {
            // Merge the tile
            newGrid[newI][newJ] = {
              id: Math.random(),
              value: tile.value * 2,
              mergedFrom: [tile, nextTile],
            }
            newGrid[i][j] = null
            // @ts-ignore: Object is possibly 'null'
            scoreIncrease += newGrid[newI][newJ].value
            moved = true
            // @ts-ignore: Object is possibly 'null'
            if (newGrid[newI][newJ].value === 2048 && !isWon) {
              setIsWon(true)
            }
            break
          } else {
            break
          }
          newI += di
          newJ += dj
        }
      }
      
  
      if (direction === "up") {
        for (let j = 0; j < GRID_SIZE; j++) {
          for (let i = 1; i < GRID_SIZE; i++) {
            move(i, j, -1, 0)
          }
        }
      } else if (direction === "down") {
        for (let j = 0; j < GRID_SIZE; j++) {
          for (let i = GRID_SIZE - 2; i >= 0; i--) {
            move(i, j, 1, 0)
          }
        }
      } else if (direction === "left") {
        for (let i = 0; i < GRID_SIZE; i++) {
          for (let j = 1; j < GRID_SIZE; j++) {
            move(i, j, 0, -1)
          }
        }
      } else if (direction === "right") {
        for (let i = 0; i < GRID_SIZE; i++) {
          for (let j = GRID_SIZE - 2; j >= 0; j--) {
            move(i, j, 0, 1)
          }
        }
      }
  
      if (moved) {
        addRandomTile(newGrid)
        setGrid(newGrid)
        setScore((prevScore) => prevScore + scoreIncrease)
      }
  
      if (isGameOver(newGrid)) {
        setGameOver(true)
      }
    },
    [grid, isWon, addRandomTile, gameOver], // Using 'gameOver' here
  )
  
  const isGameOver = (grid: Grid) => {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (!grid[i][j]) return false
        if (
          (i < GRID_SIZE - 1 && grid[i][j]?.value === grid[i + 1][j]?.value) ||
          (j < GRID_SIZE - 1 && grid[i][j]?.value === grid[i][j + 1]?.value)
        ) {
          return false
        }
      }
    }
    return true
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault()
        moveTiles(e.key.replace("Arrow", "").toLowerCase() as "up" | "down" | "left" | "right")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [moveTiles])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    }

    const dx = touchEnd.x - touchStartRef.current.x
    const dy = touchEnd.y - touchStartRef.current.y

    if (Math.abs(dx) > Math.abs(dy)) {
      moveTiles(dx > 0 ? "right" : "left")
    } else {
      moveTiles(dy > 0 ? "down" : "up")
    }

    touchStartRef.current = null
  }

  const getTileColor = (value: number) => {
    const colors: { [key: number]: string } = {
      2: "bg-gray-700",
      4: "bg-gray-600",
      8: "bg-gray-500",
      16: "bg-gray-400",
      32: "bg-gray-300",
      64: "bg-[#F67C5F]",
      128: "bg-[#EDC850]",
      256: "bg-yellow-400",
      512: "bg-yellow-300",
      1024: "bg-yellow-200",
      2048: "bg-yellow-100",
    }
    return colors[value] || "bg-yellow-50"
  }

  return (
    <Card
      className="p-6 bg-[#1E1E1E] border-gray-700 shadow-xl backdrop-blur-sm bg-opacity-80"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">2048</h1>
        <div className="text-right">
          <div className="text-xl font-semibold text-white mb-2">Score: {score}</div>
          <Button onClick={resetGame} variant="secondary">
            New Game
          </Button>
        </div>
      </div>
      <div
        className="grid gap-2 bg-[#121212] p-2 rounded-lg shadow-inner"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}vmin)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}vmin)`,
        }}
      >
        {grid.flat().map((tile, index) => (
          <motion.div
            key={index}
            className={cn(
              "flex items-center justify-center rounded-lg shadow-md text-white font-bold",
              tile ? getTileColor(tile.value) : "bg-gray-800",
            )}
            initial={{ scale: tile?.mergedFrom ? 0 : 1 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <AnimatePresence>
              {tile && (
                <motion.div
                  key={tile.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  {tile.value}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      {isWon && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Card className="p-6 bg-[#1E1E1E] border-gray-700 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Congratulations! You won!</h2>
            <div className="flex justify-between">
              <Button onClick={() => setIsWon(false)} variant="secondary">
                Continue
              </Button>
              <Button onClick={resetGame} variant="secondary">
                Restart
              </Button>
            </div>
          </Card>
          <Confetti width={width} height={height} />
        </div>
      )}
      {gameOver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Card className="p-6 bg-[#1E1E1E] border-gray-700 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Game Over</h2>
            <p className="text-white mb-4">Your score: {score}</p>
            <Button onClick={resetGame} variant="secondary" className="w-full">
              Restart Game
            </Button>
          </Card>
          <Confetti width={width} height={height} colors={["#808080", "#A9A9A9", "#D3D3D3"]} gravity={0.2} />
        </div>
      )}
    </Card>
  )
}

export default Game2048

