"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Pencil,
  Trash2,
  TriangleAlert,
  Smartphone,
} from "lucide-react";
import { useState, useEffect } from "react";
import clientFetchAPI from "@/utils/clientFetchAPI";
import type { DeleteConfirmModalProps, SellRequestRowProps, SellRequestStatusStyle, SkeletonRowProps, StatusBadgeProps } from "@/types/props/dashboard";
import { errMessage, fieldsOf, filterList, findList, itemOpt, lengthStrict, mapList, rec, toDateInput } from "@/lib/json";
import { idKey, nodeOf, str } from "@/lib/render";

const STATUS_STYLES = {
  0: { label: "Inactive", className: "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400" },
  1: { label: "Active", className: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20" },
  2: { label: "Pending", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" },
  3: { label: "Rejected", className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" },
  4: { label: "Approved", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" },
};

function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, SellRequestStatusStyle> = {
    0: { label: "Inactive", dot: "bg-slate-400", pill: "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400" },
    1: { label: "Active", dot: "bg-sky-500", pill: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20" },
    2: { label: "Pending Review", dot: "bg-amber-500", pill: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" },
    3: { label: "Rejected", dot: "bg-rose-500", pill: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" },
    4: { label: "Approved", dot: "bg-emerald-500", pill: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" },
  };

  const item = styles[String(status)] ?? {
    label: "Unknown",
    dot: "bg-slate-400",
    pill: "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
}

function formatDate(dateStr: unknown) {
  if (!dateStr) return "";
  return new Date(toDateInput(dateStr)).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });
}

function DeleteConfirmModal({ request, onCancel, onConfirm, deleting }: DeleteConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 transition-all"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-[#0f182c] border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-sm p-6 sm:p-7 text-center transition-transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4 text-rose-500 shadow-sm">
          <TriangleAlert size={26} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
          Delete this listing?
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            &quot;{nodeOf(fieldsOf(request).ad_title)}&quot;
          </span>{" "}
          will be permanently removed. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-50 shadow-md shadow-rose-500/20 cursor-pointer"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RequestRow({ request, isLast, onDeleteClick, deleting }: SellRequestRowProps) {
  const r = fieldsOf(request);
  const coverImage =
    (r.images === null || r.images === undefined ? undefined : rec(findList(r.images, (img) => fieldsOf(img).is_primary))?.url) ||
    rec(itemOpt(r.images, 0))?.url ||
    null;

  return (
    <div
      className={`group flex items-center gap-4 py-4.5 transition-colors ${!isLast ? "border-b border-slate-100 dark:border-white/5" : ""}`}
    >
      {/* Thumbnail */}
      <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-900 flex-shrink-0 shadow-sm group-hover:border-emerald-500/30 transition-colors">
        {coverImage ? (
          <Image
            src={str(coverImage) ?? ""}
            alt={str(r.ad_title) ?? ""}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="64px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/[0.02]">
            <ImageIcon size={20} className="text-slate-400 dark:text-slate-500" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {nodeOf(r.ad_title)}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {nodeOf(rec(r.category)?.name)}
            {rec(r.brand)?.name ? ` · ${String(fieldsOf(r.brand).name)}` : ""}
          </span>
          <span className="text-slate-300 dark:text-white/10">•</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {formatDate(r.created_at)}
          </span>
        </div>
      </div>

      {/* Price, Status & Actions */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
          ৳{Number(r.asking_price).toLocaleString()}
        </span>
        <StatusBadge status={r.status} />
        <div className="flex items-center gap-1 mt-0.5">
          <Link
            href={`/dashboard/sell-your-device/${String(r.id)}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            title="Edit Listing"
          >
            <Pencil size={14} />
          </Link>
          <button
            type="button"
            onClick={() => onDeleteClick(request)}
            disabled={deleting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-40 cursor-pointer"
            title="Delete Listing"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonRow({ isLast }: SkeletonRowProps) {
  return (
    <div
      className={`flex items-center gap-4 py-4.5 ${!isLast ? "border-b border-slate-100 dark:border-white/5" : ""}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-white/10 animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
        <div className="h-3 w-24 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" />
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="h-4 w-16 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
        <div className="h-5 w-20 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

export default function MySellRequests() {
  const [requests, setRequests] = useState<unknown>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<unknown>(1);
  const [deletingId, setDeletingId] = useState<unknown>(null);
  const [deleteTarget, setDeleteTarget] = useState<unknown>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await clientFetchAPI(
          `/customer/sell-device-requests?page=${currentPage}`,
          "GET",
        );
        setRequests(rec(rec(res)?.data)?.data ?? []);
        setTotalPages(rec(rec(res)?.data)?.last_page ?? 1);
      } catch (err) {
        setError(errMessage(err) || "Failed to load your listings.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [currentPage]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = fieldsOf(deleteTarget).id;
    setDeletingId(id);
    try {
      await clientFetchAPI(`/customer/sell-device-requests/${String(id)}`, "DELETE");
      setRequests((prev: unknown) => filterList(prev, (r) => fieldsOf(r).id !== id));
      setDeleteTarget(null);
    } catch (err) {
      setError(errMessage(err) || "Failed to delete listing.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      <title>My Sell Requests - Tekzo Dashboard</title>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              My Sell Requests
            </h1>
            {!loading && (
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {nodeOf(lengthStrict(requests))} {lengthStrict(requests) === 1 ? "listing" : "listings"}
              </span>
            )}
          </div>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track approval status and offers for devices you have submitted
          </p>
        </div>

        <Link
          href="/dashboard/sell-your-device"
          className="self-start sm:self-auto inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <Smartphone size={15} />
          <span>+ Sell a Device</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex items-center justify-between">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Submissions Log
          </p>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Page {currentPage} of {nodeOf(totalPages)}
          </span>
        </div>

        <div className="px-6 pb-2">
          {loading &&
            [1, 2, 3].map((i) => <SkeletonRow key={i} isLast={i === 3} />)}

          {nodeOf(error && (
            <div className="py-6 text-center text-xs font-medium text-rose-500 bg-rose-50 dark:bg-rose-500/10 rounded-2xl my-4 border border-rose-200 dark:border-rose-500/20">
              {nodeOf(error)}
            </div>
          ))}

          {!loading && !error && lengthStrict(requests) === 0 && (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-3">
                <Smartphone size={26} />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                You haven&apos;t listed any devices yet
              </p>
              <Link
                href="/dashboard/sell-your-device"
                className="inline-block mt-4 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                + List a Device for Sale
              </Link>
            </div>
          )}

          {!loading &&
            !error &&
            mapList(requests, (request, index) => (
              <RequestRow
                key={idKey(request)}
                request={request}
                isLast={index === Number(lengthStrict(requests)) - 1}
                onDeleteClick={setDeleteTarget}
                deleting={deletingId === fieldsOf(request).id}
              />
            ))}
        </div>
      </div>

      {nodeOf(deleteTarget && (
        <DeleteConfirmModal
          request={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          deleting={deletingId === fieldsOf(deleteTarget).id}
        />
      ))}

      {Number(totalPages) > 1 && (
        <div className="flex justify-center sm:justify-end items-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 disabled:opacity-30 transition-all hover:bg-slate-50 dark:hover:bg-white/10 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: Number(totalPages) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                page === currentPage
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm"
                  : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(Number(totalPages), p + 1))}
            disabled={currentPage === totalPages}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 disabled:opacity-30 transition-all hover:bg-slate-50 dark:hover:bg-white/10 cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
