'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './banner.module.css';

const images = ['/logo.svg', '/logo.svg', '/logo.svg'];

export default function Banner() {
  const [current, setCurrent] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const total = images.length;

  const moveTo = (index: number) => {
    if (!wrapperRef.current) return;

    const width = wrapperRef.current.clientWidth;
    wrapperRef.current.scrollTo({
      left: width * index,
      behavior: 'smooth',
    });

    setCurrent(index);
  };

  /* 자동 슬라이드 */
  useEffect(() => {
    const interval = setInterval(() => {
      moveTo((current + 1) % total);
    }, 3000);

    return () => clearInterval(interval);
  }, [current]);

  /* 특정 슬라이드로 이동 */

  /* 수동 스크롤 시 현재 인덱스 계산 */
  const handleScroll = () => {
    if (!wrapperRef.current) return;

    const width = wrapperRef.current.clientWidth;
    const index = Math.round(wrapperRef.current.scrollLeft / width);
    setCurrent(index);
  };

  return (
    <div className={styles.boxBanner}>
      <div
        className={styles.carouselWrapper}
        ref={wrapperRef}
        onScroll={handleScroll}
      >
        {images.map((src, idx) => (
          <div key={idx} className={styles.slide}>
            <Image
              src={src}
              alt={`Banner ${idx + 1}`}
              fill
              priority={idx === 0}
              className={styles.bannerImage}
            />
          </div>
        ))}
      </div>

      {/* 오른쪽 아래 컨트롤 */}
      <div className={styles.controls}>
        <span className={styles.page}>
          {current + 1} / {total}
        </span>

        <div className={styles.buttons}>
          <button onClick={() => moveTo((current - 1 + total) % total)}>
            ‹
          </button>
          <button onClick={() => moveTo((current + 1) % total)}>›</button>
        </div>
      </div>
    </div>
  );
}
