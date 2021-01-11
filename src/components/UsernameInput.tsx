import { FormEvent, useState } from "react";
import { UPDATE_GLOBALSTATE_VALUE } from "../App";

interface UsernameInputProps {
  dispatch: any;
}

export const UsernameInput: React.FC<UsernameInputProps> = ({ dispatch }) => {
  const [username, setUsername] = useState("");
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    dispatch({
      type: UPDATE_GLOBALSTATE_VALUE,
      payload: { username: username },
    });
  }
  return (
    <div className="usernameBlock">
      <form onSubmit={(e) => handleSubmit(e)}>
        <label className="usernameLabel">Username: </label>
        <input
          type="text"
          size={40}
          className="usernameInput"
          value={username}
          onChange={(e) => {
            setUsername(e.currentTarget.value);
          }}
        />
        <input type="submit" value="Continue" className="usernameSubmit" />
      </form>
    </div>
  );
};
