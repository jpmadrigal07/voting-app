import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getSession } from "@/lib/auth-server";
import { signOut } from "@/lib/auth-actions";

export default async function Home() {
  const session = await getSession();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      {session ? (
        <p className="text-muted-foreground text-center text-sm">
          Signed in as{" "}
          <span className="text-foreground font-medium">
            {session.user.name}
          </span>{" "}
          ({session.user.email})
        </p>
      ) : (
        <p className="text-muted-foreground text-sm">You are not signed in.</p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button nativeButton={false} render={<Link href="/polls" />}>
          Manage polls
        </Button>
        {session ? (
          <form action={signOut}>
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        ) : (
          <Button nativeButton={false} render={<Link href="/login" />}>
            Sign in
          </Button>
        )}
      </div>
    </div>
  );
}
