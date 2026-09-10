"use client";

import { useState } from "react";

type CategoryType = "TEXT" | "PHOTO" | "AUDIO";

interface Props {
  categoryId: string;
  name: string;
  description: string | null;
  type: CategoryType;
  alreadyVoted: boolean;
}

export default function VoteCard({ categoryId, name, description, type, alreadyVoted }: Props) {
  const [textAnswer, setTextAnswer] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    alreadyVoted ? "done" : "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("sending");

    const formData = new FormData();
    formData.append("categoryId", categoryId);
    if (type === "TEXT") {
      formData.append("textAnswer", textAnswer);
    } else if (file) {
      formData.append("file", file);
    }

    const res = await fetch("/api/votes", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo registrar el voto. Intentá de nuevo.");
      setStatus("error");
      return;
    }

    setStatus("done");
  }

  const typeLabel = { TEXT: "Texto", PHOTO: "Foto", AUDIO: "Audio" }[type];

  return (
    <div className="vote-card">
      <span className="vote-card-type">{typeLabel}</span>
      <h2>{name}</h2>
      {description && <p className="vote-card-desc">{description}</p>}

      {status === "done" ? (
        <p className="vote-card-done">Voto registrado ✓</p>
      ) : (
        <form onSubmit={handleSubmit}>
          {type === "TEXT" && (
            <textarea
              placeholder="Escribí tu respuesta"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              required
              rows={3}
            />
          )}

          {type === "PHOTO" && (
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
          )}

          {type === "AUDIO" && (
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
          )}

          {error && <p className="vote-card-error">{error}</p>}

          <button type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Enviando..." : "Votar"}
          </button>
        </form>
      )}
    </div>
  );
}
