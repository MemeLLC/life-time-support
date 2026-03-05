import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SectionLinksProps {
  links: string[];
  rootSelector?: string;
}

export default function SectionLinks({ links, rootSelector = "main" }: SectionLinksProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = rootSelector ? document.querySelector<HTMLElement>(rootSelector) : null;

    const sections = links
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) return;

    const updateFromHash = () => {
      const hash = decodeURIComponent(window.location.hash.replace("#", ""));
      if (hash) setActiveId(hash);
    };

    const getActiveFromScroll = () => {
      const rootRect = root ? root.getBoundingClientRect() : { top: 0, height: window.innerHeight };
      const anchorY = rootRect.top + rootRect.height * 0.35;

      let current: HTMLElement | null = null;
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= anchorY) current = section;
      }

      setActiveId((current ?? sections[0]).id);
    };

    const scrollTarget: HTMLElement | Window = root ?? window;
    let rafId = 0;
    const handleScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        getActiveFromScroll();
      });
    };

    updateFromHash();
    if (!window.location.hash) getActiveFromScroll();

    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    window.addEventListener("hashchange", updateFromHash);

    return () => {
      scrollTarget.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("hashchange", updateFromHash);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [links, rootSelector]);

  return (
    <ul className="space-y-2 font-bold">
      {links.map((link) => {
        const isActive = activeId === link;
        return (
          <li key={link}>
            <a
              href={`#${link}`}
              className={cn(
                "inline-block transform-gpu text-[#D2D2D1] transition-all hover:text-neutral-100",
                isActive && "-translate-x-1.5 text-neutral-100",
              )}
              aria-current={isActive ? "location" : undefined}
            >
              {link}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
