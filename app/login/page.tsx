import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth-server";
import { signInWithGoogle } from "@/lib/auth-actions";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight">Sign in</h1>
          <p className="text-muted-foreground text-sm">
            Continue with your Google account.
          </p>
        </div>
        <form action={signInWithGoogle}>
          <Button type="submit" className="w-full" size="lg">
            Continue with Google
          </Button>
        </form>
        <Button
          nativeButton={false}
          variant="ghost"
          className="w-full"
          render={<Link href="/" />}
        >
          Back to home
        </Button>
      </div>
    </div>
  );
}
