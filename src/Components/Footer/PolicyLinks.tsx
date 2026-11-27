import { getPolicies } from "@/lib/api";
import { fieldsOf, isList } from "@/lib/json";
import { nodeOf } from "@/lib/render";
import PreFetchLink from "../ReuseableComponent/CustomUIComponent/PreFetchLink";

const PolicyLinks = async () => {
  // `Links.map(…)` / `link.type`: anything but an array, or a null entry,
  // threw before; the check below and fieldsOf keep that.
  const policies = await getPolicies();
  if (!isList(policies)) throw new TypeError("Links.map is not a function");
  const Links = policies;

  return (
    <div className="bg-transparent">
      <h3 className="font-semibold  text-sm mb-4 text-gray-800">Policies</h3>
      <ul className="space-y-2 text-sm">
        {Links.map((entry, index) => {
          const link = fieldsOf(entry);
          return (
            <li key={index}>
              <PreFetchLink prefetch={false} href={`/policy/${link.type}`} className="font-light text-gray-700 hover:text-primary transition">
                {nodeOf(link.name)}
              </PreFetchLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PolicyLinks;
