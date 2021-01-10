import { GameChoice } from "../App";
import { Action, actions, GameState, UPDATE_STATE_VALUE } from "./Game";

interface MovesProps {
  state: GameState;
  moves: number[];
  movesResult?: number;
  gameType: GameChoice;
  dispatch: React.Dispatch<Action>;
  isYourTurn: boolean;
  gameOver: boolean;
}

export const Moves: React.FC<MovesProps> = (props) => {
  function setMove(move: number) {
    if (!props.isYourTurn) {
      props.dispatch({
        type: UPDATE_STATE_VALUE,
        payload: { currError: "It's not your turn!" }
      });
      return;
    }
    if (props.state.currMoves.includes(move)) {
      if (props.state.currMoves.length === 1) {
        // Double current move
        props.dispatch({
          type: actions.ADD_CLICKED_MOVE,
          payload: { move: move },
        });
        props.dispatch({ type: actions.UPDATE_BOARD_INSTRUCTIONS });
        props.dispatch({ type: actions.SYNC_DB });
        return;
      }
      // toggle - remove clicked move from list
      const allowToggle =
        move !== props.state.lockedNumber ||
        props.state.currMoves.every((a) => a === move);
      if (allowToggle) {
        const currIndex = props.state.currMoves.indexOf(move);
        const newMoves = [...props.state.currMoves];
        newMoves.splice(currIndex, 1);
        props.dispatch({
          type: UPDATE_STATE_VALUE,
          payload: { currMoves: newMoves },
        });
        props.dispatch({ type: actions.UPDATE_BOARD_INSTRUCTIONS });
        props.dispatch({ type: actions.RESET_ERROR });
        if (
          props.state.lastMoved &&
          props.state.lastMoved.length === 2 &&
          props.state.lastMoved[0] === props.state.currMoves[0] &&
          props.state.lastMoved[1] === props.state.currMoves[1]
        ) {
          const newLockedNumber =
            props.state.lastMoved[0] === move
              ? props.state.lastMoved[1]
              : props.state.lastMoved[0];
          props.dispatch({
            type: UPDATE_STATE_VALUE,
            payload: { lockedNumber: newLockedNumber! },
          });
        }
        props.dispatch({ type: actions.SYNC_DB });
      } else {
        props.dispatch({
          type: UPDATE_STATE_VALUE,
          payload: { currError: "You can only change one number per turn!" },
        });
        return;
      }
    } else if (props.state.currMoves.length < 2) {
      // add clicked move to moves list
      if (props.state.currMoves.length === 0) {
        props.dispatch({
          type: UPDATE_STATE_VALUE,
          payload: { lockedNumber: move },
        });
        console.log("Player was ", props.state.currPlayer);
        props.dispatch({ type: actions.TOGGLE_PLAYER });
        console.log("After toggle, player is ", props.state.currPlayer);
      }
      props.dispatch({
        type: actions.ADD_CLICKED_MOVE,
        payload: { move: move },
      });
      props.dispatch({ type: actions.UPDATE_BOARD_INSTRUCTIONS });
      console.log("ABOUT TO SYNC DB");
      props.dispatch({ type: actions.SYNC_DB });
    } else {
      props.dispatch({
        type: UPDATE_STATE_VALUE,
        payload: {
          currError:
            "Click on one of the active numbers to disable it before selecting a new number",
        },
      });
    }
  }

  return (
    <div id="moveBlock">
      <div id="moves">
        {(props.gameOver) ? (
          ""
        ) : (
          <span
            id="moveInstructions"
            className={`${
              (props.state.currMoves.length <= 1 && props.isYourTurn) ? "highlight" : ""
            }`}
          >
            {props.state.currMoves.length <= 1 ? "👉  " : ""}Select two numbers
            to {props.gameType === "ADD" ? "add" : "multiply"} together (change one
            number per turn):
          </span>
        )}
        <div id="moveButtons">
          {props.gameOver
            ? ""
            : props.moves.map((move) => (
                <button
                  key={move}
                  className={`moveButton ${
                    props.state.currMoves.includes(move)
                      ? props.state.currMoves.filter((x) => x === move)
                          .length === 2
                        ? "double active"
                        : "active"
                      : "inactive"
                  }`}
                  onClick={() => setMove(move)}
                >
                  {move}
                </button>
              ))}
        </div>
      </div>
      { !props.gameOver && <div id="movesResult" className={props.movesResult ? "" : "hidden"}>
        {props.movesResult !== undefined && !props.gameOver
          ? `${props.state.currMoves[0]} ${props.gameType === "ADD" ? "+" : "\u2715"} ${
              props.state.currMoves[1]
            } = ${props.movesResult}`
          : ""}
      </div> }
    </div>
  );
};

export default Moves;