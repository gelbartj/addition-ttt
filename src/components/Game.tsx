import { useRef, useState, useReducer } from "react";
import { AppStatus } from "../App";
import {
  addBoard,
  emptyStatus,
  makeBoardNums,
  moves,
  Players,
  search,
} from "./InitialsAndUtilities";
import { ErrorBanner } from "./ErrorBanner";
import { Moves } from "./Moves";
import { Board } from "./Board";

interface GameOverBlockProps {
  message?: string;
  resetGame: (arg0?: boolean) => void;
}

export const GameOverBlock: React.FC<GameOverBlockProps> = ({
  message,
  resetGame,
}) => (
  <>
    <div>{message}</div>
    <button className="playAgain" onClick={() => resetGame()}>
      Play again (same board)
    </button>
    &nbsp;&nbsp;
    <button className="playAgain" onClick={() => resetGame(true)}>
      Play again (new board)
    </button>
  </>
);

interface CurrPlayerBlockProps {
  currPlayer: Players;
}

const CurrPlayerBlock: React.FC<CurrPlayerBlockProps> = ({ currPlayer }) => (
  <>
    Current player:{" "}
    <strong className={`currPlayer ${currPlayer}`}>{currPlayer}</strong>
  </>
);

interface GameProps {
  appStatus: AppStatus;
}

let startPlayer: Players = "X";
const startMove: (number | undefined)[] = [];

export const initialState = {
  currPlayer: startPlayer as Players,
  randomBoard: false,
  currBoard: addBoard, // arbitrary, could easily be multboard
  currError: "",
  currMoves: startMove,
  activeSquares: emptyStatus(addBoard.length, addBoard[0].length),
  winSquares: [] as number[][],
  gameOver: false,
  moveCount: 0,
  showBoardInstructions: "" as "" | "active" | "hidden",
  lastMoved: [] as typeof startMove,
  lockedNumber: null as number | null,
  boardInstructions: "",
};

export const actions = {
  ADD_CLICKED_MOVE: "ADD_CLICKED_MOVE",
  RESET_ERROR: "RESET_ERROR",
  RESET_GAME: "RESET_GAME",
  GAME_OVER: "GAME_OVER",
  TOGGLE_PLAYER: "TOGGLE_PLAYER",
} as const;

interface AnyObj {
  [key: string]: any;
}

interface PayloadAction {
  type: typeof actions[keyof typeof actions];
  payload: AnyObj;
}

interface NoPayloadAction {
  type: typeof actions.TOGGLE_PLAYER | typeof actions.RESET_ERROR;
}

export const UPDATE_STATE_VALUE = "UPDATE_STATE_VALUE";

type StateField<T> = {
  [P in keyof T]?: T[P];
};

interface UpdateAction {
  type: typeof UPDATE_STATE_VALUE;
  payload: StateField<typeof initialState>;
}

export type Action = PayloadAction | NoPayloadAction | UpdateAction;

export const Game: React.FC<GameProps> = ({ appStatus }) => {
  const boardRef = useRef<HTMLDivElement>(null);

  const hideMessageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initialMsgState = {
    boardInstructions: "",
    showBoardInstructions: false,
    moveInstructions: "",
    highlightMoveInstructions: false,
  };

  function reducer(
    state: typeof initialState,
    action: Action
  ): typeof initialState {
    switch (action.type) {
      case actions.ADD_CLICKED_MOVE:
        let newState = {
          ...state,
          currMoves: state.currMoves.concat(action.payload.move),
          currError: "",
        };
        const [boardInstructions, showBoardInstructions] = getBoardInstructions(
          newState.currMoves as number[],
          newState.moveCount as number
        );
        return {
          ...newState,
          boardInstructions: boardInstructions,
          showBoardInstructions: showBoardInstructions,
        };
      case UPDATE_STATE_VALUE:
        return {
          ...state,
          ...action.payload,
        };
      case actions.RESET_ERROR:
        return {
          ...state,
          currError: "",
        };
      case actions.RESET_GAME:
        // payload should contain newBoard boolean
        return {
          ...initialState,
          randomBoard: action.payload.newBoard,
          currBoard: action.payload.newBoard
            ? makeBoardNums(
                state.currBoard.length,
                state.currBoard[0].length,
                appStatus
              )
            : state.currBoard,
        };
      case actions.GAME_OVER:
        // payload should contain winner and winChain
        return {
          ...state,
          currError: `🎉 Game over! ${action.payload.winner} wins 🎉`,
          gameOver: true,
          winSquares: action.payload.winChain,
        };
      case actions.TOGGLE_PLAYER:
        return {
          ...state,
          lastMoved: state.currMoves,
          currPlayer: state.currPlayer === "O" ? "X" : "O",
        };
      default:
        throw new Error();
    }
  }

  const [gameState, dispatch] = useReducer(reducer, initialState);

  function getBoardInstructions(
    currMovesArg: number[],
    moveCountArg: number,
    activeSquaresArg?: typeof gameState.activeSquares
  ): [string, "" | "active" | "hidden"] {
    // inefficient duplication of logic
    let newMovesResult =
      appStatus === "ADD"
        ? currMovesArg[0] + currMovesArg[1]
        : currMovesArg[0] * currMovesArg[1];
    if (!activeSquaresArg) activeSquaresArg = gameState.activeSquares;
    let noMoves = !gameState.currBoard
      .flat()
      .map((num) => num === newMovesResult)
      .some((val, idx) => {
        return (
          val &&
          activeSquaresArg![Math.floor(idx / gameState.activeSquares.length)][
            idx % gameState.activeSquares[0].length
          ] === null
        );
      });

    if (currMovesArg.length === 2 && moveCountArg === 0) {
      return [
        `👉 Now make your move in a square that matches the ${
          appStatus === "ADD" ? "sum" : "product"
        } of the numbers you picked!`,
        "active",
      ];
    } else if (moveCountArg === 1 && !noMoves) {
      return ["Nice choice!", "active"];
      // set timeout to disappear after 5 seconds
    } else if (currMovesArg.length === 2 && noMoves) {
      return [
        "Create a new number combination using the buttons above to enable new valid moves",
        "active",
      ];
    } else {
      return ["", "hidden"];
    }
  }

  function checkGameOver() {
    if (gameState.gameOver) return true;
    for (let row = 0; row < gameState.activeSquares.length; ++row) {
      for (let col = 0; col < gameState.activeSquares[0].length; ++col) {
        if (gameState.activeSquares[row][col]) {
          let winChain = search(row, col, gameState.activeSquares!);
          if (winChain.length >= 4) {
            dispatch({
              type: actions.GAME_OVER,
              payload: {
                winner: gameState.activeSquares[row][col],
                winChain: winChain,
              },
            });
            return true;
          }
        }
      }
    }
    return false;
  }

  let movesSum =
    gameState.currMoves.length === 2 &&
    gameState.currMoves[0] !== undefined &&
    gameState.currMoves[1] !== undefined
      ? gameState.currMoves[0] + gameState.currMoves[1]
      : undefined;

  let movesProduct =
    gameState.currMoves.length === 2 &&
    gameState.currMoves[0] !== undefined &&
    gameState.currMoves[1] !== undefined
      ? gameState.currMoves[0] * gameState.currMoves[1]
      : undefined;

  let movesResult = appStatus ? movesSum : movesProduct;

  function resetGame() {
    dispatch({ type: actions.RESET_GAME });
  }

  return (
    <>
      <ErrorBanner error={gameState.gameOver ? "" : gameState.currError} />
      <div id="moveStatus" className={gameState.gameOver ? "gameOver" : ""}>
        {gameState.gameOver ? (
          <GameOverBlock message={gameState.currError} resetGame={resetGame} />
        ) : (
          <CurrPlayerBlock currPlayer={gameState.currPlayer} />
        )}
      </div>
      <Moves
        state={gameState}
        moves={moves}
        movesResult={movesResult}
        appStatus={appStatus}
        dispatch={dispatch}
      />
      <Board />
    </>
  );
};
