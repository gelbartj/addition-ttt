import React, { DOMElement, useRef, useState } from "react";
import "./App.css";

function App() {
  type players = "X" | "O";

  let startPlayer: players = "X";

  const [currPlayer, setCurrPlayer] = useState<players>(startPlayer);

  const addBoard = [
    [-9, 1, 8, 0, 2, 3, 9, 6],
    [-2, -3, 1, -8, -1, 10, -4, 8],
    [-10, 4, -7, 9, -6, 3, -5, 7],
    [-9, -2, 2, -3, 0, -7, 6, 4],
    [-6, -4, -1, 5, 3, -10, 7, -2],
    [2, 0, -9, 10, -5, 8, 4, -6],
    [-7, -8, -4, -3, -1, -10, 0, 5],
    [9, 5, 6, 7, -8, -5, 10, 1],
  ];

  const multBoard = [
    [-4, -3, 16, 12, 1, 10, 6, -16],
    [15, 20, -8, -6, 0, -9, 1, 4],
    [-20, -25, 5, -12, -1, -25, -10, -9],
    [-10, 4, -15, -2, 5, 4, -12, 0],
    [12, 8, 16, 6, 9, 20, -5, 15],
    [3, 10, 4, 25, -4, -15, 2, 8],
    [-5, 0, -2, 3, -12, -8, -20, 3],
    [-16, -4, 15, -10, 2, 0, -6, -3],
  ];

  const [addGame, setAddGame] = useState<boolean | null>(null);
  const [randomBoard, setRandomBoard] = useState(false);
  const [currBoard, setCurrBoard] = useState(addBoard); // arbitrary initial state
  
  let boardNums = randomBoard ? makeBoardNums() : currBoard;

  const moves = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];

  const startMove: (number | undefined)[] = [];
  const [currMoves, setCurrMoves] = useState(startMove);

  const [currError, setCurrError] = useState("");

  type squareVal = players | null;

  // Set up this way instead of an array of fewer objects to allow for direct lookup without search
  let emptyStatus: squareVal[][] = [...Array(boardNums.length)].map((e) =>
    Array(boardNums[0].length).fill(null)
  );
  const [activeSquares, setActiveSquares] = useState(emptyStatus);
  const [winSquares, setWinSquares] = useState([] as number[][]);
  const [gameOver, setGameOver] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [showBoardInstructions, setShowBoardInstructions] = useState("");
  const [lastMoved, setLastMoved] = useState<typeof startMove>([]);
  const [lockedNumber, setLockedNumber] = useState<number | null>(null);
  const [boardInstructions, setBoardInstructions] = useState("");
  // const [noMoves, setNoMoves] = useState(false);

  const boardRef = useRef<HTMLDivElement>(null);

  const initialMsgState = {
    boardInstructions: "",
    showBoardInstructions: false,
    moveInstructions: "",
    highlightMoveInstructions: false
  }

  const actionTypes = {
    moveChanged: "MOVE_CHANGED",
    boardChanged: "BOARD_CHANGED"
  }
  
  const messageReducer = (action: any) => {
    switch (action.type) {
      case actionTypes.moveChanged:

    }
  }

  let movesSum =
    currMoves.length === 2 &&
    currMoves[0] !== undefined &&
    currMoves[1] !== undefined
      ? currMoves[0] + currMoves[1]
      : undefined;

  let movesProduct =
    currMoves.length === 2 &&
    currMoves[0] !== undefined &&
    currMoves[1] !== undefined
      ? currMoves[0] * currMoves[1]
      : undefined;

  let movesResult = addGame ? movesSum : movesProduct;

  const hideMessageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // range of board numbers should be 2 * range of moves, centered on 0
  const addBoardRange = Array.from(
    { length: (moves.length - 1) * 2 + 1 },
    (e, i) => i - (moves.length - 1)
  );

  let multBoardRange: number[] = [];

  for (let i = -5; i < 6; ++i) {
    for (let j = -5; j < 6; ++j) {
      multBoardRange.push(i * j);
    }
  }

  function makeBoardRow() {
    // Put only unique numbers in each row
    let rowSet = new Set<number>();
    while (rowSet.size < boardNums.length) {
      // Inefficient but immaterial for such a small array.
      // Testing on 100 million rows, average 6.87 loops was needed.
      rowSet.add(
        (addGame ? addBoardRange : multBoardRange)[
          Math.floor(
            Math.random() * (addGame ? addBoardRange : multBoardRange).length
          )
        ]
      );
    }
    return Array.from(rowSet);
  }

  function makeBoardNums() {
    let newBoard: number[][] = [...Array(boardNums.length)];
    for (let i = 0; i < boardNums.length; ++i) {
      newBoard[i] = makeBoardRow();
    }
    return newBoard;
  }

  function randomBoardNums() {
    // Completely random
    let minMax = 10; // range of board numbers will be [-minMax, minMax]
    let newBoard: number[][] = [...Array(boardNums.length)];
    let randoms = Array.from(
      { length: boardNums.length * boardNums[0].length },
      () => Math.floor(Math.random() * (minMax * 2 + 1) - minMax)
    );
    for (let i = 0; i < boardNums.length; ++i) {
      newBoard[i] = randoms.slice(
        i * boardNums.length,
        i * boardNums.length + boardNums[0].length
      );
    }
    return newBoard;
  }

  function setMove(move: number) {
    if (currMoves.includes(move)) {
      if (currMoves.length === 1) {
        // Double current move
        setCurrMoves((cm) => {
          let newCm = cm.concat(move);
          updateBoardInstructions(newCm as number[], moveCount as number);
          return newCm;
        });
        setCurrError("");
        return;
      }
      // toggle - remove clicked move from list
      const allowToggle =
        move !== lockedNumber || currMoves.every((a) => a === move);
      if (allowToggle) {
        const currIndex = currMoves.indexOf(move);
        const newMoves = [...currMoves];
        newMoves.splice(currIndex, 1);
        setCurrMoves(newMoves);
        setCurrError("");
        if (
          lastMoved &&
          lastMoved.length === 2 &&
          lastMoved[0] === currMoves[0] &&
          lastMoved[1] === currMoves[1]
        ) {
          const newLockedNumber =
            lastMoved[0] === move ? lastMoved[1] : lastMoved[0];
          setLockedNumber(newLockedNumber!);
        }
      } else {
        setCurrError("You can only change one number per turn!");
        return;
      }
    } else if (currMoves.length < 2) {
      // add clicked move to moves list
      if (currMoves.length === 0) {
        setLockedNumber(move);
        togglePlayer();
      }
      setCurrMoves((cm) => {
        let newCm = cm.concat(move);
        updateBoardInstructions(newCm as number[], moveCount as number);
        return newCm;
      });
      setCurrError("");
    } else {
      setCurrError(
        "Click on one of the active numbers to disable it before selecting a new number"
      );
    }
  }

  function togglePlayer() {
    setLastMoved(currMoves);
    setCurrPlayer((cp) => (cp === "O" ? "X" : "O"));
  }

  function setSquareStatus(row: number, col: number) {
    if (gameOver) return;
    if (currMoves[0] === undefined || currMoves[0] === undefined) {
      setCurrError(
        "Please make a move first (select two numbers in the Moves row above the grid)"
      );
      return;
    } else if (boardNums[row][col] !== movesResult || activeSquares[row][col]) {
      setCurrError("Please select a valid square (with dashed green outline)");
      return;
    }
    setCurrError("");
    let activeSquaresCopy = [...activeSquares];
    activeSquaresCopy[row][col] = currPlayer;
    setActiveSquares(activeSquaresCopy);
    setMoveCount(mc => {
      let newMc = ++mc;
      updateBoardInstructions(currMoves as number[], newMc as number, activeSquaresCopy);
      return newMc;
    });
    togglePlayer();
    checkGameOver();
    setLockedNumber(null);
  }

  type nsType = "N" | "S" | undefined;
  type ewType = "E" | "W" | undefined;

  function nonRecSearch(
    row: number,
    col: number,
    player: players,
    nsDir?: nsType,
    ewDir?: ewType
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
          if (row > boardNums.length) row += 1;
          else breakFlag = true;
          break;
      }
      switch (ewDir) {
        case "E":
          if (col < boardNums.length - 2) {
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

  function search(row = 0, col = 0, player: players) {
    let winChain: number[][] = [];
    for (let ns of ["N", "S", undefined] as nsType[]) {
      for (let ew of ["E", "W", undefined] as ewType[]) {
        if (!ns && !ew) {
          continue;
        }
        winChain = nonRecSearch(row, col, player, ns, ew);
        if (winChain.length >= 4) return winChain;
      }
    }
    return winChain;
  }

  function checkGameOver() {
    if (gameOver) return true;
    for (let row = 0; row < activeSquares.length; ++row) {
      for (let col = 0; col < activeSquares[0].length; ++col) {
        if (activeSquares[row][col]) {
          let winChain = search(row, col, activeSquares[row][col]!);
          if (winChain.length >= 4) {
            setCurrError(`🎉 Game over! ${activeSquares[row][col]} wins 🎉`);
            setGameOver(true);
            setWinSquares(winChain);
            return true;
          }
        }
      }
    }
    return false;
  }

  function resetGame(newBoard?: boolean) {
    setCurrMoves(startMove);
    setCurrError("");
    setActiveSquares(emptyStatus);
    setWinSquares([]);
    setGameOver(false);
    if (newBoard) setRandomBoard(true);
  }

  const gameOverBlock = (
    <>
      <div>{currError}</div>
      <button className="playAgain" onClick={() => resetGame()}>
        Play again (same board)
      </button>
      &nbsp;&nbsp;
      <button className="playAgain" onClick={() => resetGame(true)}>
        Play again (new board)
      </button>
    </>
  );

  const pickGameBlock = (
    <div id="pickGame">
      <div>
        <div className="startMsg">
          Choose one of these two games to get started!
        </div>
        <div className="gameButtons">
          <button onClick={() => { setAddGame(true); setCurrBoard(addBoard) }}>
            <span
              style={{ fontSize: "1.75em", color: "green", fontWeight: "bold" }}
            >
              +{" "}
            </span>
            Addition game
          </button>
          <button onClick={() => { setAddGame(false); setCurrBoard(multBoard) }}>
            <span
              style={{ fontSize: "1.75em", color: "red", fontWeight: "bold" }}
            >
              &times;{" "}
            </span>
            Multiplication game
          </button>
        </div>
      </div>
    </div>
  );

  // const encouragingMessages = ["Great!", "Nice choice!", "Amazing!", "That's what I was going to pick!", "You're a real mathematician!", "Now that's some real arithmetic!"];

  const instructions = (
    <>
      <ul className="instructions">
        <li>
          When there are no more green squares indicating valid moves, select a
          new number combination using the buttons above.
        </li>
        <li>Then keep making new moves until you get four in a row!</li>
      </ul>
      <button onClick={() => setShowBoardInstructions("hidden")}>
        Dismiss
      </button>
    </>
  );

  function updateBoardInstructions(currMovesArg: number[], moveCountArg: number, activeSquaresArg?: typeof activeSquares) {
    // inefficient duplication of logic
    let newMovesResult = addGame ? (currMovesArg[0] + currMovesArg[1]) : (currMovesArg[0] * currMovesArg[1]);
    if (!activeSquaresArg) activeSquaresArg = activeSquares;
    let noMoves = !boardNums
    .flat()
    .map((num) => num === newMovesResult)
    .some((val, idx) => {
      return (
        val &&
        activeSquaresArg![Math.floor(idx / activeSquares.length)][
          idx % activeSquares[0].length
        ] === null
      );
    });

    if (currMovesArg.length === 2 && moveCountArg === 0) {
      setShowBoardInstructions("active");
      setBoardInstructions(`👉 Now make your move in a square that matches the ${addGame ? "sum" : "product"} of the numbers you picked!`);
    }
    else if (moveCountArg === 1 && !noMoves) {
      setShowBoardInstructions("active");
      setBoardInstructions("Nice choice!");
      // set timeout to disappear after 5 seconds
    }
    else if (currMovesArg.length === 2 && noMoves) {
      setShowBoardInstructions("active");
      setBoardInstructions("Create a new number combination using the buttons above to enable new valid moves");
    }
    else {
      setShowBoardInstructions("hidden");
      setBoardInstructions("");
    }
  }

  
  return (
    <>
      <div className="mathsymbols" aria-hidden="true">
        {addGame === null &&
          [...Array(3)].map((item, idx) => (
            <React.Fragment key={idx}>
              <div className="mathsymbol plus">+</div>
              <div className="mathsymbol times">&times;</div>
              <div className="mathsymbol minus">–</div>
              <div className="mathsymbol div">÷</div>
            </React.Fragment>
          ))}
      </div>
      <header className="App-header">
        <a href="/" style={{ color: "white", textDecoration: "none" }}>
          {addGame === null
            ? "Math Four-In-A-Row"
            : `Four-In-A-Row: ${
                addGame ? "Addition Edition" : "Multiplication Station"
              }`}
        </a>
      </header>
      <main>
        {addGame === null ? (
          pickGameBlock
        ) : (
          <>
            <div id="moveBlock">
              <div
                id="moveError"
                className={!gameOver && currError ? "active" : ""}
              >
                {gameOver ? "" : currError}
              </div>
              <div id="moveStatus" className={gameOver ? "gameOver" : ""}>
                {gameOver ? (
                  gameOverBlock
                ) : (
                  <>
                    Current player:{" "}
                    <strong className={`currPlayer ${currPlayer}`}>
                      {currPlayer}
                    </strong>
                  </>
                )}
              </div>
              <div id="moves">
                {gameOver ? (
                  ""
                ) : (
                  <span
                    id="moveInstructions"
                    className={`${currMoves.length === 0 ? "highlight" : ""}`}
                  >
                    {currMoves.length === 0 ? "👉 " : ""}Select two numbers to{" "}
                    {addGame ? "add" : "multiply"} together (change one number
                    per turn):
                  </span>
                )}
                <div id="moveButtons">
                  {gameOver
                    ? ""
                    : moves.map((move) => (
                        <button
                          key={move}
                          className={`moveButton ${
                            currMoves.includes(move)
                              ? currMoves.filter((x) => x === move).length === 2
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
              <div id="movesResult">
                {movesResult !== undefined && !gameOver
                  ? `${currMoves[0]} ${addGame ? "+" : "\u2715"} ${
                      currMoves[1]
                    } = ${movesResult}`
                  : ""}
              </div>
            </div>
            <div id="boardInstructions" className={showBoardInstructions}>
              {boardInstructions}
            </div>
            <div id="board" ref={boardRef}>
              {boardNums.map((boardRow, rowIdx) => (
                <div key={rowIdx}>
                  {boardRow.map((boardNum, colIdx) => (
                    <button
                      key={colIdx}
                      className={`
            square ${
              movesResult === boardNum && !activeSquares[rowIdx][colIdx]
                ? "valid"
                : ""
            }
            ${
              activeSquares[rowIdx][colIdx]
                ? activeSquares[rowIdx][colIdx] === "X"
                  ? "active x"
                  : "active o"
                : ""
            }
            ${
              winSquares.some(
                (winSquare) =>
                  winSquare[0] === rowIdx && winSquare[1] === colIdx
              )
                ? "winner"
                : gameOver
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
        )}
      </main>
    </>
  );
}

export default App;
