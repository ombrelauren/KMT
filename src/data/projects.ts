// The actual content now lives in Sanity (see src/lib/sanity.ts for the
// fetch functions). This file only defines the shapes used across the site.

export type ProjectCategory = "music-video" | "film" | "commercial" | "photography";

export type MediaBlock = { type: "image" | "video"; src: string; width: "full" | "half" };

// A row rendered on the project page. A single block = full width (100%).
// Two blocks = side by side, 50/50.
export type MediaRow = MediaBlock[];

export type DescriptionBlock =
  | { type: "credit"; label: string; value: string }
  | { type: "note"; text: string }
  | { type: "spacer" };

export type TextColor = "white" | "black";

export type HomeCover = { type: "image" | "video"; src: string };

export type Project = {
  slug: string;
  artist: string;
  track: string;
  year: number;
  coverImage: string;
  homeCover: HomeCover;
  categories: ProjectCategory[];
  media: MediaRow[];
  description: DescriptionBlock[];
  homeHeaderColor: TextColor;
  homeCaptionColor: TextColor;
};
