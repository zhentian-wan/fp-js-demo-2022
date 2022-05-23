import { useState, useEffect, useCallback } from "react";
import { DONE } from "./broadcasters";
export const useBroadcaster = (broadcaster, init, deps = []) => {
  const [state, setState] = useState(init);
  useEffect(() => {
    const cancel = broadcaster((value) => {
      if (value === DONE) {
        return;
      }
      setState(value);
    });
    return () => {
      cancel();
    };
  }, deps);
  return state;
};

export const useListener = (deps = []) => {
  let listeners = [];
  const callbackListener = (value) => {
    if (typeof value === "function") {
      listeners.push(value);
      return () => {
        listeners = [];
      };
    }
    listeners.forEach((listener) => {
      listener(value);
    });
  };
  return useCallback(callbackListener, deps);
};
