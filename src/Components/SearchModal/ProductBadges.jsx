import Image from "next/image";

const BADGE_CLASS = "w-12 lg:w-[50px] 2xl:w-[70px] absolute -top-2 -right-2 z-10";

const BADGES = [
  { key: "official", src: "/official-logoo.webp" },
  { key: "unofficial", src: "/unofficial-iconn.webp" },
  { key: "chinese", src: "/Chinese.svg" },
  { key: "refurbished", src: "/Refurbish.webp" },
];

// Warranty/condition badges shown on search and featured cards.
export default function ProductBadges({ badges }) {
  return BADGES.filter(({ key }) => badges?.[key]).map(({ key, src }) => (
    <Image key={key} src={src} alt="warranty logo" width={120} height={120} className={BADGE_CLASS} />
  ));
}
