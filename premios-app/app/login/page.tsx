"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import BackLink from "../BackLink";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email o contraseña incorrectos.");
      return;
    }

    router.push("/votar");
  }

  return (
    <main className="auth-page">
      <div className="auth-wrap">
        <BackLink href="/" label="Inicio" />
        <form className="auth-form" onSubmit={handleSubmit}>
        <img src="/trolas-awards-logo.gif" alt="Trolas Awards" className="brand-logo" />
        <p className="auth-subtitle">Usá el email y la contraseña con los que te registraste.</p>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        <p>
          ¿No tenés cuenta? <a href="/registro">Registrarme</a>
        </p>
      </form>
      </div>
    </main>
  );
}
