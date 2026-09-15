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
    <Link href="/perfil" aria-label="Mi perfil" className="floating-profile-btn">
      {image ? (
        <img src={image} alt={name ?? "Perfil"} />
      ) : (
        <span className="floating-profile-btn-initials">{initials}</span>
      )}
    </Link>
  );
}