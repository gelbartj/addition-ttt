export const Instructions = (props: any) => (
    <>
      <ul className="instructions">
        <li>
          When there are no more green squares indicating valid moves, select a
          new number combination using the buttons above.
        </li>
        <li>Then keep making new moves until you get four in a row!</li>
      </ul>
      <button onClick={() => console.log("board instructions hidden")}>
        Dismiss
      </button>
    </>

)