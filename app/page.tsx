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

const rotateMatrix = (matrix: number[][]): number[][] => {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated: number[][] = [];

  for (let newRow = 0; newRow < cols; newRow++) {
    rotated[newRow] = [];
    for (let newCol = 0; newCol < rows; newCol++) {
      rotated[newRow][newCol] = matrix[rows - 1 - newCol][newRow];
    }
  }

  return rotated;
};

export default function Home() {
  const [score, setScore] = useState(0);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [board, setBoard] = useState<(string | null)[][]>(() =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
  );
  const [currentPiece, setCurrentPiece] = useState<PieceType | null>(null);
  const [piecePosition, setPiecePosition] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentPieceRef = useRef(currentPiece);
  const piecePositionRef = useRef(piecePosition);
  const boardRef = useRef<(string | null)[][]>(board);

  useEffect(() => {
    currentPieceRef.current = currentPiece;
  }, [currentPiece]);

  useEffect(() => {
    piecePositionRef.current = piecePosition;
  }, [piecePosition]);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  // Validador de posición
  const isValidPosition = (
    piece: PieceType,
    pos: { x: number; y: number },
    boardToCheck: (string | null)[][],
  ): boolean => {
    // hacemos un recorrido por la matriz de la pieza
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c] === 1) {
          const boardX = pos.x + c;
          const boardY = pos.y + r;

          // Detectamos las paredes laterales y el piso
          if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
            return false;
          }

          // Detectamos si la pieza está por encima del techo
          if (boardY < 0) continue;

          // Detectamos si hay colisión con otro bloque fijo del tablero (no está vacío en ese espacio)
          if (boardToCheck[boardY][boardX] !== null) {
            return false;
          }
        }
      }
    }

    // Si pasó todas las pruebas es una posición válida
    return true;
  };

  // Colocar pieza y spawnear nueva
  const lockPiece = () => {
    const piece = currentPieceRef.current;
    const pos = piecePositionRef.current;
    const currentBoard = boardRef.current;

    if (!piece) return;

    // Copia del tablero y ponemos pieza actual
    const newBoard = currentBoard.map((row) => [...row]);
    const { shape, color } = piece;
    const { x, y } = pos;

    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (shape[r][c] === 1) {
          const boardY = y + r;
          const boardX = x + c;
          if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
            newBoard[boardY][boardX] = color;
          }
        }
      }
    }

    // TODO: Revisar puntuación
    // Elimina las filas completas
    const { board: clearedBoard, rowsCleared } = clearFullRows(newBoard);
    setBoard(clearedBoard);

    // Conteo de puntos
    if (rowsCleared) {
      // 100 pts por c/línea o mas si son más de 1 línea
      const points = [0, 100, 300, 500, 800];
      const addScore = points[rowsCleared] || 0;
      setScore((prev) => prev + addScore);
    }

    // Generamos nueva pieza
    const randomIndex = Math.floor(Math.random() * PIECES.length);
    const newPiece = PIECES[randomIndex];
    const spawnPos = { x: Math.floor(COLS / 2) - 1, y: 0 };

    // Validamos si cabe la nueva pieza
    if (!isValidPosition(newPiece, spawnPos, clearedBoard)) {
      setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
      setCurrentPiece(null);
      alert("¡Se acabó el Juego! 💀 Recarga la página para volver a empezar");
    } else {
      setCurrentPiece(newPiece);
      setPiecePosition(spawnPos);
    }
  };

  const clearFullRows = (
    currentBoard: (string | null)[][],
  ): { board: (string | null)[][]; rowsCleared: number } => {
    const nonFullRows = currentBoard.filter((row) =>
      row.some((cell) => cell === null),
    );
    const rowsCleared = ROWS - nonFullRows.length;

    const emptyRows = Array.from({ length: rowsCleared }, () =>
      Array(COLS).fill(null),
    );
    const newBoard = [...emptyRows, ...nonFullRows];

    return { board: newBoard, rowsCleared };
  };

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    setCtx(context);

    // Generar primera pieza
    const randomIndex = Math.floor(Math.random() * PIECES.length);
    const firstPiece = PIECES[randomIndex];
    setCurrentPiece(firstPiece);
    setPiecePosition({ x: Math.floor(COLS / 2) - 1, y: 0 });

    // tiempo de caída
    const interval = setInterval(() => {
      const piece = currentPieceRef.current;
      const pos = piecePositionRef.current;
      const currentBoard = boardRef.current;

      if (!piece) return;

      const newPos = { x: pos.x, y: pos.y + 1 };
      if (isValidPosition(piece, newPos, currentBoard)) {
        setPiecePosition(newPos);
      } else {
        lockPiece();
      }
    }, 500);

    // Controles del teclado
    const handleKeyDown = (e: KeyboardEvent) => {
      const piece = currentPieceRef.current;
      const pos = piecePositionRef.current;
      const currentBoard = boardRef.current;

      if (!piece) return;

      switch (e.key) {
        case "ArrowLeft": {
          const newPos = { x: pos.x - 1, y: pos.y };
          if (isValidPosition(piece, newPos, currentBoard)) {
            setPiecePosition(newPos);
          }
          e.preventDefault();
          break;
        }
        case "ArrowRight": {
          const newPos = { x: pos.x + 1, y: pos.y };
          if (isValidPosition(piece, newPos, currentBoard)) {
            setPiecePosition(newPos);
          }
          e.preventDefault();
          break;
        }
        case "ArrowDown": {
          const newPos = { x: pos.x, y: pos.y + 1 };
          if (isValidPosition(piece, newPos, currentBoard)) {
            setPiecePosition(newPos);
          }
          e.preventDefault();
          break;
        }
        case "ArrowUp": {
          const piece = currentPieceRef.current;
          const pos = piecePositionRef.current;
          if (!piece) return;

          const rotatedShape = rotateMatrix(piece.shape);
          const rotatedPiece: PieceType = {
            shape: rotatedShape,
            color: piece.color,
          };

          // Efecto Wall-Kick
          const attempts = [
            pos,
            { x: pos.x - 1, y: pos.y }, //Izq
            { x: pos.x + 1, y: pos.y }, //Der
          ];

          for (const attempt of attempts) {
            if (isValidPosition(rotatedPiece, attempt, boardRef.current)) {
              setCurrentPiece(rotatedPiece);
              setPiecePosition(attempt);
              break;
            }
          }
          e.preventDefault();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!ctx) return;
    drawBoard(ctx);
  }, [ctx, board, currentPiece, piecePosition]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
<<<<<<< HEAD
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert h-5 w-[100px]"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          // priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the{" "}
            <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/[.08]">
              page.tsx
            </code>{" "}
            file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert h-[14px] w-4"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={14}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
=======
      <h1 className="text-2xl mb-4">Block Puzzle</h1>
      <p className="mt-0 text-lg text-gray-100">Puntuación: {score}</p>
      <div className="p-2">
        <canvas
          ref={canvasRef}
          className="bg-gray-800 border-2 border-gray-600"
          id="canvas"
          width={COLS * BLOCK_SIZE}
          height={ROWS * BLOCK_SIZE}
        ></canvas>
      </div>
<<<<<<< HEAD
>>>>>>> c803d86857ec739877eb179bb2776b9a8fb1425b
=======
      <p className="mt-4 text-sm text-gray-500">
        Usa las flechas de ← → ↓ para mover, y ↑ para rotar
      </p>
>>>>>>> colissions-rotation
    </div>
  );
}
