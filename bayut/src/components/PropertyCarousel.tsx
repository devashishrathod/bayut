"use client";

import { useEffect, useRef, useState } from "react";
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    function compute() {
      const node = carouselRef.current;
      if (!node) return;
      const nextCanScrollLeft = node.scrollLeft > 0;
      const nextCanScrollRight =
        node.scrollLeft + node.clientWidth < node.scrollWidth - 1;
      setCanScrollLeft(nextCanScrollLeft);
      setCanScrollRight(nextCanScrollRight);
    }

    compute();
    el.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      el.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [items.length]);

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

      {canScrollLeft ? (
        <div className="pointer-events-none absolute left-0 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center md:flex">
          <CarouselArrowButton
            direction="left"
            ariaLabel="Scroll left"
            onClick={() => scrollCarousel("left")}
            className=""
          />
        </div>
      ) : null}
      {canScrollRight ? (
        <div className="pointer-events-none absolute right-0 top-1/2 hidden translate-x-1/2 -translate-y-1/2 items-center md:flex">
          <CarouselArrowButton
            direction="right"
            ariaLabel="Scroll right"
            onClick={() => scrollCarousel("right")}
            className=""
          />
        </div>
      ) : null}
    </div>
  );
}
