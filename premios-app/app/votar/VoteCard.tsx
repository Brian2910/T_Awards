"use client";

import { useState } from "react";

type CategoryType = "TEXT" | "TEXT3" | "PHOTO" | "AUDIO";

interface Props {
  categoryId: string;
  name: string;
  description: string | null;
  type: CategoryType;
  alreadyVoted: boolean;
}

export default function VoteCard({ categoryId, name, description, type, alreadyVoted }: Props) {
  const [open, setOpen] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");
  const [textAnswer2, setTextAnswer2] = useState("");
  const [textAnswer3, setTextAnswer3] = useState("");
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
    } else if (type === "TEXT3") {
      formData.append("textAnswer", textAnswer);
      formData.append("textAnswer2", textAnswer2);
      formData.append("textAnswer3", textAnswer3);
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
    setOpen(false);
  }

  const typeLabel = { TEXT: "Texto", TEXT3: "Texto", PHOTO: "Foto", AUDIO: "Audio" }[type];
  const isDone = status === "done";

  return (
    <div className="vote-card">
      <button
        type="button"
        className="vote-card-header"
        onClick={() => !isDone && setOpen(!open)}
        disabled={isDone}
      >
        <div className="vote-card-header-text">
          <h2>{name}</h2>
        </div>
        {isDone ? (
          <span className="vote-card-check">✓</span>
        ) : (
          <span className={`vote-card-chevron ${open ? "vote-card-chevron-open" : ""}`}>
            ⌄
          </span>
        )}
      </button>

      {isDone && <p className="vote-card-done">Voto registrado ✓</p>}

      {!isDone && open && (
        <div className="vote-card-body">
          {description && <p className="vote-card-desc">{description}</p>}

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

            {type === "TEXT3" && (
              <>
                <textarea
                  placeholder="Respuesta 1"
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  required
                  rows={2}
                />
                <textarea
                  placeholder="Respuesta 2"
                  value={textAnswer2}
                  onChange={(e) => setTextAnswer2(e.target.value)}
                  required
                  rows={2}
                />
                <textarea
                  placeholder="Respuesta 3"
                  value={textAnswer3}
                  onChange={(e) => setTextAnswer3(e.target.value)}
                  required
                  rows={2}
                />
              </>
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
        </div>
      )}
    </div>
  );
}