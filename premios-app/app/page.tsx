import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import SignOutButton from "./SignOutButton";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const admin = isAdmin(session?.user?.email);

  return (
    <main className="home-page">
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
          <a href="/login" className="home-cta">
               Iniciar sesión
          </a>              
          <a href="/registro" className="home-cta">
               Registrarme
          </a>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
