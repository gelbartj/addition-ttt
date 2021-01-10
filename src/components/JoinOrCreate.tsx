import { UPDATE_GLOBALSTATE_VALUE, globalActions } from "../App";

interface JoinOrCreateProps {
  dispatch: any;
  createGameObj: (arg0?: string) => Promise<any>;
  username: string;
}

export const JoinOrCreate: React.FC<JoinOrCreateProps> = ({
  dispatch,
  createGameObj,
  username
}) => (
  <div id="pickGame">
    <div>
      <div className="startMsg"></div>
      <div className="gameButtons multi">
        <button
          onClick={() => {
            dispatch({
              type: UPDATE_GLOBALSTATE_VALUE,
              payload: { isLoading: true, createGameCode: true },
            });
            createGameObj(username)
              .then((result) => {
                console.log("Result: ", result);
                dispatch({
                  type: globalActions.CREATE_GAME,
                  payload: {
                    APIgameObj: result.data.createGame,
                  },
                });
              })
              .catch((e) => {
                console.error("Join or create error: ", e);
                dispatch({
                  type: UPDATE_GLOBALSTATE_VALUE,
                  payload: {
                    currError: e?.errors?.map((err: any) => err?.message),
                    isLoading: false,
                  },
                });
              });
          }}
        >
          <span style={{ fontSize: "2em" }}>🌱 </span>
          <span style={{ fontSize: "1.5em", fontWeight: "bold" }}>
            Create game room
          </span>
        </button>
        <button
          onClick={() => {
            dispatch({
              type: UPDATE_GLOBALSTATE_VALUE,
              payload: { createGameCode: false },
            });
          }}
        >
          <span style={{ fontSize: "2em" }}>🔗 </span>
          <span style={{ fontSize: "1.5em", fontWeight: "bold" }}>
            Join game room
          </span>
          <br />
          (With a code from your friend)
        </button>
      </div>
    </div>
  </div>
);
