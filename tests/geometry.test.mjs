import test from "node:test";
import assert from "node:assert/strict";
import { angleDeg, dist, visOK } from "../js/geometry.mjs";

// 1e-3 tolerance: angleDeg's preserved +1e-9 epsilon keeps collinear
// angles slightly off 0/180 degrees, by design of the original formula.
const approx = (actual, expected, eps = 1e-3) =>
  assert.ok(Math.abs(actual - expected) < eps, `${actual} !~= ${expected}`);

test("angleDeg: straight line is 180 degrees", () => {
  approx(angleDeg({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, 100, 100), 180);
});

test("angleDeg: right angle is 90 degrees", () => {
  approx(angleDeg({ x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }, 100, 100), 90);
});

test("angleDeg: same direction is 0 degrees", () => {
  approx(angleDeg({ x: 2, y: 0 }, { x: 1, y: 0 }, { x: 3, y: 0 }, 100, 100), 0);
});

test("angleDeg: aspect correction uses W/H scaling", () => {
  // Vectors (200,100) and (200,0) after W=200,H=100 scaling.
  approx(angleDeg({ x: 1, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }, 200, 100), 26.56505117707799, 1e-9);
});

test("dist: aspect-scaled euclidean distance", () => {
  approx(dist({ x: 0, y: 0 }, { x: 3, y: 4 }, 10, 10), 50);
  approx(dist({ x: 0, y: 0 }, { x: 1, y: 1 }, 200, 100), Math.hypot(200, 100));
});

test("visOK: missing visibility defaults to visible, 0.4 is not enough", () => {
  const lm = Array.from({ length: 33 }, () => ({ x: 0, y: 0 }));
  assert.equal(visOK(lm), true);
  lm[11].visibility = 0.4;
  assert.equal(visOK(lm), false);
  lm[11].visibility = 0.41;
  assert.equal(visOK(lm), true);
  lm[26].visibility = 0.1; // a CORE joint
  assert.equal(visOK(lm), false);
});
