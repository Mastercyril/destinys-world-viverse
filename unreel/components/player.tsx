"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadManifest, type Title } from "@/lib/catalog";

export function Player({ title }: { title: Title }) {
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void loadManifest().then((manifest) => {
      if (!active) return;
      setSource(manifest.titles[title.id]?.preview ?? null);
    });
    return () => { active = false; };
  }, [title.id]);

  const data = useMemo(() => ({ title: title.title, year: title.year, genres: title.genres.join(" · ") }), [title]);

  return (
    <div className="theater">
      {source ? (
        <video className="reel" src={source} autoPlay controls muted playsInline />
      ) : (
        <div className="buffering"><div className="ring" /><span>Loading</span></div>
      )}
      <div className="chrome top">
        <Link href="/" className="back" aria-label="Back to browse">←</Link>
        <div className="now">
          <span className="now-title">{data.title}</span>
        </div>
        <div className="render-badge"><span className="live-dot" aria-hidden="true" />LIVE</div>
      </div>
      <div className="caption">{title.tagline}</div>
      <div className="chrome bottom">
        <div className="progress"><div className="progress-fill" style={{ width: "36%" }} /></div>
        <div className="bottom-row">
          <div className="shots"><span>{title.mode === "chaos" ? "Live channel" : "Original film"}</span></div>
          <div className="controls"><span>{data.genres}</span></div>
        </div>
      </div>
    </div>
  );
}
