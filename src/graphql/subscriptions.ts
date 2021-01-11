/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const updatedGameById = /* GraphQL */ `
  subscription UpdatedGameById($roomCode: String!) {
    updatedGameByID(roomCode: $roomCode) {
      id
      roomCode
      currBoard
      activeSquares
      moveCount
      currMoves
      gameType
      playerIDs
      xUsername
      oUsername
      winner
      winSquares
      currPlayer
      lastUpdateBy
      createdAt
      updatedAt
    }
  }
`;
export const onCreateGame = /* GraphQL */ `
  subscription OnCreateGame {
    onCreateGame {
      id
      roomCode
      currBoard
      activeSquares
      moveCount
      currMoves
      gameType
      playerIDs
      xUsername
      oUsername
      winner
      winSquares
      currPlayer
      lastUpdateBy
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateGame = /* GraphQL */ `
  subscription OnUpdateGame {
    onUpdateGame {
      id
      roomCode
      currBoard
      activeSquares
      moveCount
      currMoves
      gameType
      playerIDs
      xUsername
      oUsername
      winner
      winSquares
      currPlayer
      lastUpdateBy
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteGame = /* GraphQL */ `
  subscription OnDeleteGame {
    onDeleteGame {
      id
      roomCode
      currBoard
      activeSquares
      moveCount
      currMoves
      gameType
      playerIDs
      xUsername
      oUsername
      winner
      winSquares
      currPlayer
      lastUpdateBy
      createdAt
      updatedAt
    }
  }
`;
