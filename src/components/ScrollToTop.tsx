import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrollt bei jedem Routenwechsel zuverlässig nach oben – auch auf Mobile,
 * wo Browser die alte Scroll-Position wiederherstellen.
 */
const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const jump = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    jump();
    const raf1 = requestAnimationFrame(() => {
      jump();
      requestAnimationFrame(jump);
    });
    const t = setTimeout(jump, 120);

    return () => {
      cancelAnimationFrame(raf1);
      clearTimeout(t);
    };
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
