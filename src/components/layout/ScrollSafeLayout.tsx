import { useEffect } from "react";

interface ScrollSafeLayoutProps {
  children: React.ReactNode;
}

export default function ScrollSafeLayout({ children }: ScrollSafeLayoutProps) {
  useEffect(() => {
    // HARD RESET — guarantees scroll is enabled
    document.documentElement.style.overflowY = "auto";
    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowY = "auto";
    document.body.style.overflowX = "hidden";
    document.body.style.height = "auto";
    document.documentElement.style.height = "auto";

    console.log('🔒 ScrollSafeLayout: Hard scroll reset applied');

    return () => {
      // DO NOT lock scroll on unmount
      document.documentElement.style.overflowY = "auto";
      document.body.style.overflowY = "auto";
    };
  }, []);

  return (
    <div className="scroll-safe-root">
      {children}
    </div>
  );
}