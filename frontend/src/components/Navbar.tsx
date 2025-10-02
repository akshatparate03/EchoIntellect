"use client";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { isAuthenticated, signOut } from "../utils/auth";

export default function Navbar() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const authed = isAuthenticated();
  return (
    <header className="border-b border-panel bg-[#0c121a]">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div
            className="h-7 w-7 rounded bg-[var(--color-primary)]"
            aria-hidden
          />
          <div className="leading-tight">
            <div className="font-semibold">EchoIntellect</div>
            <div className="text-xs text-muted">
              Where Intelligence Reflects
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            to="/"
            className={pathname === "/" ? "text-[var(--color-primary)]" : ""}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={
              pathname === "/about" ? "text-[var(--color-primary)]" : ""
            }
          >
            About
          </Link>
          <Link
            to="/contact"
            className={
              pathname === "/contact" ? "text-[var(--color-primary)]" : ""
            }
          >
            Contact
          </Link>
          {!authed ? (
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
          ) : (
            <button
              className="btn btn-ghost"
              onClick={() => {
                signOut();
                nav("/");
              }}
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
