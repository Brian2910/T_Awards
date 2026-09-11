"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  name?: string | null;
  image?: string | null;
};

export default function FloatingProfileButton({ name, image }: Props) {
  const pathname = usePathname();

  if (pathname === "/perfil") return null;

  const initials = (name ?? "?")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Link
      href="/perfil"
      aria-label="Mi perfil"
      style={{
        position: "fixed",
        top: 20,
        left: 20,
        zIndex: 1000,
        width: 200,
        height: 200,
        borderRadius: "50%",
        overflow: "hidden",
        border: "6px solid #f9a8d4",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ec4899",
        textDecoration: "none",
      }}
    >
      {image ? (
        <img
          src={image}
          alt={name ?? "Perfil"}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 56 }}>
          {initials}
        </span>
      )}
    </Link>
  );
}