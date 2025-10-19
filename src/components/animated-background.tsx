import { cn } from "@/lib/utils";

export function AnimatedBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background"
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-1/2 size-[150vmax] -translate-x-1/2 -translate-y-1/2 animate-blob-spin">
        <div
          className={cn(
            "absolute h-full w-full rounded-full",
            "bg-[radial-gradient(circle_at_center,_#ff69b444_0%,_transparent_40%),radial-gradient(circle_at_center,_#ffd70044_0%,_transparent_40%)]",
            "opacity-70"
          )}
          style={{
            backgroundSize: "800px 800px, 1200px 1200px",
            backgroundPosition: "0 0, 100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>
    </div>
  );
}
