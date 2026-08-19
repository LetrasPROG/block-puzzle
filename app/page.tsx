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

  const [board, setBoard] = useState<(string | null)[][]>(() =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
  );

  const [currentPiece, setCurrentPiece] = useState<PieceType | null>(null);
  const [piecePosition, setPiecePosition] = useState({ x: 0, y: 0 });

  // Funciones de dibujado
  const drawBoard = (context: CanvasRenderingContext2D) => {
    context.clearRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);

    // Elementos estáticos del canvas
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const color = board[row][col];
        if (color) {
          context.fillStyle = color;
          context.fillRect(
            col * BLOCK_SIZE,
            row * BLOCK_SIZE,
            BLOCK_SIZE - 1,
            BLOCK_SIZE - 1,
          );
        }
      }
    }

    // Cuadrícula
    context.strokeStyle = "#444";
    context.lineWidth = 0.5;
    for (let i = 0; i <= COLS; i++) {
      context.beginPath();
      context.moveTo(i * BLOCK_SIZE, 0);
      context.lineTo(i * BLOCK_SIZE, ROWS * BLOCK_SIZE);
      context.stroke();
    }
    for (let i = 0; i <= ROWS; i++) {
      context.beginPath();
      context.moveTo(0, i * BLOCK_SIZE);
      context.lineTo(COLS * BLOCK_SIZE, i * BLOCK_SIZE);
      context.stroke();
    }

    // Pieza actual
    if (currentPiece) {
      const { shape, color } = currentPiece;
      const { x, y } = piecePosition;
      context.fillStyle = color;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c] === 1) {
            context.fillRect(
              (x + c) * BLOCK_SIZE,
              (y + r) * BLOCK_SIZE,
              BLOCK_SIZE - 1,
              BLOCK_SIZE - 1,
            );
          }
        }
      }
    }
  };

  // Función Sapwner
  const spawnPiece = () => {
    const randomIndex = Math.floor(Math.random() * PIECES.length);
    setCurrentPiece(PIECES[randomIndex]);
    setPiecePosition({ x: Math.floor(COLS / 2) - 1, y: 0 });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    setCtx(context);

    spawnPiece();

    // tiempo de caída
    const interval = setInterval(() => {
      setPiecePosition((prev) => ({ ...prev, y: prev.y + 1 }));
    }, 500);

    return clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!ctx) return;
    drawBoard(ctx);
  }, [ctx, board, currentPiece, piecePosition]);

  // const drawPiece = (context: CanvasRenderingContext2D, piece: any) => {
  //   const blockSize = 25;
  //   piece.shape.forEach((row: number[], y: number) => {
  //     row.forEach((cell: number, x: number) => {
  //       if (cell) {
  //         context.fillStyle = piece.color;
  //         context.fillRect(
  //           (piece.x + x) * blockSize,
  //           (piece.y + y) * blockSize,
  //           blockSize - 1,
  //           blockSize - 1,
  //         );
  //       }
  //     });
  //   });
  // };

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-2xl mb-4">Block Puzzle</h1>
      <div className="p-2">
        <canvas
          ref={canvasRef}
          className="bg-gray-800 border-2 border-gray-600"
          id="canvas"
          width={COLS * BLOCK_SIZE}
          height={ROWS * BLOCK_SIZE}
        ></canvas>
      </div>
    </div>
  );
}
