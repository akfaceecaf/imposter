import { useContext } from "react";
import { MultiplayerCtx } from "./MultiplayerCtx";

const ConnectionManager = () => {
  const { socket } = useContext(MultiplayerCtx);

  const connect = () => {
    socket.connect();
  };

  const disconnect = () => {
    socket.disconnect();
  };

  return (
    <div>
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
};

export default ConnectionManager;
