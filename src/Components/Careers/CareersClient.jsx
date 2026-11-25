import JobCircular from "@/Components/Careers/JobCircular";
import Title2 from "@/Components/ReuseableComponent/Title2";

// The "Our Team" tab/section (TeamMembers) is intentionally turned off;
// only Job Circular openings are shown.
export default function CareersClient({ jobs }) {
  return (
    <div className="w-full">
      <div className="lg:pb-4 my-4 lg:my-8">
        <Title2>Diversified Job Openings To Apply</Title2>
      </div>
      <JobCircular jobs={jobs} />
    </div>
  );
}
