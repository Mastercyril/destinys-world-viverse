"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BRAND, POWERED_BY } from "@/lib/brand";

export function Nav() {
  const [solid, setSolid] = useState(false);
  useEffect(() => { const onScroll = () => setSolid(window.scrollY > 24); onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, []);
  return <header className={`nav${solid ? " solid" : ""}`}><div className="nav-left"><Link href="/" className="wordmark">{BRAND}</Link><nav className="nav-links"><a className="active" href="#">World</a><a href="#zones">Zones</a><a href="#live">Live Intel</a></nav></div><span className="powered">{POWERED_BY}</span></header>;
}
