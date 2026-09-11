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
  currentUserId: string;
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
  currentUserId,
}: Props) {
  const [games, setGames] = useState(initialGames);
  const [users, setUsers] = useState(initialUsers);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [categories, setCategories] = useState(initialCategories);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [userError, setUserError] = useState<string | null>(null);
  const [userMessage, setUserMessage] = useState<string | null>(null);

  const [gameName, setGameName] = useState("");
  const [gameDesc, setGameDesc] = useState("");
  const [creatingGame, setCreatingGame] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);
  const [gameMessage, setGameMessage] = useState<string | null>(null);

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");
  const [categoryType, setCategoryType] = useState<CategoryType>("TEXT");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categoryMessage, setCategoryMessage] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatDesc, setEditCatDesc] = useState("");
  const [editCatType, setEditCatType] = useState<CategoryType>("TEXT");
  const [savingCategoryId, setSavingCategoryId] = useState<string | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [categoryActionError, setCategoryActionError] = useState<string | null>(null);
  const [categoryActionMessage, setCategoryActionMessage] = useState<string | null>(null);  const [selectedUser, setSelectedUser] = useState(initialUsers[0]?.id ?? "");
  
const [selectedGame, setSelectedGame] = useState("");
  const [points, setPoints] = useState(10);
  const [reason, setReason] = useState("");
  const [awarding, setAwarding] = useState(false);
  const [pointsError, setPointsError] = useState<string | null>(null);
  const [pointsMessage, setPointsMessage] = useState<string | null>(null);

  async function handleCreateGame(e: React.FormEvent) {
    e.preventDefault();
    setGameError(null);
    setGameMessage(null);
    setCreatingGame(true);

    const res = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: gameName, description: gameDesc || undefined }),
    });

    setCreatingGame(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setGameError(data.error ?? "No se pudo crear el juego.");
      return;
    }

    const created = await res.json();
    setGames([created, ...games]);
    setGameName("");
    setGameDesc("");
    setGameMessage("Juego creado.");
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setCategoryError(null);
    setCategoryMessage(null);
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
      setCategoryError(data.error ?? "No se pudo crear la categoría.");
      return;
    }

    const created = await res.json();
    setCategories([created, ...categories]);
    setCategoryName("");
    setCategoryDesc("");
    setCategoryType("TEXT");
    setCategoryMessage("Categoría creada.");
  }

  async function handleAwardPoints(e: React.FormEvent) {
    e.preventDefault();
    setPointsError(null);
    setPointsMessage(null);

    if (!selectedUser || !reason.trim()) {
      setPointsError("Elegí un usuario y escribí un motivo.");
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
      setPointsError(data.error ?? "No se pudieron otorgar los puntos.");
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
    setPointsMessage("Puntos otorgados.");
  }

  async function handleDeleteUser(userId: string, userName: string) {
    if (
      !window.confirm(
        `¿Eliminar a ${userName}? Se borran también sus votos y su historial de puntos. Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    setUserError(null);
    setUserMessage(null);
    setDeletingId(userId);

    const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });

    setDeletingId(null);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setUserError(data.error ?? "No se pudo eliminar el usuario.");
      return;
    }

    const remaining = users.filter((u) => u.id !== userId);
    setUsers(remaining);
    if (selectedUser === userId) {
      setSelectedUser(remaining[0]?.id ?? "");
    }
    setUserMessage("Usuario eliminado.");
  }

  function handleStartEditCategory(cat: Category) {
  setEditingCategoryId(cat.id);
  setEditCatName(cat.name);
  setEditCatDesc(cat.description ?? "");
  setEditCatType(cat.type);
  setCategoryActionError(null);
  setCategoryActionMessage(null);
}

function handleCancelEditCategory() {
  setEditingCategoryId(null);
}

async function handleSaveCategoryEdit(id: string) {
  setCategoryActionError(null);
  setCategoryActionMessage(null);
  setSavingCategoryId(id);

  const res = await fetch(`/api/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: editCatName,
      description: editCatDesc || undefined,
      type: editCatType,
    }),
  });

  setSavingCategoryId(null);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    setCategoryActionError(data.error ?? "No se pudo actualizar la categoría.");
    return;
  }

  const updated = await res.json();
  setCategories(categories.map((c) => (c.id === id ? updated : c)));
  setEditingCategoryId(null);
  setCategoryActionMessage("Categoría actualizada.");
}

async function handleDeleteCategory(cat: Category, force = false) {
  if (!force && !window.confirm(`¿Eliminar la categoría "${cat.name}"?`)) return;

  setCategoryActionError(null);
  setCategoryActionMessage(null);
  setDeletingCategoryId(cat.id);

  const res = await fetch(`/api/categories/${cat.id}${force ? "?force=true" : ""}`, {
    method: "DELETE",
  });

  setDeletingCategoryId(null);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 409 && data.voteCount) {
      const confirmForce = window.confirm(
        `${data.error} ¿Eliminar la categoría junto con esos votos? Esta acción no se puede deshacer.`
      );
      if (confirmForce) {
        await handleDeleteCategory(cat, true);
      }
      return;
    }
    setCategoryActionError(data.error ?? "No se pudo eliminar la categoría.");
    return;
  }

  setCategories(categories.filter((c) => c.id !== cat.id));
  setCategoryActionMessage("Categoría eliminada.");
}

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

        <ul className="admin-list admin-categories-list">
          {categories.map((cat) => (
            <li key={cat.id} className="admin-category-row">
              {editingCategoryId === cat.id ? (
                <div className="admin-category-edit-form">
                  <input value={editCatName} onChange={(e) => setEditCatName(e.target.value)} />
                  <input
                    value={editCatDesc}
                    onChange={(e) => setEditCatDesc(e.target.value)}
                    placeholder="Descripción (opcional)"
                  />
                  <select
                    value={editCatType}
                    onChange={(e) => setEditCatType(e.target.value as CategoryType)}
                  >
                    {CATEGORY_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="admin-category-edit-actions">
                    <button
                      type="button"
                      onClick={() => handleSaveCategoryEdit(cat.id)}
                      disabled={savingCategoryId === cat.id}
                    >
                      {savingCategoryId === cat.id ? "Guardando..." : "Guardar"}
                    </button>
                    <button type="button" className="admin-delete-btn" onClick={handleCancelEditCategory}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span>
                    <strong>{cat.name}</strong>{" "}
                    <span className="admin-user-email">
                      ({CATEGORY_TYPE_OPTIONS.find((o) => o.value === cat.type)?.label ?? cat.type})
                    </span>
                    {cat.description ? ` — ${cat.description}` : ""}
                  </span>
                  <div className="admin-category-actions">
                    <button type="button" onClick={() => handleStartEditCategory(cat)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className="admin-delete-btn"
                      onClick={() => handleDeleteCategory(cat)}
                      disabled={deletingCategoryId === cat.id}
                    >
                      {deletingCategoryId === cat.id ? "Eliminando..." : "Eliminar"}
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>

        {(categoryActionError || categoryActionMessage) && (
          <p className={categoryActionError ? "vote-card-error" : "profile-message"}>
            {categoryActionError ?? categoryActionMessage}
          </p>
        )}

        {(categoryError || categoryMessage) && (
          <p className={categoryError ? "vote-card-error" : "profile-message"}>
            {categoryError ?? categoryMessage}
          </p>
        )}
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

        {(gameError || gameMessage) && (
          <p className={gameError ? "vote-card-error" : "profile-message"}>
            {gameError ?? gameMessage}
          </p>
        )}
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

        {(pointsError || pointsMessage) && (
          <p className={pointsError ? "vote-card-error" : "profile-message"}>
            {pointsError ?? pointsMessage}
          </p>
        )}
      </section>

      <section className="admin-card admin-card-wide">
        <h2>Usuarios</h2>
        <ul className="admin-list admin-users-list">
          {users.map((u) => (
            <li key={u.id} className="admin-user-row">
              <span>
                {u.name} <span className="admin-user-email">({u.email})</span> — {u.points} pts
              </span>
              {u.id !== currentUserId && (
                <button
                  type="button"
                  className="admin-delete-btn"
                  onClick={() => handleDeleteUser(u.id, u.name)}
                  disabled={deletingId === u.id}
                >
                  {deletingId === u.id ? "Eliminando..." : "Eliminar"}
                </button>
              )}
            </li>
          ))}
        </ul>

        {(userError || userMessage) && (
          <p className={userError ? "vote-card-error" : "profile-message"}>
            {userError ?? userMessage}
          </p>
        )}
      </section>

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