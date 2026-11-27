import SellYourDevice from "@/Components/SellYourDevice/SellYourDevice";
import { getCategoryTree, getBrands, getDistricts } from "@/lib/api";
import Link from "next/link";
import { List } from "lucide-react";

export default async function SellYourDevicePage() {
  const [categories, brands, districts] = await Promise.all([
    getCategoryTree(),
    getBrands(),
    getDistricts(),
  ]);

  return (
    <div className="w-full space-y-6">
      <title>Sell Your Device - Tekzo Dashboard</title>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Sell Your Device
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1">
            List your pre-owned smartphone, laptop, or gadget for instant evaluation
          </p>
        </div>

        <Link
          href="/dashboard/my-sell-requests"
          className="self-start sm:self-auto inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all"
        >
          <List size={15} />
          <span>My Listings</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm p-5 sm:p-8">
        <SellYourDevice
          categories={categories}
          brands={brands}
          districts={districts}
        />
      </div>
    </div>
  );
}
