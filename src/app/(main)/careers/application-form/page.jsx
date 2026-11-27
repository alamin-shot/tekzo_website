// Careers is hidden for now: the original page is kept below, commented out.
// Next.js still needs a default export to build, so this route serves the
// standard 404 until the page is restored (AUDIT_NOTES N12).
import { notFound } from "next/navigation";

export default function ApplicationFormPageHidden() {
  notFound();
}

// import JobApplicationForm from "@/Components/ReuseableComponent/JobApplicationForm/JobApplicationForm";

// const ApplicationFormPage = async ({ searchParams }) => {
//   const { job: slug } = await searchParams;
//   return <JobApplicationForm slug={slug} />;
// };

// export default ApplicationFormPage;
