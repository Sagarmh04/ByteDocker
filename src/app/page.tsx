import { ImmersiveIntro } from "@/components/Home/ImmersiveIntro";
import { ThreeDMarqueeDemo } from "@/components/Home/Marquee";
import ImmersiveService from "@/components/ImmersiveService";

export default function HomePage() {
  return (
    <main >
      <ImmersiveIntro />
      {/* <ImmersiveService /> */}
      <ThreeDMarqueeDemo />

    </main>
  )
}