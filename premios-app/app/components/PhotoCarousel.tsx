"use client";

import { useState, type CSSProperties } from "react";

interface Photo {
  src: string;
  alt: string;
}

interface Props {
  photos: Photo[];
}

const arrowStyle: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  border: "none",
  backgroundColor: "#ec4899",
  color: "#fff",
  fontSize: 28,
  lineHeight: 1,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

export default function PhotoCarousel({ photos }: Props) {
  const [index, setIndex] = useState(0);

  if (photos.length === 0) return null;

  function goPrev() {
    setIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  }

  function goNext() {
    setIndex((i) => (i === photos.length - 1 ? 0 : i + 1));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <button type="button" onClick={goPrev} aria-label="Foto anterior" style={arrowStyle}>
          ‹
        </button>

        <div
          style={{
            width: 480,
            maxWidth: "60vw",
            aspectRatio: "4 / 3",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            border: "3px solid #f9a8d4",
          }}
        >
          <img
            src={photos[index].src}
            alt={photos[index].alt}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <button type="button" onClick={goNext} aria-label="Foto siguiente" style={arrowStyle}>
          ›
        </button>
      </div>

      <p style={{ color: "var(--text-muted, #d8a9bb)", fontSize: "0.85rem", margin: 0 }}>
        {index + 1} / {photos.length}
      </p>
    </div>
  );
}