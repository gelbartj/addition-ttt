import { GameChoice } from "../App";

interface PickGameBlockProps {
    setGameChoice: React.Dispatch<React.SetStateAction<GameChoice>>
}

export const PickGameBlock: React.FC<PickGameBlockProps> = ({ setGameChoice }) => (
    <div id="pickGame">
      <div>
        <div className="startMsg">
          Choose one of these two games to get started!
        </div>
        <div className="gameButtons">
          <button
            onClick={() => {
              setGameChoice("ADD");
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
              setGameChoice("MULT");
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