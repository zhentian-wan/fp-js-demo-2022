import React from "react";
import { createRoot } from "react-dom/client";
import { SearchBox } from "./Components/SearchBox";

const container = document.getElementById("app");
const root = createRoot(container);
const App = () => {
  return (
    <>
      <SearchBox />
    </>
  );
};
root.render(<App />);
