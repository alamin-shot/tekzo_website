const Title = ({ children }) => {
  return (
    <div className="">
      <h2 className="w-fit text-lg md:text-2xl xl:text-3xl font-semibold capitalize bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent ">
        {children}
      </h2>
    </div>
  );
};

export default Title;
