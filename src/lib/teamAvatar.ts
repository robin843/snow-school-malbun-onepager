/**
 * Team card image selection.
 *
 * A real portrait from the public instructor feed always wins. Only when a
 * card has no portrait does a shared comic avatar apply, and only for an
 * instructor whose gender is stated as structured feed data — never inferred
 * from a name or a role label. The two shared assets are not uploaded yet, so
 * the gate below stays closed and cards keep the working neutral initial
 * fallback instead of pointing at a missing file.
 */

export const TEAM_AVATAR_PATHS = {
  male: "/images/avatar-skilehrer-maennlich.png",
  female: "/images/avatar-skilehrerin-weiblich.png",
} as const;

/**
 * Flip to true in the same commit that adds both files under `public/images/`.
 * While false, a card without a portrait renders the neutral initial.
 */
export const COMIC_AVATARS_AVAILABLE = false;

export type TeamGender = "male" | "female";

export interface TeamAvatarInput {
  display_name: string;
  portrait_url?: string;
  /** Structured gender from the feed; absent until YETI publishes such a field. */
  gender?: string;
}

export interface TeamImageSource {
  /** portrait = real photo, avatar = shared placeholder, initial = neutral letter. */
  kind: "portrait" | "avatar" | "initial";
  src: string;
  alt: string;
}

/**
 * Accepts only an explicit gender value from the feed. Role texts such as
 * "Skilehrerin" are deliberately not consulted, so an unspecified or unknown
 * value stays unspecified and the neutral fallback is used.
 */
export const normalizeTeamGender = (value: unknown): TeamGender | null => {
  if (typeof value !== "string") return null;
  const token = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
  switch (token) {
    case "m":
    case "male":
    case "mann":
    case "mannlich":
    case "maennlich":
      return "male";
    case "f":
    case "female":
    case "frau":
    case "weiblich":
      return "female";
    default:
      return null;
  }
};

export const resolveTeamImageWith = (
  instructor: TeamAvatarInput,
  avatarsAvailable: boolean,
): TeamImageSource => {
  const portrait =
    typeof instructor.portrait_url === "string" ? instructor.portrait_url.trim() : "";
  if (portrait) {
    return { kind: "portrait", src: portrait, alt: `Portrait von ${instructor.display_name}` };
  }

  const gender = avatarsAvailable ? normalizeTeamGender(instructor.gender) : null;
  if (gender) {
    return {
      kind: "avatar",
      src: TEAM_AVATAR_PATHS[gender],
      alt: `Platzhalterbild für ${instructor.display_name}`,
    };
  }

  return { kind: "initial", src: "", alt: "" };
};

/** The card-facing resolver: the asset gate decides whether avatars may load. */
export const resolveTeamImage = (instructor: TeamAvatarInput): TeamImageSource =>
  resolveTeamImageWith(instructor, COMIC_AVATARS_AVAILABLE);
