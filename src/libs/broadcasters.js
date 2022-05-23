import { curry } from "lodash/fp";
export const DONE = Symbol("done");

export const addListener = curry((element, eventName, listener) => {
  element.addEventListener(eventName, listener);
  return () => {
    element.removeEventListener(eventName, listener);
  };
});

export const createTimeout = curry((time, listener) => {
  const id = setTimeout(() => {
    listener(null);
    listener(DONE);
  }, time);
  return () => {
    clearTimeout(id);
  };
});

export const forOf = curry((iteretor, listener) => {
  const id = setTimeout(() => {
    for (const value of iteretor) {
      listener(value);
    }
    listener(DONE);
  }, 0);
  return () => {
    clearTimeout(id);
  };
});

export const createInterval = curry((time, listener) => {
  let i = 0;
  const id = setInterval(() => listener(i++), time);
  return () => {
    clearInterval(id);
  };
});

export const getUrl = curry((url, listener) => {
  let control = new AbortController();
  let signal = control.signal;
  fetch(url, { signal })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      listener(json);
    })
    .catch((err) => {
      listener(err);
    });

  return () => {
    control.abort();
  };
});

export const merge = curry((boradcaster1, boradcaster2, listener) => {
  const cancel1 = boradcaster1(listener);
  const cancel2 = boradcaster2(listener);
  return () => {
    cancel1();
    cancel2();
  };
});

export const zip = curry((boradcaster1, boradcaster2, listener) => {
  let buffer1 = [];
  let buffer2 = [];
  const cancelBoth = () => {
    cancel1();
    cancel2();
  };
  const cancel1 = boradcaster1((value1) => {
    buffer1.push(value1);
    if (buffer2.length) {
      listener([buffer1.shift(), buffer2.shift()]);
    }
    if (buffer1[0] === DONE || buffer2[0] === DONE) {
      listener(DONE);
      cancelBoth();
    }
  });

  const cancel2 = boradcaster2((value2) => {
    buffer2.push(value2);
    if (buffer1.length) {
      listener([buffer1.shift(), buffer2.shift()]);
    }
    if (buffer1[0] === DONE || buffer2[0] === DONE) {
      listener(DONE);
      cancelBoth();
    }
  });

  return cancelBoth;
});
