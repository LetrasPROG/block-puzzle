export default function ControlsInfo() {
  return (
    <div className="text-center text-gray-400 text-sm bg-gray-700/30 px-4 py-2 rounded-xl border border-gray-700 w-full">
      <div className="flex justify-center gap-3 text-xs">
        <div>
          <span>← →</span>
          <p className="mt-1">Mover</p>
        </div>
        <div>
          <span>↓</span>
          <p className="mt-1">Caer</p>
        </div>
        <div>
          <span>↑</span>
          <p className="mt-1">Rotar</p>
        </div>
      </div>
    </div>
  );
}
