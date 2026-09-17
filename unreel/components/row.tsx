"use client";

import Link from "next/link";
import { type ManifestEntry, type Row as RowData, type Title } from "@/lib/catalog";

export function Row({ row, titles, assets, onInfo }: { row: RowData; titles: Title[]; assets: Record<string, ManifestEntry>; onInfo: (title: Title) => void }) {
  return <section className="row" id={row.id}><h2 className="row-label">{row.live && <span className="live-pill">LIVE</span>}{row.label}</h2><div className="row-track">
    {titles.map((title) => <Card key={`${row.id}-${title.id}`} title={title} asset={assets[title.id] ?? null} live={Boolean(row.live)} onInfo={() => onInfo(title)} />)}
  </div></section>;
}

function Card({ title, asset, live, onInfo }: { title: Title; asset: ManifestEntry | null; live: boolean; onInfo: () => void }) {
  return <article className="card"><Link href={`/watch/${title.id}`} className="card-media" aria-label={`Enter ${title.title}`}>
    {asset ? <img src={asset.cover} alt="" loading="lazy" /> : <div className="card-skeleton">{title.title}</div>}{live && <span className="card-live">LIVE</span>}
  </Link><div className="card-panel"><div className="card-actions"><Link href={`/watch/${title.id}`} className="round primary">▶</Link><button type="button" className="round" onClick={onInfo} aria-label={`Intel for ${title.title}`}>i</button></div><div className="card-title">{title.title}</div><div className="card-sub"><span className={`mode-chip ${title.mode}`}>{title.mode === "chaos" ? "LIVE" : `ZONE ${title.zone}`}</span><span className="rating">{title.rating}</span></div><div className="card-tagline">{title.tagline}</div></div></article>;
}
