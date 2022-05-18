import { createInterval } from "../libs/broadcasters";
import { startWhen, takeUntil } from "../libs/operators";
import { pipe, curry } from "lodash/fp";

const timer = (interval = 100) => createInterval(interval);
const stopwatchLogic = (startBroadcaster, stopBroadcaster) =>
  pipe(takeUntil(stopBroadcaster), startWhen(startBroadcaster));
const stopwatch = curry((interval, startBroadcaster, stopBroadcaster) =>
  stopwatchLogic(startBroadcaster, stopBroadcaster)(timer(interval))
);

export default stopwatch;

/**
const start = document.querySelector("#start");
const stop = document.querySelector("#stop");

const startClick = addListener(start, "click");
const stopClick = addListener(stop, "click");
stopwatch(100)(startClick, stopClick)(log);
 */
