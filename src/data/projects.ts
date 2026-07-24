export type ProjectCategory = "music-video" | "commercial" | "photography";

export type MediaBlock = { type: "image" | "video"; src: string };

// One row of the project page. A single block = full width (100%).
// Two blocks = side by side, 50/50.
export type MediaRow = MediaBlock[];

export type CreditLine = { label: string; value: string };

export type Project = {
  slug: string;
  artist: string;
  track: string;
  year: number;
  image: string;
  category: ProjectCategory;
  media: MediaRow[];
  credits: CreditLine[];
  creditsNote: string;
};

const img = (n: number) => ({ type: "image" as const, src: `/projects/project-${n}.svg` });

const defaultCredits: CreditLine[] = [
  { label: "Réalisation", value: "KMT" },
  { label: "Image Montage Étalonnage", value: "Jad & Tarek Daccache" },
  { label: "Remerciements", value: "Yaniss Terbah & Julien Marmillot & Adrien Dufay" },
];

const defaultCreditsNote = "CPSH Industry, distributed by Label Blue Sky ©";

export const projects: Project[] = [
  {
    slug: "projet-1",
    artist: "Nom Artiste 1",
    track: "Titre du morceau 1",
    year: 2024,
    image: "/projects/project-1.svg",
    category: "music-video",
    media: [[img(1)], [img(2), img(3)], [img(4)]],
    credits: defaultCredits,
    creditsNote: defaultCreditsNote,
  },
  {
    slug: "projet-2",
    artist: "Nom Artiste 2",
    track: "Titre du morceau 2",
    year: 2023,
    image: "/projects/project-2.svg",
    category: "commercial",
    media: [[img(2), img(1)], [img(3)], [img(4), img(2)]],
    credits: defaultCredits,
    creditsNote: defaultCreditsNote,
  },
  {
    slug: "projet-3",
    artist: "Nom Artiste 3",
    track: "Titre du morceau 3",
    year: 2023,
    image: "/projects/project-3.svg",
    category: "photography",
    media: [[img(3)], [img(4)], [img(1), img(2)]],
    credits: defaultCredits,
    creditsNote: defaultCreditsNote,
  },
  {
    slug: "projet-4",
    artist: "Nom Artiste 4",
    track: "Titre du morceau 4",
    year: 2022,
    image: "/projects/project-4.svg",
    category: "music-video",
    media: [[img(4), img(3)], [img(1), img(2)], [img(2)]],
    credits: defaultCredits,
    creditsNote: defaultCreditsNote,
  },
];
