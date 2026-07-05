import { RouterProvider } from "react-router-dom"
import { AppProviders } from "./shared/providers/AppProviders"
import { router } from "./shared/router"
import { useEffect } from "react";
import { socket } from "./socket.ts";

function App() {
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.log(err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}

export default App