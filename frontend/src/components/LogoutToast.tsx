"use client";

import { useEffect } from "react";

interface LogoutToastProps {
  show: boolean;
  message: string;
  onClose: () => void;
}

export default function LogoutToast({
  show,
  message,
  onClose,
}: LogoutToastProps) {
  // Auto hide after 3 seconds
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-[90px] right-6 bg-[#111827]/90 text-white px-4 py-3 rounded-xl border border-gray-600/70 shadow-xl backdrop-blur-md z-[9999] animate-toastSlideIn">
      <div className="flex items-center gap-3">
        {/* Small rounded indicator bullet like screenshot */}
        <div className="w-2 h-2 bg-white rounded-full"></div>

        {/* Message */}
        <p className="text-sm font-medium">{message}</p>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-gray-300 hover:text-white ml-2"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
