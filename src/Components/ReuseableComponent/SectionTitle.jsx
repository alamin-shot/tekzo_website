const { IoPhonePortraitOutline } = require("react-icons/io5");

const SectionTitle = ({ children }) => {
  return (
    <div className="flex justify-between items-center py-4">
      <div className="flex gap-3 lg:gap-5 items-center">
        <span className="text-xl lg:text-3xl bg-black text-white p-2 aspect-square rounded-xl">
          <IoPhonePortraitOutline />
        </span>{" "}
        <h2 className="text-2xl lg:text-4xl font-medium capitalize text-gray-800">{children}</h2>
      </div>
    </div>
  );
};

export default SectionTitle;
