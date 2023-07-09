import { useState, useEffect } from "react";
import Card from "../components/cards/Card";
import { ILanguage } from "../components/cards/cardTypes";
import useSocket from "../hooks/useSocket";
import useUsername from "../hooks/useUsername";

const ENDPOINT = "http://localhost:5000";

function CardList() {
  const { username } = useUsername();
  const [selectedStatValue, setSelectedStatValue] = useState<string | null>(
    null
  );
  const [pendingStatValue, setPendingStatValue] = useState<string | null>(null);
  const [shouldSend, setShouldSend] = useState(false);
  const [data, setData] = useState<ILanguage | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const { socket, thinkingStat } = useSocket(ENDPOINT, {
    username,
    stat: selectedStatValue,
    shouldSend,
  });

  useEffect(() => {
    if (socket) {
      socket.on("data", (newData: ILanguage) => {
        setData(newData);
        setShouldSend(false);
      });

      socket.on("message", (newMessage: string) => {
        setMessage(newMessage);
      });

      socket.on("result", (newResultMessage: string) => {
        setResultMessage(newResultMessage);
      });
    }
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return (
    <div>
      {data && (
        <Card
          key={data.id}
          language={data}
          pendingStat={pendingStatValue}
          onStatSelect={(value) => {
            setPendingStatValue(value);
            if (socket) {
              socket.emit("thinking_stat", value);
            }
          }}
        />
      )}
      {thinkingStat && <p>{thinkingStat}</p>}
      {pendingStatValue !== null && (
        <div>
          <p>Pending stat value: {pendingStatValue}</p>
          <button
            onClick={() => {
              setSelectedStatValue(pendingStatValue);
              setShouldSend(true);
              setPendingStatValue(null);
            }}
          >
            Confirm
          </button>
          <button
            onClick={() => {
              setPendingStatValue(null);
            }}
          >
            Cancel
          </button>
        </div>
      )}
      {message && <p>{message}</p>}
      {resultMessage && <p>{resultMessage}</p>}
    </div>
  );
}

export default CardList;
