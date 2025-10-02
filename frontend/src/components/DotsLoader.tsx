export default function DotsLoader({ label = "Thinking" }: { label?: string }) {
  return (
    <div className="text-muted">
      <span>{label}</span>
      <span className="dots" aria-hidden></span>
    </div>
  );
}
