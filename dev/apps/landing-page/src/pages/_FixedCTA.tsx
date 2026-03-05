import { Mail } from "lucide-react";
import { useState, useEffect } from "react";
import lineImage from "@assets/line.svg";

const lineUrl = import.meta.env.PUBLIC_LINE_URL;

export default function FixedCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;

    const handleScroll = () => {
      const scrollThreshold = window.innerHeight;
      setIsVisible(main.scrollTop > scrollThreshold);
    };

    main.addEventListener("scroll", handleScroll);
    return () => main.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed bottom-0 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 font-bold text-neutral-100 transition-all duration-300 lg:hidden ${isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
    >
      <a
        href="/contact"
        className="flex flex-1 items-center justify-center gap-2 bg-orange-500 py-5"
      >
        <Mail size={24} />
        <p>
          メール<span className="text-xs">でお問い合わせ</span>
        </p>
      </a>
      <a
        href={lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 items-center justify-center gap-2 bg-[#06C755] py-5"
      >
        <img src={lineImage.src} alt="LINE" className="size-6" />
        <p>
          LINE<span className="text-xs">でお問い合わせ</span>
        </p>
      </a>
    </nav>
  );
}
