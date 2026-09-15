import { getEmbedUrl } from "@/lib/videoEmbed";

interface VideoItem {
  url: string;
  title: string;
}

interface Props {
  videos: VideoItem[];
}

export default function VideoGallery({ videos }: Props) {
  if (videos.length === 0) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "1.5rem",
        width: "100%",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      {videos.map((video) => (
        <div key={video.url} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div
            style={{
              position: "relative",
              paddingTop: "56.25%",
              borderRadius: 14,
              overflow: "hidden",
              border: "3px solid #f9a8d4",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            <iframe
              src={getEmbedUrl(video.url)}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
            />
          </div>
          <p style={{ color: "var(--text-muted, #d8a9bb)", margin: 0, textAlign: "center" }}>
            {video.title}
          </p>
        </div>
      ))}
    </div>
  );
}