import Image from "next/image";

const TeamMembers = ({ teams = [] }) => {
  const leaders = teams.filter((m) => m.about && m.about.length > 5);
  const members = teams.filter((m) => !m.about || m.about.length <= 5);

  return (
    <section className="">
      {/* Leadership Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-4 lg:mb-5">
        {leaders.map((leader) => (
          <div key={leader.id} className="group bg-white rounded-2xl xl:rounded-4xl p-3 lg:p-6 border border-gray-100 lg:border-gray-200 flex flex-col md:flex-row gap-8 transition-all">
            <div className="shrink-0 w-full md:w-52 text-center">
              <div className="relative h-[350px] lg:h-64 w-full rounded-xl xl:rounded-2xl overflow-hidden bg-gray-100 mb-5">
                <Image src={leader.profile_photo} alt={leader.name} fill sizes="(max-width: 1023px) 100vw, 50vw" className="object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="bg-slate-100 py-3 px-4 rounded-xl xl:rounded-2xl">
                <h3 className="font-bold text-sm leading-tight">{leader.name}</h3>
                <p className="text-[11px] opacity-70 mt-1 uppercase whitespace-nowrap">{leader.designation}</p>
              </div>
            </div>
            <div className="flex-1 flex items-center text-gray-500 text-sm leading-relaxed border-l border-gray-100 pl-6">{leader.about}</div>
          </div>
        ))}
      </div>

      {/* General Members Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-5">
        {members.map((member) => (
          <div key={member.id} className="group bg-white rounded-2xl xl:rounded-4xl p-2 lg:p-3 xl:p-4 border border-gray-100 flex flex-col items-center transition-all h-full">
            <div className="relative h-44 w-full mb-3 lg:mb-4 rounded-xl xl:rounded-2xl overflow-hidden bg-gray-100 shrink-0">
              <Image src={member.profile_photo} alt={member.name} fill sizes="(max-width: 639px) 50vw, (max-width: 767px) 33vw, (max-width: 1023px) 25vw, 17vw" className="object-contain group-hover:scale-105 transition-all duration-500" />
            </div>
            <div className="flex-1 flex flex-col justify-center bg-slate-100 group-hover:bg-gray-100 p-3 rounded-xl xl:rounded-2xl w-full text-center transition-colors">
              <h3 className="font-bold text-gray-800 text-[11px] leading-tight">{member.name}</h3>
              <p className="text-gray-400 text-[10px] mt-1 font-medium">{member.designation}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TeamMembers;
