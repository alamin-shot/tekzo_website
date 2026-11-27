"use client";

import { BsBag } from "react-icons/bs";
import { SlHeart } from "react-icons/sl";
import { BiUser } from "react-icons/bi";
import Image from "next/image";
import type { NavBadgesProps } from "@/types/props/layout";
import { useCounter } from "@/context/CounterContext";
import { rec } from "@/lib/json";
import { str } from "@/lib/render";
import PreFetchLink from "../ReuseableComponent/CustomUIComponent/PreFetchLink";

// Large screen: wishlist + cart + account icons with live badges
export function NavCountBadgesLg({ isLoggedIn, user }: NavBadgesProps) {
  const { cartCount, wishlistCount } = useCounter();
  const profilePicture = rec(user)?.profile_picture;

  return (
    <div className="flex gap-6">
      <PreFetchLink prefetch={false} href={isLoggedIn ? "/dashboard/manage-account" : "/login"} className="nav-item" aria-label="User account">
        {isLoggedIn && profilePicture ? (
          <Image src={str(profilePicture) ?? ""} alt="User profile" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <BiUser className="nav-icon" />
        )}
      </PreFetchLink>
      <PreFetchLink
        prefetch={false}
        href={isLoggedIn ? "/dashboard/wishlist" : "/login"}
        className="relative nav-item"
        aria-label={`Wishlist, ${wishlistCount} items`}
      >
        <SlHeart className="nav-icon" />
        <span className="absolute -bottom-1 -right-1.5 bg-white text-black w-4 h-4 rounded-full text-[10px] flex justify-center items-center">{wishlistCount}</span>
      </PreFetchLink>

      <PreFetchLink prefetch={false} href={isLoggedIn ? "/dashboard/my-bag" : "/login"} className="relative nav-item" aria-label={`Shopping bag, ${cartCount} items`}>
        <BsBag className="nav-icon" />
        <span className="absolute -bottom-1 -right-1.5 bg-white text-black w-4 h-4 rounded-full text-[10px] flex justify-center items-center">{cartCount}</span>
      </PreFetchLink>
    </div>
  );
}

// Small screen: cart badge only
export function NavCartBadgeSm({ isLoggedIn }: NavBadgesProps) {
  const { cartCount } = useCounter();

  return (
    <PreFetchLink prefetch={false} href={isLoggedIn ? "/dashboard/my-bag" : "/login"} className="relative nav-item" aria-label={`Shopping cart, ${cartCount} items`}>
      <BsBag className="nav-icon" />
      <p>Cart</p>
      <span className="absolute bottom-4 -right-1.5 bg-primary text-white w-4 h-4 rounded-full text-[9px] flex justify-center items-center">{cartCount}</span>
    </PreFetchLink>
  );
}
