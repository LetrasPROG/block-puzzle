// Parámetros fijos del tablero
export const COLS = 10;
export const ROWS = 20;
export const BLOCK_SIZE = 25;
export const SUPPORT_COLS = COLS / 2;
export const SUPPORT_ROWS = ROWS / 5;

// Tipado de piezas
export type PieceType = {
  //(1 = relleno, 0 = vacío)
  shape: number[][];
  color: string;
};

// Posibles piezas
export const PIECES: PieceType[] = [
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

// Generar pieza random
export const getRandomPiece = (): PieceType => {
  const randomIndex = Math.floor(Math.random() * PIECES.length);
  return PIECES[randomIndex];
};

// Rotar pieza
export const rotateMatrix = (matrix: number[][]): number[][] => {
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

// Validador de posición
export const isValidPosition = (
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

// Limpiar líneas completas
export const clearFullRows = (
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
