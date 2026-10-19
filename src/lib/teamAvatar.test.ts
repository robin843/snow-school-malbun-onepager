import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  COMIC_AVATARS_AVAILABLE,
  TEAM_AVATAR_PATHS,
  normalizeTeamGender,
  resolveTeamImage,
  resolveTeamImageWith,
  type TeamAvatarInput,
} from "./teamAvatar.ts";

const MALE = "/images/avatar-skilehrer-maennlich.png";
const FEMALE = "/images/avatar-skilehrerin-weiblich.png";

const assetExists = (webPath: string) => {
  try {
    readFileSync(new URL(`../../public${webPath}`, import.meta.url));
    return true;
  } catch {
    return false;
  }
};

test("the two shared avatar assets use the agreed paths", () => {
  assert.deepEqual(TEAM_AVATAR_PATHS, { male: MALE, female: FEMALE });
});

test("a real portrait always beats gender and the shared avatar", () => {
  const instructor: TeamAvatarInput = {
    display_name: "Ella Brunhart",
    portrait_url: "https://yeti.example/portraits/ella.png",
    gender: "weiblich",
  };
  assert.deepEqual(resolveTeamImageWith(instructor, true), {
    kind: "portrait",
    src: "https://yeti.example/portraits/ella.png",
    alt: "Portrait von Ella Brunhart",
  });
});

test("a blank portrait field counts as no portrait", () => {
  const image = resolveTeamImageWith(
    { display_name: "Ella Brunhart", portrait_url: "   ", gender: "weiblich" },
    false,
  );
  assert.deepEqual(image, { kind: "initial", src: "", alt: "" });
});

test("structured gender maps to the exact avatar path", () => {
  for (const value of ["m", "M", " male ", "Mann", "männlich", "MÄNNLICH", "maennlich"]) {
    const gender = normalizeTeamGender(value);
    assert.equal(gender, "male", value);
    assert.equal(TEAM_AVATAR_PATHS[gender], MALE);
  }
  for (const value of ["f", "F", " Female ", "Frau", "weiblich", "WEIBLICH"]) {
    const gender = normalizeTeamGender(value);
    assert.equal(gender, "female", value);
    assert.equal(TEAM_AVATAR_PATHS[gender], FEMALE);
  }
});

test("role text, names and unknown values stay unspecified", () => {
  for (const value of ["Skilehrerin", "Ski- und Snowboardlehrerin", "w/u", "1", "", "   ", "keine Angabe"]) {
    assert.equal(normalizeTeamGender(value), null, String(value));
  }
  for (const value of [undefined, null, 3, true, { gender: "female" }]) {
    assert.equal(normalizeTeamGender(value), null);
  }
});

test("the same name with no stated gender never picks an avatar", () => {
  const nameOnly: TeamAvatarInput = { display_name: "Maria Gstig" };
  assert.deepEqual(resolveTeamImageWith(nameOnly, true), { kind: "initial", src: "", alt: "" });
  assert.equal(
    resolveTeamImageWith({ ...nameOnly, gender: "weiblich" }, true).src,
    FEMALE,
  );
  assert.equal(
    resolveTeamImageWith({ ...nameOnly, gender: "m" }, true).src,
    MALE,
  );
});

test("an avatar is labelled a placeholder, not a portrait", () => {
  const image = resolveTeamImageWith(
    { display_name: "Anna Frick", gender: "f" },
    true,
  );
  assert.equal(image.kind, "avatar");
  assert.equal(image.alt, "Platzhalterbild für Anna Frick");
  assert.ok(!image.alt.includes("Portrait"));
});

test("no card requests an avatar file while the assets are missing", () => {
  const missing = Object.values(TEAM_AVATAR_PATHS).filter((path) => !assetExists(path));
  if (missing.length > 0) {
    assert.equal(COMIC_AVATARS_AVAILABLE, false, `avatar gate opened before ${missing.join(", ")}`);
    assert.deepEqual(
      resolveTeamImage({ display_name: "Jonas Betschier", gender: "m" }),
      { kind: "initial", src: "", alt: "" },
    );
    assert.deepEqual(
      resolveTeamImage({ display_name: "Anna Frick", gender: "weiblich" }),
      { kind: "initial", src: "", alt: "" },
    );
  }
});

test("the card keeps the neutral fallback when the avatar cannot load", () => {
  const source = readFileSync(new URL("../components/Team.tsx", import.meta.url), "utf8");
  assert.match(source, /const image = resolveTeamImage\(instructor\);/);
  assert.match(source, /image\.kind !== "initial" && !imageFailed/);
  assert.match(source, /src=\{image\.src\}/);
  assert.match(source, /alt=\{image\.alt\}/);
  assert.match(source, /onError=\{\(\) => setImageFailed\(true\)\}/);
});
