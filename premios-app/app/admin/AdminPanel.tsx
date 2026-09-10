"use client";

import { useState } from "react";

interface Game {
  id: string;
  name: string;
  description: string | null;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  points: number;
}

interface Transaction {
  id: string;
  points: number;
  reason: string;
  createdAt: string;
  user: { name: string };
  game: { name: string } | null;
}

type CategoryType = "TEXT" | "TEXT3" | "PHOTO" | "AUDIO";

interface Category {
  id: string;
  name: string;
  description: string | null;
  type: CategoryType;
}

interface Props {
  initialGames: Game[];
  initialUsers: UserRow[];
  initialTransactions: Transaction[];
  initialCategories: Category[];
}

const CATEGORY_TYPE_OPTIONS: { value: CategoryType; label: string }[] = [
  { value: "TEXT", label: "Texto (1 campo)" },
  { value: "TEXT3", label: "Texto (3 campos)" },
  { value: "PHOTO", label: "Imagen" },
  { value: "AUDIO", label: "Audio" },
];

export default function AdminPanel({
  initialGames,
  initialUsers,
  initialTransactions,
  initialCategories,
}: Props) {
  const [games, setGames] = useState(initialGames);
  const [users, setUsers] = useState(initialUsers);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [categories, setCategories] = useState(initialCategories);

  const [gameName, setGameName] = useState("");
  const [gameDesc, setGameDesc] = useState("");
  const [creatingGame, setCreatingGame] = useState(false);

  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");
  const [categoryType, setCategoryType] = useState<CategoryType>("TEXT");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [selectedUser, setSelectedUser] = useState(initialUsers[0]?.id ?? "");
  const [selectedGame, setSelectedGame] = useState("");
  const [points, setPoints] = useState(10);
  const [reason, setReason] = useState("");
  const [awarding, setAwarding] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleCreateGame(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setCreatingGame(true);

    const res = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: gameName, description: gameDesc || undefined }),
    });

    setCreatingGame(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo crear el juego.");
      return;
    }

    const created = await res.json();
    setGames([created, ...games]);
    setGameName("");
    setGameDesc("");
    setMessage("Juego creado.");
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setCreatingCategory(true);

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: categoryName,
        description: categoryDesc || undefined,
        type: categoryType,
      }),
    });

    setCreatingCategory(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo crear la categoría.");
      return;
    }

    const created = await res.json();
    setCategories([created, ...categories]);
    setCategoryName("");
    setCategoryDesc("");
    setCategoryType("TEXT");
    setMessage("Categoría creada.");
  }

  async function handleAwardPoints(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!selectedUser || !reason.trim()) {
      setError("Elegí un usuario y escribí un motivo.");
      return;
    }

    setAwarding(true);

    const res = await fetch("/api/points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: selectedUser,
        gameId: selectedGame || undefined,
        points,
        reason: reason.trim(),
      }),
    });

    setAwarding(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudieron otorgar los puntos.");
      return;
    }

    setUsers(
      users.map((u) => (u.id === selectedUser ? { ...u, points: u.points + points } : u))
    );

    const user = users.find((u) => u.id === selectedUser);
    const game = games.find((g) => g.id === selectedGame);
    setTransactions([
      {
        id: crypto.randomUUID(),
        points,
        reason: reason.trim(),
        createdAt: new Date().toISOString(),
        user: { name: user?.name ?? "" },
        game: game ? { name: game.name } : null,
      },
      ...transactions,
    ]);

    setReason("");
    setMessage("Puntos otorgados.");
  }

  const categoryTypeLabel = (type: CategoryType) =>
    CATEGORY_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;

  return (
    <div className="admin-layout">
      <section className="admin-card">
        <h2>Nueva categoría</h2>
        <form onSubmit={handleCreateCategory} className="admin-form">
          <label>
            Nombre
            <input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />
          </label>
          <label>
            Descripción (opcional)
            <input value={categoryDesc} onChange={(e) => setCategoryDesc(e.target.value)} />
          </label>
          <label>
            Tipo
            <select
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value as CategoryType)}
            >
              {CATEGORY_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={creatingCategory}>
            {creatingCategory ? "Creando..." : "Crear categoría"}
          </button>
        </form>

        <ul className="admin-list">
          {categories.map((c) => (
            <li key={c.id}>
              {c.name} <span className="admin-tag">({categoryTypeLabel(c.type)})</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-card">
        <h2>Nuevo juego</h2>
        <form onSubmit={handleCreateGame} className="admin-form">
          <label>
            Nombre
            <input value={gameName} onChange={(e) => setGameName(e.target.value)} required />
          </label>
          <label>
            Descripción (opcional)
            <input value={gameDesc} onChange={(e) => setGameDesc(e.target.value)} />
          </label>
          <button type="submit" disabled={creatingGame}>
            {creatingGame ? "Creando..." : "Crear juego"}
          </button>
        </form>

        <ul className="admin-list">
          {games.map((g) => (
            <li key={g.id}>{g.name}</li>
          ))}
        </ul>
      </section>

      <section className="admin-card">
        <h2>Otorgar puntos</h2>
        <form onSubmit={handleAwardPoints} className="admin-form">
          <label>
            Usuario
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.points} pts)
                </option>
              ))}
            </select>
          </label>

          <label>
            Juego (opcional)
            <select value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)}>
              <option value="">Sin juego</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Puntos
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
            />
          </label>

          <label>
            Motivo
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ganó trivia, 1er puesto..."
              required
            />
          </label>

          <button type="submit" disabled={awarding || users.length === 0}>
            {awarding ? "Otorgando..." : "Otorgar puntos"}
          </button>
        </form>
      </section>

      {(error || message) && (
        <p className={error ? "vote-card-error" : "profile-message"}>{error ?? message}</p>
      )}

      <section className="admin-card admin-card-wide">
        <h2>Últimos movimientos</h2>
        <ul className="admin-list">
          {transactions.map((t) => (
            <li key={t.id}>
              <strong>{t.user.name}</strong> {t.points >= 0 ? "+" : ""}
              {t.points} — {t.reason}
              {t.game ? ` (${t.game.name})` : ""}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}