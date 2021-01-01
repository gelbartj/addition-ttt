export const Board = (props) => {
  function updateBoardInstructions(
    currMovesArg: number[],
    moveCountArg: number,
    activeSquaresArg?: typeof activeSquares
  ) {
    // inefficient duplication of logic
    let newMovesResult = addGame
      ? currMovesArg[0] + currMovesArg[1]
      : currMovesArg[0] * currMovesArg[1];
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
      setBoardInstructions(
        `👉 Now make your move in a square that matches the ${
          addGame ? "sum" : "product"
        } of the numbers you picked!`
      );
    } else if (moveCountArg === 1 && !noMoves) {
      setShowBoardInstructions("active");
      setBoardInstructions("Nice choice!");
      // set timeout to disappear after 5 seconds
    } else if (currMovesArg.length === 2 && noMoves) {
      setShowBoardInstructions("active");
      setBoardInstructions(
        "Create a new number combination using the buttons above to enable new valid moves"
      );
    } else {
      setShowBoardInstructions("hidden");
      setBoardInstructions("");
    }
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
    setMoveCount((mc) => {
      let newMc = ++mc;
      updateBoardInstructions(
        currMoves as number[],
        newMc as number,
        activeSquaresCopy
      );
      return newMc;
    });
    togglePlayer();
    checkGameOver();
    setLockedNumber(null);
  }

  return (
    <>
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
                          movesResult === boardNum &&
                          !activeSquares[rowIdx][colIdx]
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
  );
};
