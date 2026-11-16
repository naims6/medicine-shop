import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "PharmaCare POS - Medicine Shop Point of Sale",
  description: "Modern, professional Medicine Shop POS system for fast cashier operations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased">
      <body className="h-full overflow-hidden font-sans text-slate-900 bg-slate-50">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
