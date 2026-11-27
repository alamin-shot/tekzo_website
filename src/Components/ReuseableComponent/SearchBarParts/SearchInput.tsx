import type { SearchInputProps } from "@/types/search";
import { IoCloseOutline } from "react-icons/io5";

// The search text box plus its clear (×) button.
export default function SearchInput({ value, onChange, onFocus, isModalOpen, isListening, inputRef, clearBtnRef }: SearchInputProps) {
  return (
    <div className="relative w-full lg:w-[48%] h-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        className={`${isModalOpen ? "bg-white" : "bg-dark"} lg:bg-transparent h-full rounded-xl pl-12 lg:pl-7 xl:pl-10 pr-10 lg:pr-22 text-base lg:text-sm xl:text-base py-2 w-full transition-all duration-200 outline-transparent focus:outline-secondary focus:outline-1 lg:focus:outline-none relative z-[111] placeholder:text-zinc-600`}
        placeholder={isListening ? "Listening..." : "Search for products..."}
      />

      {/* Clear Button */}
      {value && (
        <button
          ref={clearBtnRef}
          onClick={(e) => {
            e.stopPropagation();
            onChange("");
            inputRef.current?.focus();
          }}
          className="absolute right-1 lg:right-24 top-1/2 -translate-y-1/2 z-[2951] p-1 text-zinc-800 hover:text-red-500 transition-colors"
        >
          <IoCloseOutline size={20} />
        </button>
      )}
    </div>
  );
}
