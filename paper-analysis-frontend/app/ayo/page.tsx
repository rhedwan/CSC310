"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, Crown } from "lucide-react";

interface GameState {
  board: number[];
  currentPlayer: 0 | 1;
  gameOver: boolean;
  winner: number | null;
  capturedSeeds: [number, number];
  lastMove: number[];
}

const INITIAL_SEEDS = 4;
const PITS_PER_SIDE = 6;
const TOTAL_PITS = PITS_PER_SIDE * 2;

export default function AyoGame() {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(TOTAL_PITS).fill(INITIAL_SEEDS),
    currentPlayer: 0,
    gameOver: false,
    winner: null,
    capturedSeeds: [0, 0],
    lastMove: [],
  });

  const getTotalRemainingSeeds = () => {
    return gameState.board.reduce((sum, seeds) => sum + seeds, 0);
  };

  const isValidMove = (pitIndex: number) => {
    const playerPits =
      gameState.currentPlayer === 0
        ? Array.from({ length: PITS_PER_SIDE }, (_, i) => i)
        : Array.from({ length: PITS_PER_SIDE }, (_, i) => i + PITS_PER_SIDE);

    return playerPits.includes(pitIndex) && gameState.board[pitIndex] > 0;
  };

  const makeMove = (startPit: number) => {
    if (!isValidMove(startPit) || gameState.gameOver) return;

    let newBoard = [...gameState.board];
    const currentPlayer = gameState.currentPlayer;
    let currentPit = startPit;
    let seeds = newBoard[startPit];
    newBoard[startPit] = 0;
    const movePath = [startPit];
    const newCapturedSeeds = [...gameState.capturedSeeds] as [number, number];

    const sowSeeds = () => {
      while (seeds > 0) {
        currentPit = (currentPit + 1) % TOTAL_PITS;
        if (currentPit !== startPit) {
          newBoard[currentPit]++;
          seeds--;
          movePath.push(currentPit);
        }
      }

      // Check if last seed landed in player's side and pit was not empty
      if (
        (currentPlayer === 0 && currentPit < PITS_PER_SIDE) ||
        (currentPlayer === 1 && currentPit >= PITS_PER_SIDE)
      ) {
        if (newBoard[currentPit] > 1) {
          seeds = newBoard[currentPit];
          newBoard[currentPit] = 0;
          sowSeeds();
        } else {
          // Capture if opposite pit has seeds
          const oppositePit = TOTAL_PITS - 1 - currentPit;
          if (newBoard[oppositePit] > 0) {
            newCapturedSeeds[currentPlayer] += newBoard[oppositePit] + 1;
            newBoard[currentPit] = 0;
            newBoard[oppositePit] = 0;
          }
        }
      }
    };

    sowSeeds();

    // Check for game over
    const player1Empty = newBoard
      .slice(0, PITS_PER_SIDE)
      .every((pit) => pit === 0);
    const player2Empty = newBoard
      .slice(PITS_PER_SIDE)
      .every((pit) => pit === 0);
    const isGameOver = player1Empty || player2Empty;

    if (isGameOver) {
      // Add remaining seeds to the player who still has seeds
      const remainingSeeds = newBoard.reduce((sum, seeds) => sum + seeds, 0);
      if (player1Empty) {
        newCapturedSeeds[1] += remainingSeeds;
      } else {
        newCapturedSeeds[0] += remainingSeeds;
      }
      newBoard = Array(TOTAL_PITS).fill(0);
    }

    setGameState((prev) => ({
      board: newBoard,
      currentPlayer: isGameOver
        ? prev.currentPlayer
        : prev.currentPlayer === 0
        ? 1
        : 0,
      gameOver: isGameOver,
      winner: isGameOver
        ? newCapturedSeeds[0] > newCapturedSeeds[1]
          ? 0
          : newCapturedSeeds[0] < newCapturedSeeds[1]
          ? 1
          : null
        : null,
      capturedSeeds: newCapturedSeeds,
      lastMove: movePath,
    }));
  };

  const resetGame = () => {
    setGameState({
      board: Array(TOTAL_PITS).fill(INITIAL_SEEDS),
      currentPlayer: 0,
      gameOver: false,
      winner: null,
      capturedSeeds: [0, 0],
      lastMove: [],
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 p-4 sm:p-8">
      <Card className="p-6 max-w-4xl w-full mx-auto">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Ayo Game</h1>
            <Button onClick={resetGame} variant="outline">
              Reset Game
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div
              className={`p-4 rounded-lg border ${
                gameState.currentPlayer === 0 ? "bg-primary/10" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold">Player 1</span>
                {gameState.winner === 0 && (
                  <Crown className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              <div className="text-2xl font-bold">
                {gameState.capturedSeeds[0]}
              </div>
              <div className="text-sm text-muted-foreground">
                seeds captured
              </div>
            </div>
            <div
              className={`p-4 rounded-lg border ${
                gameState.currentPlayer === 1 ? "bg-primary/10" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold">Player 2</span>
                {gameState.winner === 1 && (
                  <Crown className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              <div className="text-2xl font-bold">
                {gameState.capturedSeeds[1]}
              </div>
              <div className="text-sm text-muted-foreground">
                seeds captured
              </div>
            </div>
          </div>

          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              {gameState.gameOver
                ? gameState.winner !== null
                  ? `Game Over! Player ${gameState.winner + 1} wins!`
                  : "Game Over! It's a tie!"
                : `Player ${gameState.currentPlayer + 1}'s turn`}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-6 gap-4 mb-4">
            {/* Player 2's pits (reversed for better visualization) */}
            {gameState.board
              .slice(PITS_PER_SIDE)
              .reverse()
              .map((seeds, index) => (
                <Button
                  key={TOTAL_PITS - 1 - index}
                  variant="outline"
                  className={`h-20 transition-all duration-300 ${
                    gameState.currentPlayer === 1 &&
                    isValidMove(TOTAL_PITS - 1 - index)
                      ? "hover:bg-primary hover:text-primary-foreground"
                      : ""
                  } ${
                    gameState.lastMove.includes(TOTAL_PITS - 1 - index)
                      ? "animate-highlight"
                      : ""
                  }`}
                  onClick={() => makeMove(TOTAL_PITS - 1 - index)}
                  disabled={
                    !isValidMove(TOTAL_PITS - 1 - index) || gameState.gameOver
                  }
                >
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold">{seeds}</span>
                    <span className="text-xs text-muted-foreground">seeds</span>
                  </div>
                </Button>
              ))}
          </div>

          <div className="grid grid-cols-6 gap-4">
            {/* Player 1's pits */}
            {gameState.board.slice(0, PITS_PER_SIDE).map((seeds, index) => (
              <Button
                key={index}
                variant="outline"
                className={`h-20 transition-all duration-300 ${
                  gameState.currentPlayer === 0 && isValidMove(index)
                    ? "hover:bg-primary hover:text-primary-foreground"
                    : ""
                } ${
                  gameState.lastMove.includes(index) ? "animate-highlight" : ""
                }`}
                onClick={() => makeMove(index)}
                disabled={!isValidMove(index) || gameState.gameOver}
              >
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold">{seeds}</span>
                  <span className="text-xs text-muted-foreground">seeds</span>
                </div>
              </Button>
            ))}
          </div>

          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <span className="font-medium">Total Seeds on Board:</span>
            <span className="text-xl font-bold">
              {getTotalRemainingSeeds()}
            </span>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-semibold">Rules of Nigerian Ayo:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>The game starts with 4 seeds in each of the 12 pits</li>
              <li>
                Players sow seeds counter-clockwise, one in each pit, skipping
                the starting pit
              </li>
              <li>
                If the last seed lands in a non-empty pit on your side, pick up
                all seeds and continue sowing
              </li>
              <li>
                Capture occurs when the last seed lands in an empty pit on your
                side, and the opposite pit has seeds
              </li>
              <li>
                The game ends when a player has no seeds to sow on their turn
              </li>
              <li>
                The player with the most seeds (captured + on their side) wins
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
