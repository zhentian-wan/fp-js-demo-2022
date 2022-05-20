import { useState, useEffect, useCallback } from "react";
import { DONE } from "./broadcasters";
export const useBroadcaster = (broadcaster, deps = []) => {
  const [state, setState] = useState(null);
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
  let listener;
  const callbackListener = (value) => {
    if (typeof value === "function") {
      listener = value;
      return;
    }
    listener(value);
  };
  return useCallback(callbackListener, deps);
};
