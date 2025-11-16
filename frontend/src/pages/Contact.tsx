"use client";
import React from "react";

export default function Contact() {
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

        <form className="flex flex-col gap-4 text-left">
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Message</label>
            <textarea
              placeholder="Type your message"
              className="input h-24 resize-none"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="btn btn-primary mt-4 w-full hover:scale-105 transition-transform duration-200"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}
