"use client";

import { useEffect, useState, useRef } from "react";
import { lockScroll, unlockScroll } from "@/utils/scrollLock";
import { Filter, X, RotateCcw } from "lucide-react";

// --- Sub-components ---

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[11px] font-medium">
      {label}
      <button
        onClick={onRemove}
        className="w-4 h-4 rounded-full bg-secondary text-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer shrink-0"
      >
        <X size={10} strokeWidth={3} />
      </button>
    </span>
  );
}

// --- Mobile Filter Sidebar ---

export function MobileFilterSidebar({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  activeFilterCount,
  onResetFilters,
  conditions = [],
  storages = [],
  storageSearchTerm = "",
  onStorageSearchChange = () => {},
}) {
  const sidebarRef = useRef(null);
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);
  const [showStorageDropdown, setShowStorageDropdown] = useState(false);
  const conditionDropdownRef = useRef(null);
  const storageDropdownRef = useRef(null);

  // Filter storages based on search
  const filteredStorages = storages.filter((s) =>
    s.name.toLowerCase().includes(storageSearchTerm.toLowerCase()),
  );

  // Sort storages: items without "/" sorted by GB value (lowest to highest), then items with "/"
  const sortedStorages = [...filteredStorages].sort((a, b) => {
    const aHasSlash = a.name.includes("/");
    const bHasSlash = b.name.includes("/");

    // If one has slash and other doesn't, item without slash comes first
    if (aHasSlash !== bHasSlash) {
      return aHasSlash ? 1 : -1;
    }

    // Both have slash or both don't have slash - sort by first GB value
    const aMatch = a.name.match(/(\d+)\s*(GB|TB)/i);
    const bMatch = b.name.match(/(\d+)\s*(GB|TB)/i);

    if (!aMatch || !bMatch) return 0;

    let aValue = parseInt(aMatch[1]);
    if (aMatch[2].toUpperCase() === "TB") {
      aValue = aValue * 1024;
    }

    let bValue = parseInt(bMatch[1]);
    if (bMatch[2].toUpperCase() === "TB") {
      bValue = bValue * 1024;
    }

    return aValue - bValue;
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        conditionDropdownRef.current &&
        !conditionDropdownRef.current.contains(e.target)
      ) {
        setShowConditionDropdown(false);
      }
      if (
        storageDropdownRef.current &&
        !storageDropdownRef.current.contains(e.target)
      ) {
        setShowStorageDropdown(false);
      }
    };

    if (showConditionDropdown || showStorageDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showConditionDropdown, showStorageDropdown]);

  useEffect(() => {
    if (isOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }
    return () => unlockScroll();
  }, [isOpen]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target))
        onClose();
    };
    if (isOpen) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 z-5000 lg:hidden transition-all duration-300 ${isOpen ? "visible" : "invisible"}`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div
        ref={sidebarRef}
        className={`absolute right-0 top-0 h-full w-full bg-white shadow-2xl transition-transform duration-300 ease-out transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <div className="flex items-center gap-2.5">
              <Filter size={18} className="text-secondary" />
              <span className="text-sm font-semibold text-gray-900">
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-secondary text-white text-[10px] rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900"
            >
              <X size={20} />
            </button>
          </div>

          {/* Filter Content */}
          <div className="p-4 space-y-8 ">
            {/* Condition Filter - Dynamic from API (No Search) */}
            {conditions.length > 0 && (
              <div>
                <h4 className="text-[13px] font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-secondary rounded-full"></span>
                  Condition
                </h4>
                <div ref={conditionDropdownRef} className="relative">
                  {/* Dropdown Button */}
                  <button
                    onClick={() =>
                      setShowConditionDropdown(!showConditionDropdown)
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 bg-white flex items-center justify-between hover:border-gray-300 transition-colors focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20"
                  >
                    <span>
                      {filters.condition
                        ? conditions.find(
                            (c) => c.id === parseInt(filters.condition),
                          )?.name || "Select Condition"
                        : "Select Condition"}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className={`transition-transform ${showConditionDropdown ? "rotate-180" : ""}`}
                    >
                      <path d="M2 5l5 5 5-5" />
                    </svg>
                  </button>

                  {/* Dropdown Options (No Search) */}
                  {showConditionDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      {/* Dropdown Options */}
                      <div className="max-h-48 overflow-y-auto">
                        {conditions.length > 0 ? (
                          conditions.map((condition) => (
                            <button
                              key={condition.id}
                              onClick={() => {
                                onFilterChange(
                                  "condition",
                                  String(condition.id),
                                );
                                setShowConditionDropdown(false);
                              }}
                              className={`w-full px-4 py-2.5 text-left text-[13px] font-medium transition-colors ${
                                filters.condition === String(condition.id)
                                  ? "bg-secondary/10 text-secondary border-l-2 border-secondary"
                                  : "text-gray-700 hover:bg-gray-50 border-l-2 border-transparent"
                              }`}
                            >
                              {condition.name}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-center text-[12px] text-gray-600">
                            No conditions found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Storage Filter - Dynamic from API with Search Dropdown */}
            {storages.length > 0 && (
              <div>
                <h4 className="text-[13px] font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-secondary rounded-full"></span>
                  Storage Capacity
                </h4>
                <div ref={storageDropdownRef} className="relative">
                  {/* Dropdown Button */}
                  <button
                    onClick={() => setShowStorageDropdown(!showStorageDropdown)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 bg-white flex items-center justify-between hover:border-gray-300 transition-colors focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20"
                  >
                    <span>
                      {filters.storage
                        ? storages.find(
                            (s) => s.id === parseInt(filters.storage),
                          )?.name || "Select Storage"
                        : "Select Storage"}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className={`transition-transform ${showStorageDropdown ? "rotate-180" : ""}`}
                    >
                      <path d="M2 5l5 5 5-5" />
                    </svg>
                  </button>

                  {/* Search Input */}
                  {showStorageDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <input
                        type="text"
                        placeholder="Search storage..."
                        value={storageSearchTerm}
                        onChange={(e) => onStorageSearchChange(e.target.value)}
                        className="w-full px-4 py-2 border-b border-gray-100 text-[12px] focus:outline-none focus:ring-0"
                        autoFocus
                      />

                      {/* Dropdown Options */}
                      <div className="max-h-48 overflow-y-auto">
                        {filteredStorages.length > 0 ? (
                          sortedStorages.map((storage) => (
                            <button
                              key={storage.id}
                              onClick={() => {
                                onFilterChange("storage", String(storage.id));
                                setShowStorageDropdown(false);
                                onStorageSearchChange("");
                              }}
                              className={`w-full px-4 py-2.5 text-left text-[13px] font-medium transition-colors ${
                                filters.storage === String(storage.id)
                                  ? "bg-secondary/10 text-secondary border-l-2 border-secondary"
                                  : "text-gray-700 hover:bg-gray-50 border-l-2 border-transparent"
                              }`}
                            >
                              {storage.name}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-center text-[12px] text-gray-600">
                            No storages found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* --- Added Active Filters Section --- */}
            {activeFilterCount > 0 && (
              <div className="pb-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] text-gray-600 uppercase font-bold tracking-wider">
                    Active Filters
                  </span>
                  <button
                    onClick={onResetFilters}
                    className="text-[11px] text-secondary font-bold"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.condition && (
                    <FilterChip
                      label={
                        conditions.find(
                          (c) => c.id === parseInt(filters.condition),
                        )?.name || filters.condition
                      }
                      onRemove={() => onFilterChange("condition", "")}
                    />
                  )}
                  {filters.storage && (
                    <FilterChip
                      label={
                        storages.find((s) => s.id === parseInt(filters.storage))
                          ?.name || filters.storage
                      }
                      onRemove={() => onFilterChange("storage", "")}
                    />
                  )}
                </div>
              </div>
            )}

            <div className="text-right">
              <button
                onClick={onClose}
                className="bg-secondary text-white py-2 px-4 text-sm rounded-md "
              >
                See Result
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Desktop Filter Bar ---

export function DesktopFilterBar({
  filters,
  onFilterChange,
  activeFilterCount,
  onResetFilters,
  conditions = [],
  storages = [],
  storageSearchTerm = "",
  onStorageSearchChange = () => {},
}) {
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);
  const [showStorageDropdown, setShowStorageDropdown] = useState(false);
  const conditionDropdownRef = useRef(null);
  const storageDropdownRef = useRef(null);

  // Filter storages based on search
  const filteredStorages = storages.filter((s) =>
    s.name.toLowerCase().includes(storageSearchTerm.toLowerCase()),
  );

  // Sort storages: items without "/" sorted by GB value (lowest to highest), then items with "/"
  const sortedStorages = [...filteredStorages].sort((a, b) => {
    const aHasSlash = a.name.includes("/");
    const bHasSlash = b.name.includes("/");

    // If one has slash and other doesn't, item without slash comes first
    if (aHasSlash !== bHasSlash) {
      return aHasSlash ? 1 : -1;
    }

    // Both have slash or both don't have slash - sort by first GB value
    const aMatch = a.name.match(/(\d+)\s*(GB|TB)/i);
    const bMatch = b.name.match(/(\d+)\s*(GB|TB)/i);

    if (!aMatch || !bMatch) return 0;

    let aValue = parseInt(aMatch[1]);
    if (aMatch[2].toUpperCase() === "TB") {
      aValue = aValue * 1024;
    }

    let bValue = parseInt(bMatch[1]);
    if (bMatch[2].toUpperCase() === "TB") {
      bValue = bValue * 1024;
    }

    return aValue - bValue;
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        conditionDropdownRef.current &&
        !conditionDropdownRef.current.contains(e.target)
      ) {
        setShowConditionDropdown(false);
      }
      if (
        storageDropdownRef.current &&
        !storageDropdownRef.current.contains(e.target)
      ) {
        setShowStorageDropdown(false);
      }
    };

    if (showConditionDropdown || showStorageDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showConditionDropdown, showStorageDropdown]);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm mb-6 ">
      <div className="p-4 flex items-center gap-6">
        {/* Main Label */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Filter size={15} className="text-secondary" strokeWidth={2.5} />
          <span className="text-[11px] text-gray-600 uppercase tracking-[0.15em] select-none">
            Filter By
            {activeFilterCount > 0 && (
              <span className="ml-2 font-bold text-secondary">
                ({activeFilterCount})
              </span>
            )}
          </span>
        </div>

        {/* VR Bar */}
        <div className="w-px h-6 bg-gray-100" />

        {/* Condition Filter - Dynamic from API (No Search) */}
        {conditions.length > 0 && (
          <>
            <div className="flex items-center gap-4">
              <label className="text-[12px] text-gray-600 shrink-0">
                Condition:
              </label>
              <div ref={conditionDropdownRef} className="relative">
                {/* Dropdown Button */}
                <button
                  onClick={() =>
                    setShowConditionDropdown(!showConditionDropdown)
                  }
                  className="px-3.5 py-1.5 rounded-lg text-[12px] font-medium text-gray-700 bg-white border border-gray-200 flex items-center gap-2 hover:border-gray-300 transition-colors focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20"
                >
                  <span>
                    {filters.condition
                      ? conditions.find(
                          (c) => c.id === parseInt(filters.condition),
                        )?.name || "Select"
                      : "Select Condition"}
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`transition-transform ${showConditionDropdown ? "rotate-180" : ""}`}
                  >
                    <path d="M2 4l4 4 4-4" />
                  </svg>
                </button>

                {/* Dropdown Menu (No Search) */}
                {showConditionDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
                    <div className="max-h-40 overflow-y-auto">
                      {conditions.length > 0 ? (
                        conditions.map((condition) => (
                          <button
                            key={condition.id}
                            onClick={() => {
                              onFilterChange("condition", String(condition.id));
                              setShowConditionDropdown(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-[12px] font-medium transition-colors ${
                              filters.condition === String(condition.id)
                                ? "bg-secondary/10 text-secondary border-l-2 border-secondary"
                                : "text-gray-700 hover:bg-gray-50 border-l-2 border-transparent"
                            }`}
                          >
                            {condition.name}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-center text-[12px] text-gray-600">
                          No conditions found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* VR Bar */}
            <div className="w-px h-6 bg-gray-100" />
          </>
        )}

        {/* Storage Filter - Dynamic from API with Search Dropdown */}
        {storages.length > 0 && (
          <div className="flex items-center gap-4">
            <label className="text-[12px] text-gray-600 shrink-0">
              Storage:
            </label>
            <div ref={storageDropdownRef} className="relative">
              {/* Dropdown Button */}
              <button
                onClick={() => setShowStorageDropdown(!showStorageDropdown)}
                className="px-3.5 py-1.5 rounded-lg text-[12px] font-medium text-gray-700 bg-white border border-gray-200 flex items-center gap-2 hover:border-gray-300 transition-colors focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20"
              >
                <span>
                  {filters.storage
                    ? storages.find((s) => s.id === parseInt(filters.storage))
                        ?.name || "Select"
                    : "Select Storage"}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className={`transition-transform ${showStorageDropdown ? "rotate-180" : ""}`}
                >
                  <path d="M2 4l4 4 4-4" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showStorageDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Search storage..."
                    value={storageSearchTerm}
                    onChange={(e) => onStorageSearchChange(e.target.value)}
                    className="w-full px-3 py-2 border-b border-gray-100 text-[12px] focus:outline-none focus:ring-0"
                    autoFocus
                  />
                  <div className="max-h-40 overflow-y-auto">
                    {filteredStorages.length > 0 ? (
                      sortedStorages.map((storage) => (
                        <button
                          key={storage.id}
                          onClick={() => {
                            onFilterChange("storage", String(storage.id));
                            setShowStorageDropdown(false);
                            onStorageSearchChange("");
                          }}
                          className={`w-full px-3 py-2 text-left text-[12px] font-medium transition-colors ${
                            filters.storage === String(storage.id)
                              ? "bg-secondary/10 text-secondary border-l-2 border-secondary"
                              : "text-gray-700 hover:bg-gray-50 border-l-2 border-transparent"
                          }`}
                        >
                          {storage.name}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-center text-[12px] text-gray-600">
                        No storages found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Active State Bar */}
      <div className="px-4 py-2.5 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between min-h-[48px]">
        {activeFilterCount > 0 ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600 uppercase tracking-tight mr-1">
                Active:
              </span>
              {filters.condition && (
                <FilterChip
                  label={
                    conditions.find((c) => c.id === parseInt(filters.condition))
                      ?.name || filters.condition
                  }
                  onRemove={() => onFilterChange("condition", "")}
                />
              )}
              {filters.storage && (
                <FilterChip
                  label={
                    storages.find((s) => s.id === parseInt(filters.storage))
                      ?.name || filters.storage
                  }
                  onRemove={() => onFilterChange("storage", "")}
                />
              )}
            </div>
            <button
              onClick={onResetFilters}
              className="text-[11px] text-gray-600 hover:text-red-500 transition-colors flex items-center gap-1.5 cursor-pointer group"
            >
              <RotateCcw
                size={12}
                className="group-hover:-rotate-45 transition-transform duration-300"
              />
              Reset all filters
            </button>
          </>
        ) : (
          <p className="text-[11px] text-gray-400 italic">
            No filters applied — showing all available inventory
          </p>
        )}
      </div>
    </div>
  );
}
