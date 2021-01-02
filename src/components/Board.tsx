import { useRef } from "react";
import { Action, actions, initialState, UPDATE_STATE_VALUE } from "./Game";

interface BoardProps {
  state: typeof initialState;
  dispatch: React.Dispatch<Action>;
  movesResult: number | undefined;
  checkGameOver: () => boolean;
  updateBoardInstructions: () => void;
}

export const Board: React.FC<BoardProps> = (props) => {
  function setSquareStatus(row: number, col: number) {
    if (props.state.gameOver) return;
    if (
      props.state.currMoves[0] === undefined ||
      props.state.currMoves[0] === undefined
    ) {
      props.dispatch({
        type: UPDATE_STATE_VALUE,
        payload: {
          currError:
            "Please make a move first (select two numbers in the Moves row above the grid)",
        },
      });
      return;
    } else if (
      props.state.currBoard[row][col] !== props.movesResult ||
      props.state.activeSquares[row][col]
    ) {
      props.dispatch({
        type: UPDATE_STATE_VALUE,
        payload: {
          currError: "Please select a valid square (with dashed green outline)",
        },
      });
      return;
    }
    props.dispatch({ type: actions.RESET_ERROR });
    let activeSquaresCopy = [...props.state.activeSquares];
    activeSquaresCopy[row][col] = props.state.currPlayer;
    props.dispatch({
      type: actions.UPDATE_SQUARE_STATUS,
      payload: { activeSquares: activeSquaresCopy },
    });
    props.updateBoardInstructions();
    props.dispatch({ type: actions.TOGGLE_PLAYER });
    props.checkGameOver();
    props.dispatch({
      type: UPDATE_STATE_VALUE,
      payload: { lockedNumber: null },
    });
  }

  const boardRef = useRef<HTMLDivElement>(null);
  const HideHints = () => (
    <button
      className="hideHints"
      onClick={() =>
        props.dispatch({
          type: UPDATE_STATE_VALUE,
          payload: { hideHints: true },
        })
      }
    >
      <sup>X</sup>
    </button>
  );

  return (
    <>
      <div
        id="boardInstructions"
        className={
          props.state.hideHints ? "hidden" : props.state.showBoardInstructions
        }
      >
        {props.state.boardInstructions}
        {props.state.showBoardInstructions && <HideHints />}
      </div>
      <div id="board" ref={boardRef}>
        {props.state.currBoard.map((boardRow, rowIdx) => (
          <div className="boardRow" key={rowIdx}>
            {boardRow.map((boardNum, colIdx) => (
              <button
                key={colIdx}
                className={`
                        square ${
                          props.movesResult === boardNum &&
                          !props.state.activeSquares[rowIdx][colIdx]
                            ? "valid"
                            : ""
                        }
                        ${
                          props.state.activeSquares[rowIdx][colIdx]
                            ? props.state.activeSquares[rowIdx][colIdx] === "X"
                              ? "active x"
                              : "active o"
                            : ""
                        }
                        ${
                          props.state.winSquares.some(
                            (winSquare) =>
                              winSquare[0] === rowIdx && winSquare[1] === colIdx
                          )
                            ? "winner"
                            : props.state.gameOver
                            ? "inactive"
                            : ""
                        }
                        `}
                onClick={() => setSquareStatus(rowIdx, colIdx)}
              >
                {boardNum}
              </button>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};
