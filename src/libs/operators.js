import { curry } from "lodash";
import { DONE } from "./broadcasters";

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

export const doneCondition = (condition) => (broadcaster) => (listener) => {
  let cancel = broadcaster((value) => {
    if (condition(value)) {
      listener(value);
      listener(DONE);
      cancel();
    }
  });
  return () => {
    cancel();
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

export const flatMap = (createBroadcaster) =>
  createOperator((broadcaster, listener) => {
    return broadcaster((value) => {
      const newBroadcaster = createBroadcaster(value);
      return newBroadcaster(listener);
    });
  });

export const flatMapTo = (broadcaster) =>
  flatMap((operator) => operator(broadcaster));

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
        if (cancelWhen) {
          cancelWhen();
        }
        // When whenBraodcaster fires, cancel the mainBroadcaster
        // then restart the repeatListener with mainBroadcaster
        cancelWhen = whenBroadcaster(() => {
          if (cancel) {
            cancel();
          }
          cancel = mainBroadcaster(repeatListener);
          return;
        });
      }

      listener(value);
    };

    cancel = mainBroadcaster(repeatListener);
    return () => {
      cancel();
      cancelWhen && cancelWhen();
    };
  };

// needs custom DONE logic, so pull out from createOperator
export const split = (splitter) =>
  curry((broadcaster, listener) => {
    let buffer = [];
    return broadcaster((value) => {
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
      cancelInnter();
    };
  }
);

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

export const mapDone = (doneValue) => (broadcaster) => (listener) => {
  return broadcaster((value) => {
    if (value === DONE) {
      listener(doneValue);
    } else {
      listener(value);
    }
  });
};
