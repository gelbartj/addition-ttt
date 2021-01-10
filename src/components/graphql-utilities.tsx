import { extGameState } from "./Game";

export interface GraphQLGame {
  id: number;
  roomCode: string;
  currBoard?: number[];
  activeSquares?: ("X" | "O" | "")[];
  moveCount?: number;
  currMoves?: number[];
  gameType?: "ADD" | "MULT" | "ALG";
  playerIDs?: string[]; // emails
  xUsername?: string;
  oUsername?: string;
  winner?: "X" | "O" | "";
  winSquares?: number[];
  currPlayer?: "X" | "O";
  lastUpdateBy?: string;
}

function reshapeFlatBoard(flat: any[], rows = 8, cols = 8) {
  if (flat.length !== rows * cols) {
    console.error("Received board with mismatched size");
    return null;
  }
  const newBoard = [...Array(rows)].map((e) => Array(cols).fill(null));
  let currRow = 0;
  let currCol = 0;
  for (let item of flat) {
    newBoard[currRow][currCol] = item;
    // console.log(`Set [${currRow}, ${currCol}] to ${item}`);
    if (currCol === cols - 1) {
      currCol = 0;
      ++currRow;
    } else {
      ++currCol;
    }
  }
  // console.log("Started with: ", flat);
  // console.log("Reshaped board: ", newBoard);
  return newBoard;
}

export function qlToState(ql: GraphQLGame) {
  const newState: Partial<typeof extGameState> = {};

  if (ql.currBoard !== undefined) {
    if ((ql.currBoard?.length || 0) > 0) {
      let reshapedBoard = reshapeFlatBoard(ql.currBoard);
      if (reshapedBoard) {
        newState.currBoard = reshapedBoard;
      } else {
        console.error("Failed to deserialize boardNums");
        return newState;
      }
    } else {
      newState.currBoard = [];
    }
  }
  if (ql.activeSquares !== undefined) {
    if ((ql.activeSquares?.length || 0) > 0) {
      let reshapedBoard = reshapeFlatBoard(ql.activeSquares);
      if (reshapedBoard) {
        newState.activeSquares = reshapedBoard;
      } else {
        console.error("Failed to deserialize currBoard");
        return newState;
      }
    } else {
      newState.activeSquares = [];
    }
  }

  if (ql.currMoves !== undefined && ql.currMoves !== null) {
    newState.currMoves = ql.currMoves.filter((item) => item !== null);
  }

  if (ql.winSquares !== undefined) {
    if ((ql.winSquares?.length || 0) > 0) {
      if (ql.winSquares.length % 2 !== 0) {
        console.error(
          "Failed to deserialize winSquares, " + "invalid board shape"
        );
        return newState;
      }
      let reshapedBoard = [...Array(ql.winSquares.length / 2)].map((_, idx) => {
        return ql.winSquares!.slice(idx * 2, idx * 2 + 2);
      });
      if (reshapedBoard) {
        newState.winSquares = reshapedBoard;
      } else {
        console.error("Failed to deserialize winSquares");
        return newState;
      }
    } else {
      newState.winSquares = [];
    }
  }

  if (ql.moveCount !== undefined) {
    newState.moveCount = ql.moveCount;
  }

  if (ql.winner !== undefined) {
    newState.winner = ql.winner;
  }

  if (ql.currPlayer !== undefined) newState.currPlayer = ql.currPlayer;

  if (ql.gameType !== undefined) newState.gameType = ql.gameType;

  if (ql.oUsername !== undefined) {
    newState.oUsername = ql.oUsername;
  }

  if (ql.xUsername !== undefined) {
    newState.xUsername = ql.xUsername;
  }

  //    playerIDs?: string[], // emails
  //    xUsername?: string,
  //    oUsername?: string,
  // newState.gameType: gameChoice

  return newState;
}
