import { useCallback, useEffect, useMemo, useReducer } from "react";
import { GameChoice as GameType } from "../App";
import {
  addBoard,
  emptyStatus,
  makeBoardNums,
  moves,
  multBoard,
  Players,
  search,
  SquareVal,
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

export interface GameState {
  currPlayer: Players,
  randomBoard: boolean,
  currBoard: number[][],
  currError: string,
  currMoves: (number | null)[],
  activeSquares: SquareVal[][],
  winSquares: number[][],
  winner: "X" | "O" | "",
  moveCount: number,
  showBoardInstructions: "" | "active" | "hidden",
  lastMoved: (number | null)[],
  lockedNumber: number | null,
  boardInstructions: string,
  hideHints: boolean,
  gameType: GameType, // arbitrary
  needsUpdate: boolean,
  xUsername: string,
  oUsername: string
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
  payload: Partial<GameState>;
}

export type Action = PayloadAction | NoPayloadAction | UpdateAction;

export const Game: React.FC<GameProps> = ({
  gameType,
  gameObj,
  playerIsX,
  receivedGameState,
  userId
}) => {
  const initialGameState: GameState = { 
    currPlayer: startPlayer,
  randomBoard: false,
  currBoard: gameType === "ADD" ? addBoard : multBoard,
  currError: "",
  currMoves: startMove,
  activeSquares: emptyStatus(addBoard.length, addBoard[0].length),
  winSquares: [],
  winner: "",
  moveCount: 0,
  showBoardInstructions: "hidden",
  lastMoved: [],
  lockedNumber: null,
  boardInstructions: "",
  hideHints: false,
  gameType: gameType,
  needsUpdate: true,
  xUsername: gameObj?.xUsername || "[Your name]",
  oUsername: gameObj?.oUsername || "[Awaiting opponent]"
   };

  if (!playerIsX) {
    initialGameState.needsUpdate = false;
  }

  const isMultiplayer = gameObj !== undefined && playerIsX !== undefined;
  
  const getGameOverMsg = useCallback((state: Partial<GameState>) => {
    // NOTE: Will only work while deserializer is returning
    // whole objects, not a smaller delta.
    // If necessary, usernames could come from initialGameState
    // instead.
    if (state.winner && state.winSquares) {
      return `🎉 Game over. ${!isMultiplayer ? state.winner + " wins!" : (playerIsX ? (state.winner === "X" ? "You win!" : state.oUsername + " wins")
      : (state.winner === "O" ? "You win!" : state.xUsername + " wins"))} 🎉`;
    }
    return "";
  }, [playerIsX, isMultiplayer]);

  const getMovesResult = useCallback((moves: (number | null)[]) => {
    let movesSum =
    moves.length === 2 &&
    moves[0] !== null &&
    moves[1] !== null
      ? moves[0] + moves[1]
      : undefined;

  let movesProduct =
    moves.length === 2 &&
    moves[0] !== null &&
    moves[1] !== null
      ? moves[0] * moves[1]
      : undefined;

   return gameType === "ADD" ? movesSum : movesProduct;
  }, [gameType]);

  const getIsYourTurn = (currPlayer: Players) => !isMultiplayer || (isMultiplayer &&
    ((playerIsX && currPlayer === "X") ||
      (!playerIsX && currPlayer === "O")));

  const [gameState, dispatch] = useReducer(reducer, initialGameState);

  const movesResult = useMemo(() => getMovesResult(gameState.currMoves), [
    getMovesResult, gameState.currMoves]);
  const gameOver = gameState.winner === "X" || gameState.winner === "O";

  const isYourTurn =
    !isMultiplayer || (isMultiplayer &&
    ((playerIsX && gameState.currPlayer === "X") ||
      (!playerIsX && gameState.currPlayer === "O")));
    


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
            moveCount: state.moveCount + 1,
            needsUpdate: true
          };
          const [winner, winSquares] = checkGameOver(newState);
          if (winner && winSquares) {
            newState = {
              ...newState,
              winSquares: winSquares,
              winner: winner
            }
            const msg = getGameOverMsg(newState)
            newState = {
              ...newState,
              currError: msg
            }
          }
          return newState;
        case actions.RESET_GAME:
          // payload should contain newBoard boolean
          console.log("Resetting game");
          console.log("Initial: ", initialGameState);
          const resetState = {
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
          }
          console.log(resetState);
          return resetState;
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

  useEffect(() => {
    if (!gameState.needsUpdate || !isMultiplayer) {
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
        lastUpdateBy: userId,
        roomCode: gameObj.roomCode
      };
      console.log("=============", "Sending update to GraphQL...", input);
      return (API.graphql(
        graphqlOperation(updateGame, { input: input })
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

  }, [gameState.needsUpdate, gameObj?.id, gameState, gameType, userId,
      isMultiplayer]);

  const deserialized = useMemo(() => {
    console.log("receivedGameState changed: ", receivedGameState);
    return receivedGameState ? qlToState(receivedGameState) : null;
  }, [receivedGameState]);
  
  useEffect(() => {
    if (deserialized !== null) {
      console.log("Deserialize changed: ", deserialized);
      let gameOverMsg = "";
      if (deserialized.winner && deserialized.winSquares) {
        gameOverMsg = getGameOverMsg(deserialized);
      }
      dispatch({ type: UPDATE_STATE_VALUE, payload: { ...deserialized,
      currError: gameOverMsg } });
    }
  }, [deserialized, getGameOverMsg]);

  function getBoardInstructions(
    state: typeof initialGameState
  ): [string, "" | "hidden" | "active"] {
    // Check for squares with values matching movesResult and that are empty (no X or O)
    let boardInstructions = "";
    let showBoardInstructions: "" | "hidden" | "active" = "hidden";
    let noMoves = !state.currBoard
      .flat()
      .map((num) => num === getMovesResult(state.currMoves))
      .some((val, idx) => {
        return (
          val &&
          state.activeSquares![Math.floor(idx / state.activeSquares.length)][
            idx % state.activeSquares[0].length
          ] === null
        );
      });

    if (state.currMoves.length === 2 && state.moveCount === 0) {
      boardInstructions = `👉  ${isMultiplayer ? "When it's your turn, m" : "M"}ake your move in a square that matches the ${
        gameType === "ADD" ? "sum" : "product"
      } of the numbers you picked!`;
      showBoardInstructions = "active";
    } else if (state.moveCount === 1 && !noMoves && (!isMultiplayer || !getIsYourTurn(state.currPlayer))) {
      // Show this message after turn has switched to the other player
      boardInstructions = "Nice choice!";
      showBoardInstructions = "active";
      // set timeout to disappear after 5 seconds
    } else if (state.currMoves.length === 2 && noMoves) {
      boardInstructions =
        `${isMultiplayer ? "When it's your turn, c" : "C"}reate a new number combination using the buttons above to enable new valid moves`;
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
      {gameObj && gameObj.roomCode}
      {gameObj && <div className="challengers"><span className="username">{gameState.xUsername}</span> vs. <span className="username">{gameState.oUsername}</span></div>}
      <ErrorBanner error={gameOver ? "" : gameState.currError} />
      <button onClick={() => resetGame(true)}>Reset</button>
      <div id="moveStatus" className={gameOver ? "gameOver" : ""}>
        {gameOver ? (
          <GameOverBlock message={gameState.currError} />
        ) : (
          <>
            {/* You are player {playerIsX ? "X" : "O"}
            <br /> */}
            { isMultiplayer ? <PlayerBlock player={playerIsX ? "X" : "O"} message={"You are player: "} /> : <PlayerBlock player={gameState.currPlayer} message={"Current player: "} /> }
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
