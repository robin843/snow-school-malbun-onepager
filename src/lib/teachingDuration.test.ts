import test from "node:test";
import assert from "node:assert/strict";
import { effectiveTeachingMinutes, teachingMinutesForBlocks } from "./teachingDuration.ts";

test("60-minute window has 55 effective teaching minutes", () => {
  assert.equal(effectiveTeachingMinutes(60), 55);
  assert.equal(teachingMinutesForBlocks([{ start: "09:00", end: "10:00" }]), 55);
});
test("120-minute window has 115 effective teaching minutes", () => {
  assert.equal(effectiveTeachingMinutes(120), 115);
  assert.equal(teachingMinutesForBlocks([{ start: "10:00", end: "12:00" }]), 115);
});
test("two separate double blocks total 230, not 240 or elapsed time including lunch", () => {
  assert.equal(teachingMinutesForBlocks([{ start: "10:00", end: "12:00" }, { start: "14:00", end: "16:00" }]), 230);
});
test("duplicate, overlapping, malformed and unknown blocks cannot establish teaching totals", () => {
  for (const blocks of [[], [{ start: "10:00", end: "12:00" }, { start: "10:00", end: "12:00" }],
    [{ start: "10:00", end: "12:00" }, { start: "11:00", end: "13:00" }],
    [{ start: "23:00", end: "01:00" }], [{ start: "bad", end: "12:00" }], [{ start: "10:00", end: "11:30" }]]) {
    assert.equal(teachingMinutesForBlocks(blocks), null);
  }
});
test("already effective and unknown durations are not shortened again", () => {
  for (const duration of [55, 115, 230, 90, 180, 240]) assert.equal(effectiveTeachingMinutes(duration), duration);
  assert.equal(teachingMinutesForBlocks([{ start: "14:00", end: "16:00" }, { start: "10:00", end: "12:00" }]), 230);
  assert.equal(teachingMinutesForBlocks([{ start: "09:00", end: "10:00" }, { start: "10:00", end: "12:00" }]), 170);
});