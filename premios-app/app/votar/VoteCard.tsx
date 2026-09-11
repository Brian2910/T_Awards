"use client";

import { useState } from "react";

type CategoryType = "TEXT" | "TEXT3" | "PHOTO" | "AUDIO";

interface ExistingVote {
  textAnswer: string | null;
  textAnswer2: string | null;
  textAnswer3: string | null;
  fileUrl: string | null;
}

interface Props {
  categoryId: string;
  name: string;
  description: string | null;
  type: CategoryType;
  existingVote: ExistingVote | null;
}

export default function VoteCard({ categoryId, name, description, type, existingVote }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [hasVote, setHasVote] = useState(Boolean(existingVote));
  const [currentFileUrl, setCurrentFileUrl] = useState(existingVote?.fileUrl ?? null);

  const [textAnswer, setTextAnswer] = useState(existingVote?.textAnswer ?? "");
  const [textAnswer2, setTextAnswer2] = useState(existingVote?.textAnswer2 ?? "");
  const [textAnswer3, setTextAnswer3] = useState(existingVote?.textAnswer3 ?? "");
  const [file, setFile] = useState<File | null>(null);

  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const isFileType = type === "PHOTO" || type === "AUDIO";
  const showForm = editing || (!hasVote && open);

  function startEditing() {
    setTextAnswer(existingVote?.textAnswer ?? "");
    setTextAnswer2(existingVote?.textAnswer2 ?? "");
    setTextAnswer3(existingVote?.textAnswer3 ?? "");
    setFile(null);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setError(null);
  }

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
      method: hasVote ? "PUT" : "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo guardar. Intentá de nuevo.");
      setStatus("error");
      return;
    }

    const saved = await res.json();
    setCurrentFileUrl(saved.fileUrl ?? currentFileUrl);
    setStatus("idle");
    setHasVote(true);
    setEditing(false);
    setOpen(false);
  }

  const typeLabel = { TEXT: "Texto", TEXT3: "Texto", PHOTO: "Foto", AUDIO: "Audio" }[type];

  return (
    <div className="vote-card">
      <button
        type="button"
        className="vote-card-header"
        onClick={() => !hasVote && setOpen(!open)}
        disabled={hasVote}
      >
        <div className="vote-card-header-text">
          <h2>{name}</h2>
        </div>
        {hasVote ? (
          <span className="vote-card-check">✓</span>
        ) : (
          <span className={`vote-card-chevron ${open ? "vote-card-chevron-open" : ""}`}>
            ⌄
          </span>
        )}
      </button>

      {hasVote && !editing && (
        <div className="vote-card-done-row">
          <p className="vote-card-done">Voto registrado ✓</p>
          <button type="button" className="vote-card-edit-link" onClick={startEditing}>
            Editar respuesta
          </button>
        </div>
      )}

      {showForm && (
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

            {isFileType && (
              <>
                {editing && currentFileUrl && (
                  <p className="vote-card-current-file">
                    Archivo actual:{" "}
                    <a href={currentFileUrl} target="_blank" rel="noreferrer">
                      verlo
                    </a>{" "}
                    (subí uno nuevo solo si querés reemplazarlo)
                  </p>
                )}
                <input
                  type="file"
                  accept={type === "PHOTO" ? "image/*" : "audio/*"}
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  required={!editing}
                />
              </>
            )}

            {error && <p className="vote-card-error">{error}</p>}

            <div className="vote-card-actions">
              <button type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Guardando..." : editing ? "Guardar cambios" : "Votar"}
              </button>
              {editing && (
                <button type="button" className="vote-card-cancel" onClick={cancelEditing}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}