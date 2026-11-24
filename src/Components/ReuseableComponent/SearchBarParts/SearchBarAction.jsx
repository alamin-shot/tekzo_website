import { IoCloseOutline } from "react-icons/io5";
import { GoGift } from "react-icons/go";
import PreFetchLink from "../CustomUIComponent/PreFetchLink";

// Mobile-only button next to the search input: "close" while the modal is
// open, otherwise a shortcut to the offers page.
export default function SearchBarAction({ isModalOpen, onClose }) {
  if (isModalOpen) {
    return (
      <button
        onClick={onClose}
        className="bg-red-500 text-white rounded-xl flex justify-center items-center aspect-square p-2.5 lg:hidden relative z-[2950]"
      >
        <IoCloseOutline className="text-2xl" />
      </button>
    );
  }

  return (
    <PreFetchLink
      prefetch={false}
      href="/shop/offer"
      className="bg-[#cc4529] text-white rounded-xl flex flex-col justify-center items-center aspect-square p-2.5 lg:hidden relative z-[2950]"
    >
      <GoGift className="text-lg" />
      <span className="text-xs">offer</span>
    </PreFetchLink>
  );
}
