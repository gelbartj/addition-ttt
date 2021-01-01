import React, { useState } from "react";
import "./App.css";
import { Game } from "./components/Game";
import { PickGameBlock } from "./components/PickGameBlock";
import { FloatingSymbols } from "./components/FloatingSymbols";

export type AppStatus = "ADD" | "MULT" | "ALG" | null;
  
function App() {

  // const encouragingMessages = ["Great!", "Nice choice!", "Amazing!", "That's what I was going to pick!", "You're a real mathematician!", "Now that's some real arithmetic!"];
  
  const [appStatus, setAppStatus] = useState<AppStatus>(null);

  return (
    <>
      <FloatingSymbols show={appStatus === null} />
      <header className="App-header">
        <a href="/" style={{ color: "white", textDecoration: "none" }}>
          {appStatus === null
            ? "Math Four-In-A-Row"
            : `Four-In-A-Row: ${
                appStatus === "ADD" ? "Addition Edition" : "Multiplication Station"
              }`}
        </a>
      </header>
      <main>
        {appStatus === null ? (
          <PickGameBlock setAppStatus={setAppStatus} />
        ) : (
          <>
            <Game appStatus={appStatus} />
          </>
        )}
      </main>
    </>
  );
}

export default App;
