import React from "react";
import { Package, ShoppingBag, Heart, Edit2, MapPin, User, ArrowRight, Sparkles, Calendar, CheckCircle2, Clock, Truck, XCircle, ShieldCheck, CreditCard } from "lucide-react";
import Link from "next/link";
import { getAuthUser } from "@/fetch-API/getAuthUser";
import { getRecentOrder, getStatistics, getDefaultShippingAndBillingAddress } from "@/fetch-API/getRecentOrder";
import DashboardStatCard from "@/Components/Dashboard/DashboardStatCard";
import { fieldsOf, lengthOpt, lowerOpt, mapOpt, rec, toDateInput } from "@/lib/json";
import { idKey, nodeOf } from "@/lib/render";

const AccountDashboard = async () => {
  const user = await getAuthUser();
  const recentOrders = await getRecentOrder();
  const statistics = await getStatistics();
  const defaultShippingAndBillingAddress = await getDefaultShippingAndBillingAddress();
  const u = rec(user);
  const st = rec(statistics);
  const ship = rec(rec(defaultShippingAndBillingAddress)?.shippingAddress);
  const bill = rec(rec(defaultShippingAndBillingAddress)?.billingAddress);

  // Status badge styling helper
  const getStatusBadge = (status: unknown) => {
    const name = lowerOpt(rec(status)?.name);
    switch (name) {
      case "delivered":
        return {
          style: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          icon: CheckCircle2,
          label: rec(status)?.name || "Delivered",
        };
      case "pending":
        return {
          style: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          icon: Clock,
          label: rec(status)?.name || "Pending",
        };
      case "processing":
        return {
          style: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
          icon: Sparkles,
          label: rec(status)?.name || "Processing",
        };
      case "cancelled":
        return {
          style: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
          icon: XCircle,
          label: rec(status)?.name || "Cancelled",
        };
      case "shipped":
        return {
          style: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
          icon: Truck,
          label: rec(status)?.name || "Shipped",
        };
      default:
        return {
          style: "bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10",
          icon: Clock,
          label: rec(status)?.name || "Order Placed",
        };
    }
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
      <title>Manage Account - Tekzo Dashboard</title>

      {/* ── 2. TOP KPI METRIC CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <DashboardStatCard
          label="Total Orders"
          value={st?.totalOrder || 0}
          icon={Package}
          gradient="from-[#007AFF] to-[#5856D6]"
          shadow="shadow-[0_4px_14px_rgba(0,122,255,0.25)]"
          subText="Recorded purchases"
          href="/dashboard/all-orders"
          linkText="View orders"
        />
        <DashboardStatCard
          label="Products in Bag"
          value={st?.totalCart || 0}
          icon={ShoppingBag}
          gradient="from-[#FF9500] to-[#FF5E3A]"
          shadow="shadow-[0_4px_14px_rgba(255,149,0,0.25)]"
          subText="Items awaiting checkout"
          href="/dashboard/my-bag"
          linkText="View bag"
        />
        <DashboardStatCard
          label="Products in Wishlist"
          value={st?.totalWishlist || 0}
          icon={Heart}
          gradient="from-[#FF2D55] to-[#E11D48]"
          shadow="shadow-[0_4px_14px_rgba(255,45,85,0.25)]"
          subText="Saved favourite gadgets"
          href="/dashboard/wishlist"
          linkText="View wishlist"
        />
      </div>

      {/* ── 3. PROFILE & ADDRESS SUMMARY BENTO ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Profile Card */}
        <div className="bg-white dark:bg-[#0f182c] p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-white/15">
          <div>
            <div className="flex justify-between items-center pb-5 border-b border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-xs shadow-sky-500/20 ring-4 ring-sky-500/10">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Personal Profile</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Primary identity & contact</p>
                </div>
              </div>
              <Link
                href="/dashboard/edit-profile"
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-sky-500/40 text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 flex items-center gap-1.5 text-xs font-bold transition-all bg-slate-50/60 dark:bg-white/[0.02]"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Full Name</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{nodeOf(u?.name || "Customer Name")}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Email Address</span>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">{nodeOf(u?.email || "No email on record")}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Phone Number</span>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">{nodeOf(u?.phone || "No phone on record")}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.06]">
            <Link
              href="/dashboard/profile"
              className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 flex items-center justify-between group transition-colors"
            >
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                View full profile & verification status
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Address Book Card */}
        <div className="bg-white dark:bg-[#0f182c] p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-white/15">
          <div>
            <div className="flex justify-between items-center pb-5 border-b border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs shadow-emerald-500/20 ring-4 ring-emerald-500/10">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Default Addresses</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Shipping & billing destinations</p>
                </div>
              </div>
              <Link
                href="/dashboard/address-book"
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1.5 text-xs font-bold transition-all bg-slate-50/60 dark:bg-white/[0.02]"
              >
                Manage
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
              <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
                <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block mb-1">Default Shipping</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{nodeOf(u?.name || "Recipient")}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                  {rec(ship?.district)?.name
                    ? `${rec(ship?.district)?.name} - ${rec(ship?.area)?.name || ""} - ${ship?.street || ""}`
                    : "No shipping address configured"}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
                <span className="text-[10px] uppercase tracking-wider text-sky-600 dark:text-sky-400 font-bold block mb-1">Default Billing</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{nodeOf(u?.name || "Recipient")}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                  {rec(bill?.district)?.name
                    ? `${rec(bill?.district)?.name} - ${rec(bill?.area)?.name || ""} - ${bill?.street || ""}`
                    : "Same as shipping address"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.06]">
            <Link
              href="/dashboard/address-book"
              className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-between group transition-colors"
            >
              <span>Add or edit delivery addresses</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── 4. RECENT ORDERS TABLE ── */}
      <div className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Recent Orders</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Latest items purchased through your account</p>
          </div>
          <Link href="/dashboard/all-orders" className="text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 flex items-center gap-1.5 transition-colors group">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-white/[0.02] text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-100 dark:border-white/[0.06]">
                <th className="px-6 py-4 font-bold">Invoice</th>
                <th className="px-6 py-4 font-bold">Placed On</th>
                <th className="px-6 py-4 font-bold text-center">Items</th>
                <th className="px-6 py-4 font-bold">Total</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {lengthOpt(recentOrders) === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 bg-slate-100 dark:bg-white/[0.04] rounded-2xl flex items-center justify-center mb-3 text-slate-400 dark:text-slate-500">
                        <Package className="w-7 h-7" />
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No recent orders on record</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">When you place an order, its real-time shipping status and delivery updates will appear right here.</p>
                      <Link href="/" className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity">
                        Explore Store
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                mapOpt(recentOrders, (order) => {
                  const badge = getStatusBadge(fieldsOf(order).status);
                  const StatusIcon = badge.icon;
                  return (
                    <tr key={idKey(order)} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-xs font-bold">
                        <Link href={`/dashboard/order-status/${String(fieldsOf(order).id)}`} className="font-mono text-sky-600 hover:text-sky-700 dark:text-sky-400 hover:underline font-bold">
                          {nodeOf(fieldsOf(order).invoice_number)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {fieldsOf(order).created_at
                            ? new Date(toDateInput(fieldsOf(order).created_at)).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400 text-center font-medium">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.04] text-[11px] font-bold">{nodeOf(fieldsOf(order).total_item || 1)}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-extrabold text-slate-900 dark:text-white">৳{Number(fieldsOf(order).grand_total || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${badge.style}`}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{nodeOf(badge.label)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/order-status/${String(fieldsOf(order).id)}`}
                          className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountDashboard;
