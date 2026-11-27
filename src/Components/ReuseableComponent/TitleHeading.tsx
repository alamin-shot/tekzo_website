import type { ChildrenOnlyProps } from "@/types/props/catalog";
const TitleHeading = ({ children }: ChildrenOnlyProps) => {
  return <div className="flex justify-between items-center mb-4 md:mb-6">{children}</div>;
};

export default TitleHeading;
