"use client";

import { useState, useEffect, useRef } from "react";

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
            blockSize - 1
          );
        }
      });
    });
  };

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
      <div className="p-2">
        <canvas
          ref={canvasRef}
          className="bg-gray-800 border-2 border-gray-600"
          id="canvas"
          width={250}
          height={500}
        ></canvas>
      </div>
>>>>>>> c803d86857ec739877eb179bb2776b9a8fb1425b
    </div>
  );
}
