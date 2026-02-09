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

import { useEffect } from "react";
import { logger } from '../utils/logger';

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
    logger.debug("🔄 LoadingGate mounted");
    
    // HARD LOCK: Prevent infinite loop re-entry
    if (sessionStorage.getItem("LOADING_LOCKED")) {
      logger.warn("🚫 LoadingGate: Re-entry blocked by LOADING_LOCKED flag");
      window.location.hash = "#/home";
      return;
    }
    
    // Set lock immediately
    sessionStorage.setItem("LOADING_LOCKED", "1");
    logger.debug("🔒 LoadingGate: Lock engaged");
    
    // ✅ MOBILE SCROLL FIX: Use modal-open class instead of inline styles
    document.body.classList.add('modal-open');
    
    const timer = setTimeout(() => {
      logger.debug("✅ LoadingGate: Timeout complete, redirecting to home");
      // Direct hash navigation - works with app's routing system
      window.location.hash = "#/home";
    }, 300); // 300ms - smooth transition without unnecessary wait

    return () => {
      clearTimeout(timer);
      document.body.classList.remove('modal-open');
    };
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#FF7A00",
        height: "100dvh", // Fixed: iOS Safari viewport fix
        minHeight: "calc(var(--vh, 1vh) * 100)", // Fallback for browsers without 100dvh
        width: "100%",
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
