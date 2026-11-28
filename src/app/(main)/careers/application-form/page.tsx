import JobApplicationForm from "@/Components/ReuseableComponent/JobApplicationForm/JobApplicationForm";
import type { SearchPageProps } from "@/types/route";
import { fieldsOf } from "@/lib/json";

const ApplicationFormPage = async ({ searchParams }: SearchPageProps) => {
  const { job: slug } = fieldsOf(await searchParams);
  return <JobApplicationForm slug={slug} />;
};

export default ApplicationFormPage;
