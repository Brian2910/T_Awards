import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import SignOutButton from "./SignOutButton";
import PhotoCarousel from "./components/PhotoCarousel";

const GALLERY_PHOTOS = [
  { src: "/gallery/foto1.png", alt: "Foto 1" },
  { src: "/gallery/foto2.jpg", alt: "Foto 2" },
  { src: "/gallery/foto3.jpg", alt: "Foto 3" },
  { src: "/gallery/foto4.jpg", alt: "Foto 4" },

];

export default async function Home() {
  const session = await getServerSession(authOptions);
  const admin = isAdmin(session?.user?.email);

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
                <a href="/perfil" className="home-cta">Mi perfil</a>
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
        <h2 className="home-gallery-title">Galería</h2>
        <PhotoCarousel photos={GALLERY_PHOTOS} />
      </section>
    </main>
  );
}