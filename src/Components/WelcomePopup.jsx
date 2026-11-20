"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import fetchPublicAPI from "@/utils/fetchPublicAPI";
import PreFetchLink from "@/Components/ReuseableComponent/CustomUIComponent/PreFetchLink";

export default function WelcomePopup() {
  const LAST_PATHNAME_KEY = "lastPathname";

  const [mounted, setMounted] = useState(false);
  const [popup, setPopup] = useState({
    data: null,
    show: false,
    visible: false,
  });

  useEffect(() => {
    let isMounted = true;
    setMounted(true);

    // Get current pathname
    const currentPathname = typeof window !== "undefined" ? window.location.pathname : "";

    // Get last pathname from sessionStorage
    const lastPathname = sessionStorage.getItem(LAST_PATHNAME_KEY);

    // Update the pathname for next check
    sessionStorage.setItem(LAST_PATHNAME_KEY, currentPathname);

    // Show popup if:
    // 1. Last pathname is null (first visit) OR
    // 2. Last pathname is different (page was reloaded while on same route, or navigated away and back)
    // 3. Don't show if it's just a route navigation within the same session
    const isPageReload = lastPathname === currentPathname;
    const isFirstVisit = lastPathname === null;

    if (!isFirstVisit && !isPageReload) {
      // Route change within the session, do not show popup
      return;
    }

    // Fetch popup details from backend API
    fetchPublicAPI("/popup-dialogs")
      .then((res) => {
        if (!isMounted) return;

        const data = res?.data;

        // If data is null or no valid image, the popup is off
        if (!data || !data.image) {
          setPopup({ data: null, show: false, visible: false });
          return;
        }

        // Popup is active
        setPopup({ data, show: true, visible: false });
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (isMounted) {
              setPopup((prev) => ({ ...prev, visible: true }));
            }
          });
        });
      })
      .catch(() => {
        if (isMounted) {
          // If error occurs or request fails, keep popup off
          setPopup({ data: null, show: false, visible: false });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleClose = () => {
    setPopup((prev) => ({ ...prev, visible: false }));
    setTimeout(() => setPopup((prev) => ({ ...prev, show: false })), 300);
  };

  // Don't render until client is mounted and popup has active data
  if (!mounted || !popup.show || !popup.data || !popup.data.image) return null;

  const desktopImage = popup.data.image;
  const mobileImage = popup.data.mobile_image || popup.data.image;
  const imageAlt = popup.data.name || "Welcome Popup";
  const targetLink = popup.data.url;

  const handleLinkClick = (e) => {
    if (!targetLink || targetLink === "#") {
      e.preventDefault();
    }
    handleClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-10049 transition-opacity duration-300 ease-out will-change-[opacity] ${popup.visible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      <div className="fixed inset-0 flex items-center justify-center z-10050 pointer-events-none p-4 sm:p-6">
        <div
          className={`w-[92%] sm:w-[85%] md:w-[75%] lg:w-[65%] xl:w-[55%] max-w-[850px] max-h-[88%] relative pointer-events-auto transition-all duration-300 ease-out transform-gpu will-change-[opacity,transform] ${
            popup.visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-2"
          }`}
        >
          <button
            onClick={handleClose}
            className="absolute -top-11 lg:-top-12 right-0 lg:right-2 text-gray-500 hover:text-gray-700 transition-colors duration-200 bg-white rounded-full p-1.5 lg:p-2 cursor-pointer border border-slate-200/80 active:scale-95"
            aria-label="Close popup"
          >
            <X size={22} />
          </button>

          {/* Popup content */}
          <div className="rounded-[30px] sm:rounded-[40px] lg:rounded-[50px] overflow-hidden bg-transparent select-none">
            <PreFetchLink href={targetLink} onClick={handleLinkClick} prefetch={false} className="block w-full cursor-pointer">
              {/* Image for large screen */}
              <Image
                src={desktopImage}
                alt={imageAlt}
                width={1200}
                height={600}
                priority
                quality={90}
                sizes="(max-width: 1024px) 0px, 65vw"
                className="w-full h-auto max-h-[82vh] hidden lg:block object-contain"
              />

              {/* Image for mobile screen */}
              <Image
                src={mobileImage}
                alt={imageAlt}
                width={1200}
                height={600}
                priority
                quality={90}
                sizes="(max-width: 1024px) 92vw, 0px"
                className="w-full h-auto max-h-[82vh] lg:hidden object-contain"
              />
            </PreFetchLink>
          </div>
        </div>
      </div>
    </>
  );
}
