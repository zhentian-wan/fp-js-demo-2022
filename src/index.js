import { DONE, createTimeout, addListener, forOf } from "./libs/broadcasters";
import {
  doneAfter,
  filter,
  mapTo,
  repeat,
  repeatWhen,
  startWhen,
  mapSequence,
} from "./libs/operators";
import hangman from "./features/hangman";
import { pipe } from "lodash/fp";

const log = (v) => {
  console.log(v);
};
