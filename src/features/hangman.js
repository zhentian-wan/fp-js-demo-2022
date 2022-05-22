import {
  DONE,
  map,
  switchMapTo,
  concatString,
  mapInputValue,
  cancelWhen,
  doneCondition,
  mapDone,
} from "../libs/operators";
import { addListener, forOf } from "../libs/broadcasters";
import { curry, pipe } from "lodash/fp";

const inputValue = (inputSelector) =>
  mapInputValue(addListener(document.querySelector(inputSelector), "input"));

const hangmanLogic = (values) => {
  return map((letter) => {
    if (letter === DONE) {
      return;
    }
    return values.includes(letter) ? letter : "_";
  });
};

const winLogic = pipe(
  doneCondition((str) => !str.includes("_")),
  mapDone("You win!")
);

const hangman = curry((inputSelector, word) => {
  const game = pipe(
    map(hangmanLogic),
    switchMapTo(forOf(word)),
    concatString
  )(inputValue(inputSelector));

  return {
    game,
    startGame(listener) {
      const win = winLogic(game);
      const stopPlayAfterWin = pipe(cancelWhen(win));
      stopPlayAfterWin(game)(listener);
      win(listener);
    },
  };
});

export default hangman;

// const startGame = hangman("#input", "helloworld");
// startGame(log);
