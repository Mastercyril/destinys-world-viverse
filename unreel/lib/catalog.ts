export type Title = {
  id: string;
  title: string;
  tagline: string;
  logline: string;
  genres: string[];
  year: number;
  rating: string;
  mode: "story" | "chaos";
  featured?: boolean;
};

export type ManifestEntry = {
  cover: string;
  preview: string;
  title: string;
  poster?: string;
};

export type Row = {
  id: string;
  label: string;
  live?: boolean;
  ids: string[];
};

export const TITLES: Title[] = [
  {
    id: "meridian-drift",
    title: "Meridian Drift",
    tagline: "The distress call is in her own voice.",
    logline: "A salvage pilot boards a derelict ship and finds a log recorded in her own voice, three days from now.",
    genres: ["Sci-Fi", "Mystery"],
    year: 2026,
    rating: "13+",
    mode: "story",
    featured: true,
  },
  {
    id: "neon-vespers",
    title: "Neon Vespers",
    tagline: "Every choir needs a missing voice.",
    logline: "A detective hunts a missing android singer through a rain-soaked megacity and the cathedral wants her back before dawn.",
    genres: ["Noir", "Cyberpunk"],
    year: 2026,
    rating: "16+",
    mode: "story",
  },
  {
    id: "salt-and-sundown",
    title: "Salt & Sundown",
    tagline: "The railroad is coming. So is she.",
    logline: "A widowed sheriff protects a frontier town from a railroad baron as the sun falls on the salt flats.",
    genres: ["Western", "Drama"],
    year: 2026,
    rating: "13+",
    mode: "story",
  },
  {
    id: "hollow-creek",
    title: "Hollow Creek",
    tagline: "The festival needs one more guest.",
    logline: "A journalist returns to a town where her name is already carved into a ritual effigy.",
    genres: ["Horror", "Folk"],
    year: 2026,
    rating: "16+",
    mode: "story",
  },
  {
    id: "capybara-news",
    title: "Capybara News Network",
    tagline: "The most trusted grass-eating newsroom in the multiverse.",
    logline: "A live news channel where the anchors are capybaras and the stories get stranger by the minute.",
    genres: ["Comedy", "Live"],
    year: 2026,
    rating: "TV-14",
    mode: "chaos",
  },
  {
    id: "goblin-tax-season",
    title: "Goblin Tax Season",
    tagline: "Nothing is taxable, but everything is personal.",
    logline: "A goblin bureaucracy turns fiscal collapse into absurdist comedy and a very aggressive public hearing.",
    genres: ["Comedy", "Live"],
    year: 2026,
    rating: "TV-MA",
    mode: "chaos",
  },
  {
    id: "toaster-court",
    title: "Toaster Court",
    tagline: "Justice is served at 1200 watts.",
    logline: "An absurd legal show where appliances argue their own constitutional rights in real time.",
    genres: ["Comedy", "Live"],
    year: 2026,
    rating: "TV-14",
    mode: "chaos",
  },
];

export const ROWS: Row[] = [
  { id: "for-you", label: "For You", ids: ["meridian-drift", "neon-vespers", "salt-and-sundown", "hollow-creek"] },
  { id: "live", label: "Live Channels", live: true, ids: ["capybara-news", "goblin-tax-season", "toaster-court"] },
];

const SAMPLE_MEDIA = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

export function featuredTitle() {
  return TITLES.find((title) => title.featured) ?? TITLES[0];
}

export function titleById(id: string) {
  return TITLES.find((title) => title.id === id);
}

export function mediaUrl(url: string) {
  return url;
}

export async function loadManifest(): Promise<{ titles: Record<string, ManifestEntry> }> {
  return {
    titles: Object.fromEntries(
      TITLES.map((title) => [
        title.id,
        {
          cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
          preview: SAMPLE_MEDIA,
          title: title.title,
        },
      ])
    ),
  };
}

export type Manifest = Awaited<ReturnType<typeof loadManifest>>;
