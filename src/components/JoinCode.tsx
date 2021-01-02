import { FormEvent, useState } from "react";
import { UPDATE_GLOBALSTATE_VALUE } from "../App";

interface JoinCodeProps {
    dispatch: any,
    getGameObj: (arg0: string) => Promise<any>
}

export const JoinCode: React.FC<JoinCodeProps> = ({ dispatch, getGameObj }) => {
    const [roomCode, setRoomCode] = useState("");
    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        dispatch({ type: UPDATE_GLOBALSTATE_VALUE, payload: { isLoading: true }});
        getGameObj(roomCode).then((result) => {
            console.log("Query result ", result);
            dispatch({ type: UPDATE_GLOBALSTATE_VALUE, payload: { APIgameObj: result.data }})
        })
        .catch((e) => {
            console.error(e);
            dispatch({ type: UPDATE_GLOBALSTATE_VALUE, payload: { currError: e }});
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