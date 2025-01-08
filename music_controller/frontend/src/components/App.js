import React from "react";
import { createRoot } from "react-dom/client";
import HomePage from "./HomePage";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";

const App = () => {
    return (
    <div>
        <HomePage />
    </div>
        );
};

const appDiv = document.getElementById("app");
if (appDiv) {
    const root = createRoot(appDiv);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error("No element with id 'app' found.");
}