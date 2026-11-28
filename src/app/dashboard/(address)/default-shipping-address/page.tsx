"use client";

import RecipientLine from "@/Components/Dashboard/AddressBook/RecipientLine";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import clientFetchAPI from "@/utils/clientFetchAPI";
import { FiTruck, FiChevronLeft, FiCheckCircle } from "react-icons/fi";
import { errMessage, fieldsOf, findList, lengthStrict, mapList, rec } from "@/lib/json";
import { idKey, nodeOf } from "@/lib/render";

export default function DefaultShippingAddress() {
  const [addresses, setAddresses] = useState<unknown>([]);
  const [selectedId, setSelectedId] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<unknown>("");

  // ✅ Addresses fetch
  useEffect(() => {
    const fetchAddresses = async () => {
      setLoading(true);
      try {
        const data = await clientFetchAPI("/customer/addresses", "GET");
        const list = rec(data)?.data || [];
        setAddresses(list);

        const defaultAddr = findList(list, (a) => fieldsOf(a).is_default_shipping);
        if (defaultAddr) setSelectedId(fieldsOf(defaultAddr).id);
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  // ✅ Save default shipping
  const handleSave = async () => {
    if (!selectedId) {
      setError("Please select an address");
      return;
    }
    setSaveLoading(true);
    setSaveSuccess(false);
    setError("");

    try {
      await clientFetchAPI(`/customer/default-address/${String(selectedId)}`, "PATCH", {
        is_default_shipping: 1,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(errMessage(err) || "Failed to save");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <title>Default Shipping Address - Tekzo Dashboard</title>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/address-book"
            className="w-10 h-10 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0f182c] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm hover:border-slate-300 dark:hover:border-white/20 transition-colors"
            title="Back to Address Book"
          >
            <FiChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Default Shipping Address
            </h1>
            <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Select your primary address for package shipments and deliveries
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saveLoading || loading || lengthStrict(addresses) === 0}
          className="self-start sm:self-auto inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
        >
          {saveLoading ? "Saving..." : "Save Default"}
        </button>
      </div>

      {/* Error / Success Feedback */}
      {nodeOf(error && (
        <div className="p-4 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl">
          {nodeOf(error)}
        </div>
      ))}
      {saveSuccess && (
        <div className="p-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2">
          <FiCheckCircle size={16} /> Default shipping address updated successfully!
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/10 p-6 space-y-4 animate-pulse shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-20 bg-slate-200 dark:bg-white/10 rounded-lg" />
                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/10" />
              </div>
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-white/10 rounded-lg" />
              <div className="h-3 w-1/2 bg-slate-100 dark:bg-white/5 rounded-lg" />
            </div>
          ))}
        </div>
      ) : lengthStrict(addresses) === 0 ? (
        <div className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm p-12 sm:p-16 text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto mb-4 shadow-sm">
            <FiTruck size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No Addresses Found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto mb-6">
            Please add at least one address in your Address Book before selecting your default shipping address.
          </p>
          <Link
            href="/dashboard/address-book"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-widest px-7 py-3 rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            Go to Address Book
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mapList(addresses, (addr) => {
            const a = fieldsOf(addr);
            const isSelected = selectedId === a.id;
            return (
              <div
                key={idKey(addr)}
                onClick={() => setSelectedId(a.id)}
                className={`relative group rounded-3xl border p-6 cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-sm ${
                  isSelected
                    ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] shadow-emerald-500/5"
                    : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0f182c] hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-block bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[10px] font-bold tracking-wider rounded-lg px-2.5 py-1 uppercase">
                      {nodeOf(a.label || "Address")}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-300 dark:border-white/20 group-hover:border-emerald-400"
                      }`}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {nodeOf(a.street)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {nodeOf(a.area_detail || "—")}
                    </p>
                    <RecipientLine address={addr} className="mt-1" />
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{nodeOf(rec(a.contact)?.phone || "No phone")}</span>
                  {isSelected && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Selected
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
