"use client";

import { useRef } from "react";
import type { Property } from "../types/property";
import { CarouselArrowButton } from "./CarouselArrowButton";
import { PropertyCard } from "./PropertyCard";

export function PropertyCarousel({
  items,
  ariaLabel,
}: {
  items: Property[];
  ariaLabel: string;
}) {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  function scrollCarousel(direction: "left" | "right") {
    const el = carouselRef.current;
    if (!el) return;
    const delta = Math.max(280, Math.floor(el.clientWidth * 0.85));
    el.scrollBy({
      left: direction === "left" ? -delta : delta,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative mt-5">
      <div
        ref={carouselRef}
        aria-label={ariaLabel}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((p) => (
          <div key={p.id} className="w-[320px] shrink-0 snap-start">
            <PropertyCard property={p} />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 hidden items-center md:flex">
        <CarouselArrowButton
          direction="left"
          ariaLabel="Scroll left"
          onClick={() => scrollCarousel("left")}
          className="ml-2"
        />
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden items-center md:flex">
        <CarouselArrowButton
          direction="right"
          ariaLabel="Scroll right"
          onClick={() => scrollCarousel("right")}
          className="mr-2"
        />
      </div>
    </div>
  );
}
