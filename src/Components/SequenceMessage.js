import React from "react";
import {
  delayWhen,
  filterByKey,
  flatMap,
  mapInputValue,
  mapSequence,
  mapTo,
  scan,
} from "../libs/operators";
import { useBroadcaster, useListener } from "../libs/hooks";
import { createTimeout, forOf } from "../libs/broadcasters";
import { pipe } from "lodash/fp";

export const SequenceMessages = () => {
  const onInput = useListener();
  const onKeyDown = useListener();
  const delayMessage = (msg) => mapTo(msg)(createTimeout(500));
  const sequenceMessages = (message = "") =>
    mapSequence(delayMessage)(forOf(message.split(" ")));
  const enter = filterByKey("Enter")(onKeyDown);
  const logic = pipe(
    mapInputValue,
    delayWhen(enter),
    flatMap(sequenceMessages),
    scan((acc, curr) => {
      acc += ` ${curr}`;
      return acc;
    }, "")
  );
  let state = useBroadcaster(logic(onInput), "");
  return (
    <div>
      <label>Sequence message on Enter:</label>
      <br />
      <input type="text" onInput={onInput} onKeyDown={onKeyDown} />
      <br />
      {state}
    </div>
  );
};
