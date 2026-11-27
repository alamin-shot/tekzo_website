"use client";

import { useState, useEffect } from "react";
import { BiUser } from "react-icons/bi";
import { GoGift } from "react-icons/go";
import Image from "next/image";
import { MdKeyboardArrowUp } from "react-icons/md";
import type { NavUser } from "@/types/auth";
import clientFetchAPI from "@/utils/clientFetchAPI";
import hasAuthCookie from "@/utils/hasAuthCookie";
import { rec } from "@/lib/json";
import { str } from "@/lib/render";
import PreFetchLink from "../ReuseableComponent/CustomUIComponent/PreFetchLink";
import NavHoverEffect from "./NavFunction/NavHoverEffect";
import { NavCountBadgesLg, NavCartBadgeSm } from "./NavCountBadges";

// Only used by the unused Navbar.tsx (AUDIT_NOTES N14). Converted as-is.
export default function NavbarAuthSection() {
  const [user, setUser] = useState<NavUser>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!hasAuthCookie()) {
      setChecked(true);
      return;
    }
    clientFetchAPI("/customer/profile", "GET")
      .then((res) => setUser(rec(res)?.data || null))
      .catch(() => setUser(null))
      .finally(() => setChecked(true));
  }, []);

  const isLoggedIn = checked && !!user;
  const profilePicture = rec(user)?.profile_picture;

  return (
    <div className="w-full">
      {/* small screen */}
      <div className="flex w-full justify-around lg:hidden">
        <NavCartBadgeSm isLoggedIn={isLoggedIn} />
        <PreFetchLink href={isLoggedIn ? "/dashboard/manage-account" : "/login"} className="nav-item">
          {isLoggedIn && profilePicture ? (
            <Image src={str(profilePicture) ?? ""} alt="User profile" width={32} height={32} className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <BiUser className="nav-icon" />
          )}
          <p className={`${isLoggedIn ? "pb-1 leading-tight" : "pb-0"}`}>Account</p>
        </PreFetchLink>
      </div>

      {/* large screen */}
      <div className="hidden lg:flex justify-around">
        <NavHoverEffect title={"company profile"}>
          <span className="nav-item-lg py-1">
            Company Profile <MdKeyboardArrowUp className="text-2xl" />
          </span>
        </NavHoverEffect>
        <PreFetchLink href={"/used-device"} className="nav-item group" style={{ flexDirection: "row" }}>
          <p className="text-sm mr-1 group-hover:text-[#ee8045] duration-300">Used Device</p>
        </PreFetchLink>
        <PreFetchLink href={"/shop/offer"} className="nav-item group" style={{ flexDirection: "row" }}>
          <p className="text-sm mr-1 group-hover:text-[#ee8045] duration-300">Offers</p>
          <GoGift className="text-[21px] group-hover:text-[#ee8045] duration-300" />
        </PreFetchLink>
        <NavCountBadgesLg isLoggedIn={isLoggedIn} user={user} />
      </div>
    </div>
  );
}
