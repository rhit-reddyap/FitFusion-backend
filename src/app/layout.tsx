import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fit Fusion AI Backend",
  description: "Backend API for Fit Fusion AI"
};

// Disable static generation - all pages will be dynamically rendered
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
