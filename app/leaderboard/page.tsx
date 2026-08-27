"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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

  if (loading) return <div>Cargando ranking...</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🏆 Ranking de Puntuaciones</h1>
      <div className="space-y-2">
        {scores.map((score, index) => (
          <div
            key={score.id}
            className="flex justify-between items-center p-3 bg-gray-800 rounded-lg"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-cyan-400">
                #{index + 1}
              </span>
              <span className="text-white font-medium">
                {score.player_name}
              </span>
            </div>
            <div className="text-right">
              <span className="text-yellow-400 font-bold">{score.score}</span>
              <span className="text-gray-400 text-sm ml-2">
                ({score.lines_cleared} líneas)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
