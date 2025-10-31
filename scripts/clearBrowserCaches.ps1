# 🧹 Browser Cache Clearing Script for Windows
# This script provides comprehensive cache clearing instructions and utilities

Write-Host "`n╔═══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       🧹 COMPREHENSIVE BROWSER CACHE CLEARING GUIDE                  ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "📍 ISSUE: Images not updating despite code changes" -ForegroundColor Yellow
Write-Host "🎯 SOLUTION: Nuclear browser cache clearing`n" -ForegroundColor Green

Write-Host "════════════════════════════════════════════════════════════════════════" -ForegroundColor Gray

Write-Host "`n⚡ QUICK FIX #1: DevTools Method (RECOMMENDED)" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "1. Open your browser to http://localhost:3000" -ForegroundColor White
Write-Host "2. Press F12 (or Ctrl+Shift+I) to open DevTools" -ForegroundColor White
Write-Host "3. Right-click the refresh button (🔄) → 'Empty Cache and Hard Reload'" -ForegroundColor White
Write-Host "4. OR: Go to 'Application' tab → Storage → 'Clear site data'" -ForegroundColor White
Write-Host "5. OR: Go to 'Network' tab → Check 'Disable cache' → Keep DevTools open" -ForegroundColor White

Write-Host "`n⚡ QUICK FIX #2: Manual Browser Cache Clear" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "Chrome/Edge:" -ForegroundColor Yellow
Write-Host "  1. Press Ctrl+Shift+Delete" -ForegroundColor White
Write-Host "  2. Select 'Cached images and files'" -ForegroundColor White
Write-Host "  3. Time range: 'All time'" -ForegroundColor White
Write-Host "  4. Click 'Clear data'" -ForegroundColor White

Write-Host "`nFirefox:" -ForegroundColor Yellow
Write-Host "  1. Press Ctrl+Shift+Delete" -ForegroundColor White
Write-Host "  2. Check 'Cache'" -ForegroundColor White
Write-Host "  3. Click 'Clear Now'" -ForegroundColor White

Write-Host "`n⚡ QUICK FIX #3: Incognito/Private Mode Test" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "1. Press Ctrl+Shift+N (Chrome/Edge) or Ctrl+Shift+P (Firefox)" -ForegroundColor White
Write-Host "2. Navigate to http://localhost:3000" -ForegroundColor White
Write-Host "3. Check if images appear correctly" -ForegroundColor White
Write-Host "   → If YES: Cache was the problem ✅" -ForegroundColor Green
Write-Host "   → If NO: Issue is elsewhere ❌" -ForegroundColor Red

Write-Host "`n⚡ NUCLEAR OPTION: Clear ALL Browser Data" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "⚠️  WARNING: This will clear ALL browsing data!" -ForegroundColor Red

$confirm = Read-Host "`nDo you want to proceed with nuclear cache clearing? (yes/no)"

if ($confirm -eq 'yes') {
    Write-Host "`n🚀 Executing nuclear cache clear..." -ForegroundColor Yellow
    
    # Chrome
    Write-Host "`n📌 Clearing Chrome cache..." -ForegroundColor Cyan
    $chromeCache = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache"
    $chromeCache2 = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Code Cache"
    
    if (Test-Path $chromeCache) {
        Remove-Item -Recurse -Force $chromeCache -ErrorAction SilentlyContinue
        Write-Host "  ✅ Chrome Cache cleared" -ForegroundColor Green
    }
    if (Test-Path $chromeCache2) {
        Remove-Item -Recurse -Force $chromeCache2 -ErrorAction SilentlyContinue
        Write-Host "  ✅ Chrome Code Cache cleared" -ForegroundColor Green
    }
    
    # Edge
    Write-Host "`n📌 Clearing Edge cache..." -ForegroundColor Cyan
    $edgeCache = "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cache"
    $edgeCache2 = "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Code Cache"
    
    if (Test-Path $edgeCache) {
        Remove-Item -Recurse -Force $edgeCache -ErrorAction SilentlyContinue
        Write-Host "  ✅ Edge Cache cleared" -ForegroundColor Green
    }
    if (Test-Path $edgeCache2) {
        Remove-Item -Recurse -Force $edgeCache2 -ErrorAction SilentlyContinue
        Write-Host "  ✅ Edge Code Cache cleared" -ForegroundColor Green
    }
    
    # Firefox
    Write-Host "`n📌 Clearing Firefox cache..." -ForegroundColor Cyan
    $firefoxProfiles = "$env:APPDATA\Mozilla\Firefox\Profiles"
    
    if (Test-Path $firefoxProfiles) {
        Get-ChildItem -Path $firefoxProfiles -Directory | ForEach-Object {
            $cacheDir = Join-Path $_.FullName "cache2"
            if (Test-Path $cacheDir) {
                Remove-Item -Recurse -Force $cacheDir -ErrorAction SilentlyContinue
                Write-Host "  ✅ Firefox profile cache cleared: $($_.Name)" -ForegroundColor Green
            }
        }
    }
    
    Write-Host "`n✅ Nuclear cache clear complete!" -ForegroundColor Green
    Write-Host "⚠️  Please restart your browser for changes to take effect" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ Nuclear cache clear cancelled" -ForegroundColor Red
}

Write-Host "`n═══════════════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "📝 ADDITIONAL TIPS:" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "1. Disable browser extensions (AdBlock, cache plugins) temporarily" -ForegroundColor White
Write-Host "2. Check if image URLs in DevTools Network tab show 200 status" -ForegroundColor White
Write-Host "3. Verify image URLs directly in browser address bar" -ForegroundColor White
Write-Host "4. For ImageKit.io CDN issues, add '?purge=true' to image URL" -ForegroundColor White
Write-Host "5. Check if browser is in offline mode (rare)" -ForegroundColor White

Write-Host "`n╔═══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ After clearing cache, refresh page with Ctrl+F5 (hard refresh)   ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green
