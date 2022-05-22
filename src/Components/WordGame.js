import { getUrl } from "../libs/broadcasters";
import { map, share, switchMap } from "../libs/operators";
import { useBroadcaster, useListener } from "../libs/hooks";
import { pipe, head } from "lodash/fp";

let logic = pipe(
  switchMap((event) => getUrl(`https://random-word-api.herokuapp.com/word`)),
  map(head),
  share()
);

export const WordGame = () => {
  const onClick = useListener();
  const broadcaster = logic(onClick);
  const word = useBroadcaster(broadcaster);
  const anotherWord = useBroadcaster(broadcaster);
  return (
    <div>
      <button onClick={onClick}>Load word</button>
      <br />
      {word}
      <br />
      {anotherWord}
    </div>
  );
};
