"use client";

import React from "react";
import Link from "next/link";
import {
  Store,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  UserCheck,
  Mail,
  MessageSquare,
  Award,
  ThermometerSnowflake,
  FileCheck2,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  HeartPulse,
} from "lucide-react";
import { useAuth } from "@/stores/AuthContext";

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header / Public Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
                Shodesh Pharmacy
              </span>
              <span className="text-[11px] text-slate-500 font-medium block -mt-0.5">
                স্বদেশ ফার্মেসী • Mirpur, Dhaka
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#about" className="hover:text-emerald-600 transition-colors">
              About Store
            </a>
            <a href="#owner" className="hover:text-emerald-600 transition-colors">
              Owner & Pharmacist
            </a>
            <a href="#location" className="hover:text-emerald-600 transition-colors">
              Location & Hours
            </a>
            <a href="#contact" className="hover:text-emerald-600 transition-colors">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <span>POS Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 hover:border-emerald-500 hover:text-emerald-600 bg-white text-xs font-semibold text-slate-700 transition-all shadow-2xs"
              >
                <span>Staff Login</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>DGDA Licensed Retail Pharmacy • Reg #DGDA/DL-2024/98421</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Trusted Healthcare & Genuine Medicines in Mirpur
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Welcome to <strong className="text-slate-900 font-semibold">Shodesh Pharmacy (স্বদেশ ফার্মেসী)</strong>.
              We are committed to serving our local community with 100% manufacturer-sourced medicines,
              cold-chain preservation for biologicals, and professional prescription dispensing by registered pharmacists.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="tel:+8801711234567"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call Hotline: +880 1711-234567</span>
              </a>

              <a
                href="https://wa.me/8801711234567"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-800 text-xs font-semibold transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Prescription</span>
              </a>

              <a
                href="#location"
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 font-semibold px-2 py-1"
              >
                <span>Store Directions</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-10 pt-8 border-t border-slate-100">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <Award className="w-5 h-5 text-emerald-600 mb-2" />
              <h4 className="text-xs font-bold text-slate-900">100% Genuine Medicines</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Directly sourced from Square, Beximco, Incepta, Renata & ACME.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <ThermometerSnowflake className="w-5 h-5 text-blue-600 mb-2" />
              <h4 className="text-xs font-bold text-slate-900">Cold Chain Storage</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                2°C – 8°C dedicated refrigeration for insulin, vaccines & eye drops.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <FileCheck2 className="w-5 h-5 text-amber-600 mb-2" />
              <h4 className="text-xs font-bold text-slate-900">Printed Cash Memo</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Transparent retail billing adhering to government approved MRP.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <HeartPulse className="w-5 h-5 text-rose-600 mb-2" />
              <h4 className="text-xs font-bold text-slate-900">Health Check Station</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Free blood pressure and instant blood glucose monitoring on request.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Owner Information Section */}
      <section id="owner" className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Leadership & Professional Governance
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Owner & Chief Pharmacist
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Qualified pharmaceutical oversight ensuring medicine efficacy and patient safety
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Profile Avatar / Badge */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0 border border-emerald-200 shadow-2xs">
                SI
              </div>

              {/* Profile Content */}
              <div className="space-y-4 flex-1">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                      Md. Shahidul Islam
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Proprietor & Managing Pharmacist
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    B.Pharm (Hons), M.Pharm (Clinical Pharmacy) • University of Dhaka
                  </p>
                  <p className="text-xs text-slate-500">
                    Registered &apos;A-Grade&apos; Pharmacist • Pharmacy Council of Bangladesh (PCB Reg #A-14920)
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed italic space-y-2">
                  <p>
                    &ldquo;At Shodesh Pharmacy, medicine is treated with the highest ethical responsibility.
                    We never sell counterfeit or unauthorized parallel-import drugs. Every batch is verified
                    for authentic manufacturer QR codes, valid expiry dates, and proper cold-chain handling.
                    Our mission is to ensure every family in our neighborhood receives safe, genuine, and fairly-priced healthcare.&rdquo;
                  </p>
                  <p className="font-semibold text-slate-900 not-italic">
                    — Md. Shahidul Islam, Founder
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>18+ Years Experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>PCB Licensed Grade-A</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Evening Consultations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Store Hours Section */}
      <section id="location" className="bg-white border-y border-slate-200 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Store Visit
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Location & Operating Hours
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Easily accessible store front on the main road in Mirpur, Dhaka
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Address Card */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Physical Store Address</h3>
                  <p className="text-xs text-slate-500">Walk-in counter & pickup</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <p className="font-semibold text-slate-900 text-sm">
                  Shodesh Pharmacy (স্বদেশ ফার্মেসী)
                </p>
                <p>
                  Holding #42/A, Main Road, Block-D, Section-6,<br />
                  Mirpur, Dhaka - 1216, Bangladesh.
                </p>
                <p className="text-slate-500 pt-1">
                  <strong>Landmark:</strong> Opposite to Central Diagnostic Centre & adjacent to Metro Rail Station (Pillar #194).
                </p>
              </div>

              <div className="pt-2">
                <a
                  href="https://maps.google.com/?q=Mirpur+6+Dhaka+Bangladesh"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Operating Hours Card */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Store Hours</h3>
                  <p className="text-xs text-slate-500">Counter schedule</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="font-medium text-slate-600">Saturday – Thursday:</span>
                  <span className="font-bold text-slate-900">8:00 AM – 11:30 PM</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="font-medium text-slate-600">Friday (After Jummah):</span>
                  <span className="font-bold text-slate-900">2:30 PM – 11:30 PM</span>
                </div>

                <div className="flex justify-between py-1 text-emerald-700">
                  <span className="font-medium">Emergency Calls:</span>
                  <span className="font-bold">24/7 Telephone Hotline</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px]">
                <span className="font-bold">Fast Service:</span> Call or WhatsApp your prescription beforehand to have medicines packed ready for counter pickup.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Reach Out
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Contact Numbers & Support
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Call our store counter directly or send your prescription via WhatsApp
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto text-xs">
            {/* Phone Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900">Hotline & Phone</h3>
              <p className="text-slate-500 text-[11px]">Direct store line</p>
              <div className="pt-1 font-mono font-bold text-slate-900 text-sm">
                <a href="tel:+8801711234567" className="hover:text-emerald-600 block">
                  +880 1711-234567
                </a>
                <a href="tel:+8801819876543" className="hover:text-emerald-600 block text-xs text-slate-600 mt-0.5">
                  +880 1819-876543
                </a>
              </div>
            </div>

            {/* WhatsApp Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900">WhatsApp Prescription</h3>
              <p className="text-slate-500 text-[11px]">Send photo of prescription</p>
              <div className="pt-1">
                <a
                  href="https://wa.me/8801711234567"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono font-bold text-emerald-700 hover:underline text-sm block"
                >
                  +880 1711-234567
                </a>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Instant confirmation
                </span>
              </div>
            </div>

            {/* Email & License Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900">Email & Licensing</h3>
              <p className="text-slate-500 text-[11px]">Official inquiries</p>
              <div className="pt-1 space-y-0.5">
                <a
                  href="mailto:contact@shodeshpharmacy.com"
                  className="text-slate-800 hover:text-emerald-600 font-medium block truncate"
                >
                  contact@shodeshpharmacy.com
                </a>
                <span className="text-[10px] text-slate-400 block font-mono">
                  Reg #DGDA/DL-2024/98421
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Public Footer */}
      <footer className="bg-slate-900 text-slate-300 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white text-sm">Shodesh Pharmacy</span>
                <span className="text-[10px] text-slate-400 block">স্বদেশ ফার্মেসী • Mirpur-6, Dhaka</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#owner" className="hover:text-white transition-colors">Owner & Pharmacist</a>
              <a href="#location" className="hover:text-white transition-colors">Location</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold ml-2">
                Staff POS Login →
              </Link>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <p>© 2026 Shodesh Pharmacy. All rights reserved.</p>
            <p>Government Drug Administration Reg: DGDA/DL-2024/98421 • PCB Reg: A-14920</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
