export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 w-full border-t border-panel bg-[#0c121a] text-white z-50">
      <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="text-sm text-gray-400">
          © {currentYear}{" "}
          <span className="text-white font-medium">EchoIntellect</span>. All
          rights reserved.
        </div>

        <div className="flex items-center gap-5 text-sm">
          {/* Gmail */}
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=echointellect.org@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Gmail"
            className="transition-transform transform hover:scale-110 hover:text-[var(--color-primary)] duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM12 13L4 8V6l8 5 8-5v2l-8 5z" />
            </svg>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/echointellect.in"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="transition-transform transform hover:scale-110 hover:text-[var(--color-primary)] duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-6 h-6"
            >
              <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 2c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3h10zm-5 3.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm0 7A2.5 2.5 0 1 1 14.5 12 2.5 2.5 0 0 1 12 14.5zm4.75-7.88a.88.88 0 1 1-.88-.88.88.88 0 0 1 .88.88z" />
            </svg>
          </a>

          {/* GitHub */}
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="transition-transform transform hover:scale-110 hover:text-[var(--color-primary)] duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-6 h-6"
            >
              <path d="M12 .5C5.7.5.5 5.7.5 12a11.5 11.5 0 0 0 7.9 10.9c.6.1.8-.2.8-.6v-2.1c-3.2.7-3.9-1.5-3.9-1.5-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1 1.5-.7 1.7-1.1.1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.9 0-1.3.4-2.4 1.1-3.3-.1-.3-.5-1.6.1-3.3 0 0 .9-.3 3.4 1.1a12 12 0 0 1 6.2 0c2.5-1.4 3.4-1.1 3.4-1.1.6 1.7.2 3 .1 3.3.7.9 1.1 2 1.1 3.3 0 4.6-2.7 5.6-5.3 5.9.4.3.8 1 .8 2v3c0 .4.2.7.8.6A11.5 11.5 0 0 0 23.5 12C23.5 5.7 18.3.5 12 .5z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
