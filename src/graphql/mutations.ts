/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const customUpdateGame = /* GraphQL */ `
  mutation CustomUpdateGame(
    $id: ID!
    $roomCode: String
    $currBoard: [Int]
    $activeSquares: [String]
    $moveCount: Int
    $currMoves: [Int]
    $gameType: String
    $playerIDs: [String]
    $xUsername: String
    $oUsername: String
    $winner: String
    $winSquares: [Int]
    $currPlayer: String
    $lastUpdateBy: String
  ) {
    customUpdateGame(
      id: $id
      roomCode: $roomCode
      currBoard: $currBoard
      activeSquares: $activeSquares
      moveCount: $moveCount
      currMoves: $currMoves
      gameType: $gameType
      playerIDs: $playerIDs
      xUsername: $xUsername
      oUsername: $oUsername
      winner: $winner
      winSquares: $winSquares
      currPlayer: $currPlayer
      lastUpdateBy: $lastUpdateBy
    ) {
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
export const createGame = /* GraphQL */ `
  mutation CreateGame(
    $input: CreateGameInput!
    $condition: ModelGameConditionInput
  ) {
    createGame(input: $input, condition: $condition) {
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
export const updateGame = /* GraphQL */ `
  mutation UpdateGame(
    $input: UpdateGameInput!
    $condition: ModelGameConditionInput
  ) {
    updateGame(input: $input, condition: $condition) {
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
export const deleteGame = /* GraphQL */ `
  mutation DeleteGame(
    $input: DeleteGameInput!
    $condition: ModelGameConditionInput
  ) {
    deleteGame(input: $input, condition: $condition) {
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
