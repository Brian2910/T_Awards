import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignOutButton from "./SignOutButton";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="home-page">
      <div className="home-content">
        <img src="/trolas-awards-logo.gif" alt="Trolas Awards" className="brand-logo" />

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
              <a href="/perfil">Mi perfil</a>
              <SignOutButton />
            </>
          ) : (
            <>
              <a href="/login">Iniciar sesión</a>
              <a href="/registro">Registrarme</a>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
