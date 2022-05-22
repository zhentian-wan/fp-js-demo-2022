import React from "react";
import { createRoot } from "react-dom/client";
import { SearchBoxV1 } from "./Components/SearchBoxV1";

const container = document.getElementById("app");
const root = createRoot(container);
const App = () => {
  return (
    <>
      <SearchBoxV1 />
    </>
  );
};
root.render(<App />);
