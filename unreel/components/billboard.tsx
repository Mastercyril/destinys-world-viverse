"use client";

import Link from "next/link";
import { mediaUrl, type ManifestEntry, type Title } from "@/lib/catalog";
import { Meta } from "./meta";

export function Billboard({ title, asset, onInfo }: { title: Title; asset: ManifestEntry | null; onInfo: () => void }) {
  return <section className="billboard"><div className="billboard-media">
    {asset?.preview ? <video src={mediaUrl(asset.preview)} poster={asset.cover} autoPlay muted loop playsInline /> : asset ? <img src={asset.cover} alt="" /> : <div className="billboard-fallback" />}
    <div className="billboard-shade" /><div className="billboard-fade" />
  </div><div className="billboard-content">
    <span className="billboard-kicker"><span className="kicker-dot" />VIVERSE ORIGINAL · ZONE {title.zone}</span>
    <h1 className="billboard-title">{title.title}</h1><Meta title={title} />
    <p className="billboard-logline">{title.logline}</p><div className="billboard-actions">
      <Link href={`/watch/${title.id}`} className="btn btn-play">Enter Zone</Link>
      <button type="button" className="btn btn-info" onClick={onInfo}>Intel</button>
    </div>
  </div></section>;
}
