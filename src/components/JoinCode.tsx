import { FormEvent, useState } from "react";
import { UPDATE_GLOBALSTATE_VALUE, getGameObj } from "../App";
import { API, graphqlOperation } from "aws-amplify";
import { customUpdateGame } from "../graphql/mutations";
import { CustomUpdateGameMutation } from "../API";
import { GraphQLResult } from "@aws-amplify/api";

interface JoinCodeProps {
    dispatch: any,
    username: string
}

export const JoinCode: React.FC<JoinCodeProps> = ({ dispatch, username }) => {
    const [roomCode, setRoomCode] = useState("");
    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        dispatch({ type: UPDATE_GLOBALSTATE_VALUE, payload: { isLoading: true }});
        getGameObj(roomCode).then((result) => {
            console.log("Query result: ", result);
            if ("data" in result && (result.data?.listGames?.items || []).length > 0) {
                const apiGameObj = result.data!.listGames!.items![0];
                dispatch({ type: UPDATE_GLOBALSTATE_VALUE, payload: { 
                    APIgameObj: apiGameObj,
                    isLoading: false
                 }})

                if (!apiGameObj?.oUsername) {
                    (API.graphql(
                        graphqlOperation(customUpdateGame, {
                          input: { id: apiGameObj?.id, oUsername: username },
                        })
                      ) as Promise<GraphQLResult<CustomUpdateGameMutation>>)
                        .then((e) => {
                          if (e) console.log("Successfully updated oUsername: ", e);
                        })
                        .catch((e) => console.error("Error when updating oUsername: ", e));
                } 
            }
            else {
                dispatch({ type: UPDATE_GLOBALSTATE_VALUE, payload: { 
                    currError: "No room found with that game code!",
                    isLoading: false  }});
            }
        })
        .catch((e) => {
            console.error("Join code error: ", e);
            dispatch({ type: UPDATE_GLOBALSTATE_VALUE, payload: { 
                currError: e?.errors?.map((er: any) => er?.message),
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