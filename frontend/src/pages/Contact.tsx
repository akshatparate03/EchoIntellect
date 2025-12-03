"use client";
import React, { useState, useEffect } from "react";
import { isAuthenticated, currentEmail } from "../utils/auth";
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

  // Get logged-in user's email
  const loggedInEmail = currentEmail();
  const isLoggedIn = isAuthenticated();

  // Set email field to logged-in email on mount
  useEffect(() => {
    if (isLoggedIn && loggedInEmail) {
      setEmail(loggedInEmail);
    }
  }, [isLoggedIn, loggedInEmail]);

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

  // Validate name - only letters and spaces
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only letters (a-z, A-Z) and spaces
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setName(value);
    }
  };

  // Handle email field click - check if logged in
  const handleEmailClick = (e: React.MouseEvent<HTMLInputElement>) => {
    if (!isLoggedIn) {
      e.preventDefault();
      showToast("Please login first to send a message!");
      setTimeout(() => {
        navigate("/login?next=/contact");
      }, 1500);
    }
  };

  // Handle email change - only allow logged-in email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!isLoggedIn) {
      showToast("Please login first!");
      return;
    }

    // Only allow the logged-in email
    if (value !== loggedInEmail) {
      showToast("You can only use your logged-in email!");
      setEmail(loggedInEmail || "");
      return;
    }

    setEmail(value);
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

    if (!/^[a-zA-Z\s]+$/.test(name)) {
      showToast("Name can only contain letters and spaces!");
      return;
    }

    if (email !== loggedInEmail) {
      showToast("You can only use your logged-in email!");
      setEmail(loggedInEmail || "");
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

      // Clear form
      setName("");
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      showToast("Failed to send message. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen bg-app text-fg overflow-hidden">
      {/* --- Background Layers --- */}
      <div className="bg-ai-gradient absolute inset-0"></div>
      <div className="bg-grid absolute inset-0"></div>

      {/* --- Contact Box --- */}
      <div className="relative z-10 bg-panel/80 border border-panel rounded-2xl shadow-xl p-8 w-[85%] max-w-sm backdrop-blur-md">
        <h1 className="text-2xl font-semibold mb-6 text-primary text-center">
          Contact Us
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              className="input"
              value={name}
              onChange={handleNameChange}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              placeholder={
                isLoggedIn ? loggedInEmail || "Your email" : "Login first"
              }
              className="input"
              value={email}
              onChange={handleEmailChange}
              onClick={handleEmailClick}
              required
              disabled={isLoading || !isLoggedIn}
              readOnly={isLoggedIn}
            />
          </div>

          <div>
            <label className="label">Message</label>
            <textarea
              placeholder="Type your message"
              className="input h-24 resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={isLoading}
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isLoggedIn}
            className="btn btn-primary mt-4 w-full hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending..." : "Send Message"}
          </button>
        </form>

        {!isLoggedIn && (
          <p className="text-center text-muted text-xs mt-4">
            Please login to send a message
          </p>
        )}
      </div>

      {/* Toast Component - LogoutToast Style */}
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
