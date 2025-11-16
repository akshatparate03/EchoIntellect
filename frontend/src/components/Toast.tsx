"use client";

interface ToastProps {
  show: boolean;
  message: string;
  type: "success" | "error";
}

export default function Toast({ show, message, type }: ToastProps) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 ease-in-out ${
        show
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`px-6 py-4 rounded-lg font-medium flex items-center gap-3 shadow-lg backdrop-blur-sm ${
          type === "success"
            ? "bg-green-500/20 border border-green-500/40 text-green-300"
            : "bg-red-500/20 border border-red-500/40 text-red-300"
        }`}
      >
        {type === "success" ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <span>{message}</span>
      </div>
    </div>
  );
}
