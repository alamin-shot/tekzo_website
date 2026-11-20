import Title from "../../ReuseableComponent/Title";
import TitleHeading from "../../ReuseableComponent/TitleHeading";
import Section from "../../ReuseableComponent/Section";
import { getNews } from "@/lib/api";
import HomePageNews from "@/Components/HomePageNews/HomePageNews";

// news data for card
// const newsData = [
//   {
//     image: "/news-coverage/news1.jpg",
//     date: "21 Mar, 2024",
//     title: "TEKZO Grand Opening Today",
//     desc: "We’re all set to serve you better. The wait is over — it’s finally happening! Experience the most exciting launch of the season.",
//   },
//   {
//     image: "/news-coverage/news2.jpg",
//     date: "21 Mar, 2024",
//     title: "TEKZO Grand Opening Today",
//     desc: "We’re all set to serve you better. The wait is over — it’s finally happening! Experience the most exciting launch of the season.",
//   },
//   {
//     image: "/news-coverage/news1.jpg",
//     date: "21 Mar, 2024",
//     title: "TEKZO Grand Opening Today",
//     desc: "We’re all set to serve you better. The wait is over — it’s finally happening! Experience the most exciting launch of the season.",
//   },
//   {
//     image: "/news-coverage/news2.jpg",
//     date: "21 Mar, 2024",
//     title: "TEKZO Grand Opening Today",
//     desc: "We’re all set to serve you better. The wait is over — it’s finally happening! Experience the most exciting launch of the season.",
//   },
//   {
//     image: "/news-coverage/news1.jpg",
//     date: "21 Mar, 2024",
//     title: "TEKZO Grand Opening Today",
//     desc: "We’re all set to serve you better. The wait is over — it’s finally happening! Experience the most exciting launch of the season.",
//   },
// ];

const NewsCoverage = async () => {
  const result = await getNews();
  const newsData = result?.news || [];
  return (
    <div className="mt-1 lg:mt-3">
      <Section>
        <TitleHeading>
          <Title>Source Of Tech News Coverage</Title>
        </TitleHeading>
        <div className=" overflow-x-clip ">
          <HomePageNews newsData={newsData}></HomePageNews>
        </div>
      </Section>
    </div>
  );
};

export default NewsCoverage;
