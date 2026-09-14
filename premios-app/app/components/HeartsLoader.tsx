export default function HeartsLoader() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
      }}
    >
      <div className="hearts-loader">
        <span>💗</span>
        <span>💗</span>
        <span>💗</span>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Cargando...</p>
    </div>
  );
}