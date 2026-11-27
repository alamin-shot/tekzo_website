"use client";

import AddAddressPopup from "@/Components/Dashboard/AddressBook/AddAddressPopup";
import Link from "next/link";
import { useState, useEffect } from "react";
import clientFetchAPI from "@/utils/clientFetchAPI";
import { FiMapPin, FiPlus, FiEdit3, FiPhone, FiCheckCircle } from "react-icons/fi";
import type { AddressSavePayload } from "@/types/props/dashboard";
import { fieldsOf, lengthStrict, mapList, rec } from "@/lib/json";
import { idKey, nodeOf } from "@/lib/render";

export default function AddressBook() {
  const [addresses, setAddresses] = useState<unknown>([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<unknown>(null);

  // ✅ Addresses fetch
  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const data = await clientFetchAPI("/customer/addresses", "GET");
      setAddresses(rec(data)?.data || []);
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSaveAddress = async (formData: AddressSavePayload) => {
    try {
      if (rec(editData)?.id) {
        await clientFetchAPI(
          `/customer/addresses/${String(fieldsOf(editData).id)}`,
          "PUT",
          formData,
        );
      } else {
        await clientFetchAPI("/customer/addresses", "POST", formData);
      }
      await fetchAddresses();
      setEditData(null);
    } catch (err) {
      console.error("Failed to save address:", err);
    }
  };

  return (
    <div className="w-full space-y-6">
      <title>Address Book - Tekzo Dashboard</title>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Address Book
            </h1>
            {!loading && (
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {nodeOf(lengthStrict(addresses))} {lengthStrict(addresses) === 1 ? "address" : "addresses"}
              </span>
            )}
          </div>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your delivery and billing locations for lightning fast checkouts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/default-shipping-address"
            className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0f182c] shadow-sm hover:border-emerald-500/30 transition-all"
          >
            Default Shipping
          </Link>
          <Link
            href="/dashboard/default-billing-address"
            className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0f182c] shadow-sm hover:border-emerald-500/30 transition-all"
          >
            Default Billing
          </Link>
          <button
            onClick={() => setEditData({})}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer"
          >
            <FiPlus size={16} />
            <span>Add Address</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/10 p-6 space-y-4 animate-pulse shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-20 bg-slate-200 dark:bg-white/10 rounded-lg" />
                <div className="h-5 w-16 bg-slate-200 dark:bg-white/10 rounded-lg" />
              </div>
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-white/10 rounded-lg" />
              <div className="h-3 w-1/2 bg-slate-100 dark:bg-white/5 rounded-lg" />
              <div className="h-9 bg-slate-100 dark:bg-white/5 rounded-xl w-full pt-2" />
            </div>
          ))}
        </div>
      ) : lengthStrict(addresses) === 0 ? (
        <div className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm p-12 sm:p-16 text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto mb-4 shadow-sm">
            <FiMapPin size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No Addresses Saved Yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto mb-6">
            Add your home or office address to enable instant one-click checkouts and shipment tracking.
          </p>
          <button
            onClick={() => setEditData({})}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-widest px-7 py-3.5 rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <FiPlus size={16} />
            <span>Add First Address</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {mapList(addresses, (addr) => (
            <div
              key={idKey(addr)}
              className="group bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between p-6"
            >
              <div className="space-y-3.5">
                {/* Top tags */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                    <FiMapPin size={11} className="text-slate-400" />
                    {nodeOf(fieldsOf(addr).label || "Address")}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {nodeOf(fieldsOf(addr).is_default_shipping && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <FiCheckCircle size={10} /> Shipping
                      </span>
                    ))}
                    {nodeOf(fieldsOf(addr).is_default_billing && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                        <FiCheckCircle size={10} /> Billing
                      </span>
                    ))}
                  </div>
                </div>

                {/* Street address */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {nodeOf(fieldsOf(addr).street)}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {nodeOf(fieldsOf(addr).area_detail || "—")}
                  </p>
                </div>

                {/* Phone */}
                {nodeOf(rec(rec(addr)?.contact)?.phone && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.02] px-3 py-2 rounded-xl border border-slate-100 dark:border-white/5">
                    <FiPhone size={13} className="text-slate-400" />
                    <span className="font-semibold">{nodeOf(fieldsOf(fieldsOf(addr).contact).phone)}</span>
                  </div>
                ))}
              </div>

              {/* Card Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {fieldsOf(addr).thana ? `${String(fieldsOf(addr).thana)}, ` : ""}{nodeOf(fieldsOf(addr).postcode || "")}
                </span>
                <button
                  onClick={() => setEditData(addr)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 py-1 px-2.5 rounded-lg hover:bg-emerald-500/10 transition-colors cursor-pointer"
                >
                  <FiEdit3 size={13} />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          ))}

          {/* Add New Address Card */}
          <button
            onClick={() => setEditData({})}
            className="group rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 bg-slate-50/50 dark:bg-white/[0.01] hover:bg-emerald-500/[0.02] p-8 flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer min-h-[200px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 flex items-center justify-center text-slate-400 dark:text-slate-400 group-hover:text-emerald-500 transition-colors shadow-sm">
              <FiPlus size={22} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Add New Address
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Save another location for fast shipping
              </p>
            </div>
          </button>
        </div>
      )}

      {editData !== null && (
        <AddAddressPopup
          initialData={editData}
          onClose={() => setEditData(null)}
          onSave={handleSaveAddress}
        />
      )}
    </div>
  );
}
