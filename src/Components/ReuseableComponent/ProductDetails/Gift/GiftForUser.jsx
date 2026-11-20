import Image from "next/image";
import GiftPopup from "./GiftPopup";

const GiftForUser = ({ productDetails, onGiftSelect }) => {
  const giftProducts = productDetails?.gift_products;
  if (!giftProducts || giftProducts.length === 0) {
    return null;
  }

  return (
    <div className="relative bg-gray-200 p-1.5 rounded-xl lg:rounded-2xl 2xl:rounded-[20px] ">
      <Image
        src={"/gift.svg"}
        alt="svg"
        width={300}
        height={100}
        className="w-full h-auto"
      ></Image>
      <div className="absolute top-1/2  transform -translate-y-1/2 w-[23%] flex justify-center items-center">
        <div className="flex items-center gap-1 2xl:gap-1.5">
          <div className="w-5 2xl:w-8 shrink-0 text-primary">
            <Image
              src={"/product-details/gift-icon.svg"}
              alt="gift image"
              width={400}
              height={400}
              className="w-full opacity-90"
            ></Image>
          </div>
          <div className="flex flex-col">
            <span className="text-[7px] lg:text-[9px] 2xl:text-[11px] whitespace-nowrap font-semibold">
              Gift For You
            </span>
            <span className="text-[4px] lg:text-[6px] 2xl:text-[7px] whitespace-nowrap">
              Choose your free gift
            </span>
          </div>
        </div>
      </div>
      <div className="absolute top-1/2 right-0  transform -translate-y-1/2 w-[77%]">
        <GiftPopup
          key={productDetails?.gift_products?.[0]?.gift_id || "gift-picker"}
          productDetails={productDetails?.gift_products}
          onSelectGift={onGiftSelect}
        ></GiftPopup>
        {/* <span className="pl-8 lg:pl-14 text-xs lg:text-sm 2xl:text-base text-gray-500">No Gift Available</span> */}
      </div>
    </div>
  );
};

export default GiftForUser;
