"use client";

import {
  PieceType,
  BLOCK_SIZE,
  SUPPORT_COLS,
  SUPPORT_ROWS,
} from "@/lib/tetris";
import Canvas from "./canvas";
import { useEffect, useRef, useState } from "react";

interface NexPiecePreviewProps {
  piece: PieceType | null;
}

export default function NexPiecePreview({ piece }: NexPiecePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    ctxRef.current = context;
  }, []);

  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.clearRect(0, 0, SUPPORT_COLS * BLOCK_SIZE, SUPPORT_ROWS * BLOCK_SIZE);
    if (!piece) return;

    const { shape, color } = piece;
    const pieceWidth = shape[0].length;
    const pieceHeight = shape.length;
    const offsetX = (SUPPORT_COLS - pieceWidth) / 2;
    const offsetY = (SUPPORT_ROWS - pieceHeight) / 2;

    ctx.fillStyle = color;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] === 1) {
          const x = (offsetX + c) * BLOCK_SIZE;
          const y = (offsetY + r) * BLOCK_SIZE;
          ctx.fillRect(x, y, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        }
      }
    }
  }, [piece]);

  return (
    <Canvas
      height={SUPPORT_ROWS * BLOCK_SIZE}
      width={SUPPORT_COLS * BLOCK_SIZE}
      ref={canvasRef}
    />
  );
}
