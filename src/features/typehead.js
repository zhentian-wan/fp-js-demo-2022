import { pipe } from "lodash/fp";
import { createInterval, forOf, zip } from "../libs/broadcasters";
import { map, split } from "../libs/operators";

const typeheadLogic = pipe(
  map((values) => values[0]),
  split(" "),
  map((ary) => ary.join(""))
);
const typehead = (text, time) =>
  typeheadLogic(zip(forOf(text), createInterval(time)));
// const typehead = pipe(typeheadLogic)(zip(forOf(text), createInterval(time)))
export default typehead;
