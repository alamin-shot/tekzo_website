import Image from "next/image";
import type { CompanySettingProps } from "@/types/props/layout";
import type { FooterIconLink } from "@/types/nav";
import { rec, requireString } from "@/lib/json";
import { nodeOf, str } from "@/lib/render";
import Footer from "./Footer";
import About from "./About";
import PolicyLinks from "./PolicyLinks";
import { GrLocation } from "react-icons/gr";
import { FiPhone } from "react-icons/fi";
import { GoMail } from "react-icons/go";
import PreFetchLink from "../ReuseableComponent/CustomUIComponent/PreFetchLink";

const FooterPage = async ({ companySetting }: CompanySettingProps) => {
  const cs = rec(companySetting);
  const paymentMethods: FooterIconLink[] = [
    { icon: "/payment-logo/visa.svg", title: "visa", link: "/" },

    { icon: "/payment-logo/master.svg", title: "master", link: "/" },

    { icon: "/payment-logo/american.svg", title: "american card", link: "/" },

    { icon: "/payment-logo/bksh.svg", title: "bkash", link: "/" },

    { icon: "/payment-logo/nagad.svg", title: "nagad", link: "/" },

    { icon: "/payment-logo/rocket.svg", title: "rocket", link: "/" },
  ];
  return (
    <Footer companySetting={companySetting}>
      <div className="max-w-362.5 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ">
        {/* Column 1: Logo & Contact */}
        <div className="space-y-6">
          <Image src={str(cs?.company_logo) || "/logo.png"} alt={str(cs?.company_name) || "TEKZO"} width={180} height={60} className="w-32.5" />
          <div className="space-y-3">
            <h3 className="font-semibold text-base text-gray-800">
              <PreFetchLink prefetch={false} href="/contact-us" className="hover:text-primary transition">
                Contact Us
              </PreFetchLink>
            </h3>

            <div className="flex items-start gap-3 text-sm leading-relaxed">
              <span className="mt-1 text-lg">
                <GrLocation />
              </span>
              <span className="text-gray-700 font-light">{nodeOf(cs?.primary_address || "")}</span>
            </div>
            <div className="flex items-start gap-3 text-sm leading-relaxed">
              <span className="mt-1 text-lg">
                <FiPhone />
              </span>
              {cs?.primary_phone_number ? (
                <a href={`tel:${requireString(cs.primary_phone_number).replace(/[^\d+]/g, "")}`} className="text-gray-700 font-light hover:text-primary transition">
                  {nodeOf(cs.primary_phone_number)}
                </a>
              ) : null}
            </div>
            <div className="flex items-start gap-3 text-sm leading-relaxed">
              <span className="mt-1 text-lg">
                <GoMail />
              </span>
              {cs?.support_email ? (
                <a href={`mailto:${cs.support_email}`} className="text-gray-700 font-light hover:text-primary transition">
                  {nodeOf(cs.support_email)}
                </a>
              ) : null}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-base text-gray-800">Complain / Advice</h3>
            <PreFetchLink prefetch={false} href="/contact-us" aria-label="Contact us with feedback" className="gradient text-white px-8 py-2 rounded-md text-sm hover:shadow-lg transition">
              Feedback
            </PreFetchLink>
          </div>
        </div>

        {/* Column 2: About (Server Component) */}
        <About />

        {/* Column 3: Policies (Server Component with API Fetch) */}
        <PolicyLinks />

        {/* Column 4: Payments & Store */}
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-sm mb-5 text-gray-800">Pay With</h3>

            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((method, index) => (
                <Image key={index} src={method.icon} alt={method.title} className="w-auto" width={4000} height={3000}></Image>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold  text-sm mb-4 text-gray-800">Store</h3>

            <PreFetchLink prefetch={false} href={"/outlets"} className="inline-block gradient text-white px-8 py-2 rounded-md   text-sm hover:shadow-lg transition">
              Shop Location
            </PreFetchLink>
          </div>
        </div>
      </div>
    </Footer>
  );
};

export default FooterPage;
