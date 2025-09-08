"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/services/firebase"; // adjust
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

interface Card {
  id: string;
  title: string;
  src: string;
}

export default function ImmersiveService() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [slides, setSlides] = useState<Card[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      let cards: Card[] = [];
      if (window.innerWidth < 768) {
        const docRef = doc(db, "Content", "services");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          cards = (data.cards ?? [])
            .slice(0, 3)
            .map((c: Card) => ({
              id: String(c.id),
              title: c.title,
              src: c.src,
            }));
        }
      } else {
        const colRef = collection(db, "serviceDetailsserviceDetails");
        const docsSnap = await getDocs(colRef);
        cards = docsSnap.docs
          .slice(0, 3)
          .map((d) => ({
            id: d.id,
            title: d.data().title,
            src: d.data().src,
          }));
      }
      setSlides(cards);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const handleScroll = () => {
      const containerTop = container.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      const containerHeight = container.offsetHeight;

      // Calculate scroll range for horizontal sliding
      const totalHorizontalScroll = track.scrollWidth - container.clientWidth;

      // When the container reaches top of viewport
      if (containerTop <= 0 && containerTop + containerHeight > windowHeight) {
        const scrollY = -containerTop; // how much user has scrolled inside container
        const translateX = Math.min(scrollY, totalHorizontalScroll);
        track.style.transform = `translateX(-${translateX}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [slides]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{
        height: "100vh",
        position: "relative",
      }}
    >
      <div
        ref={trackRef}
        className="flex h-full transition-transform duration-0"
        style={{ willChange: "transform" }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="relative flex-shrink-0 w-screen h-full cursor-pointer"
            onClick={() => router.push(`/services/${slide.id}`)}
          >
            <img
              src={slide.src}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-8 left-8 text-white text-xl font-bold">
              {slide.title}
            </div>
          </div>
        ))}
        <div
          className="relative flex-shrink-0 w-screen h-full flex items-center justify-center bg-gray-800 text-white text-2xl font-bold cursor-pointer"
          onClick={() => router.push("/services")}
        >
          View More Here
        </div>
      </div>
    </div>
  );
}
