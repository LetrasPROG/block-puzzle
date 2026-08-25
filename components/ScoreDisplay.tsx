export default function ScoreDisplay({ score }: { score: number }) {
  return (
    <div className="bg-gray-700/50 px-4 py-2 rounded-xl border border-gray-600">
      <span className="text-xs uppercase tracking-wider text-gray-400">
        Puntuación
      </span>
      <p className="text-2xl font-bold text-cyan-300 text-center">{score}</p>
    </div>
  );
}
