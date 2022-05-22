import { F } from "lodash/fp";
import { useState, useEffect, useCallback } from "react";
import { DONE } from "./broadcasters";
export const useBroadcaster = (broadcaster, init, deps = []) => {
  const [state, setState] = useState(init);
  useEffect(() => {
    broadcaster((value) => {
      if (value === DONE) {
        return;
      }
      setState(value);
    });
  }, deps);
  return state;
};

export const useListener = (deps = []) => {
  let listeners = [];
  const callbackListener = (value) => {
    if (typeof value === "function") {
      listeners.push(value);
      return;
    }
    listeners.forEach((listener) => {
      listener(value);
    });
  };
  return useCallback(callbackListener, deps);
};
