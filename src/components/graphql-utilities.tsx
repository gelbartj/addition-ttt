import { initialGameState } from "./Game";

export interface GraphQLGame {
    id: number,
    roomCode: string,
    currBoard?: number[],
    activeSquares?: ("X" | "O" | "")[],
    moveCount?: number,
    currMoves?: number[],
    gameType?: "ADD" | "MULT" | "ALG", 
    playerIDs?: string[], // emails
    xUsername?: string,
    oUsername?: string,
    winner?: "X" | "O" | "",
    winSquares?: number[],
    currPlayer?: "X" | "O",
    lastUpdateBy?: string
}

function reshapeFlatBoard(flat: any[], rows = 8, cols = 8) {
    if (flat.length !== rows * cols) {
        console.error("Received board with mismatched size");
        return null;
    }
    const newBoard  = [...Array(rows)].map((e) => Array(cols).fill(null));
    let currRow = 0;
    let currCol = 0;
    for (let item of flat) {
        newBoard[currRow][currCol] = item;
        // console.log(`Set [${currRow}, ${currCol}] to ${item}`);
        if (currCol === cols - 1) {
            currCol = 0;
            ++currRow;
        }
        else {
            ++currCol;
        }
    }
    // console.log("Started with: ", flat);
    // console.log("Reshaped board: ", newBoard);
    return newBoard;
}

export function qlToState(ql: GraphQLGame) {
    const newState: Partial<typeof initialGameState> = { };

    if (ql.currBoard && (ql.currBoard?.length || 0) > 0) {
        let reshapedBoard = reshapeFlatBoard(ql.currBoard);
        if (reshapedBoard) {
            newState.currBoard = reshapedBoard;
        }
        else {
            console.error("Failed to deserialize boardNums");
            return newState;
        }
    }
    if (ql.activeSquares && (ql.activeSquares?.length || 0) > 0) {
        let reshapedBoard = reshapeFlatBoard(ql.activeSquares);
        if (reshapedBoard) {
            newState.activeSquares = reshapedBoard;
        }
        else {
            console.error("Failed to deserialize currBoard");
            return newState;
        }
    }

    if (ql.moveCount) {
        newState.moveCount = ql.moveCount
    };

    if (ql.currMoves) {
        newState.currMoves = ql.currMoves.filter(item => item !== null);
    }

    if (ql.winSquares && (ql.winSquares?.length || 0) > 0) {
        let reshapedBoard = reshapeFlatBoard(ql.winSquares);
        if (reshapedBoard) {
            newState.winSquares = reshapedBoard;
        }
        else {
            console.error("Failed to deserialize winSquares");
            return newState;
        }
    }

    if (ql.winner) {
        newState.winner = ql.winner;
    }

    if (ql.currPlayer)
        newState.currPlayer = ql.currPlayer;
    
    if (ql.gameType) 
        newState.gameType = ql.gameType;

    //    playerIDs?: string[], // emails
    //    xUsername?: string,
    //    oUsername?: string,
    // newState.gameType: gameChoice

    return newState;
}