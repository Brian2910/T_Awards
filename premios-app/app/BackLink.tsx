export default function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="back-cta">
      ← {label}
    </a>
  );
}