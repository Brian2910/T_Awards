import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import SignOutButton from "./SignOutButton";
import PhotoCarousel from "./components/PhotoCarousel";
import fs from "fs";
import path from "path";
import VideoGallery from "./components/VideoGallery";

const VIDEOS = [
  { url: "https://drive.google.com/file/d/1nQmLARgFU2HavuqRThkIIO6TvlDh4SOJ/view?usp=sharing", title: "Gemelas Asesinas" },
  { url: "https://drive.google.com/file/d/1pBe1E6ikFaK7vZbA_XzLfWwu0rkJm4cz/view?usp=sharing", title: "Dueto: Paloma y Lourdes" },
  { url: "https://drive.google.com/file/d/1n4k-Oqk37-w5PTJ7Ow71cBf-OYiSoju-/view?usp=sharing", title: "Trolas Awards: 2023" },

];

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

function getGalleryPhotos() {
  const dir = path.join(process.cwd(), "public", "gallery");

  let files: string[] = [];
  try {
    files = fs.readdirSync(dir);
  } catch {
    return [];
  }

  return files
  .filter((file) => IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase()))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
  .map((file) => ({ src: `/gallery/${file}`, alt: file }));
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  const admin = isAdmin(session?.user?.email);
  const galleryPhotos = getGalleryPhotos();


  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-content">
          <img src="/trolas-awards-logo.png" alt="Trolas Awards" className="brand-logo" />

          <p className="home-tagline">
            Elegí a tus favoritos en cada categoría. Necesitás una cuenta para votar,
            y cada voto queda guardado a tu nombre.
          </p>

          {session?.user && <p className="home-greeting">Hola, {session.user.name}</p>}

          <a href="/votar" className="home-cta">
            Ir a votar
          </a>

          <div className="home-secondary">
            {session?.user ? (
              <>
                {admin && <a href="/admin" className="home-cta">Panel admin</a>}
                <SignOutButton />
              </>
            ) : (
              <>
                <a href="/login" className="home-cta">Iniciar sesión</a>
                <a href="/registro" className="home-cta">Registrarme</a>
              </>
            )}
          </div>

          <a href="#galeria" className="home-scroll-cue" aria-label="Ver galería de fotos">
            ⌄
          </a>
        </div>
      </section>

      <section id="galeria" className="home-gallery">
        <h2 className="home-gallery-title">Galería de la Banda Peronista</h2>
        <PhotoCarousel photos={galleryPhotos} />
      </section>

      <section className="home-gallery">
          <h2 className="home-gallery-title">Videos de la Banda Peronista</h2>
          <VideoGallery videos={VIDEOS} />
        </section>
    </main>
  );
}