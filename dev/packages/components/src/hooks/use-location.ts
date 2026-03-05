import { useEffect, useState } from "react";

const getPathname = () => {
  if (typeof window === "undefined") return "";
  return window.location.pathname;
};

export function useLocation() {
  const [pathname, setPathname] = useState(getPathname);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleChange = () => setPathname(getPathname());

    window.addEventListener("popstate", handleChange);
    window.addEventListener("hashchange", handleChange);
    return () => {
      window.removeEventListener("popstate", handleChange);
      window.removeEventListener("hashchange", handleChange);
    };
  }, []);

  return pathname;
}
