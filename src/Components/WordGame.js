import { getUrl } from "../libs/broadcasters";
import {
  map,
  thenCombine,
  startWith,
  mapInputValue,
  filter,
  repeatIf,
} from "../libs/operators";
import { useBroadcaster, useListener } from "../libs/hooks";
import { pipe, head, every, isString } from "lodash/fp";
const wordLogic = pipe(map(head));
const wordBraodcaster = wordLogic(
  getUrl(`https://random-word-api.herokuapp.com/word`)
);
export const WordGame = () => {
  const onChange = useListener();
  const gameLogic = pipe(
    filter(every(isString)),
    repeatIf(([word, guess]) =>
      Array.from(word).every((letter) => guess.includes(letter))
    )
  );
  const guessLogic = pipe(mapInputValue, startWith(""));
  const guesBroadcaster = guessLogic(onChange);
  const gameBroadcaster = gameLogic(
    thenCombine(guesBroadcaster)(wordBraodcaster)
  );
  const [word, guess] = useBroadcaster(gameBroadcaster, ["", ""]);
  return (
    <div>
      <input type="text" onChange={onChange} value={guess} />
      <br />
      {word}
      <br />
      {Array.from(word)
        .map((letter) => (guess.includes(letter) ? letter : "*"))
        .join("")}
    </div>
  );
};
