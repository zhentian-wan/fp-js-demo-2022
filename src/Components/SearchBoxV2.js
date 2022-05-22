import React, { useState, useEffect, useRef } from "react";
import {
  debounce,
  filter,
  flatMap,
  map,
  mapInputValue,
} from "../libs/operators";
import { useBroadcaster, useListener } from "../libs/hooks";
import { getUrl, merge } from "../libs/broadcasters";
import { pipe } from "lodash/fp";

const BASE_URL = "https://openlibrary.org";
const openLibraryApi = (id) => `${BASE_URL}/search.json?q=${id}`;

export const SearchBoxV2 = () => {
  // const onInput = useListener();
  // const inputValue = mapInputValue(onInput);
  // const searchForBooks = pipe(
  //   debounce(500),
  //   filter((str) => str.length > 3),
  //   map(openLibraryApi),
  //   flatMap(getUrl),
  //   map((obj) => obj.docs)
  // );
  // const clearSearch = pipe(
  //   filter((str) => str.length < 4),
  //   map(() => [])
  // );
  // let books = useBroadcaster(
  //   merge(searchForBooks(inputValue), clearSearch(inputValue)),
  //   []
  // );

  const [inputValue, setInputValue] = useState("");
  const [books, setBooks] = useState([]);
  const firstRef = useRef(true);
  const timeoutRef = useRef(null);
  const controllerRef = useRef(null);
  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false;
      return;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;
    timeoutRef.current = setTimeout(async () => {
      if (inputValue.length > 3) {
        try {
          const response = await fetch(openLibraryApi(inputValue), { signal });
          const json = await response.json();
          setBooks(json.docs);
        } catch (err) {}
      }
      if (inputValue.length < 4) {
        setBooks([]);
      }
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [inputValue]);

  return (
    <div>
      <label>Search for books:</label>
      <br />
      <input
        type="text"
        onInput={(event) => setInputValue(event.target.value)}
      />
      <br />
      {books &&
        books.map((book, i) => (
          <div key={`${book.key}-${i}`}>
            <a href={BASE_URL + book.key} target="_blank" rel="noopener">
              {book.title}
            </a>
          </div>
        ))}
    </div>
  );
};
