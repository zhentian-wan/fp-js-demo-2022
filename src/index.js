import React from "react";
import { createRoot } from "react-dom/client";

import {
  delayWhen,
  debounce,
  filter,
  filterByKey,
  flatMap,
  map,
  mapError,
  mapInputValue,
  mapSequence,
  mapTo,
  scan,
} from "./libs/operators";
import { useBroadcaster, useListener } from "./libs/hooks";
import { createTimeout, getUrl, forOf } from "./libs/broadcasters";
import { pipe } from "lodash/fp";

const BASE_URL = "https://openlibrary.org";
const openLibraryApi = (id) => `${BASE_URL}/search.json?q=${id}`;

const container = document.getElementById("app");
const root = createRoot(container);
const App = () => {
  const onInput = useListener();
  const searchForBooks = pipe(
    debounce(500),
    mapInputValue,
    filter((str) => str.length > 3),
    map(openLibraryApi),
    flatMap(getUrl),
    map((obj) => obj.docs)
  );
  let books = useBroadcaster(searchForBooks(onInput), []);
  return (
    <div>
      <input type="text" onInput={onInput} />
      <br />
      {books.map((book, i) => (
        <div key={`${book.key}-${i}`}>
          <a href={BASE_URL + book.key} target="_blank" rel="noopener">
            {" "}
            {book.title}
          </a>
        </div>
      ))}
    </div>
  );
};
root.render(<App />);
