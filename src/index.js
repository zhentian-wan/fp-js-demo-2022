import { DONE, createTimeout, addListener, forOf } from "./libs/broadcasters";
import { filter, mapTo, repeat, repeatWhen, startWhen } from "./libs/operators";
import hangman from "./features/hangman";
import { pipe } from "lodash/fp";

const log = (v) => {
  if (v === DONE) {
    return;
  }
  console.log(v);
};
const inputClick = addListener(document.querySelector("#input"), "click");
const word = forOf("cat");
const cancel = startWhen(word)(word)(log);
