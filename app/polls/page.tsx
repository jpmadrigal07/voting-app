"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Poll = {
  id: number;
  title: string;
  createdAt: string;
};

async function readError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    return data.error ?? res.statusText;
  } catch {
    return res.statusText;
  }
}

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadPolls = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/polls");
    if (!res.ok) {
      setError(await readError(res));
      setPolls([]);
      return;
    }
    const data = (await res.json()) as { polls: Poll[] };
    setPolls(data.polls);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadPolls();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadPolls]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        setError(await readError(res));
        return;
      }
      setNewTitle("");
      await loadPolls();
    } finally {
      setSaving(false);
    }
  }

  function startEdit(poll: Poll) {
    setEditingId(poll.id);
    setEditTitle(poll.title);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
  }

  async function saveEdit(id: number) {
    const title = editTitle.trim();
    if (!title || busyId !== null) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/polls/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        setError(await readError(res));
        return;
      }
      cancelEdit();
      await loadPolls();
    } finally {
      setBusyId(null);
    }
  }

  async function removePoll(id: number) {
    if (
      !confirm(
        "Delete this poll? All votes for it will be removed as well.",
      )
    ) {
      return;
    }
    if (busyId !== null) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/polls/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError(await readError(res));
        return;
      }
      if (editingId === id) cancelEdit();
      await loadPolls();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">
            <Link href="/" className="hover:text-foreground underline-offset-4 hover:underline">
              Home
            </Link>
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Polls</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create, rename, or remove polls.
          </p>
        </div>
        <Button variant="outline" size="sm" type="button" onClick={() => void loadPolls()}>
          Refresh
        </Button>
      </header>

      {error ? (
        <div
          className="border-destructive/30 bg-destructive/5 text-destructive mb-6 rounded-lg border px-3 py-2 text-sm"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <section className="border-border bg-card text-card-foreground mb-10 rounded-xl border p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-medium">New poll</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1">
            <span className="text-muted-foreground sr-only">Title</span>
            <input
              className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              placeholder="Poll title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              disabled={saving}
              maxLength={500}
            />
          </label>
          <Button type="submit" disabled={saving || !newTitle.trim()}>
            {saving ? "Creating…" : "Create"}
          </Button>
        </form>
      </section>

      <section>
        <h2 className="text-muted-foreground mb-3 text-sm font-medium uppercase tracking-wide">
          All polls
        </h2>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : polls.length === 0 ? (
          <p className="text-muted-foreground text-sm">No polls yet. Add one above.</p>
        ) : (
          <ul className="divide-border border-border divide-y rounded-xl border">
            {polls.map((poll) => {
              const isEditing = editingId === poll.id;
              const busy = busyId === poll.id;
              return (
                <li
                  key={poll.id}
                  className="bg-card flex flex-col gap-3 px-4 py-4 first:rounded-t-[calc(var(--radius-xl)-1px)] last:rounded-b-[calc(var(--radius-xl)-1px)] sm:flex-row sm:items-center sm:justify-between"
                >
                  {isEditing ? (
                    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        className="border-input bg-background focus-visible:ring-ring h-9 w-full min-w-0 flex-1 rounded-lg border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:max-w-md"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        disabled={busy}
                        maxLength={500}
                        autoFocus
                      />
                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="sm"
                          type="button"
                          disabled={busy || !editTitle.trim()}
                          onClick={() => void saveEdit(poll.id)}
                        >
                          {busy ? "Saving…" : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          disabled={busy}
                          onClick={cancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{poll.title}</p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          #{poll.id} ·{" "}
                          {new Date(poll.createdAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          type="button"
                          disabled={busyId !== null}
                          onClick={() => startEdit(poll)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          type="button"
                          disabled={busyId !== null}
                          onClick={() => void removePoll(poll.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
