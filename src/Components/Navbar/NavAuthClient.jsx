"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BiUser } from "react-icons/bi";
import { MdKeyboardArrowUp } from "react-icons/md";
import { GoGift } from "react-icons/go";
import Image from "next/image";
import { getAuthUser } from "@/utils/getAuthUser";
import hasAuthCookie from "@/utils/hasAuthCookie";
import PreFetchLink from "../ReuseableComponent/CustomUIComponent/PreFetchLink";
import { NavCountBadgesLg, NavCartBadgeSm } from "./NavCountBadges";
import NavHoverEffect from "./NavFunction/NavHoverEffect";

const CACHE_KEY = "cachedNavUser";

function readCachedUser() {
  if (!hasAuthCookie()) return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

export default function NavAuthClient() {
  // Must start identical on server and client (null) or React throws a
  // hydration mismatch — the cached profile is seeded in useLayoutEffect
  // below instead, which only runs client-side but fires before paint so
  // there's still no visible flash of the generic icon.
  const [user, setUser] = useState(null);
  const pathname = usePathname();

  useLayoutEffect(() => {
    const cached = readCachedUser();
    if (cached) setUser(cached);
  }, []);

  // re-check on every route change, not just first mount — the layout (and
  // this component) persists across the client-side redirect after login,
  // so a mount-only effect would keep showing the pre-login state
  useEffect(() => {
    getAuthUser()
      .then((data) => {
        setUser(data);
        try {
          if (data) localStorage.setItem(CACHE_KEY, JSON.stringify(data));
          else localStorage.removeItem(CACHE_KEY);
        } catch {}
      })
      .catch(() => setUser(null));
  }, [pathname]);

  useEffect(() => {
    const handleProfileUpdate = (event) => {
      if (event?.detail) {
        setUser((prev) => ({ ...prev, ...event.detail }));
      }
    };

    window.addEventListener("userProfileUpdated", handleProfileUpdate);
    return () => {
      window.removeEventListener("userProfileUpdated", handleProfileUpdate);
    };
  }, []);

  const isLoggedIn = !!user;

  return (
    <>
      {/* Small screen: cart + account */}
      <div className="flex w-full justify-evenly lg:hidden">
        <NavCartBadgeSm isLoggedIn={isLoggedIn} />
        <PreFetchLink
          prefetch={false}
          href={isLoggedIn ? "/dashboard/manage-account" : "/login"}
          className="nav-item"
        >
          {isLoggedIn && user?.profile_picture ? (
            <Image
              src={user.profile_picture}
              alt="User profile"
              width={32}
              height={32}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <BiUser className="nav-icon" />
          )}
          <p className={`${isLoggedIn ? "pb-1 leading-tight" : "pb-0"}`}>
            Account
          </p>
        </PreFetchLink>
      </div>

      {/* Large screen: company profile + offers + user badges */}
      <div className="hidden lg:flex justify-around w-full">
        <PreFetchLink
          prefetch={false}
          href={"/shop/offer"}
          className="nav-item group"
          style={{ flexDirection: "row" }}
        >
          <p className="text-sm mr-1 group-hover:text-[#ee8045] duration-300">
            Offers
          </p>
          <GoGift className="text-[21px] group-hover:text-[#ee8045] duration-300" />
        </PreFetchLink>
        <NavHoverEffect title={"usedDevice"}>
          <PreFetchLink
            prefetch={false}
            href={"/marketplace"}
            className="nav-item-lg py-1"
          >
            Marketplace
            <MdKeyboardArrowUp className="text-2xl" />
          </PreFetchLink>
        </NavHoverEffect>
        <NavHoverEffect title={"discovery"}>
          <PreFetchLink
            className="nav-item-lg py-1 "
            prefetch={false}
            href={"/discovery"}
          >
            Discovery
            <MdKeyboardArrowUp className="text-2xl" />
          </PreFetchLink>
        </NavHoverEffect>

        <NavCountBadgesLg isLoggedIn={isLoggedIn} user={user} />
      </div>
    </>
  );
}
