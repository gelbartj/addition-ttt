import React, { useState } from "react";
import { GameChoice } from "../App";
import { FloatingSymbols } from "./FloatingSymbols";
import { Game } from "./Game";
import { PickGameBlock } from "./PickGameBlock";

interface GameSessionProps {
    gameObj: any,
    dispatch: any
}

export const GameSession: React.FC<GameSessionProps> = (props) => {
    const [gameChoice, setGameChoice] = useState<GameChoice>(null);
    console.log("gameObj as prop: ", props.gameObj);
    return <>
      <FloatingSymbols show={gameChoice === null} />
      
        {gameChoice === null ? (
            <>
            { props.gameObj && <div style={{textAlign: "center"}}>
                <h2 style={{fontWeight: 'normal'}}>Game room successfully created.</h2>
                <h1>Now share the code{" "}
            <span className="roomCode">{ props.gameObj.roomCode }</span>
            {" "}with a friend so they can join in!</h1>
            </div>}
          <PickGameBlock setGameChoice={setGameChoice} />
          </>
        ) : (
          <>
            <Game gameChoice={gameChoice} gameObj={props.gameObj} />
          </>
        )}
      
    </>
}