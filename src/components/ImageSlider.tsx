"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Props {
  images: string[];
}

export default function ImageSlider({ images }: Props) {
  if (!images || images.length === 0) return null;

  return (
    <Swiper
      modules={[Navigation, Pagination]}
      navigation
      pagination={{ clickable: true }}
      spaceBetween={20}
      slidesPerView={1}
      className="rounded-xl mb-6"
    >
      {images.map((img, index) => (
        <SwiperSlide key={index}>
          {/* Fiksni kontejner za uniformnu visinu */}
          <div className="w-full aspect-[4/3]">
            <img
              src={img}
              alt={`Slide ${index}`}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
