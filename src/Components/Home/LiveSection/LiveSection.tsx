import Title from "@/Components/ReuseableComponent/Title";
import LiveSectionClient from "./LiveSectionClient";
import TitleHeading from "@/Components/ReuseableComponent/TitleHeading";
import { getReels } from "@/lib/api";

async function LiveSection() {
  const reels = await getReels();

  return (
    <div>
      <TitleHeading>
        <Title>Join the Tribe</Title>
      </TitleHeading>
      <LiveSectionClient reels={reels} />
    </div>
  );
}

export default LiveSection;
