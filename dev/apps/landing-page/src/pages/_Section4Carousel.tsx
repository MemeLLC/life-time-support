import { CardCarousel, CardCarouselScroller, Card } from "@/components/patterns/CardCarousel";
import option1Image from "@assets/option1.jpg";
import option2Image from "@assets/option2.jpg";
import option3Image from "@assets/option3.jpg";
import option4Image from "@assets/option4.jpg";

const optionItems: OptionMenuItem[] = [
  {
    title: "使いやすさ・収納力を高める工事",
    imageSrc: option1Image.src,
    options: ["カップボード", "可動棚", "クローゼットカスタム", "造作棚・シューズクローク拡張"],
  },
  {
    title: "見た目・快適性を高める工事",
    imageSrc: option2Image.src,
    options: ["エコカラット", "鏡・ミラー", "バルコニータイル", "窓ガラスフィルム"],
  },
  {
    title: "清潔・耐久を高める工事",
    imageSrc: option3Image.src,
    options: ["窓ガラスフィルム", "フロアコーティング", "水回りコーティング"],
  },
  {
    title: "自分好みの空間にする工事",
    imageSrc: option4Image.src,
    options: ["食器棚", "ダウンライト", "オーダーカーテン", "人感センサー"],
  },
];

interface OptionMenuItem {
  title: string;
  imageSrc: string;
  options: string[];
}

interface Section4CarouselProps {
  className?: string;
}

export function Section4Carousel({ className }: Section4CarouselProps) {
  return (
    <CardCarousel className={className}>
      <CardCarouselScroller className="gap-4 px-6">
        {optionItems.map((item, index) => (
          <Card
            key={index}
            className="w-full max-w-[360px] overflow-hidden rounded-[24px] bg-neutral-100"
          >
            <div className="relative">
              <img
                src={item.imageSrc}
                alt={item.title}
                className="h-[312px] w-full object-cover"
                loading="lazy"
              />
              <div
                className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-transparent to-neutral-100"
                aria-hidden="true"
              />
            </div>
            <div className="space-y-4 p-6">
              <h3 className="text-2xl font-bold">{item.title}</h3>
              <ul className="flex flex-wrap gap-2 font-bold text-orange-500">
                {item.options.map((option, index) => (
                  <li key={index} className="w-fit rounded-lg border border-orange-500 p-2">
                    {option}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </CardCarouselScroller>
    </CardCarousel>
  );
}
