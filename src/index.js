import React from "react";
import { createRoot } from "react-dom/client";

import {
  delayWhen,
  filter,
  filterByKey,
  flatMap,
  mapInputValue,
  mapSequence,
  mapTo,
} from "./libs/operators";
import { useBroadcaster, useListener } from "./libs/hooks";
import { createTimeout, forOf } from "./libs/broadcasters";
import { pipe } from "lodash/fp";

const delayMessage = (msg) => mapTo(msg)(createTimeout(500));
const sequenceMessages = (message = "") =>
  mapSequence(delayMessage)(forOf(message.split(" ")));

const container = document.getElementById("app");
const root = createRoot(container);
const App = () => {
  const onInput = useListener();
  const onKeyDown = useListener();
  const enter = filterByKey("Enter")(onKeyDown);
  const inputToSequenceMessage = pipe(
    mapInputValue,
    delayWhen(enter),
    flatMap(sequenceMessages)
  );
  const state = useBroadcaster(inputToSequenceMessage(onInput));
  return (
    <div>
      <input type="text" onInput={onInput} onKeyDown={onKeyDown} />
      {state}
    </div>
  );
};
root.render(<App />);
