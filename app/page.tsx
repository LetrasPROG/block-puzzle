"use client";

import ControlsInfo from "@/components/ControlsInfo";
import GameBoard from "@/components/GameBoard";
import NextPiecePreview from "@/components/NextPiecePreview";
import ScoreDisplay from "@/components/ScoreDisplay";
import { PieceType } from "@/lib/tetris";
import { useState } from "react";

// TODO: Implementar que se pueda jugar con el tlf
// TODO: Componetizar todo y reducir las líneas de código del page.tsx

export default function Home() {
  const [score, setScore] = useState(0);
  const [nextPiece, setNextPiece] = useState<PieceType | null>(null);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
            🧩 Block Puzzle
          </h1>
          <div className="flex items-center gap-4">
            <ScoreDisplay score={score} />
            <div className="bg-gray-700/50 px-4 py-2 rounded-xl border border-gray-600 hidden sm:block">
              <span className="text-xs uppercase tracking-wider text-gray-400">
                Líneas
              </span>
              <p className="text-2xl font-bold text-green-400 text-center">
                {Math.floor(score / 100)}
              </p>
            </div>
          </div>
        </div>

        {/* Area de juego */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <GameBoard
            onScoreChange={setScore}
            onNextPieceChange={setNextPiece}
            onGameOver={() => setShowModal(true)}
          />
          <div className="flex flex-col items-center gap-6 min-w-[140px]">
            <div className="bg-gray-700/50 p-4 rounded-2xl border border-gray-600 w-full">
              <p className="text-xs uppercase tracking-wider text-gray-400 text-center mb-2">
                Siguiente
              </p>
              <div className="flex justify-center">
                <NextPiecePreview piece={nextPiece} />
              </div>
            </div>
            <ControlsInfo />
          </div>
        </div>

        {/* Botón de reinicio */}
        <div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600/80 hover:bg-red-700 cursor-pointer text-white rounded-xl text-sm font-medium transition-colors duration-200 shadow-md border border-red-500/50"
          >
            🔄 Reiniciar
          </button>
        </div>

        {/* Modal GameOver */}
        {showModal && (
          <div className="absolute mx-auto my-auto w-[300px] h-[250px] z-10">
            <h1>
              ¡Se acabó el Juego! 💀 Recarga la página para volver a empezar
            </h1>
            <p>
              Tu puntuación final fue: <span>{score}</span>
            </p>
            <p>
              Total de líneas eliminadas: <span>{Math.floor(score / 100)}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
