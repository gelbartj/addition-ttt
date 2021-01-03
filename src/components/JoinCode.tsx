import { FormEvent, useState } from "react";
import { UPDATE_GLOBALSTATE_VALUE, getGameObj } from "../App";

interface JoinCodeProps {
    dispatch: any,
}

export const JoinCode: React.FC<JoinCodeProps> = ({ dispatch }) => {
    const [roomCode, setRoomCode] = useState("");
    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        dispatch({ type: UPDATE_GLOBALSTATE_VALUE, payload: { isLoading: true }});
        getGameObj(roomCode).then((result) => {
            console.log("Query result: ", result);
            if ("data" in result && (result.data?.listGames?.items || []).length > 0) {
                dispatch({ type: UPDATE_GLOBALSTATE_VALUE, payload: { 
                    APIgameObj: result.data!.listGames!.items![0],
                    isLoading: false
                 }})
            }
        })
        .catch((e) => {
            console.error("Join code error: ", e);
            dispatch({ type: UPDATE_GLOBALSTATE_VALUE, payload: { 
                currError: e,
                isLoading: false  }});
        })
    }
    return <div className="usernameBlock">
    <form onSubmit={(e) => handleSubmit(e)}>
    <label className="usernameLabel">Code: </label>
    <input type="text" size={40} className="usernameInput" value={roomCode} onChange={(e) => {
        setRoomCode(e.currentTarget.value)
    }} />
    <input type="submit" value="Continue" className="usernameSubmit" />
    </form>
    </div>
}