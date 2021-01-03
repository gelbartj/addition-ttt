import React from "react";
import { GameChoice } from "../App";
import { Game } from "./Game";
import { GraphQLGame } from "./graphql-utilities";

interface MultiplayerGameProps {
    gameType: GameChoice;
    gameObj: any;
    playerIsX: boolean;
    gameState?: GraphQLGame | null;
    userId: string;
  }

export const MultiplayerGame: React.FC<MultiplayerGameProps> = (props) => (
    <Game userId={props.userId} receivedGameState={props.gameState} gameType={props.gameType} gameObj={props.gameObj} playerIsX={props.playerIsX} />
);

export default MultiplayerGame;