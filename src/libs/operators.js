import { createTimeout, DONE } from "./broadcasters";
import { curry, pipe } from "lodash/fp";

const createOperator = curry((operator, broadcaster, listener) => {
  return operator((behaviorListener) => {
    return broadcaster((value) => {
      if (value === DONE) {
        listener(DONE);
        return;
      }
      behaviorListener(value);
    });
  }, listener);
});

export const cancelWhen =
  (cancelBroadcaster) => (mainBroadcaster) => (listener) => {
    const cancel = mainBroadcaster(listener);
    const cancel2 = cancelBroadcaster(() => {
      cancel();
    });
    return () => {
      cancel();
      cancel2();
    };
  };

export const concat = createOperator((broadcaster, listener) => {
  let string = "";
  return broadcaster((val) => {
    string += val;
    listener(string);
  });
});

export const concatString = curry((broadcaster, listener) => {
  let result = "";
  return broadcaster((value) => {
    if (value === DONE) {
      listener(result);
      result = "";
      return;
    }
    result += value;
  });
});

export const combine = curry((broadcaster1, broadcaster2, listener) => {
  let value1, value2;
  const cancel1 = broadcaster1((value) => {
    value1 = value;
    listener([value1, value2]);
  });
  const cancel2 = broadcaster2((value) => {
    value2 = value;
    listener([value1, value2]);
  });
  return () => {
    cancel1();
    cancel2();
  };
});

export const doneIf = (condition) => (broadcaster) => (listener) => {
  let cancel = broadcaster((value) => {
    listener(value);
    if (condition(value)) {
      listener(DONE);
    }
  });
  return () => {
    cancel();
  };
};

export const delayWhen = (allowBroadcaster) => (broadcaster) => (listener) => {
  let currentValue;
  let cancelAllow;
  let cancel;
  cancel = broadcaster((value) => {
    currentValue = value;
  });
  cancelAllow = allowBroadcaster(() => {
    listener(currentValue);
  });
  return () => {
    cancel && cancel();
    cancel = null;
    cancelAllow && cancelAllow();
    cancelAllow = null;
  };
};

export const filter = (predicate) =>
  createOperator((broadcaster, listener) => {
    return broadcaster((values) => {
      if (predicate(values)) {
        listener(values);
      }
    });
  });

export const filterByKey = (key) => filter((e) => e.key === key);

export const debounce = (time) => (broadcaster) => (listener) => {
  let cancelTimeout;
  const cancel = broadcaster((value) => {
    if (cancelTimeout) {
      cancelTimeout();
    }
    cancelTimeout = createTimeout(time)((innerValue) => {
      if (innerValue === DONE) {
        return;
      }
      listener(value);
    });
  });
  return () => {
    cancel();
    cancel = null;
    cancelTimeout && cancelTimeout();
    cancelTimeout = null;
  };
};

export const doneAfter = (condition) => (broadcaster) => (listener) => {
  const cancel = broadcaster((value) => {
    listener(value);
    if (condition(value)) {
      listener(DONE);
      cancel();
    }
  });

  return () => {
    cancel();
  };
};

// untested
export const flip = (fn) => {
  let cancel;
  return curry(function (a, b) {
    const newBroadcaster = fn.bind(this, [b, a]);
    return (listener) => {
      cancel = newBroadcaster((value) => {
        listener(value);
      });

      return () => {
        cancel();
      };
    };
  });
};

export const switchMap = (createBroadcaster, cacheable = false) =>
  createOperator((broadcaster, listener) => {
    const cache = new Map();
    let cancel;
    return broadcaster((value) => {
      if (cancel) {
        // cancel new broadcaster
        cancel();
      }
      if (cache.get(value)) {
        listener(cache.get(value));
        return;
      }
      const newBroadcaster = createBroadcaster(value);
      cancel = newBroadcaster((newValue) => {
        if (cacheable && !(newValue instanceof Error)) {
          cache.set(value, newValue);
        }
        listener(newValue);
      });
    });
  });

export const switchMapTo = (broadcaster) =>
  switchMap((operator) => operator(broadcaster));

export const map = (transform) =>
  createOperator((broadcaster, listener) => {
    return broadcaster((values) => {
      listener(transform(values));
    });
  });

export const mapInputValue = map((e) => e.target.value);

export const mapTo = (hardCode) =>
  createOperator((broadcaster, listener) => {
    return broadcaster((value) => {
      listener(hardCode);
    });
  });

export const repeat = (broadcaster) => (listener) => {
  let cancel;
  const repeatListener = (value) => {
    if (value === DONE) {
      if (cancel) {
        cancel();
      }
      cancel = broadcaster(repeatListener);
      return;
    }
    listener(value);
  };
  cancel = broadcaster(repeatListener);
  return () => {
    cancel();
    cancel = null;
  };
};

/**
 * RepeatWhen is a pattern catch the behavior and do the recursion
 * when WhenBroadcaster fires
 */
export const repeatWhen =
  (whenBroadcaster) => (mainBroadcaster) => (listener) => {
    let cancel;
    let cancelWhen;
    const repeatListener = (value) => {
      if (value === DONE) {
        if (cancel) {
          cancel();
        }
        // When whenBraodcaster fires, cancel the mainBroadcaster
        // then restart the repeatListener with mainBroadcaster
        cancelWhen = whenBroadcaster(() => {
          cancelWhen();
          // cancel()
          cancel = mainBroadcaster(repeatListener);
          return;
        });
      }

      listener(value);
    };

    cancel = mainBroadcaster(repeatListener);
    return () => {
      cancel();
      cancel = null;
      cancelWhen && cancelWhen();
      cancelWhen = null;
    };
  };

export const repeatIf = (condition) => pipe(doneIf(condition), repeat);

export const scan = (reducer, init) => (broadcaster) => (listener) => {
  let acc = init;
  let buffer = [];
  const cancel = broadcaster((value) => {
    if (cancel) {
      cancel();
    }
    if (value === DONE) {
      buffer.length = 0;
      acc = init;
      return;
    } else {
      buffer.push(value);
    }
    if (buffer.length) {
      acc = reducer(acc, buffer.shift());
      listener(acc);
    }
  });
  return () => {
    cancel();
    cancel = null;
  };
};

// needs custom DONE logic, so pull out from createOperator
export const split = (splitter) =>
  curry((broadcaster, listener) => {
    let buffer = [];
    const cancel = broadcaster((value) => {
      if (value === DONE) {
        listener(buffer);
        buffer = [];
        listener(DONE);
      }
      if (value == splitter) {
        listener(buffer);
        buffer = [];
      } else {
        buffer.push(value);
      }
    });

    return () => {
      cancel();
    };
  });

export const startWhen = curry(
  (outterBroadcaster, innerBroadcaster, listener) => {
    let cancelInnter;
    let cancelOutter;

    /**
     * Outter broadcaster control the inner broadcaster
     * Only when both outter broadcaster and inner broadcaster values are DONE
     * We can push DONE to listener
     */
    cancelOutter = outterBroadcaster((outterValue) => {
      if (cancelInnter) {
        cancelInnter();
      }
      cancelInnter = innerBroadcaster((innerValue) => {
        if (innerValue === DONE) {
          if (outterValue === DONE) {
            listener(DONE);
          }
          return;
        }
        listener(innerValue);
      });
    });

    return () => {
      cancelOutter();
      cancelOutter = null;
      cancelInnter();
      cancelInnter = null;
    };
  }
);

export const sequences =
  (...broadcasters) =>
  (listener) => {
    let cancel;
    let broadcaster = broadcasters.shift();
    const sequencesListener = (value) => {
      if (value === DONE && broadcasters.length) {
        let broadcaster = broadcasters.shift();
        cancel = broadcaster(sequencesListener);
        return;
      }
      listener(value);
    };
    cancel = broadcaster(sequencesListener);

    return () => {
      cancel();
      cancel = null;
    };
  };

/**
 * Idea is mapSequence(word => delayMessage(word))(forOf("Hello my name is Zhentian".split(" ")))
 * it log out each word in defined time interval
 * so createBroadcaster return a new broadcaster, take a innerListener as parameter
 * the InnerListener will perform recursion when it get DONE value
 *
 * Buffer is a tick to handle when all values come in at the same time
 * we can push the value to the buffer and wait for the next tick
 */
export const mapSequence =
  (createBroadcaster) => (broadcaster) => (listener) => {
    let buffer = [];
    let innerBroadcaster;
    let cancel;
    let cacnelInner;
    let innerListener = (innerValue) => {
      if (innerValue === DONE) {
        innerBroadcaster = null;
        if (buffer.length) {
          let value = buffer.shift();
          if (value === DONE) {
            listener(DONE);
            return;
          }
          innerBroadcaster = createBroadcaster(value);
          cacnelInner = innerBroadcaster(innerListener);
        }
        return;
      }
      listener(innerValue);
    };
    cancel = broadcaster((value) => {
      if (innerBroadcaster) {
        buffer.push(value);
      } else {
        innerBroadcaster = createBroadcaster(value);
        cacnelInner = innerBroadcaster(innerListener);
      }
    });

    return () => {
      cancel();
      cancel = null;
      cacnelInner && cacnelInner();
      cacnelInner = null;
    };
  };

export const tap = (fn) => (broadcaster) => (listener) => {
  const cancel = broadcaster((value) => {
    fn(value);
    listener(value);
  });

  return () => {
    cancel();
  };
};

export const takeUntil = curry(
  (outterBroadcaster, innterBroadcaster, listener) => {
    let cancelInner = innterBroadcaster(listener);
    let cancelOuuter = outterBroadcaster(() => {
      cancelInner();
    });
    return () => {
      cancelInner();
      cancelOuuter();
    };
  }
);

export const thenCombine = (secondBroadcaster) => {
  return mapBroadcaster((firstValue) =>
    map((secondValue) => [firstValue, secondValue])(secondBroadcaster)
  );
};

export let mapBroadcaster =
  (createBroadcaster) => (broadcaster) => (listener) => {
    let cancelNew;
    const cancel = broadcaster((value) => {
      let newBroadcaster = createBroadcaster(value);
      cancelNew = newBroadcaster(listener);
    });

    return () => {
      cancel();
      cancelNew && cancelNew();
    };
  };

export const mapDone = (doneValue) => (broadcaster) => (listener) => {
  const cancel = broadcaster((value) => {
    if (value === DONE) {
      listener(doneValue);
    } else {
      listener(value);
    }
  });

  return () => {
    cancel();
  };
};

export const mapError = (transform) => (broadcaster) => (listener) => {
  const cancel = broadcaster((error) => {
    if (error instanceof Error) {
      listener(transform(error));
      return;
    }
    listener(error);
  });
  return () => {
    cancel();
  };
};

export const ifElse =
  (condition, ifOperator, elseOperator) => (broadcaster) => (listener) => {
    const cancel = broadcaster((value) => {
      // broadcaster is a function that take a listener as parameter and invoke that listener
      const immediateBroadcaster = (l) => l(value);
      if (condition(value)) {
        ifOperator(immediateBroadcaster)(listener);
      } else {
        elseOperator(immediateBroadcaster)(listener);
      }
    });

    return () => {
      cancel();
    };
  };

// invoke share() immedicately
export const share = () => {
  let listeners = [];
  let cancel;
  return (broadcaster) => (listener) => {
    if (!cancel) {
      cancel = broadcaster((value) => {
        listeners.forEach((listener) => listener(value));
      });
    }
    listeners.push(listener);

    return () => {
      cancel();
      cancel = null;
      listeners = [];
    };
  };
};

export const startWith =
  (value = null) =>
  (broadcaster) =>
  (listener) => {
    listener(value);
    const cancel = broadcaster(listener);
    return () => {
      cancel();
    };
  };
