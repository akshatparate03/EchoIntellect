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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("comparisonData");
    setHasComparison(!!saved);

    const handleStorageChange = () => {
      const updated = sessionStorage.getItem("comparisonData");
      setHasComparison(!!updated);
    };

    const interval = setInterval(handleStorageChange, 100);
    return () => clearInterval(interval);
  }, [pathname]);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    signOut();
    nav("/");
    setShowLogoutToast(true);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 border-b border-gray-800 bg-[#0c121a]/95 backdrop-blur-md shadow-lg">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          {/* Logo - Mobile: Only name and icon, Desktop: Full */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/Images/EchoIntellect.png"
              alt="EchoIntellect"
              className="h-8 sm:h-10 w-auto object-contain drop-shadow-lg select-none"
            />
            <div className="leading-tight">
              <div className="font-semibold text-white text-sm sm:text-base">
                EchoIntellect
              </div>
              <div className="hidden sm:block text-xs text-gray-400">
                Where Intelligence Reflects
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 text-white text-sm">
            <Link
              to="/"
              className={`hover:text-[var(--color-primary)] transition-colors ${
                pathname === "/" ? "text-[var(--color-primary)]" : ""
              }`}
            >
              Home
            </Link>

            <Link
              to="/about"
              className={`hover:text-[var(--color-primary)] transition-colors ${
                pathname === "/about" ? "text-[var(--color-primary)]" : ""
              }`}
            >
              About
            </Link>

            <Link
              to="/contact"
              className={`hover:text-[var(--color-primary)] transition-colors ${
                pathname === "/contact" ? "text-[var(--color-primary)]" : ""
              }`}
            >
              Contact
            </Link>

            {hasComparison && (
              <Link
                to="/compare"
                className={`hover:text-[var(--color-primary)] transition-colors ${
                  pathname === "/compare" ? "text-[var(--color-primary)]" : ""
                }`}
              >
                Compare
              </Link>
            )}

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

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`md:hidden absolute top-full left-0 w-full bg-[#0c121a] border-b border-gray-800 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col py-4 px-4 space-y-1">
            <Link
              to="/"
              className={`px-4 py-3 rounded-lg text-white hover:bg-gray-800 transition-colors ${
                pathname === "/"
                  ? "bg-gray-800 text-[var(--color-primary)]"
                  : ""
              }`}
            >
              Home
            </Link>

            <Link
              to="/about"
              className={`px-4 py-3 rounded-lg text-white hover:bg-gray-800 transition-colors ${
                pathname === "/about"
                  ? "bg-gray-800 text-[var(--color-primary)]"
                  : ""
              }`}
            >
              About
            </Link>

            <Link
              to="/contact"
              className={`px-4 py-3 rounded-lg text-white hover:bg-gray-800 transition-colors ${
                pathname === "/contact"
                  ? "bg-gray-800 text-[var(--color-primary)]"
                  : ""
              }`}
            >
              Contact
            </Link>

            {hasComparison && (
              <Link
                to="/compare"
                className={`px-4 py-3 rounded-lg text-white hover:bg-gray-800 transition-colors ${
                  pathname === "/compare"
                    ? "bg-gray-800 text-[var(--color-primary)]"
                    : ""
                }`}
              >
                Compare
              </Link>
            )}

            <div className="border-t border-gray-800 my-2"></div>

            {!authed ? (
              <Link
                to="/login"
                className="px-4 py-3 rounded-lg bg-[var(--color-primary)] text-[#031314] font-medium hover:bg-[#0b8a8a] transition-colors text-center"
              >
                Login
              </Link>
            ) : (
              <button
                className="px-4 py-3 rounded-lg text-white hover:bg-gray-800 transition-colors text-left"
                onClick={handleLogout}
              >
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
