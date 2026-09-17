"use client";

import Link from "next/link";
import { useRef } from "react";
import { mediaUrl, type ManifestEntry, type Row as RowData, type Title } from "@/lib/catalog";

export function Row({ row, titles, assets, onInfo }: { row: RowData; titles: Title[]; assets: Record<string, ManifestEntry>; onInfo: (title: Title) => void; }) {
  const track = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section className="row" id={row.id}>
      <h2 className="row-label">{row.live && <span className="live-pill">LIVE</span>}{row.label}</h2>
      <div className="row-body">
        <button type="button" className="row-arrow left" aria-label="Scroll left" onClick={() => scrollBy(-1)}>‹</button>
        <div className="row-track" ref={track}>
          {titles.map((title) => (
            <Card key={`${row.id}-${title.id}`} title={title} asset={assets[title.id] ?? null} live={Boolean(row.live)} onInfo={() => onInfo(title)} />
          ))}
        </div>
        <button type="button" className="row-arrow right" aria-label="Scroll right" onClick={() => scrollBy(1)}>›</button>
      </div>
    </section>
  );
}

function Card({ title, asset, live, onInfo }: { title: Title; asset: ManifestEntry | null; live: boolean; onInfo: () => void; }) {
  return (
    <div className="card">
      <Link href={`/watch/${title.id}`} className="card-media" aria-label={`Play ${title.title}`}>
        {asset ? <img src={asset.cover} alt="" loading="lazy" draggable={false} /> : <div className="card-skeleton">{title.title}</div>}
        {live && <span className="card-live">LIVE</span>}
      </Link>
      <div className="card-panel">
        <div className="card-actions">
          <Link href={`/watch/${title.id}`} className="round primary" aria-label="Play">▶</Link>
          <button type="button" className="round" aria-label="More info" onClick={onInfo}>i</button>
        </div>
        <div className="card-title">{title.title}</div>
        <div className="card-sub">
          <span className={`mode-chip ${title.mode}`}>{title.mode === "chaos" ? "LIVE" : "FILM"}</span>
          <span className="rating">{title.rating}</span>
        </div>
        <div className="card-tagline">{title.tagline}</div>
      </div>
    </div>
  );
}
