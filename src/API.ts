/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateGameInput = {
  id?: string | null,
  roomCode: string,
  currBoard?: Array< number | null > | null,
  activeSquares?: Array< string | null > | null,
  moveCount?: number | null,
  currMoves?: Array< number | null > | null,
  gameType?: string | null,
  playerIDs?: Array< string | null > | null,
  xUsername?: string | null,
  oUsername?: string | null,
  winner?: string | null,
  winSquares?: Array< number | null > | null,
  currPlayer?: string | null,
  lastUpdateBy?: string | null,
};

export type ModelGameConditionInput = {
  roomCode?: ModelStringInput | null,
  currBoard?: ModelIntInput | null,
  activeSquares?: ModelStringInput | null,
  moveCount?: ModelIntInput | null,
  currMoves?: ModelIntInput | null,
  gameType?: ModelStringInput | null,
  playerIDs?: ModelStringInput | null,
  xUsername?: ModelStringInput | null,
  oUsername?: ModelStringInput | null,
  winner?: ModelStringInput | null,
  winSquares?: ModelIntInput | null,
  currPlayer?: ModelStringInput | null,
  lastUpdateBy?: ModelStringInput | null,
  and?: Array< ModelGameConditionInput | null > | null,
  or?: Array< ModelGameConditionInput | null > | null,
  not?: ModelGameConditionInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type UpdateGameInput = {
  id: string,
  roomCode?: string | null,
  currBoard?: Array< number | null > | null,
  activeSquares?: Array< string | null > | null,
  moveCount?: number | null,
  currMoves?: Array< number | null > | null,
  gameType?: string | null,
  playerIDs?: Array< string | null > | null,
  xUsername?: string | null,
  oUsername?: string | null,
  winner?: string | null,
  winSquares?: Array< number | null > | null,
  currPlayer?: string | null,
  lastUpdateBy?: string | null,
};

export type DeleteGameInput = {
  id?: string | null,
};

export type ModelGameFilterInput = {
  id?: ModelIDInput | null,
  roomCode?: ModelStringInput | null,
  currBoard?: ModelIntInput | null,
  activeSquares?: ModelStringInput | null,
  moveCount?: ModelIntInput | null,
  currMoves?: ModelIntInput | null,
  gameType?: ModelStringInput | null,
  playerIDs?: ModelStringInput | null,
  xUsername?: ModelStringInput | null,
  oUsername?: ModelStringInput | null,
  winner?: ModelStringInput | null,
  winSquares?: ModelIntInput | null,
  currPlayer?: ModelStringInput | null,
  lastUpdateBy?: ModelStringInput | null,
  and?: Array< ModelGameFilterInput | null > | null,
  or?: Array< ModelGameFilterInput | null > | null,
  not?: ModelGameFilterInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type CreateGameMutationVariables = {
  input: CreateGameInput,
  condition?: ModelGameConditionInput | null,
};

export type CreateGameMutation = {
  createGame:  {
    __typename: "Game",
    id: string,
    roomCode: string,
    currBoard: Array< number | null > | null,
    activeSquares: Array< string | null > | null,
    moveCount: number | null,
    currMoves: Array< number | null > | null,
    gameType: string | null,
    playerIDs: Array< string | null > | null,
    xUsername: string | null,
    oUsername: string | null,
    winner: string | null,
    winSquares: Array< number | null > | null,
    currPlayer: string | null,
    lastUpdateBy: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateGameMutationVariables = {
  input: UpdateGameInput,
  condition?: ModelGameConditionInput | null,
};

export type UpdateGameMutation = {
  updateGame:  {
    __typename: "Game",
    id: string,
    roomCode: string,
    currBoard: Array< number | null > | null,
    activeSquares: Array< string | null > | null,
    moveCount: number | null,
    currMoves: Array< number | null > | null,
    gameType: string | null,
    playerIDs: Array< string | null > | null,
    xUsername: string | null,
    oUsername: string | null,
    winner: string | null,
    winSquares: Array< number | null > | null,
    currPlayer: string | null,
    lastUpdateBy: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteGameMutationVariables = {
  input: DeleteGameInput,
  condition?: ModelGameConditionInput | null,
};

export type DeleteGameMutation = {
  deleteGame:  {
    __typename: "Game",
    id: string,
    roomCode: string,
    currBoard: Array< number | null > | null,
    activeSquares: Array< string | null > | null,
    moveCount: number | null,
    currMoves: Array< number | null > | null,
    gameType: string | null,
    playerIDs: Array< string | null > | null,
    xUsername: string | null,
    oUsername: string | null,
    winner: string | null,
    winSquares: Array< number | null > | null,
    currPlayer: string | null,
    lastUpdateBy: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type GetGameQueryVariables = {
  id: string,
};

export type GetGameQuery = {
  getGame:  {
    __typename: "Game",
    id: string,
    roomCode: string,
    currBoard: Array< number | null > | null,
    activeSquares: Array< string | null > | null,
    moveCount: number | null,
    currMoves: Array< number | null > | null,
    gameType: string | null,
    playerIDs: Array< string | null > | null,
    xUsername: string | null,
    oUsername: string | null,
    winner: string | null,
    winSquares: Array< number | null > | null,
    currPlayer: string | null,
    lastUpdateBy: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListGamesQueryVariables = {
  filter?: ModelGameFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListGamesQuery = {
  listGames:  {
    __typename: "ModelGameConnection",
    items:  Array< {
      __typename: "Game",
      id: string,
      roomCode: string,
      currBoard: Array< number | null > | null,
      activeSquares: Array< string | null > | null,
      moveCount: number | null,
      currMoves: Array< number | null > | null,
      gameType: string | null,
      playerIDs: Array< string | null > | null,
      xUsername: string | null,
      oUsername: string | null,
      winner: string | null,
      winSquares: Array< number | null > | null,
      currPlayer: string | null,
      lastUpdateBy: string | null,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken: string | null,
  } | null,
};

export type UpdatedGameByIdSubscriptionVariables = {
  roomCode: string,
};

export type UpdatedGameByIdSubscription = {
  updatedGameByID:  {
    __typename: "Game",
    id: string,
    roomCode: string,
    currBoard: Array< number | null > | null,
    activeSquares: Array< string | null > | null,
    moveCount: number | null,
    currMoves: Array< number | null > | null,
    gameType: string | null,
    playerIDs: Array< string | null > | null,
    xUsername: string | null,
    oUsername: string | null,
    winner: string | null,
    winSquares: Array< number | null > | null,
    currPlayer: string | null,
    lastUpdateBy: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateGameSubscription = {
  onCreateGame:  {
    __typename: "Game",
    id: string,
    roomCode: string,
    currBoard: Array< number | null > | null,
    activeSquares: Array< string | null > | null,
    moveCount: number | null,
    currMoves: Array< number | null > | null,
    gameType: string | null,
    playerIDs: Array< string | null > | null,
    xUsername: string | null,
    oUsername: string | null,
    winner: string | null,
    winSquares: Array< number | null > | null,
    currPlayer: string | null,
    lastUpdateBy: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateGameSubscription = {
  onUpdateGame:  {
    __typename: "Game",
    id: string,
    roomCode: string,
    currBoard: Array< number | null > | null,
    activeSquares: Array< string | null > | null,
    moveCount: number | null,
    currMoves: Array< number | null > | null,
    gameType: string | null,
    playerIDs: Array< string | null > | null,
    xUsername: string | null,
    oUsername: string | null,
    winner: string | null,
    winSquares: Array< number | null > | null,
    currPlayer: string | null,
    lastUpdateBy: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteGameSubscription = {
  onDeleteGame:  {
    __typename: "Game",
    id: string,
    roomCode: string,
    currBoard: Array< number | null > | null,
    activeSquares: Array< string | null > | null,
    moveCount: number | null,
    currMoves: Array< number | null > | null,
    gameType: string | null,
    playerIDs: Array< string | null > | null,
    xUsername: string | null,
    oUsername: string | null,
    winner: string | null,
    winSquares: Array< number | null > | null,
    currPlayer: string | null,
    lastUpdateBy: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};
