import { getPolicies } from "@/lib/api";
import Link from "next/link";
import PreFetchLink from "../ReuseableComponent/CustomUIComponent/PreFetchLink";

const PolicyLinks = async () => {
  const Links = await getPolicies();

  return (
    <div className="bg-transparent">
      <h3 className="font-semibold  text-sm mb-4 text-gray-800">Policies</h3>
      <ul className="space-y-2 text-sm">
        {Links.map((link, index) => (
          <li key={index}>
            <PreFetchLink
              prefetch={false}
              href={`/policy/${link.type}`}
              className="font-light text-gray-700 hover:text-primary transition"
            >
              {link.name}
            </PreFetchLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PolicyLinks;
