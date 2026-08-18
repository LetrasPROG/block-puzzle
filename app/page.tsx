"use client";

import { useState, useEffect, useRef } from "react";

// Parámetros fijos del tablero
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 25;

// Tipado de piezas
type PieceType = {
  //(1 = relleno, 0 = vacío)
  shape: number[][];
  color: string;
};

// Posibles piezas
const PIECES: PieceType[] = [
  { shape: [[1, 1, 1, 1]], color: "#00f0f0" }, //I
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#f0f000",
  }, //O
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "#a000f0",
  }, //T
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "#00f000",
  }, //S
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "#f00000",
  }, //Z
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "#f0a000",
  }, //L
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "#0000f0",
  }, //J
];

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [currentPiece, setCurrentPiece] = useState({
    shape: [[1, 1, 1, 1]],
    color: "#00f0f0",
    x: 3,
    y: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    setCtx(context);

    context.fillStyle = "#ff0000";
    context.fillRect(20, 20, 50, 50);

    drawGrid(context);
    drawPiece(context, currentPiece);
  }, []);

  const drawGrid = (context: CanvasRenderingContext2D) => {
    const blockSize = 25;
    const cols = 10;
    const rows = 20;

    context.strokeStyle = "#444";
    context.lineWidth = 0.5;

    for (let i = 0; i < cols; i++) {
      context.beginPath();
      context.moveTo(i * blockSize, 0);
      context.lineTo(i * blockSize, rows * blockSize);
      context.stroke();
    }

    for (let i = 0; i <= rows; i++) {
      context.beginPath();
      context.moveTo(0, i * blockSize);
      context.lineTo(cols * blockSize, i * blockSize);
      context.stroke();
    }
  };

  const drawPiece = (context: CanvasRenderingContext2D, piece: any) => {
    const blockSize = 25;
    piece.shape.forEach((row: number[], y: number) => {
      row.forEach((cell: number, x: number) => {
        if (cell) {
          context.fillStyle = piece.color;
          context.fillRect(
            (piece.x + x) * blockSize,
            (piece.y + y) * blockSize,
            blockSize - 1,
            blockSize - 1,
          );
        }
      });
    });
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-2xl mb-4">Block Puzzle</h1>
      <div className="p-2">
        <canvas
          ref={canvasRef}
          className="bg-gray-800 border-2 border-gray-600"
          id="canvas"
          width={250}
          height={500}
        ></canvas>
      </div>
    </div>
  );
}
