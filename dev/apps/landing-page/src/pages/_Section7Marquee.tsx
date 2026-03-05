import { InfiniteMarquee, InfiniteMarqueeRow } from "@/components/patterns/InfiniteMarquee";
import backgroundImage from "@assets/background.jpg";
import point1Image from "@assets/point1.jpg";
import point2Image from "@assets/point2.jpg";
import point3Image from "@assets/point3.jpg";
import point4Image from "@assets/point4.jpg";

const marqueeImages = [backgroundImage, point1Image, point2Image, point3Image, point4Image];

export function Section7Marquee() {
  return (
    <InfiniteMarquee gap={16}>
      <InfiniteMarqueeRow>
        {marqueeImages.map((image) => (
          <img src={image.src} alt="marquee image" className="h-[72px] w-[128px] object-cover" />
        ))}
      </InfiniteMarqueeRow>
    </InfiniteMarquee>
  );
}
