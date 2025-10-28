import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fit Fusion AI Backend",
  description: "Backend API for Fit Fusion AI"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
