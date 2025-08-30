"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";

// Import all necessary Swiper styles
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { EffectCards, Autoplay, Pagination, Navigation } from "swiper/modules";
import { SparklesIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CardData {
  id: string;
  src: string;
  alt: string;
  title: string;
  description: string;
}

interface CarouselProps {
  cards: CardData[];
  autoplayDelay?: number;
  slideShadows?: boolean;
}

export const CardSwipe: React.FC<CarouselProps> = ({
  cards,
  autoplayDelay = 2500,
  slideShadows = true,
}) => {
  const css = `
    .swiper-pagination-bullet {
      background-color: white !important;
      opacity: 0.5;
    }
    .swiper-pagination-bullet-active {
      background-color: white !important;
      opacity: 1;
    }
    .swiper-button-next, .swiper-button-prev {
      color: white !important;
      transform: scale(0.6);
    }
  `;

  return (
    <section className="py-12 md:py-20">
      <style>{css}</style>
      <div className="mx-auto w-full max-w-lg rounded-[24px] border border-black/5 p-2 shadow-sm md:rounded-t-[44px]">
        <div className="relative mx-auto flex w-full flex-col rounded-[24px] border border-black/5 bg-neutral-800/5 p-2 shadow-sm md:rounded-b-[20px] md:rounded-t-[40px] md:p-4">
          <Badge
            variant="outline"
            className="absolute left-4 top-6 rounded-[14px] border border-black/10 text-base md:left-6"
          >
            <SparklesIcon className="mr-2 h-4 w-4 fill-[#EEBDE0] stroke-1 text-neutral-800" />
            Latest Features
          </Badge>
          <div className="w-full pt-16 text-center">
            <h3 className="text-4xl font-bold tracking-tight text-foreground opacity-85">
              Services
            </h3>
            <p className="text-muted-foreground">
              Delivering next-level digital solutions.
            </p>
          </div>

          <div className="flex w-full items-center justify-center gap-4 pt-8 pb-4">
            <Swiper
              autoplay={{
                delay: autoplayDelay,
                disableOnInteraction: false,
              }}
              effect={"cards"}
              grabCursor={true}
              loop={true}
              rewind={true}
              navigation={true}
              pagination={{ clickable: true }}
              cardsEffect={{
                slideShadows: slideShadows,
              }}
              modules={[EffectCards, Autoplay, Pagination, Navigation]}
              className="w-[300px] h-[480px] sm:w-[350px] sm:h-[560px]"
            >
              {cards.map((card, index) => (
                <SwiperSlide
                  key={card.id}
                  className="!rounded-3xl bg-card shadow-lg"
                >
                  {/* --- THIS IS THE FIX --- */}
                  {/* Use a ternary operator for clean conditional rendering */}
                  {index === 0 ? (
                    <Link
                      href={`/services/${card.id}`} // Updated URL path
                      className="block h-full w-full"
                    >
                      <CardContent card={card} />
                    </Link>
                  ) : (
                    <div className="block h-full w-full">
                      <CardContent card={card} />
                    </div>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
};

// Extracted the repetitive card content into its own component for clarity
const CardContent = ({ card }: { card: CardData }) => (
  <div className="flex h-full flex-col">
    <div className="relative h-[60%] w-full">
      <Image
        src={card.src}
        fill
        className="rounded-t-3xl object-cover"
        alt={card.alt}
      />
    </div>
    <div className="flex h-[40%] flex-col justify-start p-6 text-left">
      <h4 className="text-xl font-bold text-card-foreground">
        {card.title}
      </h4>
      <p className="relative mt-2 text-sm text-muted-foreground line-clamp-2">
        {card.description}
        <span className="absolute bottom-0 right-0 h-full w-1/4 bg-gradient-to-l from-card to-transparent"></span>
      </p>
    </div>
  </div>
);