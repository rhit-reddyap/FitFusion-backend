// src/components/LockedOverlay.jsx
import React from "react";

export default function LockedOverlay({ children }) {
  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="pointer-events-none filter blur-sm">{children}</div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
        <p className="text-white font-semibold text-lg">
          🔒 Upgrade to Premium to Unlock
        </p>
      </div>
    </div>
  );
}
