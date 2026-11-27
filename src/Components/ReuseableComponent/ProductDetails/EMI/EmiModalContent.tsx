"use client";

import React, { useState, useMemo, useEffect } from "react";
import { TbHomeDollar } from "react-icons/tb";
import { AiOutlineTag } from "react-icons/ai";
import type { EmiBankCalc, EmiModalContentProps, EmiPlanRow } from "@/types/props/product";
import { fieldsOf, isList, orList, rec, requireString } from "@/lib/json";
import { keyFrom, nodeOf } from "@/lib/render";

export default function EmiModalContent({ product }: EmiModalContentProps) {
  const [search, setSearch] = useState("");
  // bank names are raw API values
  const [selectedBank, setSelectedBank] = useState<unknown>("");
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [banks, setBanks] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const defaultPrice =
    Number(rec(product)?.discount_amount) > 0
      ? rec(product)?.final_price || rec(product)?.regular_price || 0
      : rec(product)?.regular_price || 0;

  const [customAmount, setCustomAmount] = useState(String(defaultPrice));
  // Raw bank+tenure data fetched once — no re-fetch on amount change
  const [rawBanks, setRawBanks] = useState<unknown[]>([]);

  // Fetch bank/tenure data once on mount
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${baseUrl}/emi-list?amount=1000`, {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        const json: unknown = await response.json();
        // `data.data` threw for a null body; fieldsOf keeps that
        const list = fieldsOf(json).data;
        if (list && isList(list)) {
          setRawBanks(list);
          const bankNames = list.map((b) => fieldsOf(b).bank_name);
          setBanks(bankNames);
          setSelectedBank(bankNames[0] || "");
        } else {
          throw new Error("Invalid API response structure");
        }
        setError(null);
      } catch (err) {
        setError(fieldsOf(err).message);
      } finally {
        setLoading(false);
      }
    };
    fetchBanks();
  }, []);

  // Recalculate EMI locally when amount changes — no API call
  const calcAmount = Number(customAmount) > 0 ? Number(customAmount) : 0;

  const emiDataCalculated = useMemo(() => {
    if (!calcAmount) return [];
    return rawBanks.map((bank): EmiBankCalc => ({
      // `...bank` (Object.assign copies the same own enumerable properties)
      ...Object.assign({}, bank),
      // `(bank.installments || []).map` — throws for a null bank / non-array, as before
      installments: orList(fieldsOf(bank).installments).map((entry) => {
        const plan = fieldsOf(entry);
        // parseFloat / parseInt stringify their argument
        const rate = parseFloat(String(plan.charge_percent));
        const months = parseInt(String(plan.months));
        const totalPay = Math.round(calcAmount + (calcAmount * rate) / 100);
        const monthlyEmi = Math.round(totalPay / months);
        return {
          months,
          charge_percent: rate,
          monthly_emi: monthlyEmi,
          effective_cost: totalPay,
        };
      }),
    }));
  }, [rawBanks, calcAmount]);

  const filteredBanks = useMemo(() => {
    return banks.filter((bank) =>
      requireString(bank).toLowerCase().includes(search.toLowerCase()),
    );
  }, [banks, search]);

  // Get installments for selected bank
  const selectedBankData = useMemo(() => {
    return emiDataCalculated.find((item) => item.bank_name === selectedBank);
  }, [selectedBank, emiDataCalculated]);

  // Format installments data for display
  const installmentsDisplay = useMemo(() => {
    if (!selectedBankData || !selectedBankData.installments) {
      return [];
    }
    return selectedBankData.installments.map((plan): EmiPlanRow => ({
      month: plan.months,
      emi: plan.monthly_emi.toFixed(2),
      rate: plan.charge_percent.toFixed(2),
      cost: plan.effective_cost.toFixed(2),
    }));
  }, [selectedBankData]);

  return (
    <div className="relative rounded-4xl  w-full ">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center gap-4 mb-4 lg:mb-6 md:mb-8">
        <h1 className="text-lg lg:text-2xl 2xl:text-3xl font-semibold text-gray-900">
          EMI Options
        </h1>
        <button className="bg-secondary text-white text-xs lg:text-sm font-medium px-8 py-3 rounded-xl transition hover:opacity-90 self-start md:self-auto cursor-pointer">
          EMI Policy
        </button>
      </div>

      {/* MAIN CONTAINER CONTENT - Changed md:items-start to md:items-stretch */}
      <div className="flex flex-col md:grid md:grid-cols-2 gap-2 lg:gap-6 md:gap-8 md:items-stretch">
        {/* LEFT SECTION: BANK SELECTION */}
        <div className="flex flex-col h-full">
          {/* Label */}
          <div className="flex items-center gap-2 text-gray-500 font-medium mb-3 lg:mt-1.5">
            <TbHomeDollar className="text-xl" />
            <span className="text-base md:text-lg">Bank Name</span>
          </div>

          {/* DESKTOP VIEW: Left list panel */}
          <div className="hidden md:flex flex-col bg-[#EFEFEF] rounded-2xl p-4 flex-1">
            {/* Search Bar Input Container */}
            <div className="shrink-0">
              <input
                type="text"
                placeholder="Search bank..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 mb-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-teal-600 text-sm text-gray-700"
              />
            </div>

            {/* FIXED CONTAINER: h-0 tells the browser to safely calculate absolute dimensions relative to the grid height */}
            <div className="flex-1 relative h-0 w-full">
              <div className="absolute inset-0 overflow-y-auto pr-1 scrollbar-thin">
                <div className="space-y-1">
                  {loading ? (
                    // Skeleton Loader for Banks
                    <>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={`skeleton-${i}`}
                          className="w-full px-5 py-3.5 rounded-xl bg-gray-200 animate-pulse"
                        />
                      ))}
                    </>
                  ) : error ? (
                    <div className="text-red-400 text-sm p-4 text-center">
                      Error: {nodeOf(error)}
                    </div>
                  ) : filteredBanks.length === 0 ? (
                    <div className="text-gray-400 text-sm p-4 text-center">
                      No banks found
                    </div>
                  ) : (
                    filteredBanks.map((bank) => (
                      <button
                        key={keyFrom(bank)}
                        onClick={() => setSelectedBank(bank)}
                        className={`w-full text-left px-5 py-3.5 rounded-xl text-sm transition-colors duration-150 ${
                          selectedBank === bank
                            ? "bg-secondary text-white font-medium shadow-sm"
                            : "text-gray-600 hover:bg-gray-200/50"
                        }`}
                      >
                        {nodeOf(bank)}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* MOBILE VIEW: Clickable Field Select Box */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileDropdownOpen(true)}
              className="w-full bg-[#F3F4F6] text-gray-400 text-left px-4 py-3.5 rounded-xl flex justify-between items-center text-sm"
            >
              <span className="text-gray-700">
                {nodeOf(selectedBank || "select a bank")}
              </span>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* RIGHT SECTION: CALCULATED PRICING TABULAR LAYOUT */}
        <div className="flex flex-col w-full">
          {/* Header Row */}
          <div className="flex justify-between items-center gap-3 md:gap-2 mb-4 lg:mb-2">
            <div className="flex items-center gap-2 text-gray-500 font-medium shrink-0">
              <AiOutlineTag className="text-xl" />
              <span className="text-base md:text-lg whitespace-nowrap">
                Amount
              </span>
            </div>
            {/* Editable amount input */}
            <div className="border border-gray-300 rounded-xl px-3 py-1 flex items-center bg-white gap-1.5 w-44">
              <input
                type="number"
                min={1}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder={String(defaultPrice)}
                className="font-semibold text-gray-800 text-base md:text-lg w-full outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-xl font-light text-gray-900 shrink-0">৳</span>
            </div>
          </div>

          {/* PLAN CARD LAYOUTS */}
          <div className="space-y-1.5 lg:space-y-2 h-[250px] lg:h-[320px] 2xl:h-[430px] overflow-y-scroll lg:rounded-2xl">
            {/* Table Header row */}
            <div className="grid grid-cols-3 bg-[#F0EEF1] text-gray-500 text-xs md:text-sm font-medium px-4 md:px-6 py-3 rounded-xl">
              <div className="text-center">Plan (Monthly)</div>
              <div className="text-center">EMI</div>
              <div className="text-center">Effective Cost</div>
            </div>

            {/* Row entries */}
            {loading ? (
              // Skeleton Loader for Plans
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={`skeleton-plan-${i}`}
                    className="grid grid-cols-3 bg-[#EAEBED] items-center px-4 md:px-6 py-2 lg:py-4 rounded-xl gap-2"
                  >
                    <div className="h-6 bg-gray-300 rounded animate-pulse" />
                    <div className="flex flex-col gap-1">
                      <div className="h-5 bg-gray-300 rounded animate-pulse" />
                      <div className="h-3 bg-gray-300 rounded animate-pulse w-3/4 mx-auto" />
                    </div>
                    <div className="h-6 bg-gray-300 rounded animate-pulse" />
                  </div>
                ))}
              </>
            ) : error ? (
              <div className="text-red-400 text-sm p-4 text-center col-span-3">
                Error loading plans
              </div>
            ) : installmentsDisplay.length === 0 ? (
              <div className="text-gray-400 text-sm p-4 text-center col-span-3">
                No plans available
              </div>
            ) : (
              installmentsDisplay.map((plan) => (
                <div
                  key={plan.month}
                  className="grid grid-cols-3 bg-[#EAEBED] items-center px-4 md:px-6 py-2 lg:py-4 rounded-xl"
                >
                  <div className="font-semibold text-gray-700 text-xs md:text-lg text-center">
                    {plan.month}
                  </div>
                  <div className="text-center text-xs 2xl:text-base">
                    <div className="text-secondary font-semibold ">
                      ৳ {plan.emi}
                    </div>
                    <div className="text-[10px] 2xl:text-xs text-gray-500 mt-0.5">
                      EMI Charge {plan.rate}%
                    </div>
                  </div>
                  <div className="text-center font-semibold text-secondary text-xs md:text-base 2xl:text-lg">
                    ৳ {plan.cost}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* INTERACTIVE MOBILE SHEET DROPDOWN */}
      {isMobileDropdownOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-end md:hidden">
          {/* Overlay mask click-out backdrop */}
          <div
            className="absolute inset-0"
            onClick={() => setIsMobileDropdownOpen(false)}
          />

          {/* Interactive panel */}
          <div className="bg-[#EFEFEF] w-full rounded-t-[1.75rem] relative z-10 p-4 pt-0 h-[80vh] flex flex-col pb-20">
            <div className="flex justify-center pt-2 pb-4">
              <div className="w-10 h-1 bg-gray-400 rounded-full opacity-80" />
            </div>
            {/* Header input container - Cleaned up without the down arrow */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Select a bank"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#E5E7EB] text-gray-800 placeholder-gray-400 px-5 py-3.5 rounded-2xl focus:outline-none text-[15px]"
              />
            </div>
            {/* Mobile list scroll contents */}
            <div className="overflow-y-auto overflow-x-hidden pr-1 flex-1 pb-4 scrollbar-thin">
              <div className="space-y-1">
                {loading ? (
                  // Skeleton Loader for Mobile Banks
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={`skeleton-mobile-${i}`}
                        className="w-full px-5 py-4 rounded-xl bg-gray-200 animate-pulse"
                      />
                    ))}
                  </>
                ) : error ? (
                  <div className="text-red-400 text-sm p-4 text-center">
                    Error: {nodeOf(error)}
                  </div>
                ) : filteredBanks.length === 0 ? (
                  <div className="text-gray-400 text-sm p-8 text-center">
                    No banks found
                  </div>
                ) : (
                  filteredBanks.map((bank) => (
                    <button
                      key={keyFrom(bank)}
                      onClick={() => {
                        setSelectedBank(bank);
                        setIsMobileDropdownOpen(false);
                      }}
                      className={`w-full text-left px-5 py-4 text-[16px] rounded-xl transition-all duration-150 ${
                        selectedBank === bank
                          ? "bg-secondary text-white font-medium shadow-sm"
                          : "text-gray-700 border-b border-gray-200/40 last:border-0 active:bg-gray-300/50"
                      }`}
                    >
                      {nodeOf(bank)}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
