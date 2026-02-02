"use client";

export function CarouselArrowButton({
  direction,
  onClick,
  className,
  ariaLabel,
}: {
  direction: "left" | "right";
  onClick: () => void;
  className?: string;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-4 focus:ring-zinc-200 " +
        (className ?? "")
      }
      aria-label={ariaLabel}
    >
      <span aria-hidden="true" className="text-xl leading-none">
        {direction === "left" ? "‹" : "›"}
      </span>
    </button>
  );
}
