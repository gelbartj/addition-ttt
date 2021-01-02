import { GameChoice } from "../App";
import { Action, actions, initialState, UPDATE_STATE_VALUE } from "./Game";

interface MovesProps {
  state: typeof initialState;
  moves: number[];
  movesResult?: number;
  gameChoice: GameChoice;
  dispatch: React.Dispatch<Action>;
  updateBoardInstructions: () => void;
}

export const Moves: React.FC<MovesProps> = (props) => {
  function setMove(move: number) {
    if (props.state.currMoves.includes(move)) {
      if (props.state.currMoves.length === 1) {
        // Double current move
        props.dispatch({
          type: actions.ADD_CLICKED_MOVE,
          payload: { move: move },
        });
        props.updateBoardInstructions();
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
        props.updateBoardInstructions();
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
        props.dispatch({ type: actions.TOGGLE_PLAYER });
      }
      props.dispatch({
        type: actions.ADD_CLICKED_MOVE,
        payload: { move: move },
      });
      props.updateBoardInstructions();
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
        {props.state.gameOver ? (
          ""
        ) : (
          <span
            id="moveInstructions"
            className={`${
              props.state.currMoves.length === 0 ? "highlight" : ""
            }`}
          >
            {props.state.currMoves.length === 0 ? "👉  " : ""}Select two numbers
            to {props.gameChoice ? "add" : "multiply"} together (change one
            number per turn):
          </span>
        )}
        <div id="moveButtons">
          {props.state.gameOver
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
      <div id="movesResult" className={props.movesResult ? "" : "hidden"}>
        {props.movesResult !== undefined && !props.state.gameOver
          ? `${props.state.currMoves[0]} ${props.gameChoice ? "+" : "\u2715"} ${
              props.state.currMoves[1]
            } = ${props.movesResult}`
          : ""}
      </div>
    </div>
  );
};
