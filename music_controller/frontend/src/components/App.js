import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";  // Import BrowserRouter
import HomePage from "./HomePage";  // Import HomePage

const App = () => {
  return (
    <div className="center">
      <BrowserRouter>  {/* Wrap HomePage with BrowserRouter to provide routing context */}
        <HomePage />
      </BrowserRouter>
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
