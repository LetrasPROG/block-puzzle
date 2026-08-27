"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Score = {
  id: number;
  player_name: string;
  score: number;
  lines_cleared: number;
  created_at: string;
};

export default function Leaderboard() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("scores")
        .select("*")
        .order("score", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error cargando puntuaciones:", error);
      } else {
        setScores(data || []);
      }
      setLoading(false);
    };

    fetchScores();
  }, []);

  // Medalla según posición
  const getMedal = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-cyan-400 text-xl animate-pulse">
          Cargando ranking...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-700">
        {/* Header con título y botón de vuelta */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
            🏆 Ranking de Puntuaciones
          </h1>
          <Link
            href="/"
            className="px-5 py-2 bg-cyan-600/80 hover:bg-cyan-700 text-white rounded-xl text-sm font-medium transition-colors duration-200 shadow-md border border-cyan-500/50"
          >
            ← Volver al juego
          </Link>
        </div>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {/* Lista de puntuaciones */}
          {scores.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <p className="text-2xl mb-2">😕 Aún no hay puntuaciones</p>
              <p className="text-sm">
                ¡Sé el primero en jugar y guardar tu puntuación!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {scores.map((score, index) => (
                <div
                  key={score.id}
                  className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl border transition-all hover:scale-[1.01] hover:border-cyan-500/30 
                  ${
                    index === 0
                      ? "bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-yellow-500/30"
                      : index === 1
                        ? "bg-gradient-to-r from-gray-400/10 to-gray-400/5 border-gray-400/20"
                        : index === 2
                          ? "bg-gradient-to-r from-amber-700/10 to-amber-700/5 border-amber-700/20"
                          : "bg-gray-700/30 border-gray-600/30"
                  }`}
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <span className="text-2xl font-bold text-cyan-400 min-w-[50px] text-center">
                      {getMedal(index)}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-white font-medium text-lg">
                        {score.player_name}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {formatDate(score.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-yellow-400 font-bold text-xl">
                      {score.score}
                    </span>
                    <span className="text-gray-400 text-sm bg-gray-800/50 px-3 py-1 rounded-full">
                      {score.lines_cleared} líneas
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-gray-500 text-xs border-t border-gray-700 pt-4">
          Mostrando las mejores {scores.length} puntuaciones
        </div>
      </div>
    </div>
  );
}
