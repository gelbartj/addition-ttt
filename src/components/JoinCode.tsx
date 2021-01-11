import { FormEvent, useState } from "react";
import { UPDATE_GLOBALSTATE_VALUE, getGameObj, debugLog } from "../App";
import { API, graphqlOperation } from "aws-amplify";
import { updateGame } from "../graphql/mutations";
import { UpdateGameMutation } from "../API";
import { GraphQLResult } from "@aws-amplify/api";

interface JoinCodeProps {
  dispatch: any;
  username: string;
}

export const JoinCode: React.FC<JoinCodeProps> = ({ dispatch, username }) => {
  const [roomCode, setRoomCode] = useState("");
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    dispatch({ type: UPDATE_GLOBALSTATE_VALUE, payload: { isLoading: true } });
    getGameObj(roomCode)
      .then((result) => {
        debugLog("Query result: ", result);
        if ("data" in result && result.data?.getGame) {
          const apiGameObj = result.data!.getGame;
          dispatch({
            type: UPDATE_GLOBALSTATE_VALUE,
            payload: {
              APIgameObj: apiGameObj,
              isLoading: false,
            },
          });

          if (!apiGameObj?.oUsername) {
            (API.graphql(
              graphqlOperation(updateGame, {
                input: { id: apiGameObj?.id, oUsername: username },
              })
            ) as Promise<GraphQLResult<UpdateGameMutation>>)
              .then((e) => {
                if (e) debugLog("Successfully updated oUsername: ", e);
              })
              .catch((e) =>
                debugLog("error", "Error when updating oUsername: ", e)
              );
          }
        } else {
          dispatch({
            type: UPDATE_GLOBALSTATE_VALUE,
            payload: {
              currError: "No room found with that game code!",
              isLoading: false,
            },
          });
        }
      })
      .catch((e) => {
        debugLog("error", "Join code error: ", e);
        dispatch({
          type: UPDATE_GLOBALSTATE_VALUE,
          payload: {
            currError: e?.errors?.map((er: any) => er?.message),
            isLoading: false,
          },
        });
      });
  }
  return (
    <div className="usernameBlock">
      <form onSubmit={(e) => handleSubmit(e)}>
        <label className="usernameLabel">Code: </label>
        <input
          type="text"
          size={40}
          className="usernameInput"
          value={roomCode}
          onChange={(e) => {
            setRoomCode(e.currentTarget.value);
          }}
        />
        <input type="submit" value="Continue" className="usernameSubmit" />
      </form>
    </div>
  );
};
