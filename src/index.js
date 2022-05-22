import React from "react";
import { createRoot } from "react-dom/client";
import { WordGame } from "./Components/WordGame";

const container = document.getElementById("app");
const root = createRoot(container);

const App = () => {
  return (
    <>
      <WordGame />
    </>
  );
};
root.render(<App />);
