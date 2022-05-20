import { useState, useEffect, useCallback } from "react";
export const useBroadcaster = (broadcaster, deps = []) => {
  const [state, setState] = useState(null);
  useEffect(() => {
    broadcaster(setState);
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
