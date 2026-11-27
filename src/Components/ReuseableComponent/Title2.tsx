import type { ChildrenOnlyProps } from "@/types/props/catalog";
const Title2 = ({ children }: ChildrenOnlyProps) => {
  return <h2 className="text-3xl lg:text-4xl text-[#4a4a4a] mb-6 text-center capitalize">{children}</h2>;
};

export default Title2;
