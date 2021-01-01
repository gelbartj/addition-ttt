import { AppStatus } from "../App";

export type Players = "X" | "O";
type SquareVal = Players | null;

export function emptyStatus(rows: number, cols: number): SquareVal[][] {
  return [...Array(rows)].map((e) => Array(cols).fill(null));
}

export const moves = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];

export const addBoard = [
  [-9, 1, 8, 0, 2, 3, 9, 6],
  [-2, -3, 1, -8, -1, 10, -4, 8],
  [-10, 4, -7, 9, -6, 3, -5, 7],
  [-9, -2, 2, -3, 0, -7, 6, 4],
  [-6, -4, -1, 5, 3, -10, 7, -2],
  [2, 0, -9, 10, -5, 8, 4, -6],
  [-7, -8, -4, -3, -1, -10, 0, 5],
  [9, 5, 6, 7, -8, -5, 10, 1],
];

export const multBoard = [
  [-4, -3, 16, 12, 1, 10, 6, -16],
  [15, 20, -8, -6, 0, -9, 1, 4],
  [-20, -25, 5, -12, -1, -25, -10, -9],
  [-10, 4, -15, -2, 5, 4, -12, 0],
  [12, 8, 16, 6, 9, 20, -5, 15],
  [3, 10, 4, 25, -4, -15, 2, 8],
  [-5, 0, -2, 3, -12, -8, -20, 3],
  [-16, -4, 15, -10, 2, 0, -6, -3],
];

// range of board numbers should be 2 * range of moves, centered on 0
const addBoardRange = Array.from(
  { length: (moves.length - 1) * 2 + 1 },
  (e, i) => i - (moves.length - 1)
);

const makeMultBoardRange = () => {
  let multBoardRange: number[] = [];
  for (let i = -5; i < 6; ++i) {
    for (let j = -5; j < 6; ++j) {
      multBoardRange.push(i * j);
    }
  }
  return multBoardRange;
};

const multBoardRange = makeMultBoardRange();

function makeBoardRow(cols: number, appStatus: AppStatus) {
  if (appStatus === null) {
    return [];
  }

  // Put only unique numbers in each row
  let rowSet = new Set<number>();
  while (rowSet.size < cols) {
    // Inefficient but immaterial for such a small array.
    // Testing on 100 million rows, average 6.87 loops was needed.
    rowSet.add(
      (appStatus === "ADD" ? addBoardRange : multBoardRange)[
        Math.floor(
          Math.random() *
            (appStatus === "ADD" ? addBoardRange : multBoardRange).length
        )
      ]
    );
  }
  return Array.from(rowSet);
}

  // Set up this way instead of an array of fewer objects to allow for direct lookup without search
export function makeBoardNums(rows: number, cols: number, appStatus: AppStatus) {
  let newBoard: number[][] = [...Array(rows)];
  for (let i = 0; i < rows; ++i) {
    newBoard[i] = makeBoardRow(rows, appStatus);
  }
  return newBoard;
}

export function randomBoardNums(rows: number, cols: number) {
  // Completely random
  let minMax = 10; // range of board numbers will be [-minMax, minMax]
  let newBoard: number[][] = [...Array(rows)];
  let randoms = Array.from({ length: rows * cols }, () =>
    Math.floor(Math.random() * (minMax * 2 + 1) - minMax)
  );
  for (let i = 0; i < rows; ++i) {
    newBoard[i] = randoms.slice(i * rows, i * rows + cols);
  }
  return newBoard;
}

type nsType = "N" | "S" | undefined;
type ewType = "E" | "W" | undefined;

function nonRecSearch(
  row: number,
  col: number,
  player: Players,
  activeSquares: SquareVal[][],
  nsDir?: nsType,
  ewDir?: ewType,
): number[][] {
  if (!nsDir && !ewDir) {
    return [];
  }
  let winChain: number[][] = [];
  let breakFlag = false;
  while (activeSquares[row][col] === player && !breakFlag) {
    winChain.push([row, col]);
    if (winChain.length >= 4) {
      return winChain;
    }
    switch (nsDir) {
      case "N":
        if (row > 0) row -= 1;
        else breakFlag = true;
        break;
      case "S":
        if (row > activeSquares.length) row += 1;
        else breakFlag = true;
        break;
    }
    switch (ewDir) {
      case "E":
        if (col < activeSquares.length - 2) {
          col += 1;
        } else breakFlag = true;
        break;
      case "W":
        if (col > 0) {
          col -= 1;
        } else breakFlag = true;
        break;
    }
  }
  return winChain;
}

export function search(row = 0, col = 0, activeSquares: SquareVal[][]) {
  let winChain: number[][] = [];
  for (let ns of ["N", "S", undefined] as nsType[]) {
    for (let ew of ["E", "W", undefined] as ewType[]) {
      if (!ns && !ew) {
        continue;
      }
      let player = activeSquares[row][col];
      if (player === null) return winChain;
      winChain = nonRecSearch(row, col, player, activeSquares, ns, ew, );
      if (winChain.length >= 4) return winChain;
    }
  }
  return winChain;
}