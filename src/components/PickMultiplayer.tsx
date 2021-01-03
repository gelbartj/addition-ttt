import { UPDATE_GLOBALSTATE_VALUE } from "../App";

interface PickMultiplayerProps {
  dispatch: any;
}

export const PickMultiplayer: React.FC<PickMultiplayerProps> = ({
  dispatch
}) => (
  <div id="pickGame">
    <div>
      <div className="startMsg">Choose your setup:</div>
      <div className="gameButtons multi">
        <button
          onClick={() => {
            dispatch({
              type: UPDATE_GLOBALSTATE_VALUE,
              payload: { isMultiplayer: true },
            });
          }}
        >
          <span style={{ fontSize: "2em" }}>📲 </span>
          <span style={{ fontSize: "1.5em", fontWeight: "bold" }}>Remote</span>
          <br />
          (Players using different computers)
        </button>
        <button
          onClick={() => {
            dispatch({
              type: UPDATE_GLOBALSTATE_VALUE,
              payload: { isMultiplayer: false },
            });
          }}
        >
          <span style={{ fontSize: "2em" }}>🏠 </span>
          <span style={{ fontSize: "1.5em", fontWeight: "bold" }}>Local</span>
          <br />
          (Players using the same computer)
        </button>
      </div>
    </div>
  </div>
);
