"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BannerResponse } from "@/types/Banner";
import { getImageUrl } from "@/services/uploadService";

type BannerCarouselProps = {
  banners: BannerResponse[];
};

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!banners?.length) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  const active = banners[current];
  const href = active.link ?? undefined;

  if (!href) return null;

  const stop = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Link href={href} className="block">
      <div className="relative w-full overflow-hidden rounded-xl">
        <div className="relative w-full pt-[33.33%]">
          <Image
            src={getImageUrl(active.imageUrl)}
            alt="banner"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1200px"
          />
          {/* <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent">
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="text-white max-w-xl">
              <h2 className="text-3xl md:text-5xl mb-3">Phụ kiện giảm 50%</h2>
              <p className="text-lg md:text-2xl mb-5 text-white/90">Mua ngay hôm nay</p>
              <span className="inline-flex items-center gap-2 bg-white text-black font-medium px-4 py-2 rounded-lg">Mua ngay</span>
            </div>
          </div>
        </div> */}
        </div>

        <button
          onClick={(e) => {
            stop(e);
            setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
          }}
          onMouseDown={stop}
          onPointerDown={stop}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/40 text-white grid place-items-center"
          aria-label="Previous banner"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            stop(e);
            setCurrent((prev) => (prev + 1) % banners.length);
          }}
          onMouseDown={stop}
          onPointerDown={stop}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/40 text-white grid place-items-center"
          aria-label="Next banner"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                stop(e);
                setCurrent(idx);
              }}
              onMouseDown={stop}
              onPointerDown={stop}
              className={`h-2 rounded-full transition-all ${
                idx === current ? "bg-white w-8" : "bg-white/60 w-2"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
