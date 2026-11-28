import type { RecipientLineProps } from "@/types/props/dashboard";
import { rec } from "@/lib/json";
import { nodeOf } from "@/lib/render";

// "Deliver to: <recipient_name> (<recipient_phone>)" for an address that is
// for someone else (UPD-005 / UPD-007). Renders nothing without a recipient.
export default function RecipientLine({ address, className = "" }: RecipientLineProps) {
  const a = rec(address);
  const name = a?.recipient_name;
  if (!name) return null;
  const phone = a?.recipient_phone;
  return (
    <p className={`text-xs font-semibold text-amber-700 dark:text-amber-400 ${className}`}>
      Deliver to: {nodeOf(name)}
      {phone ? <> ({nodeOf(phone)})</> : null}
    </p>
  );
}
