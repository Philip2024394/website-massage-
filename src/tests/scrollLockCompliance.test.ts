/**
 * 🔒 SCROLL LOCK COMPLIANCE TESTS
 * 
 * Automated tests to enforce STABILITY_SCROLL_LOCK_RULES.md
 * These tests catch violations before they reach production.
 * 
 * Run: npm test -- scrollLockCompliance.test.ts
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Scroll Lock Compliance Tests', () => {
  describe('Rule 1: Global Scroll Must Never Be Disabled', () => {
    it('should NOT lock body scroll in CSS files', () => {
      const cssFiles = findFiles('src', /\.css$/);
      const violations: string[] = [];

      cssFiles.forEach((filePath) => {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Check for body { overflow: hidden }
        if (/body\s*\{[^}]*overflow\s*:\s*hidden/i.test(content)) {
          // Allow if it's under modal-open class (temporary lock only)
          if (!/body\.modal-open\s*\{[^}]*overflow\s*:\s*hidden/i.test(content)) {
            violations.push(`${filePath}: Contains body { overflow: hidden }`);
          }
        }
        
        // Check for html { overflow: hidden }
        if (/html\s*\{[^}]*overflow\s*:\s*hidden/i.test(content)) {
          violations.push(`${filePath}: Contains html { overflow: hidden }`);
        }
        
        // Check for #root { overflow: hidden }
        if (/#root\s*\{[^}]*overflow\s*:\s*hidden/i.test(content)) {
          violations.push(`${filePath}: Contains #root { overflow: hidden }`);
        }
      });

      if (violations.length > 0) {
        throw new Error(
          `❌ Global scroll lock detected:\n${violations.join('\n')}\n\n` +
          `See: core-ui/STABILITY_SCROLL_LOCK_RULES.md`
        );
      }
    });

    it('should NOT lock body scroll in TSX/JSX files', () => {
      const tsxFiles = findFiles('src', /\.(tsx|ts|jsx|js)$/);
      const violations: string[] = [];

      tsxFiles.forEach((filePath) => {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Check for document.body.style.overflow = 'hidden' (not under modal-open context)
        if (/document\.body\.style\.overflow\s*=\s*['"]hidden['"]/i.test(content)) {
          // Allow if followed by cleanup that removes it
          const hasCleanup = /document\.body\.style\.overflow\s*=\s*['"](?:auto|visible)['"]/i.test(content);
          if (!hasCleanup) {
            violations.push(`${filePath}: Sets document.body.style.overflow = 'hidden' without cleanup`);
          }
        }
        
        // Check for body.classList.add('modal-open') in non-modal components
        if (/document\.body\.classList\.add\(['"]modal-open['"]\)/i.test(content)) {
          // Check if file is a loading screen or landing page (not allowed)
          if (/LoadingGate|LoadingScreen|LandingPage/i.test(filePath)) {
            violations.push(
              `${filePath}: Uses modal-open class in loading/landing component\n` +
              `  → Use self-contained position: fixed instead`
            );
          }
        }
      });

      if (violations.length > 0) {
        throw new Error(
          `❌ Body scroll manipulation detected:\n${violations.join('\n')}\n\n` +
          `See: core-ui/STABILITY_SCROLL_LOCK_RULES.md Rule #1`
        );
      }
    });
  });

  describe('Rule 3: Loading & Landing Locks Are LOCAL ONLY', () => {
    it('LoadingGate should use self-contained lock', () => {
      const loadingGatePath = path.join(process.cwd(), 'src/pages/LoadingGate.tsx');
      
      if (!fs.existsSync(loadingGatePath)) {
        console.warn('⚠️ LoadingGate.tsx not found, skipping test');
        return;
      }
      
      const content = fs.readFileSync(loadingGatePath, 'utf-8');
      
      // Must use position: fixed on component container
      expect(content).toMatch(/position:\s*["']fixed["']/);
      expect(content).toMatch(/inset:\s*0/);
      
      // Must NOT manipulate body scroll
      expect(content).not.toMatch(/document\.body\.classList\.add\(['"]modal-open['"]\)/);
      expect(content).not.toMatch(/document\.body\.style\.overflow\s*=/);
    });

    it('MainLandingPage should NOT lock body scroll', () => {
      const landingPagePath = path.join(process.cwd(), 'src/pages/MainLandingPage.tsx');
      
      if (!fs.existsSync(landingPagePath)) {
        console.warn('⚠️ MainLandingPage.tsx not found, skipping test');
        return;
      }
      
      const content = fs.readFileSync(landingPagePath, 'utf-8');
      
      // Must NOT manipulate body scroll
      expect(content).not.toMatch(/document\.body\.classList\.add\(['"]modal-open['"]\)/);
      expect(content).not.toMatch(/document\.body\.style\.overflow\s*=/);
      expect(content).not.toMatch(/document\.body\.style\.position\s*=/);
    });
  });

  describe('Rule 4: Never Use height: 100vh on App-Level Containers', () => {
    it('App.tsx should use min-height not height', () => {
      const appPath = path.join(process.cwd(), 'src/App.tsx');
      
      if (!fs.existsSync(appPath)) {
        console.warn('⚠️ App.tsx not found, skipping test');
        return;
      }
      
      const content = fs.readFileSync(appPath, 'utf-8');
      
      // Check for height: 100vh assignments in style objects
      const heightVhPattern = /height:\s*["']100vh["']/g;
      const matches = content.match(heightVhPattern);
      
      if (matches) {
        // Check context - allow if it's in a comment or specific component
        const lines = content.split('\n');
        const violations: number[] = [];
        
        lines.forEach((line, index) => {
          if (heightVhPattern.test(line) && !line.includes('//') && !line.includes('/*')) {
            violations.push(index + 1);
          }
        });
        
        if (violations.length > 0) {
          throw new Error(
            `❌ App.tsx uses height: 100vh on lines: ${violations.join(', ')}\n` +
            `  → Use minHeight: '100vh' instead\n\n` +
            `See: core-ui/STABILITY_SCROLL_LOCK_RULES.md Rule #4`
          );
        }
      }
    });

    it('index.css should NOT set height: 100vh on body/html', () => {
      const indexCssPath = path.join(process.cwd(), 'index.css');
      
      if (!fs.existsSync(indexCssPath)) {
        console.warn('⚠️ index.css not found, skipping test');
        return;
      }
      
      const content = fs.readFileSync(indexCssPath, 'utf-8');
      
      // Check for body { height: 100vh }
      if (/body\s*\{[^}]*height\s*:\s*100vh/i.test(content)) {
        throw new Error(
          `❌ index.css sets height: 100vh on body\n` +
          `  → Remove or change to min-height: 100vh\n\n` +
          `See: core-ui/STABILITY_SCROLL_LOCK_RULES.md Rule #4`
        );
      }
      
      // Check for html { height: 100vh }
      if (/html\s*\{[^}]*height\s*:\s*100vh/i.test(content)) {
        throw new Error(
          `❌ index.css sets height: 100vh on html\n` +
          `  → Remove or change to min-height: 100vh\n\n` +
          `See: core-ui/STABILITY_SCROLL_LOCK_RULES.md Rule #4`
        );
      }
    });
  });

  describe('Rule 5: Dashboards Must Never Use Fixed Positioning', () => {
    it('Dashboard components should NOT be position: fixed', () => {
      const dashboardFiles = findFiles('src', /Dashboard|Panel|Status.*Page/i);
      const violations: string[] = [];

      dashboardFiles.forEach((filePath) => {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Look for container-level position: fixed
        // Allow fixed elements inside (like headers/footers)
        const lines = content.split('\n');
        let insideMainContainer = false;
        
        lines.forEach((line, index) => {
          // Detect main container opening
          if (/return\s*\(?\s*<div/i.test(line)) {
            insideMainContainer = true;
          }
          
          // Check first few lines after main container for position: fixed
          if (insideMainContainer && index < 50) {
            if (/position:\s*["']fixed["']/i.test(line) && 
                /overflow:\s*["']hidden["']/i.test(content)) {
              violations.push(
                `${filePath}:${index + 1}\n` +
                `  → Dashboard container uses position: fixed with overflow: hidden\n` +
                `  → Use natural scrolling instead (position: relative, overflow: auto)`
              );
              insideMainContainer = false; // Stop checking
            }
          }
        });
      });

      if (violations.length > 0) {
        throw new Error(
          `❌ Dashboard scroll lock detected:\n${violations.join('\n')}\n\n` +
          `See: core-ui/STABILITY_SCROLL_LOCK_RULES.md Rule #5`
        );
      }
    });
  });

  describe('Safety Checks', () => {
    it('modal-open class should have safety warnings', () => {
      const cssPath = path.join(process.cwd(), 'src/styles/mobile-scroll-gold-standard.css');
      
      if (!fs.existsSync(cssPath)) {
        console.warn('⚠️ mobile-scroll-gold-standard.css not found, skipping test');
        return;
      }
      
      const content = fs.readFileSync(cssPath, 'utf-8');
      
      // Check if modal-open has warning comments
      if (/body\.modal-open/.test(content)) {
        expect(content).toMatch(/WARNING.*STABILITY_SCROLL_LOCK_RULES/);
        expect(content).toMatch(/DO NOT USE for.*loading/i);
      }
    });
  });
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Recursively find files matching pattern
 */
function findFiles(dir: string, pattern: RegExp, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, build folders
      if (!['node_modules', 'dist', 'build', '.git'].includes(file)) {
        findFiles(filePath, pattern, fileList);
      }
    } else if (pattern.test(file)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}
