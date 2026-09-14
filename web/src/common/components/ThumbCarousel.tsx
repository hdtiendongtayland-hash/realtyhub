'use client';

import { useEffect, useState } from 'react';
import PlaceholderThumb from './PlaceholderThumb';

/** Bao lau doi mot anh khi khong ai dong den */
const AUTOPLAY_MS = 3000;

type ThumbCarouselProps = {
  /** Hat giong cho anh thay the khi chua co anh that */
  seed: string;
  images: string[];
  alt: string;
  /** Tam dung tu chuyen - the dang duoc ro chuot chang han */
  paused?: boolean;
  className?: string;
};

const ThumbCarousel = ({
  seed,
  images,
  alt,
  paused = false,
  className = '',
}: ThumbCarouselProps) => {
  const [index, setIndex] = useState(0);

  // Danh sach rong van phai ve mot khung, de PlaceholderThumb lo phan anh thay the
  const slides = images.length > 0 ? images : [''];
  const canPlay = slides.length > 1 && !paused;
  const count = slides.length;

  useEffect(() => {
    if (!canPlay) return;

    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % count),
      AUTOPLAY_MS,
    );
    return () => window.clearInterval(timer);
  }, [canPlay, count]);

  // Bo loc doi thi so anh doi theo - dung de con tro chi ra ngoai danh sach
  if (index >= slides.length) setIndex(0);

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {slides.map((src, slideIndex) => (
        <div
          key={`${src}-${slideIndex}`}
          aria-hidden={slideIndex !== index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            slideIndex === index ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <PlaceholderThumb
            seed={`${seed}-${slideIndex}`}
            src={src || undefined}
            alt={slideIndex === index ? alt : ''}
          />
        </div>
      ))}

    </div>
  );
};

export default ThumbCarousel;
