"use client";

import React, { useState } from "react";
import {
  Store,
  Printer,
  ShieldCheck,
  RotateCcw,
  Save,
  CheckCircle,
} from "lucide-react";
import { medicineRepository } from "@/repositories/medicineRepository";
import { salesRepository } from "@/repositories/salesRepository";

export default function SettingsPage() {
  const [shopName, setShopName] = useState("PharmaCare Medicine & Surgical");
  const [shopAddress, setShopAddress] = useState(
    "House #12, Road #4, Dhanmondi, Dhaka - 1205"
  );
  const [phone, setPhone] = useState("+880 1711-234567");
  const [regNumber, setRegNumber] = useState("PH-DH-88492");
  const [cashierName, setCashierName] = useState("Mohammad Rafiq");
  const [counterNumber, setCounterNumber] = useState("Counter 01");
  const [printerFormat, setPrinterFormat] = useState("80mm");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetData = async () => {
    if (confirm("Reset all medicines and sales history to demo defaults?")) {
      setIsResetting(true);
      await medicineRepository.resetToDefault();
      await salesRepository.resetToDefault();
      localStorage.removeItem("pharmacare_pos_cart_v1");
      setTimeout(() => {
        setIsResetting(false);
        window.location.reload();
      }, 500);
    }
  };

  return (
    <div className="max-w-4xl space-y-5">
      <form onSubmit={handleSave} className="space-y-5">
        {/* Pharmacy Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Store className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pharmacy Outlet Profile
              </h3>
              <p className="text-xs text-slate-500">
                Printed on customer cash memos and invoices
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Shop / Pharmacy Name
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Govt Drug License / Reg No.
              </label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Store Address
              </label>
              <input
                type="text"
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hotline / Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Cashier & Terminal Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Cashier & POS Terminal Settings
              </h3>
              <p className="text-xs text-slate-500">
                Logged-in operator identity for this physical counter
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Current Cashier Name
              </label>
              <input
                type="text"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Terminal / Counter ID
              </label>
              <input
                type="text"
                value={counterNumber}
                onChange={(e) => setCounterNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Hardware & Receipt Printer */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Printer className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Receipt Printer Configuration
              </h3>
              <p className="text-xs text-slate-500">
                Choose paper width and layout formatting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="printer"
                value="80mm"
                checked={printerFormat === "80mm"}
                onChange={(e) => setPrinterFormat(e.target.value)}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium text-slate-800">
                80mm Thermal Receipt (Standard POS Roll)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="printer"
                value="A4"
                checked={printerFormat === "A4"}
                onChange={(e) => setPrinterFormat(e.target.value)}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium text-slate-800">
                Standard A4 / Half-sheet Paper
              </span>
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs shadow-emerald-200 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>

          {savedSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
              <CheckCircle className="w-4 h-4" />
              Settings saved successfully!
            </span>
          )}
        </div>
      </form>

      {/* Danger Zone: Demo Reset */}
      <div className="bg-white rounded-xl border border-rose-200 p-5 shadow-xs space-y-3 mt-8">
        <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider">
          Demo Data Management
        </h4>
        <p className="text-xs text-slate-600">
          Reset all medicines, active cart, and sales history back to the fresh Bangladesh pharmacy sample dataset.
        </p>

        <button
          type="button"
          onClick={handleResetData}
          disabled={isResetting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
          <span>{isResetting ? "Resetting..." : "Reset Demo Data"}</span>
        </button>
      </div>
    </div>
  );
}
