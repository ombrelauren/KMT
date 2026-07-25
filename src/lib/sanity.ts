import { createClient, type SanityClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";
import type {
  DescriptionBlock,
  HomeCover,
  MediaRow,
  Project,
  ProjectCategory,
  TextColor,
} from "@/data/projects";

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

type RawMediaItem =
  | { _type: "mediaImage"; width: "full" | "half"; asset?: { _ref?: string } }
  | { _type: "mediaVideo"; width: "full" | "half"; asset?: { _ref?: string } };

type RawDescriptionBlock =
  | { _type: "creditLine"; label: string; value: string }
  | { _type: "note"; text: string }
  | { _type: "spacer" };

type RawProject = {
  slug: { current: string };
  artist?: string;
  track: string;
  year: number;
  categories: ProjectCategory[];
  coverImage: unknown;
  homeCoverType?: "image" | "video";
  homeCoverVideo?: { asset?: { _ref?: string } };
  homeCoverImage?: unknown;
  media?: RawMediaItem[];
  description?: RawDescriptionBlock[];
  homeHeaderColor?: TextColor;
  homeCaptionColor?: TextColor;
};

const projectFields = `
  artist, track, year, categories, coverImage, slug,
  homeCoverType, homeCoverVideo, homeCoverImage,
  media[]{ _type, width, asset },
  description[]{ _type, label, value, text },
  homeHeaderColor, homeCaptionColor
`;

function resolveHomeCover(raw: RawProject): HomeCover {
  if (raw.homeCoverType === "image") {
    return { type: "image", src: urlFor(raw.homeCoverImage).width(1600).height(900).url() };
  }
  return { type: "video", src: fileUrlFor(raw.homeCoverVideo) ?? "" };
}

function resolveDescription(blocks: RawDescriptionBlock[] | undefined): DescriptionBlock[] {
  if (!blocks) return [];
  return blocks.map((block) => {
    if (block._type === "note") return { type: "note" as const, text: block.text };
    if (block._type === "spacer") return { type: "spacer" as const };
    return { type: "credit" as const, label: block.label, value: block.value };
  });
}

// The flat list of items from Sanity is grouped into rows for rendering:
// a "full" item is its own row; two consecutive "half" items pair up into
// one side-by-side row; a lone trailing "half" renders alone at 50% width.
function groupMedia(rawItems: RawMediaItem[] | undefined): MediaRow[] {
  if (!rawItems) return [];
  // Media items created before the mediaImage/mediaVideo schema switch to
  // native image/file types have no `asset` ref under the new shape — skip
  // them rather than crash the whole page.
  const items = rawItems.filter((item) => item.asset?._ref);
  const rows: MediaRow[] = [];
  let i = 0;

  while (i < items.length) {
    const item = items[i];
    const block =
      item._type === "mediaVideo"
        ? { type: "video" as const, src: fileUrlFor(item) ?? "", width: item.width }
        : { type: "image" as const, src: urlFor(item).url(), width: item.width };

    if (item.width === "half" && items[i + 1]?.width === "half") {
      const next = items[i + 1];
      const nextBlock =
        next._type === "mediaVideo"
          ? { type: "video" as const, src: fileUrlFor(next) ?? "", width: next.width }
          : { type: "image" as const, src: urlFor(next).url(), width: next.width };
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
    artist: raw.artist ?? "",
    track: raw.track,
    year: raw.year,
    categories: raw.categories ?? [],
    coverImage: urlFor(raw.coverImage).width(1600).height(900).url(),
    homeCover: resolveHomeCover(raw),
    media: groupMedia(raw.media),
    description: resolveDescription(raw.description),
    homeHeaderColor: raw.homeHeaderColor ?? "white",
    homeCaptionColor: raw.homeCaptionColor ?? "white",
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

// Which projects show on the home page, and in what order, is curated
// separately from the Work page's own project order.
export async function getHomeProjects(): Promise<Project[]> {
  const raw = await sanityClient.fetch<RawProject[]>(
    `*[_type == "homePage"][0].featuredProjects[]->{ ${projectFields} }`,
  );
  return (raw ?? []).map(toProject);
}

export type SocialLink = { label: string; url: string };

export type Contact = { name: string; email: string };

export type AboutContent = {
  mainText: string;
  leftContact: Contact;
  rightContact: Contact;
  socialLinks: SocialLink[];
};

const emptyContact: Contact = { name: "", email: "" };

export async function getAboutContent(): Promise<AboutContent> {
  const about = await sanityClient.fetch<{
    mainText?: string;
    leftContact?: Contact;
    rightContact?: Contact;
    socialLinks?: SocialLink[];
  } | null>(`*[_type == "siteSettings"][0]{mainText, leftContact, rightContact, socialLinks}`);

  return {
    mainText: about?.mainText ?? "",
    leftContact: about?.leftContact ?? emptyContact,
    rightContact: about?.rightContact ?? emptyContact,
    socialLinks: about?.socialLinks ?? [],
  };
}
