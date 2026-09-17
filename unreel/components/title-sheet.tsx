"use client";

import Link from "next/link";
import { mediaUrl, type ManifestEntry, type Title } from "@/lib/catalog";
import { Meta } from "./meta";

export function TitleSheet({ title, asset, onClose }: { title: Title; asset: ManifestEntry | null; onClose: () => void; }) {
  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title.title} onClick={(event) => event.stopPropagation()}>
        <div className="sheet-media">
          {asset ? <video src={mediaUrl(asset.preview)} poster={asset.cover} autoPlay muted loop playsInline /> : <div className="billboard-fallback" />}
          <div className="sheet-fade" />
          <button type="button" className="sheet-close" aria-label="Close" onClick={onClose}>×</button>
          <div className="sheet-head">
            <h2>{title.title}</h2>
            <div className="sheet-actions">
              <Link href={`/watch/${title.id}`} className="btn btn-play">Play</Link>
            </div>
          </div>
        </div>
        <div className="sheet-body">
          <div className="sheet-main">
            <Meta title={title} />
            <p className="sheet-tagline">{title.tagline}</p>
            <p className="sheet-logline">{title.logline}</p>
          </div>
          <aside className="sheet-side">
            <p><span className="side-label">Format</span>{title.mode === "chaos" ? "Live channel. Hard cuts, escalating, endless." : "Original film. One continuous take, written while you watch."}</p>
            <p><span className="side-label">Rendered by</span>MiniMax H3 Max Turbo on fal</p>
            <p><span className="side-label">Key art</span>AI image generation</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
