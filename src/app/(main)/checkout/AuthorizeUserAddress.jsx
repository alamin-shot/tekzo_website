"use client";

import { useState, useEffect } from "react";
import { Home, Briefcase, MapPin, Plus, Check, Loader2 } from "lucide-react";
import clientFetchAPI from "@/utils/clientFetchAPI";
import AddAddressPopup from "@/Components/Dashboard/AddressBook/AddAddressPopup";

// ─── label → icon mapping ───────────────────────────────────────────────────
const LABEL_ICONS = {
  home: Home,
  office: Briefcase,
  others: MapPin,
};

// Capitalise first letter for display
const formatLabel = (label) => label.charAt(0).toUpperCase() + label.slice(1);

export default function AuthorizeUserAddress({ onAddressSelect }) {
  const [rawAddresses, setRawAddresses] = useState([]); // full API array
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(""); // active label tab
  const [selectedId, setSelectedId] = useState(null); // selected address id
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const data = await clientFetchAPI("/customer/addresses", "GET");
      const list = data?.data || [];
      setRawAddresses(list);

      // Auto-select first available tab
      if (list.length > 0) {
        // prefer default_shipping address's label, else first
        const defaultAddr = list.find((a) => a.is_default_shipping);
        const initialTab = defaultAddr ? defaultAddr.label : list[0].label;
        setSelectedTab((prev) => prev || initialTab);
        if (defaultAddr && !selectedId) {
          setSelectedId(defaultAddr.id);
          onAddressSelect?.(defaultAddr);
        } else if (!selectedId && list[0]) {
          setSelectedId(list[0].id);
          onAddressSelect?.(list[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSaveAddress = async (formData) => {
    try {
      const response = await clientFetchAPI(
        "/customer/addresses",
        "POST",
        formData,
      );
      const data = await clientFetchAPI("/customer/addresses", "GET");
      const list = data?.data || [];
      setRawAddresses(list);

      const newId = response?.data?.id || response?.data?.data?.id;
      let newlyAdded = null;

      if (newId) {
        newlyAdded = list.find((a) => String(a.id) === String(newId));
      }
      if (!newlyAdded && list.length > 0) {
        newlyAdded =
          list.find(
            (a) => a.label === formData.label && a.street === formData.street,
          ) || list[list.length - 1];
      }

      if (newlyAdded) {
        setSelectedTab(newlyAdded.label);
        setSelectedId(newlyAdded.id);
        onAddressSelect?.(newlyAdded);
      }

      setIsAddPopupOpen(false);
    } catch (err) {
      console.error("Failed to save address:", err);
      throw err;
    }
  };

  // ── Derived data ─────────────────────────────────────────────────────────

  // Unique labels in order they appear
  const tabs = [...new Set(rawAddresses.map((a) => a.label))];

  // Addresses matching the active tab
  const filteredAddresses = rawAddresses.filter((a) => a.label === selectedTab);

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    setSelectedId(null); // clear selection when switching tab
  };

  const handleSelect = (addr) => {
    setSelectedId(addr.id);
    onAddressSelect?.(addr);
  };

  // ── Address display string ────────────────────────────────────────────────
  const formatAddress = (addr) => {
    const parts = [addr.street, addr.area?.thana, addr.area_detail].filter(
      Boolean,
    );
    return parts.join(", ");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-dark rounded-2xl border border-gray-100 shadow-sm p-6 w-full">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
        Shipping To
      </p>

      {/* ── Tab buttons ── */}
      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
          <Loader2 size={16} className="animate-spin" />
          Loading addresses…
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-5">
            {tabs.reverse().map((tab) => {
              const Icon = LABEL_ICONS[tab] ?? MapPin;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer
                    ${selectedTab === tab ? "bg-secondary border-secondary text-white shadow-md" : "bg-dark border-gray-200 text-gray-600 hover:border-secondary hover:text-secondary"}`}
                >
                  <Icon size={14} />
                  {formatLabel(tab)}
                </button>
              );
            })}

            {/* Add New → opens address popup */}
            <button
              type="button"
              onClick={() => setIsAddPopupOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-dashed border-gray-300 text-gray-400 hover:border-secondary hover:text-secondary transition-all cursor-pointer"
            >
              <Plus size={14} /> Add New
            </button>
          </div>

          {/* ── Address cards ── */}
          <div className="grid gap-3 min-h-[100px]">
            {filteredAddresses.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No addresses found for {formatLabel(selectedTab)}
              </p>
            ) : (
              filteredAddresses.map((addr) => {
                const isSelected = selectedId === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => handleSelect(addr)}
                    className={`flex items-start gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all duration-200 border-1
            ${isSelected ? "bg-secondary/10 border-secondary shadow-sm" : "bg-dark border-transparent hover:border-gray-200"}`}
                  >
                    {/* Radio indicator */}
                    <div
                      className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors
              ${isSelected ? "bg-secondary border-secondary" : "bg-dark border-gray-300"}`}
                    >
                      {isSelected && (
                        <Check
                          size={10}
                          className="text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div>

                    {/* Address info */}
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      {addr.contact && (
                        <p
                          className={`text-[11px] font-bold uppercase tracking-tight ${isSelected ? "text-secondary" : "text-gray-400"}`}
                        >
                          {addr.contact.name} • {addr.contact.phone}
                        </p>
                      )}

                      <span
                        className={`text-sm leading-snug break-words ${isSelected ? "text-secondary font-medium" : "text-gray-700"}`}
                      >
                        {formatAddress(addr)}
                      </span>

                      {/* Badges */}
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {addr.is_default_shipping && (
                          <span className="text-[9px] font-bold bg-secondary/20 text-secondary px-2 py-0.5 rounded uppercase">
                            Default
                          </span>
                        )}
                        {addr.is_default_billing && (
                          <span className="text-[9px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded uppercase">
                            Billing
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {isAddPopupOpen && (
        <AddAddressPopup
          onClose={() => setIsAddPopupOpen(false)}
          onSave={handleSaveAddress}
        />
      )}
    </div>
  );
}
