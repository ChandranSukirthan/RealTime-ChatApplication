import { Loader2 } from "lucide-react";
import { AppLogo } from "./AppLogo";

export default function PageLoader() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="relative flex flex-col items-center gap-4">
        <AppLogo size={64} className="rounded-2xl shadow-md" />
        <Loader2 className="size-8 animate-spin text-accent" />
      </div>
    </div>
  );
}