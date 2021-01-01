import { AppStatus } from "../App";

interface PickGameBlockProps {
    setAppStatus: React.Dispatch<React.SetStateAction<AppStatus>>
}

export const PickGameBlock: React.FC<PickGameBlockProps> = ({ setAppStatus }) => (
    <div id="pickGame">
      <div>
        <div className="startMsg">
          Choose one of these two games to get started!
        </div>
        <div className="gameButtons">
          <button
            onClick={() => {
              setAppStatus("ADD");
            }}
          >
            <span
              style={{ fontSize: "1.75em", color: "green", fontWeight: "bold" }}
            >
              +{" "}
            </span>
            Addition game
          </button>
          <button
            onClick={() => {
              setAppStatus("MULT");
            }}
          >
            <span
              style={{ fontSize: "1.75em", color: "red", fontWeight: "bold" }}
            >
              &times;{" "}
            </span>
            Multiplication game
          </button>
        </div>
      </div>
    </div>
)