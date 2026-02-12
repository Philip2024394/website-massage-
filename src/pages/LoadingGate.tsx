/**
 * 🔴 PRODUCTION-CRITICAL — DO NOT MODIFY
 *
 * This file controls the initial app load and loading page.
 * Previously caused full app crashes and blank screens.
 * Current behavior is STABLE and MUST NOT CHANGE.
 *
 * ALLOWED:
 * - Read user location
 * - Allow city selection (slider/manual)
 * - Save selected location to state/storage
 *
 * FORBIDDEN:
 * - Changing render flow
 * - Adding async blocking logic
 * - Adding new effects, polling, or refactors
 * - Adding API or DB calls
 *
 * If this file breaks, the app does not load.
 * Stability > Features > Refactors.
 */


/**
 * LoadingGate - First-paint loading screen (matches index.html pwa-splash)
 * 
 * Displays orange screen while app loads. Parent coordinator switches to landing
 * after 300ms or when critical data ready. No self-redirect - coordinator handles transition.
 * 
 * Usage: setPage('loading') on fresh load → coordinator → setPage('landing')
 */
export default function LoadingGate() {
  return (
    <div
      data-loading-gate
      style={{
        // 🔒 STABILITY: Self-contained lock (per STABILITY_SCROLL_LOCK_RULES.md)
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        zIndex: 9999,
        // Visual styling
        backgroundColor: "#FF7A00",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: "22px",
        fontWeight: 600,
      }}
    >
      {/* Brand Header - Enhanced visibility */}
      <div style={{ marginBottom: "32px", textAlign: "center", zIndex: 10, position: "relative" }}>
        <h1 style={{ fontSize: "48px", fontWeight: "bold", marginBottom: "8px", color: "#ffffff", textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <span style={{ color: "#ffffff" }}>Inda</span>
          <span style={{ color: "#ffffff" }}>Street</span>
        </h1>
        <p style={{ color: "#ffffff", fontSize: "18px", fontWeight: "500", opacity: 1, textShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>
          Professional Massage Services
        </p>
      </div>
      
      {/* Loading Dots */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ 
          width: "8px", 
          height: "8px", 
          backgroundColor: "#fff", 
          borderRadius: "50%",
          animation: "bounce 1s infinite"
        }}></div>
        <div style={{ 
          width: "8px", 
          height: "8px", 
          backgroundColor: "#fff", 
          borderRadius: "50%",
          animation: "bounce 1s infinite 0.15s"
        }}></div>
        <div style={{ 
          width: "8px", 
          height: "8px", 
          backgroundColor: "#fff", 
          borderRadius: "50%",
          animation: "bounce 1s infinite 0.3s"
        }}></div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
        }
      `}} />
    </div>
  );
}
