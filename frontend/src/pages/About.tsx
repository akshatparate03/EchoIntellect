export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <h2 className="text-2xl font-semibold">About EchoIntellect</h2>
      <p className="text-muted">
        EchoIntellect lets you submit a single prompt and view responses from
        multiple AI models side-by-side. Minor-1 focuses on a clean dark UI,
        per-response copy and share, simple browser-only login, and a “highlight
        differences” tool to surface unique insights each model contributes.
      </p>
      <section>
        <h3 className="text-xl font-semibold mb-2">
          Current Features (Minor-1)
        </h3>
        <ul className="list-disc pl-6 text-muted space-y-1">
          <li>Prompt once, compare up to four models</li>
          <li>Animated thinking and typewriter reveal</li>
          <li>Copy and Share links for each model’s output</li>
          <li>Per-model prompt bars and a universal prompt bar</li>
          <li>Simple local login with daily per-model limits</li>
          <li>Responsive grid: 1 column mobile, 2 tablet, up to 4 desktop</li>
        </ul>
      </section>
      <section>
        <h3 className="text-xl font-semibold mb-2">Team</h3>
        <p className="text-muted">
          Creators behind this project and their roles can be listed here.
        </p>
      </section>
    </div>
  );
}
