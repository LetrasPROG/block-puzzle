"use client";

export default function Home() {
  // const canvas = document.getElementById("canvas");
  // const ctx = canvas.getContext("2d");
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1>Block Puzzle</h1>
      <div className="p-2">
        <canvas
          className="bg-gray-500 rounded-2xl"
          id="canvas"
          width={400}
          height={500}
        ></canvas>
      </div>
    </div>
  );
}
