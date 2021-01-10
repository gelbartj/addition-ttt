import { useEffect, useMemo, useReducer } from "react";
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

interface PlayerBlockProps {
  player: Players;
  message?: string;
}

const PlayerBlock: React.FC<PlayerBlockProps> = ({ player, message }) => (
  <>
    { message || "Current player: "}
    <strong className={`currPlayer ${player}`}>{player}</strong>
  </>
);

interface GameProps {
  gameType: GameType;
  gameObj?: any;
  playerIsX?: boolean;
  receivedGameState?: GraphQLGame | null;
  userId?: string;
  username?: string;
}

let startPlayer: Players = "X";
const startMove: (number | null)[] = [];

export const extGameState = {
  currPlayer: startPlayer as Players,
  randomBoard: false,
  currBoard: addBoard, // arbitrary, could easily be multboard
  currError: "",
  currMoves: startMove,
  activeSquares: emptyStatus(addBoard.length, addBoard[0].length),
  winSquares: [] as number[][],
  winner: "" as "X" | "O" | "",
  moveCount: 0,
  showBoardInstructions: "" as "" | "active" | "hidden",
  lastMoved: [] as typeof startMove,
  lockedNumber: null as number | null,
  boardInstructions: "",
  hideHints: false,
  gameType: "ADD" as GameType, // arbitrary
  needsUpdate: true,
  xUsername: "[Your name]",
  oUsername: "[Awaiting opponent]"
};

const noPayloadActions = {
  TOGGLE_PLAYER: "TOGGLE_PLAYER",
  RESET_ERROR: "RESET_ERROR",
  SYNC_DB: "SYNC_DB",
  UPDATE_BOARD_INSTRUCTIONS: "UPDATE_BOARD_INSTRUCTIONS",
  CHECK_GAME_OVER: "CHECK_GAME_OVER",
};

const payloadActions = {
  ADD_CLICKED_MOVE: "ADD_CLICKED_MOVE",
  RESET_GAME: "RESET_GAME",
  GAME_OVER: "GAME_OVER",
  UPDATE_SQUARE_STATUS: "UPDATE_SQUARE_STATUS",
  CLICKED_SQUARE: "CLICKED_SQUARE",
};

export const actions = {
  ...noPayloadActions,
  ...payloadActions,
} as const;

interface AnyObj {
  [key: string]: any;
}

interface PayloadAction {
  type: typeof payloadActions[keyof typeof payloadActions];
  payload: AnyObj;
}

interface NoPayloadAction {
  type: typeof noPayloadActions[keyof typeof noPayloadActions];
}

export const UPDATE_STATE_VALUE = "UPDATE_STATE_VALUE";

/*
type StateField<T> = {
  [P in keyof T]?: T[P];
};
*/

interface UpdateAction {
  type: typeof UPDATE_STATE_VALUE;
  payload: Partial<typeof extGameState>;
}

export type Action = PayloadAction | NoPayloadAction | UpdateAction;

export const Game: React.FC<GameProps> = ({
  gameType,
  gameObj,
  playerIsX,
  receivedGameState,
  userId
}) => {
  const initialGameState = { ...extGameState };
  initialGameState.gameType = gameType;
  initialGameState.currBoard = gameType === "ADD" ? addBoard : multBoard;
  if (gameObj.xUsername) initialGameState.xUsername = gameObj.xUsername;
  if (gameObj.oUsername) initialGameState.oUsername = gameObj.oUsername;

  if (!playerIsX) {
    initialGameState.needsUpdate = false;
  }

  const isMultiplayer = gameObj !== undefined && playerIsX !== undefined;
  
  const [gameState, dispatch] = useReducer(reducer, initialGameState);

  const gameOver = gameState.winner === "X" || gameState.winner === "O";

  const isYourTurn =
    isMultiplayer &&
    ((playerIsX && gameState.currPlayer === "X") ||
      (!playerIsX && gameState.currPlayer === "O"));

  // const hideMessageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function isPayloadAction(action: Action): action is PayloadAction {
    return (action as PayloadAction).payload !== undefined;
  }

  function isUpdateAction(action: Action): action is UpdateAction {
    return action.type === UPDATE_STATE_VALUE && (action as UpdateAction).payload !== undefined;
  }

  function reducer(
    state: typeof initialGameState,
    action: Action
  ): typeof initialGameState {
    if (isUpdateAction(action)) {
      console.warn("---------Updating values: ", action.payload);
      return {
        ...state,
        ...action.payload,
      };
    } else if (isPayloadAction(action)) {
      switch (action.type) {
        case actions.ADD_CLICKED_MOVE:
          console.warn("---------Dispatch: add clicked move");
          return {
            ...state,
            currMoves: state.currMoves.concat(action.payload.move),
            currError: "",
          };
        case actions.CLICKED_SQUARE:
          const activeSquaresCopy = [...state.activeSquares];
          const [row, col] = action.payload as number[];
          activeSquaresCopy[row][col] = state.currPlayer;
          let newState = {
            ...state,
            currError: "",
            activeSquares: activeSquaresCopy,
            lastMoved: state.currMoves,
            currPlayer: (state.currPlayer === "O" ? "X" : "O") as Players,
            lockedNumber: null,
          };
          const [winner, winSquares] = checkGameOver(newState);
          if (winner && winSquares) {
            newState = {
              ...newState,
              currError: `🎉 Game over. ${!isMultiplayer ? winner + " wins!" : (playerIsX ? (winner === "X" ? "You win!" : gameState.oUsername + " wins")
                          : (winner === "O" ? "You win!" : gameState.xUsername + " wins"))} 🎉`,
              winSquares: winSquares,
              winner: winner,
              needsUpdate: true
            }
          }
          return newState;
        case actions.UPDATE_SQUARE_STATUS:
          console.warn("---------Dispatch: update square status");
          return {
            ...state,
            activeSquares: action.payload.activeSquares,
            moveCount: ++state.moveCount,
          };
        case actions.RESET_GAME:
          // payload should contain newBoard boolean
          console.log("Resetting game")
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
            needsUpdate: true
          };
        default:
            throw new Error("Unknown action type");
      }
    } else {
      switch (action.type) {
        case actions.RESET_ERROR:
          return {
            ...state,
            currError: "",
          };
        case actions.TOGGLE_PLAYER:
          return {
            ...state,
            lastMoved: state.currMoves,
            currPlayer: state.currPlayer === "O" ? "X" : "O",
          };
        
        case actions.SYNC_DB:
          return {
            ...state,
            needsUpdate: true
          }
          /*
        case actions.CHECK_GAME_OVER:
          checkGameOver(state);
          return state; */
        case actions.UPDATE_BOARD_INSTRUCTIONS:
          let [boardInstructions, showBoardInstructions] = getBoardInstructions(
            state
          );
          return {
            ...state,
            boardInstructions: boardInstructions,
            showBoardInstructions: showBoardInstructions,
          };
        
        default:
          throw new Error("Unknown action type");
      }
    }
  }

  function arraysEqual(
    first: any[] | undefined | null,
    second: any[] | undefined | null
  ) {
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

  function isNoChange(
    received: GraphQLGame | null | undefined,
    toSend: UpdateGameInput
  ) {
    // WARNING: This will only work with current GraphQL setup.
    // If return from subscription is shrunk, will no longer work.
    if (!received) return false;

    if (
      arraysEqual(received.currBoard, toSend.currBoard) &&
      arraysEqual(received.activeSquares, toSend.activeSquares) &&
      arraysEqual(received.currMoves, toSend.currMoves) &&
      arraysEqual(received.winSquares, toSend.winSquares) &&
      received.currPlayer === toSend.currPlayer &&
      received.gameType === toSend.gameType &&
      received.winner === toSend.winner
    )
      return true;

    return false;
  }

  useEffect(() => {
    if (!gameState.needsUpdate) {
      return;
    }

    const syncDB = async (state: typeof initialGameState) => {
      if (!state) return;
  
      console.log("Preparing to send update to GraphQL");
  
      const input: UpdateGameInput = {
        id: gameObj.id,
        currBoard: state.currBoard.flat(),
        activeSquares: state.activeSquares.flat(),
        currMoves:
          state.currMoves.length === 1
            ? state.currMoves.concat(null)
            : state.currMoves,
        winSquares: state.winSquares.flat(),
        winner: state.winner,
        currPlayer: state.currPlayer,
        gameType: gameType,
        lastUpdateBy: userId
      };
      console.log("=============", "Sending update to GraphQL...", input);
      return (API.graphql(
        graphqlOperation(updateGame, {
          input: input,
        })
      ) as Promise<GraphQLResult<UpdateGameMutation>>)
        .then((e) => {
          if (e) console.log("Successfully updated DB: ", e);
        })
        .catch((e) => console.error("Error updating graphQL database: ", e));
    };

    if (gameState.needsUpdate) {
      syncDB(gameState);
      dispatch( { type: UPDATE_STATE_VALUE, payload: { needsUpdate: false }});
    }

  }, [gameState.needsUpdate, gameObj.id, gameState, gameType, userId]);

  const deserialized = useMemo(() => {
    console.log("receivedGameState changed: ", receivedGameState);
    return receivedGameState ? qlToState(receivedGameState) : null;
  }, [receivedGameState]);

  useEffect(() => {
    if (deserialized !== null) {
      console.log("Deserialize changed: ", deserialized);
      dispatch({ type: UPDATE_STATE_VALUE, payload: { ...deserialized,
      currError: "" } });
    }
  }, [deserialized]);

  function getMovesResult(state: typeof initialGameState) {
    let movesSum =
    state.currMoves.length === 2 &&
    state.currMoves[0] !== null &&
    state.currMoves[1] !== null
      ? state.currMoves[0] + state.currMoves[1]
      : undefined;

  let movesProduct =
    state.currMoves.length === 2 &&
    state.currMoves[0] !== null &&
    state.currMoves[1] !== null
      ? state.currMoves[0] * state.currMoves[1]
      : undefined;

   return gameType === "ADD" ? movesSum : movesProduct;
  }

  let movesResult = useMemo(() => getMovesResult(gameState), [gameState]);

  function getBoardInstructions(
    state: typeof initialGameState
  ): [string, "" | "hidden" | "active"] {
    // Check for squares with values matching movesResult and that are empty (no X or O)
    let boardInstructions = "";
    let showBoardInstructions: "" | "hidden" | "active" = "hidden";
    let noMoves = !state.currBoard
      .flat()
      .map((num) => num === getMovesResult(state))
      .some((val, idx) => {
        return (
          val &&
          state.activeSquares![Math.floor(idx / state.activeSquares.length)][
            idx % state.activeSquares[0].length
          ] === null
        );
      });

    if (state.currMoves.length === 2 && state.moveCount === 0) {
      boardInstructions = `👉  Now make your move in a square that matches the ${
        gameType === "ADD" ? "sum" : "product"
      } of the numbers you picked!`;
      showBoardInstructions = "active";
    } else if (state.moveCount === 1 && !noMoves) {
      boardInstructions = "Nice choice!";
      showBoardInstructions = "active";
      // set timeout to disappear after 5 seconds
    } else if (state.currMoves.length === 2 && noMoves) {
      boardInstructions =
        "Create a new number combination using the buttons above to enable new valid moves";
      showBoardInstructions = "active";
    }

    return [boardInstructions, showBoardInstructions];
  }

  function checkGameOver(state: typeof initialGameState): 
  [Players | null, number[][] | null] {
    if (state.winner && state.winSquares) {
        return [state.winner, state.winSquares];
    }
    for (let row = 0; row < state.activeSquares.length; ++row) {
      for (let col = 0; col < state.activeSquares[0].length; ++col) {
        if (state.activeSquares[row][col]) {
          let winChain = search(row, col, state.activeSquares!);
          if (winChain.length >= 4) {
            /*
            dispatch({
              type: actions.GAME_OVER,
              payload: {
                winner: state.activeSquares[row][col],
                winChain: winChain,
              },
            }); 
            return true; */
            return [state.activeSquares[row][col]!,
              winChain]
          }
        }
      }
    }
    return [null, null];
  }

  function resetGame(random: boolean = false) {
    dispatch({ type: actions.RESET_GAME, payload: { newBoard: random } });
  }

  const GameOverBlock: React.FC<GameOverBlockProps> = ({ message }) => (
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
      {gameObj.roomCode}
      {" Over: " + gameOver}
      {gameObj && <div className="challengers"><span className="username">{gameState.xUsername}</span> vs. <span className="username">{gameState.oUsername}</span></div>}
      <ErrorBanner error={gameOver ? "" : gameState.currError} />
      <div id="moveStatus" className={gameOver ? "gameOver" : ""}>
        {gameOver ? (
          <GameOverBlock message={gameState.currError} />
        ) : (
          <>
            {/* You are player {playerIsX ? "X" : "O"}
            <br /> */}
            <PlayerBlock player={playerIsX ? "X" : "O"} message={"You are player: "} />
            {isMultiplayer && (
              <div className={`turn ${isYourTurn ? "yours" : "theirs"}`}>
                {isYourTurn ? "(Your turn!)" : "(Opponent's turn)"}
              </div>
            )}
          </>
        )}
      </div>
      <Moves
        state={gameState}
        moves={moves}
        movesResult={movesResult}
        gameType={gameType}
        dispatch={dispatch}
        isYourTurn={isYourTurn}
        gameOver={gameOver}
      />
      <Board
        state={gameState}
        movesResult={movesResult}
        dispatch={dispatch}
        isYourTurn={isYourTurn}
        gameOver={gameOver}
      />
    </>
  );
};

export default Game;
