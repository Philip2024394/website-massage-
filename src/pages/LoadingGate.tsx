import { useEffect } from "react";

/**
 * LoadingGate - Isolated loading page to prevent infinite loops
 * 
 * CRITICAL RULES:
 * - NO hooks except useEffect
 * - NO context providers (Auth, Chat, Status, etc.)
 * - NO props or conditional logic
 * - Single timeout, single exit route
 * - Completely isolated from app state
 * - HARD LOCK: Prevents re-entry via sessionStorage
 * 
 * Usage: setPage('loading') or navigate to /#/loading
 */
export default function LoadingGate() {
  useEffect(() => {
    console.log("🔄 LoadingGate mounted");
    
    // HARD LOCK: Prevent infinite loop re-entry
    if (sessionStorage.getItem("LOADING_LOCKED")) {
      console.warn("🚫 LoadingGate: Re-entry blocked by LOADING_LOCKED flag");
      window.location.hash = "#/home";
      return;
    }
    
    // Set lock immediately
    sessionStorage.setItem("LOADING_LOCKED", "1");
    console.log("🔒 LoadingGate: Lock engaged");
    
    // Block scroll on this page
    document.body.style.overflow = "hidden";
    
    const timer = setTimeout(() => {
      console.log("✅ LoadingGate: Timeout complete, redirecting to home");
      // Direct hash navigation - works with app's routing system
      window.location.hash = "#/home";
    }, 1800); // 1.8 seconds

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#FF7A00",
        height: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: "22px",
        fontWeight: 600,
      }}
    >
      Loading…
    </div>
  );
}
