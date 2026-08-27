"use client";

import ControlsInfo from "@/components/ControlsInfo";
import GameBoard from "@/components/GameBoard";
import NextPiecePreview from "@/components/NextPiecePreview";
import ScoreDisplay from "@/components/ScoreDisplay";
import { PieceType } from "@/lib/tetris";
import { useState } from "react";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// TODO: Implementar que se pueda jugar con el tlf

export default function Home() {
  const [nextPiece, setNextPiece] = useState<PieceType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [currentLines, setCurrentLines] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalLines, setFinalLines] = useState(0);
  const [playerName, setPlayerName] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [message, setMessage] = useState("");

  // Guardar puntuación en Supabase
  const saveScore = async (name: string, score: number, lines: number) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("scores")
      .insert([{ player_name: name, score, lines_cleared: lines }]);
    if (error) {
      console.error("Error guardando puntuación:", error);
      throw new Error("Error al guardar la puntuación");
    }
    console.log("Puntuación guardada con éxito");
  };

  const handleGameOver = async (score: number, lines: number) => {
    setPlayerName("");
    setSaveMessage("");
    setSaveSuccess(false);
    setFinalScore(score);
    setFinalLines(lines);
    setCurrentScore(score);
    setCurrentLines(lines);
    setShowModal(true);
  };

  const handleSaveScore = async () => {
    const name = playerName.trim() || "Anónimo";
    setIsSaving(true);
    setSaveMessage("Guardando...");

    try {
      await saveScore(name, finalScore, finalLines);
      setSaveSuccess(true);
      setSaveMessage("¡Puntuación guardada correctamente! 🎉");
    } catch (error) {
      console.error(error);
      setSaveSuccess(false);
      setSaveMessage("Hubo un error al guardar. Intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestart = () => {
    setShowModal(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
            🧩 Block Puzzle
          </h1>
          <div className="flex items-center gap-4">
            <ScoreDisplay score={currentScore} />
            <div className="bg-gray-700/50 px-4 py-2 rounded-xl border border-gray-600 hidden sm:block">
              <span className="text-xs uppercase tracking-wider text-gray-400">
                Líneas
              </span>
              <p className="text-2xl font-bold text-green-400 text-center">
                {currentLines}
              </p>
            </div>
          </div>
        </div>

        {/* Area de juego */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <GameBoard
            onScoreChange={setCurrentScore}
            onLineChange={setCurrentLines}
            onNextPieceChange={setNextPiece}
            onGameOver={handleGameOver}
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
            className="px-6 py-2 bg-red-600/80 hover:bg-red-900 cursor-pointer text-white rounded-xl text-sm font-medium transition-colors duration-200 shadow-md border border-red-500/50"
          >
            🔄 Reiniciar
          </button>
        </div>

        <div>
          <Link
            href="/leaderboard"
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Ver Ranking 🏆
          </Link>
        </div>
      </div>
      <>
        {/* Modal GameOver */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-[90%] max-w-md bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl border border-gray-700 p-8 text-center transform transition-all animate-scaleIn">
              {/* Icono decorativo */}
              <div className="text-6xl mb-4">💀</div>
              <h2 className="text-3xl font-bold text-white mb-2">
                ¡Game Over!
              </h2>
              <p className="text-gray-300 mb-6">
                Has perdido, pero siempre puedes intentarlo de nuevo.
              </p>

              {/* Estadísticas */}
              <div className="bg-gray-700/50 rounded-2xl p-4 mb-6 border border-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Puntuación final</span>
                  <span className="text-2xl font-bold text-cyan-300">
                    {finalScore}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Líneas eliminadas</span>
                  <span className="text-2xl font-bold text-green-400">
                    {finalLines}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="playerName"
                  className="block text-sm text-gray-400 mb-1"
                >
                  Tu nombre (opcional)
                </label>
                <input
                  type="text"
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Ej: Carlos"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  disabled={isSaving || saveSuccess}
                />
              </div>

              {saveMessage && (
                <p
                  className={`text-sm mb-3 ${saveSuccess ? "text-green-400" : "text-red-400"}`}
                >
                  {saveMessage}
                </p>
              )}

              {/* Botón reiniciar */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSaveScore}
                  disabled={isSaving || saveSuccess}
                  className={`w-full py-3 font-bold rounded-xl transition-all duration-200 shadow-md border cursor-pointer
                  ${
                    isSaving || saveSuccess
                      ? "bg-gray-600 text-gray-300 border-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-green-400/30"
                  }`}
                >
                  {isSaving
                    ? "Guardando..."
                    : saveSuccess
                      ? "✅ Guardado"
                      : "💾 Guardar Puntuación"}
                </button>

                <button
                  onClick={handleRestart}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-200 shadow-md border border-cyan-400/30 cursor-pointer"
                >
                  🔄 Jugar de nuevo
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  );
}
