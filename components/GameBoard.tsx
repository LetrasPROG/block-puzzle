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
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Canvas from "./canvas";

export interface GameBoardHandle {
  start: () => void;
}

interface GameBoardProps {
  isPlaying?: boolean;
  onScoreChange?: (score: number) => void;
  onLineChange?: (lines: number) => void;
  onNextPieceChange?: (piece: PieceType | null) => void;
  onGameOver: (score: number, lines: number) => void;
}

// Función aumento de dificultad
const getSpeed = (lines: number): number => {
  const baseSpeed = 500;
  const minSpeed = 100;
  const level = Math.floor(lines / 10);
  const newSpeed = Math.max(minSpeed, baseSpeed - level * 30);
  return newSpeed;
};

const GameBoard = forwardRef<GameBoardHandle, GameBoardProps>(
  (
    {
      isPlaying = false,
      onScoreChange,
      onLineChange,
      onNextPieceChange,
      onGameOver,
    }: GameBoardProps,
    ref,
  ) => {
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
    const [lines, setLines] = useState(0);

    //   Ref para sincronización con setInterval
    const boardRef = useRef(board);
    const piecePositionRef = useRef(piecePosition);
    const nextPieceRef = useRef(nextPiece);
    const currentPieceRef = useRef(currentPiece);
    const scoreRef = useRef(score);
    const linesRef = useRef(lines);

    // Función para iniciar el juego (genera las primeras piezas)
    const startGame = () => {
      const firstPiece = getRandomPiece();
      const next = getRandomPiece();
      setCurrentPiece(firstPiece);
      setNextPiece(next);
      setPiecePosition({ x: Math.floor(COLS / 2) - 1, y: 0 });
    };

    useImperativeHandle(ref, () => ({
      start: startGame,
    }));

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      linesRef.current = lines;
    }, [lines]);

    useEffect(() => {
      scoreRef.current = score;
    }, [score]);

    useEffect(() => {
      onScoreChange?.(scoreRef.current);
    }, [score, onScoreChange]);

    useEffect(() => {
      onLineChange?.(linesRef.current);
    }, [lines, onLineChange]);

    // Función del bucle principal
    const gameLoop = () => {
      if (!isPlaying) return;
      const speed = getSpeed(linesRef.current);
      timeoutRef.current = setTimeout(() => {
        const piece = currentPieceRef.current;
        const pos = piecePositionRef.current;
        const boardNow = boardRef.current;

        if (piece) {
          const newPos = { x: pos.x, y: pos.y + 1 };
          if (isValidPosition(piece, newPos, boardNow)) {
            setPiecePosition(newPos);
          } else {
            lockPiece();
          }
        }

        gameLoop();
      }, speed);
    };

    // Iniciar el bucle al montar el componente (manejador de velocidad)
    useEffect(() => {
      if (isPlaying) {
        gameLoop();
      } else {
        if (timeoutRef.current) {
          clearInterval(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, [isPlaying]);

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
        setLines((prev) => prev + rowsCleared);
      }

      // Lanzamos/Generamos nueva pieza
      const newPiece = nextPieceRef.current || getRandomPiece();
      const next = getRandomPiece();
      setNextPiece(next);
      const spawnPos = { x: Math.floor(COLS / 2) - 1, y: 0 };

      // Validamos si cabe la nueva pieza
      if (!isValidPosition(newPiece, spawnPos, clearedBoard)) {
        onGameOver(scoreRef.current, linesRef.current);
        setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
        setCurrentPiece(null);
        setNextPiece(null);
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

      // Controles del teclado
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!isPlaying) return;
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
  },
);

GameBoard.displayName = "GameBoard";

export default GameBoard;
