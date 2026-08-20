// "use client";

import { useEffect, useRef, useState } from "react";

import { PieceType } from "@/utils/pieces";

export default function NextPiece(
  cols: number,
  rows: number,
  blockSize: number,
  //   piece?: PieceType,
) {
  const COLS = cols / 2;
  const ROWS = rows / 4;
  const BLOCK_SIZE = blockSize;

  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // const context = ctx.getContext("2d");
  }, []);

  return (
    <>
      <canvas
        className="bg-gray-800 border-2 border-gray-600 absolute left-68"
        ref={canvasRef}
        width={COLS * BLOCK_SIZE}
        height={ROWS * BLOCK_SIZE}
      ></canvas>
    </>
  );
}
