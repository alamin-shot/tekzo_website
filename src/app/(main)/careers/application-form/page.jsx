import JobApplicationForm from "@/Components/ReuseableComponent/JobApplicationForm/JobApplicationForm";

const ApplicationFormPage = async ({ searchParams }) => {
  const { job: slug } = await searchParams;
  return <JobApplicationForm slug={slug} />;
};

export default ApplicationFormPage;
