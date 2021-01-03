import { useEffect, useMemo, useReducer, useState } from "react";
import { GameChoice as GameType } from "../App";
import {
  addBoard,
  emptyStatus,
  makeBoardNums,
  moves,
  multBoard,
  Players,
  search,
} from "./InitialsAndUtilities";
import { ErrorBanner } from "./ErrorBanner";
import { Moves } from "./Moves";
import { Board } from "./Board";
import { API, graphqlOperation } from "aws-amplify";
import { updateGame } from "../graphql/mutations";
import { UpdateGameInput, UpdateGameMutation } from "../API";
import { GraphQLGame, qlToState } from "./graphql-utilities";
import { GraphQLResult } from "@aws-amplify/api";

interface GameOverBlockProps {
  message?: string;
}

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
  gameType: GameType;
  gameObj?: any;
  playerIsX?: boolean;
  receivedGameState?: GraphQLGame | null;
  userId?: string;
}

let startPlayer: Players = "X";
const startMove: (number | null)[] = [];

export const initialGameState = {
  currPlayer: startPlayer as Players,
  randomBoard: false,
  currBoard: addBoard, // arbitrary, could easily be multboard
  currError: "",
  currMoves: startMove,
  activeSquares: emptyStatus(addBoard.length, addBoard[0].length),
  winSquares: [] as number[][],
  winner: "" as "X" | "O" | "",
  gameOver: false,
  moveCount: 0,
  showBoardInstructions: "" as "" | "active" | "hidden",
  lastMoved: [] as typeof startMove,
  lockedNumber: null as number | null,
  boardInstructions: "",
  hideHints: false,
  gameType: "ADD" as GameType // arbitrary
};

export const actions = {
  ADD_CLICKED_MOVE: "ADD_CLICKED_MOVE",
  RESET_ERROR: "RESET_ERROR",
  RESET_GAME: "RESET_GAME",
  GAME_OVER: "GAME_OVER",
  TOGGLE_PLAYER: "TOGGLE_PLAYER",
  UPDATE_SQUARE_STATUS: "UPDATE_SQUARE_STATUS",
  CLICKED_SQUARE: "CLICKED_SQUARE"
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
  payload: StateField<typeof initialGameState>;
}

export type Action = PayloadAction | NoPayloadAction | UpdateAction;

export const Game: React.FC<GameProps> = ({ gameType, gameObj, playerIsX, receivedGameState, userId }) => {
  initialGameState.gameType = gameType;
  initialGameState.currBoard = (gameType === "ADD" ? addBoard : multBoard);

  const [gameState, dispatch] = useReducer(reducer, initialGameState);

  useEffect(() => {
    // run once on mount
    (async () => syncDB())()
  }, []);

  const isMultiplayer = gameObj !== undefined && playerIsX !== undefined;
  const isYourTurn = isMultiplayer && ((playerIsX && gameState.currPlayer === "X")
    || (!playerIsX && gameState.currPlayer === "O"));

  // const hideMessageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function reducer(
    state: typeof initialGameState,
    action: Action
  ): typeof initialGameState {
    switch (action.type) {
      case actions.ADD_CLICKED_MOVE:
        console.warn("---------Dispatch: add clicked move")
        return {
          ...state,
          currMoves: state.currMoves.concat(action.payload.move),
          currError: "",
        };
      case actions.CLICKED_SQUARE:
        const activeSquaresCopy = [...state.activeSquares];
        const [row, col] = action.payload as number[];
        activeSquaresCopy[row][col] = state.currPlayer;
        return {
          ...state,
          currError: "",
          activeSquares: activeSquaresCopy,
          lastMoved: state.currMoves,
          currPlayer: state.currPlayer === "O" ? "X" : "O",
          lockedNumber: null
        }
      case actions.UPDATE_SQUARE_STATUS:
        console.warn("---------Dispatch: update square status")
        return {
          ...state,
          activeSquares: action.payload.activeSquares,
          moveCount: ++state.moveCount,
        };
      case UPDATE_STATE_VALUE:
        console.warn("---------Updating values: ", action.payload)
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
          ...initialGameState,
          randomBoard: action.payload.newBoard,
          currBoard: action.payload.newBoard
            ? makeBoardNums(
                state.currBoard.length,
                state.currBoard[0].length,
                gameType
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
          winner: action.payload.winner
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

  function arraysEqual(first: any[] | undefined | null, 
    second: any[] | undefined | null) {
      const firstNullish = first ?? undefined;
      const secondNullish = second ?? undefined;
    if (firstNullish === undefined && secondNullish === undefined) return true;
    if (firstNullish === undefined && secondNullish !== undefined) return false;
    if (firstNullish !== undefined && secondNullish === undefined) return false;

    if (first!.length !== second!.length) return false;
    for (let i = 0; i < first!.length; ++i) {
      if (first![i] !== second![i]) {
        return false;
      }
    }
    return true;
  }

  function isNoChange(received: GraphQLGame | null | undefined, toSend: UpdateGameInput) {
    // WARNING: This will only work with current GraphQL setup.
    // If return from subscription is shrunk, will no longer work.
      if (!received) return false;

      if (arraysEqual(received.currBoard, toSend.currBoard)
      && arraysEqual(received.activeSquares, toSend.activeSquares)
      && arraysEqual(received.currMoves, toSend.currMoves)
      && arraysEqual(received.winSquares, toSend.winSquares)
      && received.currPlayer === toSend.currPlayer
      && received.gameType === toSend.gameType
      && received.winner === toSend.winner)
      return true;

      return false;
    }

  const [lastGraphQLpayload, setLastGraphQLpayload] = useState<any>(null);
  
  async function syncDB() {
      console.log("Preparing to send update to GraphQL");

      const input: UpdateGameInput = {
        id: gameObj.id,
        currBoard: gameState.currBoard.flat(),
        activeSquares: gameState.activeSquares.flat(),
        currMoves: gameState.currMoves.length === 1 ? gameState.currMoves.concat(null) :gameState.currMoves,
        winSquares: gameState.winSquares.flat(),
        winner: gameState.winner,
        currPlayer: gameState.currPlayer,
        gameType: gameType,
        lastUpdateBy: userId
      }
      console.log("=============", "Sending update to GraphQL...", input);
      return (API.graphql(
        graphqlOperation(updateGame, {
          input: input
        })
      ) as Promise<GraphQLResult<UpdateGameMutation>>).then((e) => {
      if (e) console.log("Successfully updated DB: ", e)
    })
    .catch((e) => console.error("Error updating graphQL database: ", e));
  }


  const deserialized = useMemo(() => {
    console.log("receivedGameState changed: ", receivedGameState);
    return receivedGameState ?
    qlToState(receivedGameState): null}, [receivedGameState]);

  useEffect(() => {
    if (deserialized !== null) {
      dispatch({ type: UPDATE_STATE_VALUE, payload: { ...deserialized } });
    }
  }, [deserialized])

  let movesSum =
    gameState.currMoves.length === 2 &&
    gameState.currMoves[0] !== null &&
    gameState.currMoves[1] !== null
      ? gameState.currMoves[0] + gameState.currMoves[1]
      : undefined;

  let movesProduct =
    gameState.currMoves.length === 2 &&
    gameState.currMoves[0] !== null &&
    gameState.currMoves[1] !== null
      ? gameState.currMoves[0] * gameState.currMoves[1]
      : undefined;

  let movesResult = gameType === "ADD" ? movesSum : movesProduct;

  function updateBoardInstructions() {
    // Check for squares with values matching movesResult and that are empty (no X or O)
    let boardInstructions = "";
    let showBoardInstructions: "" | "hidden" | "active" = "hidden";
    let noMoves = !gameState.currBoard
      .flat()
      .map((num) => num === movesResult)
      .some((val, idx) => {
        return (
          val &&
          gameState.activeSquares![
            Math.floor(idx / gameState.activeSquares.length)
          ][idx % gameState.activeSquares[0].length] === null
        );
      });

    if (gameState.currMoves.length === 2 && gameState.moveCount === 0) {
      boardInstructions = `👉  Now make your move in a square that matches the ${
        gameType === "ADD" ? "sum" : "product"
      } of the numbers you picked!`;
      showBoardInstructions = "active";
    } else if (gameState.moveCount === 1 && !noMoves) {
      boardInstructions = "Nice choice!";
      showBoardInstructions = "active";
      // set timeout to disappear after 5 seconds
    } else if (gameState.currMoves.length === 2 && noMoves) {
      boardInstructions =
        "Create a new number combination using the buttons above to enable new valid moves";
      showBoardInstructions = "active";
    }

    dispatch({
      type: UPDATE_STATE_VALUE,
      payload: {
        boardInstructions: boardInstructions,
        showBoardInstructions: showBoardInstructions,
      },
    });
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
            syncDB();
            return true;
          }
        }
      }
    }
    return false;
  }

  function resetGame(random: boolean = false) {
    dispatch({ type: actions.RESET_GAME, payload: { newBoard: random } });
    syncDB();
  }

  const GameOverBlock: React.FC<GameOverBlockProps> = ({
    message
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

  return (
    <>
      { gameObj.roomCode }
      <ErrorBanner error={gameState.gameOver ? "" : gameState.currError} />
      <div id="moveStatus" className={gameState.gameOver ? "gameOver" : ""}>
        {gameState.gameOver ? (
          <GameOverBlock message={gameState.currError} />
        ) : (
          <>
          <CurrPlayerBlock currPlayer={gameState.currPlayer} />
          { isMultiplayer && <div className={`turn ${isYourTurn ? "yours" : "theirs"}`}>{
              isYourTurn ? "Your turn!" : "Opponent's turn"
        }</div> }
          </>
        )}
      </div>
      <Moves
        state={gameState}
        moves={moves}
        movesResult={movesResult}
        gameType={gameType}
        dispatch={dispatch}
        updateBoardInstructions={updateBoardInstructions}
        syncDB={syncDB}
        isYourTurn={isYourTurn}
      />
      <Board
        state={gameState}
        movesResult={movesResult}
        dispatch={dispatch}
        checkGameOver={checkGameOver}
        updateBoardInstructions={updateBoardInstructions}
        syncDB={syncDB}
        isYourTurn={isYourTurn}
      />
    </>
  );
};

export default Game;