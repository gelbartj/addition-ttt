import React, { useState } from 'react';
import './App.css';

function App() {

  type players = "X" | "O";

  let startPlayer: players = "X";

  const [currPlayer, setCurrPlayer] = useState<players>(startPlayer);

  let boardNums = [
    [-9, 1, 8, 0, 2, 3, 9, 6],
    [-2, -3, 1, -8, -1, 10, -4, 8],
    [-10, 4, -7, 9, -6, 3, -5, 7],
    [-9, -2, 2, -3, 0, -7, 6, 4],
    [-6, -4, -1, 5, 3, -10, 7, -2],
    [2, 0, -9, 10, -5, 8, 4, -6],
    [-7, -8, -4, -3, -1, -10, 0, 5],
    [9, 5, 6, 7, -8, -5, 10, 1]
  ]

  const moves = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];

  const startMove: (number | undefined)[] = [];
  const [currMoves, setCurrMoves] = useState(startMove);

  const [currError, setCurrError] = useState("");

  type squareVal = players | null
  let emptyStatus: squareVal[][] = [...Array(boardNums.length)].map(e => Array(boardNums[0].length).fill(null))
  const [activeSquares, setActiveSquares] = useState(emptyStatus);

  const [winSquares, setWinSquares] = useState([] as number[][])
  const [gameOver, setGameOver] = useState(false);

  function setMove(move: number) {
    if (currMoves.includes(move)) {
      if (currMoves.length === 1) {
        setCurrError("You can only change one move at a time!");
        return;
      }
      // toggle - remove clicked move from list
      let currIndex = currMoves.indexOf(move);
      let newMoves = [...currMoves]
      newMoves.splice(currIndex, 1);
      setCurrMoves(newMoves);
      setCurrError("");
    }
    else if (currMoves.length < 2) {
      // add clicked move to moves list
      if (currMoves.length === 0) {
        setCurrPlayer(cp => cp === "X" ? "O" : "X");
      }
      setCurrMoves(currMovesCallback => currMovesCallback.concat(move));
      
      setCurrError("");
    }
    else {
      // error: toggle off another move first
      setCurrError("Click on one of the active moves to disable it before selecting a new move")
    }
  }

  let movesSum = (currMoves.length === 2 && currMoves[0] !== undefined && currMoves[1] !== undefined) ? currMoves[0] + currMoves[1] : undefined;

  function setSquareStatus(row: number, col: number) {
    if (gameOver) return;
    if (currMoves[0] === undefined || currMoves[0] === undefined) {
      setCurrError("Please make a move first (select two numbers in the Moves row above the grid)");
      return;
    }
    else if ((boardNums[row][col] !== movesSum) || activeSquares[row][col]) {
      setCurrError("Please select a valid square (with dashed green outline)");
      return;
    }
    setCurrError("");
    let activeSquaresCopy = [...activeSquares]
    activeSquaresCopy[row][col] = currPlayer;
    setActiveSquares(activeSquaresCopy);
    if (currPlayer === "X") setCurrPlayer("O");
    else {
      setCurrPlayer("X");
    }
    checkGameOver();
  }

  /* function oldSearch(row: number, col: number, chainLength = 0, player: players, direction?: dirType) {
    if (direction) {
      if (activeSquares[row][col] === player) 
        ++chainLength;
      else return chainLength;
    }
    if (chainLength >= 4) return chainLength;
    if (!direction) {
      for (let dir of dirs) { 
        chainLength = search(row, col, chainLength, player, dir) 
        if (chainLength >= 4) return chainLength;
      }
    }
    switch (direction) {
      case "N":
        if (row > 0) chainLength = search(row - 1, col, chainLength, player, "N")
        break;
      case "NE":
        if (row > 0 && col < boardNums.length - 2) 
          chainLength = search(row - 1, col + 1, chainLength, player, "NE")
        break;
      case "E":
        if (col < boardNums.length - 2) 
          chainLength = search(row, col + 1, chainLength, player, "E")
        break;
      case "SE":
        if (row < boardNums.length - 2 && col < boardNums.length - 2) 
          chainLength = search(row + 1, col + 1, chainLength, player, "SE")
        break;
      case "S":
        if (row > boardNums.length) 
          chainLength = search(row + 1, col, chainLength, player, "S")
        break;
      case "SW":
        if (row > boardNums.length && col > 0) 
          chainLength = search(row + 1, col - 1, chainLength, player, "SW")
        break;
      case "W":
        if (col > 0) 
          chainLength = search(row, col - 1, chainLength, player, "W")
        break;
      case "NW":
          if (row > 0 && col > 0) 
            chainLength = search(row - 1, col - 1, chainLength, player, "NW")
          break;
    }
    return chainLength;
  } */

  type nsType = "N" | "S" | undefined;
  type ewType = "E" | "W" | undefined;
  
  function nonRecSearch(row: number, col: number, player: players, 
    nsDir?: nsType, ewDir?: ewType): number[][] {
    if (!nsDir && !ewDir) { return []; }
    let winChain: number[][] = [];
    let breakFlag = false;
    while (activeSquares[row][col] === player && !breakFlag) {
      winChain.push([row, col]);
      if (winChain.length >= 4) { return winChain; }
      switch (nsDir) {
        case "N":
          if (row > 0) 
            row -= 1;
          else breakFlag = true;
          break;
        case "S":
          if (row > boardNums.length) 
            row += 1;
          else breakFlag = true;
          break;
      }
      switch (ewDir) {
        case "E":
          if (col < boardNums.length - 2) {
            col += 1;
          }
          else breakFlag = true;
          break;
        case "W":
          if (col > 0) {
            col -= 1;
          }
          else breakFlag = true;
          break;
      }
    }
    return winChain;
  }

  function search(row = 0, col = 0, player: players) {
    let winChain: number[][] = [];
    for (let ns of ["N", "S", undefined] as nsType[]) { 
      for (let ew of ["E", "W", undefined] as ewType[]) {
        if (!ns && !ew) { continue; }
        winChain = nonRecSearch(row, col, player, ns, ew) 
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
          let winChain = search(row, col, activeSquares[row][col]!)
          if (winChain.length >= 4) {
            setCurrError(`Game over! ${activeSquares[row][col]} wins`)
            setGameOver(true);
            setWinSquares(winChain);
            return true;
          }
        }
      }
    }
    console.log(winSquares);
    return false;
  }

  function resetGame() {
    setCurrMoves(startMove);
    setCurrError("");
    setActiveSquares(emptyStatus);
    setWinSquares([]);
    setGameOver(false);
  }


  return (
    <>
      <header className="App-header">
        Addition Tic-Tac-Toe
      </header>
    <main>
      <div id="moveBlock">
      <div id="moveError" className={ (!gameOver && currError) ? "active" : "" }>{ gameOver ? "" : currError }</div>
      <div id="moveStatus">{ gameOver ? <>{ currError }<br /><button className="playAgain" onClick={() => resetGame()}>Play again</button></> : <>Current player: <strong>{currPlayer}</strong></>}</div>
      <div id="moves">
        { gameOver ? "" : <span className="moveInstructions">Select two numbers to add together (change one number per turn):<br/></span>}
        { gameOver ? "" : moves.map( move => (
          <button key={ move } className={`moveButton ${currMoves.includes(move) ? "active" : "inactive"}`}
           onClick={e => setMove(move)}>{ move }</button>
        ))}
      </div>
      <div id="movesSum">{ (movesSum !== undefined && !gameOver) ? `${currMoves[0]} + ${currMoves[1]} = ${movesSum}` : ""}</div>
      </div>
      <div id="board">
        { boardNums.map((boardRow, rowIdx) => <div key={ rowIdx }>
          {boardRow.map((boardNum, colIdx) => <button key={ colIdx } className={`
            square ${ (movesSum === boardNum && !activeSquares[rowIdx][colIdx]) ? "valid" : ""}
            ${ activeSquares[rowIdx][colIdx] ? (activeSquares[rowIdx][colIdx] === "X" ? "active x" : "active o") : ""}
            ${ winSquares.some(winSquare => (winSquare[0] === rowIdx && winSquare[1] === colIdx)) ? "winner" 
              : (gameOver ? "inactive" : "") }
            `} onClick={e => setSquareStatus(rowIdx, colIdx)}>{boardNum}</button>)}
        </div>) }
      </div>
    </main>
    </>
  );
}

export default App;
