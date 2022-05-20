import React from "react";
import { createRoot } from "react-dom/client";

import { mapInputValue } from "./libs/operators";
import { useBroadcaster, useListener } from "./libs/hooks";

const container = document.getElementById("app");
const root = createRoot(container);
const App = () => {
  const onInput = useListener();
  const state = useBroadcaster(mapInputValue(onInput));
  return (
    <div>
      <input type="text" onInput={onInput} />
      {state}
    </div>
  );
};
root.render(<App />);
