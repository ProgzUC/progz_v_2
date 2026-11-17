import test from "node:test";
import assert from "node:assert/strict";
import { formatNextClass } from "../src/pagesStudent/utils/formatNextClass.js";

test("next class labels are empty when the date is missing or invalid", () => {
  assert.equal(formatNextClass(""), "");
  assert.equal(formatNextClass("not-a-date"), "");
});

test("next class labels include the weekday and time", () => {
  const label = formatNextClass("2026-09-28T04:30:00.000Z");
  assert.match(label, /Sep/);
  assert.match(label, /\d/);
});
