"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";


interface Props {
  initialName: string;
  initialImage: string | null;
}

export default function ProfileForm({ initialName, initialImage }: Props) {
  const { update } = useSession();
  const [name, setName] = useState(initialName);
  const [image, setImage] = useState(initialImage);
  const [savingName, setSavingName] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSavingName(true);

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setSavingName(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo guardar el nombre.");
      return;
    }

    setMessage("Nombre actualizado.");
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setMessage(null);
    setUploadingPhoto(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/profile/photo", {
      method: "POST",
      body: formData,
    });

    setUploadingPhoto(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo subir la foto.");
      return;
    }

    const updated = await res.json();
    setImage(updated.image);
    await update({ image: updated.image }); // 👈 refresca el JWT/sesión al toque
    setMessage("Foto actualizada.");
  }

  return (
    <div className="profile-card">
      <div className="profile-avatar-wrap">
        {image ? (
          <img src={image} alt="Foto de perfil" className="profile-avatar" />
        ) : (
          <div className="profile-avatar profile-avatar-placeholder">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <label className="profile-photo-btn">
          {uploadingPhoto ? "Subiendo..." : "Cambiar foto"}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            disabled={uploadingPhoto}
            hidden
          />
        </label>
      </div>

      <form onSubmit={handleSaveName} className="profile-name-form">
        <label>
          Nombre
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <button type="submit" disabled={savingName || name === initialName}>
          {savingName ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>

      {message && <p className="profile-message">{message}</p>}
      {error && <p className="vote-card-error">{error}</p>}
    </div>
  );
}
