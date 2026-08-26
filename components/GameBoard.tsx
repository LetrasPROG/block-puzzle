"use client";

import {
  COLS,
  ROWS,
  BLOCK_SIZE,
  PieceType,
  getRandomPiece,
  isValidPosition,
  clearFullRows,
  rotateMatrix,
} from "@/lib/tetris";
import { useEffect, useRef, useState } from "react";
import Canvas from "./canvas";

interface GameBoardProps {
  onScoreChange?: (score: number) => void;
  onNextPieceChange?: (piece: PieceType | null) => void;
  onGameOver?: () => void;
}

export default function GameBoard({
  onScoreChange,
  onNextPieceChange,
  onGameOver,
}: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  //   Estado del juego
  const [board, setBoard] = useState<(string | null)[][]>(() =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
  );
  const [currentPiece, setCurrentPiece] = useState<PieceType | null>(null);
  const [piecePosition, setPiecePosition] = useState({ x: 0, y: 0 });
  const [nextPiece, setNextPiece] = useState<PieceType | null>(null);
  const [score, setScore] = useState(0);

  //   Ref para sincronización con setInterval
  const boardRef = useRef(board);
  const piecePositionRef = useRef(piecePosition);
  const nextPieceRef = useRef(nextPiece);
  const currentPieceRef = useRef(currentPiece);

  useEffect(() => {
    currentPieceRef.current = currentPiece;
  }, [currentPiece]);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    nextPieceRef.current = nextPiece;
    onNextPieceChange?.(nextPiece);
  }, [nextPiece, onNextPieceChange]);

  useEffect(() => {
    piecePositionRef.current = piecePosition;
  }, [piecePosition]);

  useEffect(() => {
    onScoreChange?.(score);
  }, [score, onScoreChange]);

  //   Función para fijar pieza
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
    if (rowsCleared > 0) {
      // 100 pts por c/línea o mas si son más de 1 línea
      const points = [0, 100, 300, 500, 800];
      const addPoints = points[rowsCleared] || 0;
      setScore((prev) => prev + addPoints);
    }

    // Lanzamos/Generamos nueva pieza
    const newPiece = nextPieceRef.current || getRandomPiece();
    const next = getRandomPiece();
    setNextPiece(next);
    const spawnPos = { x: Math.floor(COLS / 2) - 1, y: 0 };

    // Validamos si cabe la nueva pieza
    if (!isValidPosition(newPiece, spawnPos, clearedBoard)) {
      setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
      setCurrentPiece(null);
      setNextPiece(null);
      onGameOver?.();
    } else {
      setCurrentPiece(newPiece);
      setPiecePosition(spawnPos);
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

  // Dibujamos el tablero de juego principal
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    setCtx(context);

    // Generar primera pieza
    const firstPiece = getRandomPiece();
    const next = getRandomPiece();
    setCurrentPiece(firstPiece);
    setNextPiece(next);
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
    <div className="relative">
      <div className="p-1 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl shadow-2xl">
        <Canvas
          ref={canvasRef}
          width={COLS * BLOCK_SIZE}
          height={ROWS * BLOCK_SIZE}
        />
      </div>
    </div>
  );
}
