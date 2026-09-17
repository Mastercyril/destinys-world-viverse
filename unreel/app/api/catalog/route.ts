import { NextResponse } from "next/server";
import { ROWS, TITLES } from "@/lib/catalog";

export async function GET() {
  return NextResponse.json({ brand: "Destiny's World", source: "VIVERSE", titles: TITLES, rows: ROWS });
}
