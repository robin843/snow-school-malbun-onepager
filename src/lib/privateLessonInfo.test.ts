import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PRIVATE_LESSON_INFO, showsPrivateLessonInfo } from "./privateLessonInfo.ts";

test("exact standard time windows from Ivo's rule", () => {
  assert.deepEqual(PRIVATE_LESSON_INFO.single.windows, ["09:00–10:00", "12:00–13:00", "13:00–14:00"]);
  assert.deepEqual(PRIVATE_LESSON_INFO.double.windows, ["10:00–12:00", "12:00–14:00", "14:00–16:00"]);
});
test("Office soft rule stated, no season or price claims", () => {
  const all = JSON.stringify(PRIVATE_LESSON_INFO);
  assert.match(all, /auf Anfrage beim Skischulbüro/);
  assert.match(all, /nach Absprache mit dem Skischulbüro/);
  assert.doesNotMatch(all, /saison|CHF|\d+\s*\.-/i);
});
test("shown only for private products by type, never by id/name", () => {
  assert.equal(showsPrivateLessonInfo({ type: "private" }), true);
  assert.equal(showsPrivateLessonInfo({ type: "group" }), false);
  assert.equal(showsPrivateLessonInfo({ type: "group_saturday" }), false);
  const card = readFileSync(new URL("../components/Kursuebersicht.tsx", import.meta.url), "utf8");
  assert.match(card, /course\.type === "private" && \(\s*<details/);
  assert.doesNotMatch(card, /Saison|CHF \d/);
});
