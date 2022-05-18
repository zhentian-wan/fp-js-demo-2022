import { curry } from "lodash/fp";
import { merge } from "../libs/broadcasters";
import { mapTo } from "../libs/operators";

const mapToStep = curry((broadcaster, step) => mapTo(step)(broadcaster));

const counterLogic = curry((initialValue, broadcaster, listener) => {
  let res = initialValue;
  return broadcaster((value) => {
    const id = setTimeout(() => {
      res = res + value;
      listener(res);
    }, 0);
    return () => {
      clearTimeout(id);
    };
  });
});

const counter = (inititalValue = 0, step = 1) =>
  curry((plusBroadcaster, minusBroadcaster) =>
    counterLogic(
      inititalValue,
      merge(
        mapToStep(plusBroadcaster, step),
        mapToStep(minusBroadcaster, step * -1)
      )
    )
  );

export default counter;

/**
 * 
const plus = document.querySelector("#plus");
const minus = document.querySelector("#minus");
const plusClick = addListener(plus, "click");
const minusClick = addListener(minus, "click");
const cancel = counter(100, 5)(plusClick, minusClick)(log);
 */
