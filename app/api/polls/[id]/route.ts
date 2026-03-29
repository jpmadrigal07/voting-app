import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { polls } from "@/db/schema";
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
    return NextResponse.json({ poll });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message.includes("DATABASE_URL") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const db = getDb();
    const { id: idParam } = await context.params;
    const pollId = parsePollId(idParam);
    if (pollId === null) {
      return NextResponse.json({ error: "Invalid poll id." }, { status: 400 });
    }

    const body = (await request.json()) as { title?: string };
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json(
        { error: "Missing or invalid `title` (non-empty string required)." },
        { status: 400 },
      );
    }

    const [poll] = await db
      .update(polls)
      .set({ title })
      .where(eq(polls.id, pollId))
      .returning();
    if (!poll) {
      return NextResponse.json({ error: "Poll not found." }, { status: 404 });
    }
    return NextResponse.json({ poll });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message.includes("DATABASE_URL") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const db = getDb();
    const { id: idParam } = await context.params;
    const pollId = parsePollId(idParam);
    if (pollId === null) {
      return NextResponse.json({ error: "Invalid poll id." }, { status: 400 });
    }

    const [removed] = await db
      .delete(polls)
      .where(eq(polls.id, pollId))
      .returning();
    if (!removed) {
      return NextResponse.json({ error: "Poll not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, poll: removed });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message.includes("DATABASE_URL") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
