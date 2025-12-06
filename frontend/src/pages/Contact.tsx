"use client";
import React, { useState, useEffect } from "react";
import { isAuthenticated, currentEmail, currentUserName } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function Contact() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Get logged-in user's email and name
  const loggedInEmail = currentEmail();
  const loggedInName = currentUserName();
  const isLoggedIn = isAuthenticated();

  // Set email and name fields to logged-in user's info on mount
  useEffect(() => {
    if (isLoggedIn) {
      if (loggedInEmail) setEmail(loggedInEmail);
      if (loggedInName) setName(loggedInName);
    }
  }, [isLoggedIn, loggedInEmail, loggedInName]);

  // Show toast function
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toastVisible) {
      const timer = setTimeout(() => setToastVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastVisible]);

  // Handle form click - redirect to login if not logged in
  const handleFormClick = () => {
    if (!isLoggedIn) {
      showToast("Please login first to send a message!");
      setTimeout(() => {
        navigate("/login?next=/contact");
      }, 1500);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation checks
    if (!isLoggedIn) {
      showToast("Please login first!");
      setTimeout(() => {
        navigate("/login?next=/contact");
      }, 1500);
      return;
    }

    if (!message.trim()) {
      showToast("Please write a message!");
      return;
    }

    setIsLoading(true);

    try {
      const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

      if (!APPS_SCRIPT_URL) {
        throw new Error("Apps Script URL not configured");
      }

      // Send data to Google Apps Script
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Important for Apps Script
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });

      // Note: no-cors mode doesn't allow reading response
      // So we assume success if no error is thrown

      showToast("Message sent successfully!");

      // Clear only message field
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      showToast("Failed to send message. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      className="fixed inset-0 flex flex-col bg-app text-fg"
      style={{ overflow: "hidden" }}
    >
      {/* Background layers */}
      <div className="bg-ai-gradient fixed inset-0"></div>
      <div className="bg-grid fixed inset-0"></div>

      {/* Spacer for navbar */}
      <div style={{ height: "var(--header-height)", flexShrink: 0 }} />

      {/* Main content area - Centered */}
      <div
        className="relative z-10 flex-1 flex items-center justify-center px-4 overflow-hidden"
        style={{ minHeight: 0 }}
      >
        <div
          className="bg-panel/80 border border-panel rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-sm backdrop-blur-md max-h-full overflow-y-auto custom-scrollbar"
          onClick={handleFormClick}
        >
          <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-primary text-center">
            Contact Us
          </h1>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:gap-4 text-left"
          >
            <div>
              <label className="label text-xs sm:text-sm">Name</label>
              <input
                type="text"
                placeholder={isLoggedIn ? name || "Your name" : "Login first"}
                className="input text-sm cursor-not-allowed opacity-75"
                value={name}
                readOnly
                disabled={!isLoggedIn}
              />
            </div>

            <div>
              <label className="label text-xs sm:text-sm">Email</label>
              <input
                type="email"
                placeholder={isLoggedIn ? email || "Your email" : "Login first"}
                className="input text-sm cursor-not-allowed opacity-75"
                value={email}
                readOnly
                disabled={!isLoggedIn}
              />
            </div>

            <div>
              <label className="label text-xs sm:text-sm">Message</label>
              <textarea
                placeholder="Type your message"
                className="input h-20 sm:h-24 resize-none text-sm"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                disabled={isLoading || !isLoggedIn}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isLoggedIn}
              className="btn btn-primary mt-2 sm:mt-4 w-full hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? "Sending..." : "Send Message"}
            </button>
          </form>

          {!isLoggedIn && (
            <p className="text-center text-muted text-xs mt-3 sm:mt-4">
              Please login to send a message
            </p>
          )}
        </div>
      </div>

      {/* Spacer for footer */}
      <div style={{ height: "var(--footer-height)", flexShrink: 0 }} />

      {/* Toast Component */}
      {toastVisible && (
        <div className="fixed top-[90px] right-6 bg-[#111827]/90 text-white px-4 py-3 rounded-xl border border-gray-600/70 shadow-xl backdrop-blur-md z-[9999] animate-toastSlideIn">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <p className="text-sm font-medium">{toastMessage}</p>
            <button
              onClick={() => setToastVisible(false)}
              className="text-gray-300 hover:text-white ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Toast Animation CSS */}
      <style>{`
        @keyframes toastSlideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-toastSlideIn {
          animation: toastSlideIn 0.3s ease-out;
        }
      `}</style>
    </section>
  );
}
