import React from "react";

const Text = ({ children }) => {
  return (
    <div>
      <h2 className="w-fit text-lg lg:text-sm xl:text-lg  2xl:text-xl font-medium capitalize bg-linear-to-r from-[#18ac8f] via-[#6baa0b] to-[#e96c27] bg-clip-text text-transparent">
        {children}
      </h2>
    </div>
  );
};

export default Text;
