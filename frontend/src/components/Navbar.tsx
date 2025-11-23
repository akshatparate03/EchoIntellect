"use client";

import { useState, useEffect } from "react";
import LogoutToast from "./LogoutToast";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { isAuthenticated, signOut } from "../utils/auth";

export default function Navbar() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const authed = isAuthenticated();

  const [showLogoutToast, setShowLogoutToast] = useState(false);

  const [hasComparison, setHasComparison] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("comparisonData");
    setHasComparison(!!saved);
  }, [pathname]);

  const handleLogout = () => {
    signOut();
    nav("/");
    setShowLogoutToast(true);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 border-b border-gray-800 bg-[#0c121a]/95 backdrop-blur-md shadow-lg">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/Images/EchoIntellect.png"
              alt="EchoIntellect"
              className="h-14 w-auto object-contain drop-shadow-lg select-none"
            />
            <div className="leading-tight">
              <div className="font-semibold text-white">EchoIntellect</div>
              <div className="text-xs text-gray-400">
                Where Intelligence Reflects
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4 text-white">
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

            {/* ⭐ Show Compare tab ONLY if comparison data exists */}
            {hasComparison && (
              <Link
                to="/compare"
                className={
                  pathname === "/compare"
                    ? "text-[var(--color-primary)]"
                    : "hover:text-[var(--color-primary)]"
                }
              >
                Compare
              </Link>
            )}

            {/* Login / Logout */}
            {!authed ? (
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
            ) : (
              <button className="btn btn-ghost" onClick={handleLogout}>
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Logout Toast */}
      <LogoutToast
        show={showLogoutToast}
        message="You have been logged out."
        onClose={() => setShowLogoutToast(false)}
      />
    </>
  );
}
