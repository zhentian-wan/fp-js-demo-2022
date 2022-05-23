import { createTimeout, getUrl } from "../libs/broadcasters";
import {
  map,
  mapTo,
  combine,
  startWith,
  mapInputValue,
  filter,
  tap,
  share,
  repeat,
  doneIf,
} from "../libs/operators";
import { useBroadcaster, useListener } from "../libs/hooks";
import { pipe, head, every, isString } from "lodash/fp";
const wordLogic = pipe(map(head), share());
const wordBraodcaster = wordLogic(
  getUrl(`https://random-word-api.herokuapp.com/word`)
);
export const WordGame = () => {
  const onChange = useListener();
  const word = useBroadcaster(wordBraodcaster);
  const gameLogic = pipe(
    filter(every(isString)),
    map(([guess, word]) => {
      return Array.from(word)
        .map((letter) => (guess.includes(letter) ? letter : "*"))
        .join("");
    }),
    doneIf((guess) => guess && !guess.includes("*")),
    repeat
  );
  const guessLogic = pipe(mapInputValue, startWith(""));
  const guesBroadcaster = guessLogic(onChange);
  const guess = useBroadcaster(guesBroadcaster, "", [word]);
  const gameBroadcaster = gameLogic(combine(guesBroadcaster, wordBraodcaster));
  const game = useBroadcaster(gameBroadcaster, "");
  return (
    <div>
      <input type="text" onChange={onChange} value={guess} />
      <br />
      {word}
      <br />
      {JSON.stringify(game, null, 2)}
    </div>
  );
};
