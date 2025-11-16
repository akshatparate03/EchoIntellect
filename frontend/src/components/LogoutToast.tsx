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
  // Hide the toast automatically after 3 seconds (you can increase if you want)
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // 👈 3000ms = 3 seconds, increase to 4000–5000 if you want longer
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      className="fixed bottom-5 right-5 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg 
                 animate-fade-in z-50 transition-all duration-300"
    >
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
