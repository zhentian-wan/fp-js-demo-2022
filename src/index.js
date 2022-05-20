import { createInterval } from "./libs/broadcasters";
import {} from "./libs/operators";
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
const container = document.getElementById("app");
const root = createRoot(container);
const App = () => {
  const [state, setState] = useState();
  useEffect(() => {
    createInterval(1000)(setState);
  }, []);
  return <div>{state}</div>;
};
root.render(<App />);
