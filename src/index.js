import React from "react";
import { createRoot } from "react-dom/client";
import { SearchBoxV2 } from "./Components/SearchBoxV2";

const container = document.getElementById("app");
const root = createRoot(container);
const App = () => {
  return (
    <>
      <SearchBoxV2 />
    </>
  );
};
root.render(<App />);
