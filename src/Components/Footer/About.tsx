import type { FooterLink } from "@/types/nav";
import PreFetchLink from "../ReuseableComponent/CustomUIComponent/PreFetchLink";

const ecommerceType = process.env.NEXT_PUBLIC_ECOMMERCE_TYPE;

const About = () => {
  //   about links
  const aboutLinks: FooterLink[] = [
    { title: "About Us", link: "/about-us" },
    { title: "Contact Us", link: "/contact-us" },
    ...(ecommerceType && ecommerceType === "salamat" ? [{ title: "News", link: "/news" }] : [{ title: "Blog", link: "/blog" }]),
    // (salamat variant only; /careers is hidden behind notFound() — AUDIT_NOTES N12)
    // Careers hidden for now (see src/app/(main)/careers/layout.tsx)
    // ...(ecommerceType && ecommerceType === "salamat" ? [{ title: "Careers", link: "/careers" }] : []),
    { title: "TEKZO Care", link: "/tekzo-care" },
    { title: "Claim Your Warranty", link: "/claim-your-warranty" },
    { title: "How to Claim Your Warranty", link: "/how-to-claim" },
    // { title: "How to Activate Your Warranty", link: "/how-to-active" },
    { title: "Track My Order", link: "/order-tracking" },
    { title: "FAQs", link: "/faq" },
    { title: "Compare", link: "/compare" },
    // { title: "Affiliate Program", link: "/" },
    // { title: "Investor", link: "/" },
  ];
  return (
    // <nav> landmark so crawlers/audits recognise About Us + Contact Us as site navigation.
    <nav aria-label="About and contact" className="bg-transparent">
      <h3 className="font-semibold  text-sm mb-4 text-gray-800">About</h3>
      <ul className="space-y-2 text-sm">
        {aboutLinks.map((link, index) => (
          <li key={index}>
            <PreFetchLink prefetch={false} href={link.link} className="font-light text-gray-700 hover:text-primary transition">
              {link.title}
            </PreFetchLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default About;
