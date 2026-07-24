import { createClient, type SanityClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { CreditLine, MediaRow, Project, ProjectCategory } from "@/data/projects";

// Project ID and dataset are not secrets — Sanity's own docs recommend
// referencing them directly like this.
export const sanityClient: SanityClient = createClient({
  projectId: "idmbo52t",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});

const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source: unknown) {
  return builder.image(source as never);
}

export function fileUrlFor(asset: { asset?: { _ref?: string } } | undefined) {
  const ref = asset?.asset?._ref;
  if (!ref) return null;
  // file asset refs look like: file-<id>-<extension>
  const [, id, extension] = ref.match(/^file-([a-f0-9]+)-(\w+)$/) ?? [];
  if (!id || !extension) return null;
  return `https://cdn.sanity.io/files/idmbo52t/production/${id}.${extension}`;
}

type RawMediaItem = {
  mediaType: "image" | "video";
  width: "full" | "half";
  image?: unknown;
  video?: { asset?: { _ref?: string } };
};

type RawProject = {
  slug: { current: string };
  artist: string;
  track: string;
  year: number;
  categories: ProjectCategory[];
  coverImage: unknown;
  coverVideo?: { asset?: { _ref?: string } };
  media?: RawMediaItem[];
  credits?: CreditLine[];
  creditsNote?: string;
};

const projectFields = `
  artist, track, year, categories, coverImage, coverVideo, slug,
  media[]{ mediaType, width, image, video },
  credits, creditsNote
`;

// The flat list of items from Sanity is grouped into rows for rendering:
// a "full" item is its own row; two consecutive "half" items pair up into
// one side-by-side row; a lone trailing "half" renders alone at 50% width.
function groupMedia(items: RawMediaItem[] | undefined): MediaRow[] {
  if (!items) return [];
  const rows: MediaRow[] = [];
  let i = 0;

  while (i < items.length) {
    const item = items[i];
    const block =
      item.mediaType === "video"
        ? { type: "video" as const, src: fileUrlFor(item.video) ?? "", width: item.width }
        : { type: "image" as const, src: urlFor(item.image).url(), width: item.width };

    if (item.width === "half" && items[i + 1]?.width === "half") {
      const next = items[i + 1];
      const nextBlock =
        next.mediaType === "video"
          ? { type: "video" as const, src: fileUrlFor(next.video) ?? "", width: next.width }
          : { type: "image" as const, src: urlFor(next.image).url(), width: next.width };
      rows.push([block, nextBlock]);
      i += 2;
    } else {
      rows.push([block]);
      i += 1;
    }
  }

  return rows;
}

function toProject(raw: RawProject): Project {
  return {
    slug: raw.slug.current,
    artist: raw.artist,
    track: raw.track,
    year: raw.year,
    categories: raw.categories ?? [],
    coverImage: urlFor(raw.coverImage).width(1600).height(900).url(),
    coverVideo: fileUrlFor(raw.coverVideo) ?? "",
    media: groupMedia(raw.media),
    credits: raw.credits ?? [],
    creditsNote: raw.creditsNote ?? "",
  };
}

export async function getProjects(): Promise<Project[]> {
  const raw = await sanityClient.fetch<RawProject[]>(
    `*[_type == "project"] | order(orderRank asc) { ${projectFields} }`,
  );
  return raw.map(toProject);
}

export async function getProject(slug: string): Promise<Project | null> {
  const raw = await sanityClient.fetch<RawProject | null>(
    `*[_type == "project" && slug.current == $slug][0] { ${projectFields} }`,
    { slug },
  );
  return raw ? toProject(raw) : null;
}

export type SiteSettings = {
  instagram?: string;
  tiktok?: string;
  vimeo?: string;
  youtube?: string;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const settings = await sanityClient.fetch<SiteSettings | null>(
    `*[_type == "siteSettings"][0]{instagram, tiktok, vimeo, youtube}`,
  );
  return settings ?? {};
}
