import React from "react";
import {
  debounce,
  filter,
  switchMap,
  map,
  mapInputValue,
} from "../libs/operators";
import { useBroadcaster, useListener } from "../libs/hooks";
import { getUrl, merge } from "../libs/broadcasters";
import { pipe } from "lodash/fp";

const BASE_URL = "https://openlibrary.org";
const openLibraryApi = (id) => `${BASE_URL}/search.json?q=${id}`;

export const SearchBoxV1 = () => {
  const onInput = useListener();
  const inputValue = mapInputValue(onInput);
  const searchForBooks = pipe(
    debounce(500),
    filter((str) => str.length > 3),
    map(openLibraryApi),
    switchMap(getUrl),
    filter((obj) => obj?.docs),
    map((obj) => obj.docs)
  );
  const clearSearch = pipe(
    filter((str) => str.length < 4),
    map(() => [])
  );
  let books = useBroadcaster(
    merge(searchForBooks(inputValue), clearSearch(inputValue)),
    []
  );
  return (
    <div>
      <label>Search for books:</label>
      <br />
      <input type="text" onInput={onInput} />
      <br />
      {books.map((book, i) => (
        <div key={`${book.key}-${i}`}>
          <a href={BASE_URL + book.key} target="_blank" rel="noopener">
            {book.title}
          </a>
        </div>
      ))}
    </div>
  );
};
