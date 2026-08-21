"use client";

import { useState, useEffect, useRef } from "react";

// Parámetros fijos del tablero
const COLS = 10;
const ROWS = 20;
const SUPPORT_COLS = COLS / 2;
const SUPPORT_ROWS = ROWS / 5;
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

const getRandomPiece = (): PieceType => {
  const randomIndex = Math.floor(Math.random() * PIECES.length);
  return PIECES[randomIndex];
};

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
  const [supCtx, setSupCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [board, setBoard] = useState<(string | null)[][]>(() =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
  );
  const [supportBoard, setSupportBoard] = useState<(string | null)[][]>(() =>
    Array.from({ length: SUPPORT_ROWS }, () => Array(SUPPORT_COLS).fill(null)),
  );
  const [currentPiece, setCurrentPiece] = useState<PieceType | null>(null);
  const [piecePosition, setPiecePosition] = useState({ x: 0, y: 0 });
  const [pieceCheck, setPieceCheck] = useState(0);
  const [staticPosition, setStaticPosition] = useState({ x: 1, y: 1 });

  const [nextPiece, setNextPiece] = useState<PieceType | null>(null);

  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const supportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentPieceRef = useRef(currentPiece);
  const nextPieceRef = useRef(nextPiece);
  const pieceCheckRef = useRef(pieceCheck);
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

  useEffect(() => {
    nextPieceRef.current = nextPiece;
  }, [nextPiece]);

  useEffect(() => {
    pieceCheckRef.current = pieceCheck;
  }, [pieceCheck]);

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

  // Verificamos si hay pieza siguiente
  const checkNextPiece = () => {
    if (pieceCheckRef.current === 0) {
      const newPiece = getRandomPiece();
      setPieceCheck(1);
      setNextPiece(newPiece);
    }
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

    // Lanzamos/Generamos nueva pieza
    const spawnPos = { x: Math.floor(COLS / 2) - 1, y: 0 };
    const newPiece = getRandomPiece();
    const nextPiece = nextPieceRef.current ? nextPieceRef.current : newPiece;

    // Validamos si cabe la nueva pieza
    if (!isValidPosition(nextPiece, spawnPos, clearedBoard)) {
      setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
      setCurrentPiece(null);
      setNextPiece(null);
      alert("¡Se acabó el Juego! 💀 Recarga la página para volver a empezar");
    } else {
      setCurrentPiece(nextPiece);
      setPiecePosition(spawnPos);
      setPieceCheck(0);
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

  const drawSupBoard = (context: CanvasRenderingContext2D) => {
    context.clearRect(
      0,
      0,
      SUPPORT_COLS * BLOCK_SIZE,
      SUPPORT_ROWS * BLOCK_SIZE,
    );

    // Elementos estáticos del 2do canvas
    for (let row = 0; row < SUPPORT_ROWS; row++) {
      for (let col = 0; col < SUPPORT_COLS; col++) {
        const color = supportBoard[row][col];
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
    for (let i = 0; i < SUPPORT_COLS; i++) {
      context.beginPath();
      context.moveTo(i * BLOCK_SIZE, 0);
      context.lineTo(i * BLOCK_SIZE, SUPPORT_ROWS * BLOCK_SIZE);
      context.stroke();
    }
    for (let i = 0; i < SUPPORT_ROWS; i++) {
      context.beginPath();
      context.moveTo(0, i * BLOCK_SIZE);
      context.lineTo(SUPPORT_COLS * BLOCK_SIZE, i * BLOCK_SIZE);
      context.stroke();
    }

    // Siguiente pieza
    if (nextPiece) {
      const { shape, color } = nextPiece;
      const { x, y } = staticPosition;
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

  // Dibujamos el canvas para mostrar pieza siguiente
  useEffect(() => {
    const canvas = supportCanvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    setSupCtx(context);
  }, []);

  // Dibujamos el tablero de juego principal
  useEffect(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    setCtx(context);

    // Generar primera pieza
    const firstPiece = getRandomPiece();
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
        checkNextPiece();
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

  useEffect(() => {
    if (!supCtx) return;
    drawSupBoard(supCtx);
  }, [supCtx, nextPiece]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
            🧩 Block Puzzle
          </h1>
          <div className="flex items-center gap-4">
            <div className="bg-gray-700/50 px-4 py-2 rounded-xl border border-gray-600">
              <span className="text-xs uppercase tracking-wider text-gray-400">
                Puntuación:
              </span>
              <p className="text-2xl font-bold text-cyan-300 text-center">
                {score}
              </p>
            </div>
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
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="relative">
            <div className="p-1 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl shadow-2xl">
              <canvas
                ref={mainCanvasRef}
                className="bg-gray-900 rounded-xl border-2 border-gray-600 shadow-inner"
                id="main_canvas"
                width={COLS * BLOCK_SIZE}
                height={ROWS * BLOCK_SIZE}
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 min-w-[140px]">
            <div className="bg-gray-700/50 p-4 rounded-2xl border border-gray-600 w-full">
              <p className="text-xs uppercase tracking-wider text-gray-400 text-center mb-2">
                Siguiente
              </p>
              <div className="flex justify-center">
                <canvas
                  className="bg-gray-900 rounded-xl border border-gray-600"
                  ref={supportCanvasRef}
                  width={SUPPORT_COLS * BLOCK_SIZE}
                  height={SUPPORT_ROWS * BLOCK_SIZE}
                  id="support_canvas"
                />
              </div>
            </div>
            <div className="text-center text-gray-400 text-sm bg-gray-700/30 px-4 py-2 rounded-xl border border-gray-700 w-full">
              <div className="flex justify-center gap-5 text-xs">
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
          </div>
        </div>

        <div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors duration-200 shadow-md border border-red-500/50"
          >
            🔄 Reiniciar
          </button>
        </div>
      </div>
    </div>
  );
}
