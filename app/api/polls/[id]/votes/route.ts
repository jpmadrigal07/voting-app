import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { polls, votes } from "@/db/schema";
import { getDb } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

function parsePollId(raw: string): number | null {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const db = getDb();
    const { id: idParam } = await context.params;
    const pollId = parsePollId(idParam);
    if (pollId === null) {
      return NextResponse.json({ error: "Invalid poll id." }, { status: 400 });
    }

    const [poll] = await db
      .select()
      .from(polls)
      .where(eq(polls.id, pollId))
      .limit(1);
    if (!poll) {
      return NextResponse.json({ error: "Poll not found." }, { status: 404 });
    }

    const rows = await db
      .select()
      .from(votes)
      .where(eq(votes.pollId, pollId))
      .orderBy(desc(votes.createdAt));

    return NextResponse.json({ poll, votes: rows });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message.includes("DATABASE_URL") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const db = getDb();
    const { id: idParam } = await context.params;
    const pollId = parsePollId(idParam);
    if (pollId === null) {
      return NextResponse.json({ error: "Invalid poll id." }, { status: 400 });
    }

    const body = (await request.json()) as { choice?: string };
    const choice = typeof body.choice === "string" ? body.choice.trim() : "";
    if (!choice) {
      return NextResponse.json(
        { error: "Missing or invalid `choice` (non-empty string required)." },
        { status: 400 },
      );
    }

    const [poll] = await db
      .select({ id: polls.id })
      .from(polls)
      .where(eq(polls.id, pollId))
      .limit(1);
    if (!poll) {
      return NextResponse.json({ error: "Poll not found." }, { status: 404 });
    }

    const [vote] = await db
      .insert(votes)
      .values({ pollId, choice })
      .returning();

    return NextResponse.json({ vote }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message.includes("DATABASE_URL") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
