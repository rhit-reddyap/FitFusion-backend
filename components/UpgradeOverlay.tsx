
import { Lock } from "lucide-react";

export default function UpgradeOverlay({ children }) {
  return (
    <div className="relative">
      <div className="blur-sm opacity-60">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black/70 text-white p-4 rounded-xl flex items-center gap-2">
          <Lock size={20} />
          <span>Upgrade to Unlock</span>
        </div>
      </div>
    </div>
  );
}
