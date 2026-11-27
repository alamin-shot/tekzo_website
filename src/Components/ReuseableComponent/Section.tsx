import type { SectionProps } from "@/types/props/catalog";
const Section = ({ children, className = "" }: SectionProps) => {
  return <section className={className}>{children}</section>;
};

export default Section;
