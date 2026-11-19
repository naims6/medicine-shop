import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "Shodesh Pharmacy - Trusted Medicine Shop & POS",
  description: "Shodesh Pharmacy (স্বদেশ ফার্মেসী) - Certified dispensing, 100% authentic medicines, and modern POS system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased">
      <body className="h-full overflow-x-hidden font-sans text-slate-900 bg-slate-50">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
