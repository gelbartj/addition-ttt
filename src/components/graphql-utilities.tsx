import { debugLog } from "../App";
import { GameState } from "./Game";

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
    debugLog("error", "Received board with mismatched size");
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
  const newState: Partial<GameState> = {};

  if (ql.currBoard !== undefined) {
    if ((ql.currBoard?.length || 0) > 0) {
      let reshapedBoard = reshapeFlatBoard(ql.currBoard);
      if (reshapedBoard) {
        newState.currBoard = reshapedBoard;
      } else {
        debugLog("error", "Failed to deserialize boardNums");
        return newState;
      }
    } 
  }
  if (ql.activeSquares !== undefined) {
    if ((ql.activeSquares?.length || 0) > 0) {
      let reshapedBoard = reshapeFlatBoard(ql.activeSquares);
      if (reshapedBoard) {
        newState.activeSquares = reshapedBoard;
      } else {
        debugLog("error", "Failed to deserialize currBoard");
        return newState;
      }
    } /* else {
      newState.activeSquares = [];
    } */
  }

  if (ql.currMoves !== undefined && ql.currMoves !== null) {
    newState.currMoves = ql.currMoves.filter((item) => item !== null);
  }

  if (ql.winSquares !== undefined) {
    if ((ql.winSquares?.length || 0) > 0) {
      if (ql.winSquares.length % 2 !== 0) {
        debugLog("error", 
          "Failed to deserialize winSquares: invalid board shape"
        );
        return newState;
      }
      let reshapedBoard = [...Array(ql.winSquares.length / 2)].map((_, idx) => {
        return ql.winSquares!.slice(idx * 2, idx * 2 + 2);
      });
      if (reshapedBoard) {
        newState.winSquares = reshapedBoard;
      } else {
        debugLog("error", "Failed to deserialize winSquares");
        return newState;
      }
    } else {
      newState.winSquares = [];
    }
  }

  if (ql.moveCount !== undefined && ql.moveCount !== null) {
    newState.moveCount = ql.moveCount;
  }

  if (ql.winner !== undefined && ql.winner !== null) {
    newState.winner = ql.winner;
  }

  if (ql.currPlayer) newState.currPlayer = ql.currPlayer;

  if (ql.gameType) newState.gameType = ql.gameType;

  if (ql.oUsername) {
    newState.oUsername = ql.oUsername;
  }

  if (ql.xUsername) {
    newState.xUsername = ql.xUsername;
  }

  //    playerIDs?: string[], // emails
  //    xUsername?: string,
  //    oUsername?: string,
  // newState.gameType: gameChoice

  return newState;
}
