import SellYourDevice from "@/Components/SellYourDevice/SellYourDevice";
import { getCategoryTree, getBrands, getDistricts } from "@/lib/api";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function EditSellYourDevicePage({ params }) {
  const { id } = await params;
  const [categories, brands, districts] = await Promise.all([
    getCategoryTree(),
    getBrands(),
    getDistricts(),
  ]);

  return (
    <div className="w-full space-y-6">
      <title>Edit Listing - Tekzo Dashboard</title>

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/my-sell-requests"
          className="w-10 h-10 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0f182c] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm hover:border-slate-300 dark:hover:border-white/20 transition-colors"
          title="Back to My Listings"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Edit Listing
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Update device specifications, pricing, and condition details
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm p-5 sm:p-8">
        <SellYourDevice
          categories={categories}
          brands={brands}
          districts={districts}
          requestId={id}
        />
      </div>
    </div>
  );
}
