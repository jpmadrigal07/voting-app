import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { polls } from "@/db/schema";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(polls)
      .orderBy(desc(polls.createdAt));
    return NextResponse.json({ polls: rows });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message.includes("DATABASE_URL") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { title?: string };
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json(
        { error: "Missing or invalid `title` (non-empty string required)." },
        { status: 400 },
      );
    }

    const db = getDb();
    const [row] = await db.insert(polls).values({ title }).returning();
    return NextResponse.json({ poll: row }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message.includes("DATABASE_URL") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
