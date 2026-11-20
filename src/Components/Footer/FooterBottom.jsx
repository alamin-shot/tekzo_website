"use client";

import Image from "next/image";
import PreFetchLink from "../ReuseableComponent/CustomUIComponent/PreFetchLink";

const FooterBottom = ({ companySetting }) => {
  const currentYear = new Date().getFullYear();

  const rawNumber = companySetting?.primary_phone_number || "";
  const cleanPhoneNumber = rawNumber.replace(/\D/g, "");
  const whatsappMessage =
    "Hello! I am interested in your products, can you help?";
  const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const socialLinks = [
    {
      icon: "/footer/fb.svg",
      title: "Facebook",
      link: companySetting?.facebook_link || "/",
    },
    {
      icon: "/footer/insta.svg",
      title: "Instagram",
      link: companySetting?.instagram_link || "/",
    },
    {
      icon: "/footer/tiktok.svg",
      title: "TikTok",
      link: companySetting?.tiktok_link || "/",
    },
    {
      icon: "/footer/yt.svg",
      title: "YouTube",
      link: companySetting?.youtube_link || "/",
    },
    {
      icon: "/footer/link.svg",
      title: "LinkedIn",
      link: companySetting?.linkedin_link || "/",
    },
    { icon: "/footer/wtp.svg", title: "WhatsApp", link: whatsappUrl },
  ];

  return (
    <div className="w-full my-rounded  bg-dark py-8 px-4 mt-4 ]">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
        {/* Top Row: Title and Icons */}
        <div className="flex flex-col md:flex-row items-center gap-5 lg:gap-15">
          <span className="text-lg font-semibold text-gray-800">
            Let&apos;s get social
          </span>
          <div className="flex gap-3">
            {socialLinks.map((social, index) => (
              <PreFetchLink
                key={index}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl transition-transform hover:scale-110"
              >
                <Image
                  src={social.icon}
                  alt={social.title}
                  className="w-6"
                  width={4000}
                  height={3000}
                />
              </PreFetchLink>
            ))}
          </div>
        </div>

        {/* Bottom Row: Copyright & Info */}
        <div className="text-sm text-gray-600 text-center font-light font-switzer">
          ©{currentYear} {companySetting?.company_name || "TEKZO"}{" "}
          <span className="hidden lg:inline-block">|</span>{" "}
          <br className="lg:hidden" /> All Rights Reserved. Trade Licence No:
          01/3809, OBN No: 98 5 40 01830
        </div>
      </div>
    </div>
  );
};

export default FooterBottom;
