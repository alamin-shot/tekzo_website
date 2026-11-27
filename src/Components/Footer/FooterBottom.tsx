"use client";

import Image from "next/image";
import type { CompanySettingProps } from "@/types/props/layout";
import type { FooterIconLink } from "@/types/nav";
import { rec, requireString } from "@/lib/json";
import { nodeOf, str } from "@/lib/render";
import PreFetchLink from "../ReuseableComponent/CustomUIComponent/PreFetchLink";

// `companySetting?.x || "/"` for a link prop (non-string values become "/").
const linkOr = (value: unknown, fallback: string): string => (value ? (str(value) ?? fallback) : fallback);

const FooterBottom = ({ companySetting }: CompanySettingProps) => {
  const currentYear = new Date().getFullYear();
  const cs = rec(companySetting);

  // `.replace` on a non-string phone value threw before; requireString keeps that.
  const rawNumber = requireString(cs?.primary_phone_number || "");
  const cleanPhoneNumber = rawNumber.replace(/\D/g, "");
  const whatsappMessage = "Hello! I am interested in your products, can you help?";
  const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const socialLinks: FooterIconLink[] = [
    {
      icon: "/footer/fb.svg",
      title: "Facebook",
      link: linkOr(cs?.facebook_link, "/"),
    },
    {
      icon: "/footer/insta.svg",
      title: "Instagram",
      link: linkOr(cs?.instagram_link, "/"),
    },
    {
      icon: "/footer/tiktok.svg",
      title: "TikTok",
      link: linkOr(cs?.tiktok_link, "/"),
    },
    {
      icon: "/footer/yt.svg",
      title: "YouTube",
      link: linkOr(cs?.youtube_link, "/"),
    },
    {
      icon: "/footer/link.svg",
      title: "LinkedIn",
      link: linkOr(cs?.linkedin_link, "/"),
    },
    { icon: "/footer/wtp.svg", title: "WhatsApp", link: whatsappUrl },
  ];

  return (
    <div className="w-full my-rounded  bg-dark py-8 px-4 mt-4 ]">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
        {/* Top Row: Title and Icons */}
        <div className="flex flex-col md:flex-row items-center gap-5 lg:gap-15">
          <span className="text-lg font-semibold text-gray-800">Let&apos;s get social</span>
          <div className="flex gap-3">
            {socialLinks.map((social, index) => (
              <PreFetchLink key={index} href={social.link} target="_blank" rel="noopener noreferrer" className="text-2xl transition-transform hover:scale-110">
                <Image src={social.icon} alt={social.title} className="w-6" width={4000} height={3000} />
              </PreFetchLink>
            ))}
          </div>
        </div>

        {/* Bottom Row: Copyright & Info */}
        <div className="text-sm text-gray-600 text-center font-light font-switzer">
          ©{currentYear} {nodeOf(cs?.company_name || "TEKZO")}{" "}
          <span className="hidden lg:inline-block">|</span>{" "}
          <br className="lg:hidden" /> All Rights Reserved. Trade Licence No:
          01/3809, OBN No: 98 5 40 01830
        </div>
      </div>
    </div>
  );
};

export default FooterBottom;
