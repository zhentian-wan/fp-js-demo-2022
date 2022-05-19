import { createTimeout, addListener, forOf } from "./libs/broadcasters";
import { mapTo, mapSequence } from "./libs/operators";

const log = (v) => {
  console.log(v);
};
const message = "Hello, my name is Zhentian".split(" ").filter(Boolean);
const delayMessage = (msg) => mapTo(msg)(createTimeout(500));
const hiClick = mapTo("hi")(
  addListener(document.querySelector("#input"), "click")
);
const cancel1 = mapSequence((word) => delayMessage(word))(forOf(message))(log);
const cancel2 = mapSequence((hi) => delayMessage(hi))(hiClick)(log);

setTimeout(() => {
  cancel1();
  cancel2();
}, 1500);
