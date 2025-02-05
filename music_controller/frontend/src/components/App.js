import React from "react";
import { BrowserRouter } from "react-router-dom";
import HomePage from "./HomePage";

const App = () => {
  return (
    <div className="center">
      <BrowserRouter>  {/* Wrap HomePage with BrowserRouter to provide routing context */}
        <HomePage />
      </BrowserRouter>
    </div>
  );
};

export default App;
