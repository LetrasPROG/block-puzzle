"use client";

import { forwardRef, HTMLAttributes } from "react";

interface CanvasProps extends HTMLAttributes<HTMLCanvasElement> {
  width: number;
  height: number;
  className?: string;
}

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ width, height, className = "", ...props }, ref) => {
    return (
      <canvas
        ref={ref}
        width={width}
        height={height}
        className={`bg-gray-900 rounded-xl border-2 border-gray-600 shadow-inner ${className}`}
        {...props}
      />
    );
  },
);

Canvas.displayName = "Canvas";

export default Canvas;
