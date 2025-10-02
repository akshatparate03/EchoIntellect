export default function Footer() {
  return (
    <footer className="border-t border-panel bg-[#0c121a]">
      <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="text-sm text-muted">
          © {new Date().getFullYear()} EchoIntellect. All rights reserved.
        </div>
        <div className="flex items-center gap-4 text-sm">
          <a
            href="#"
            aria-label="Twitter"
            className="hover:text-[var(--color-primary)]"
          >
            Twitter
          </a>
          <a
            href="#"
            aria-label="LinkedIn"
            className="hover:text-[var(--color-primary)]"
          >
            LinkedIn
          </a>
          <a
            href="#"
            aria-label="GitHub"
            className="hover:text-[var(--color-primary)]"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
