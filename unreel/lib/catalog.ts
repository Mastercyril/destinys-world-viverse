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
  zone: number;
};

export type ManifestEntry = {
  cover: string;
  preview?: string;
  title: string;
  poster?: string;
};

export type Row = { id: string; label: string; live?: boolean; ids: string[] };

export const TITLES: Title[] = [
  { id: "modern-district", title: "Modern District", tagline: "The city remembers what time erased.", logline: "Investigate the decaying district, gather temporal fragments, and survive the first signs of the alien hunter.", genres: ["Investigation", "Horror"], year: 2026, rating: "13+", mode: "story", featured: true, zone: 1 },
  { id: "transition-zone", title: "Transition Zone", tagline: "Reality begins to distort.", logline: "Cross the corrupted boundary where weather, memory, and the geometry of the world stop obeying the rules.", genres: ["Sci-Fi", "Survival"], year: 2026, rating: "13+", mode: "story", zone: 2 },
  { id: "dark-corrupted-area", title: "Dark Corrupted Area", tagline: "The fragments whisper below the ruins.", logline: "Search ancient ruins while hostile creatures and corrupted scholars guard the next pieces of the Shattered Chronos.", genres: ["Dark Fantasy", "Adventure"], year: 2026, rating: "16+", mode: "story", zone: 3 },
  { id: "final-corruption-zone", title: "Final Corruption Zone", tagline: "Every timeline ends here.", logline: "Reach the Ethereal Void, face the boss entity, and choose whether to repair, shatter, or accept the loop.", genres: ["Cosmic Horror", "Finale"], year: 2026, rating: "16+", mode: "story", zone: 4 },
  { id: "alien-killer-files", title: "Alien Killer Files", tagline: "It is not human. It is still hunting.", logline: "A live evidence channel assembled from Destiny's encounters with the adaptive alien AI.", genres: ["Live", "AI Horror"], year: 2026, rating: "16+", mode: "chaos", zone: 1 },
  { id: "viverse-world-feed", title: "VIVERSE World Feed", tagline: "The investigation continues between worlds.", logline: "A live channel for world updates, creator drops, and new Destiny's World content.", genres: ["Live", "VIVERSE"], year: 2026, rating: "ALL", mode: "chaos", zone: 1 },
];

export const ROWS: Row[] = [
  { id: "zones", label: "Explore Destiny's World", ids: ["modern-district", "transition-zone", "dark-corrupted-area", "final-corruption-zone"] },
  { id: "live", label: "Live Investigation Channels", live: true, ids: ["alien-killer-files", "viverse-world-feed"] },
];

const zoneCover: Record<number, string> = {
  1: "/destiny-assets/zone-1.svg",
  2: "/destiny-assets/zone-2.svg",
  3: "/destiny-assets/zone-3.svg",
  4: "/destiny-assets/zone-4.svg",
};

export function featuredTitle() { return TITLES.find((title) => title.featured) ?? TITLES[0]; }
export function titleById(id: string) { return TITLES.find((title) => title.id === id); }
export function mediaUrl(url: string) { return url; }

export async function loadManifest(): Promise<{ titles: Record<string, ManifestEntry> }> {
  return {
    titles: Object.fromEntries(TITLES.map((title) => [title.id, {
      cover: zoneCover[title.zone],
      title: title.title,
      // Add a generated MP4/WebM to assets/video/<id>.mp4 when available.
      preview: undefined,
    }])),
  };
}

export type Manifest = Awaited<ReturnType<typeof loadManifest>>;
