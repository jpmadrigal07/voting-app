import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Button nativeButton={false} render={<Link href="/polls" />}>
        Manage polls
      </Button>
    </div>
  );
}
