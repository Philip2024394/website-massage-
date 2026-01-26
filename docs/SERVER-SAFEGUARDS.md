# 🛡️ Server Safeguard System

## Problem Solved
The development server was frequently going offline due to:
- Terminal windows being accidentally closed
- Commands interrupting the running server
- No health monitoring or alerts
- No automatic cleanup of zombie processes

## ✅ Solution: 3-Script Safeguard System

### 1. **start-server.ps1** - Safe Server Startup
**Purpose:** Start the development server with automatic cleanup and validation

**Features:**
- ✅ Kills zombie processes automatically
- ✅ Clears ports 3000, 3001, 3002
- ✅ Validates workspace and package.json
- ✅ Provides clear status messages
- ✅ Captures and displays all server output
- ✅ Creates flag file to track server state

**Usage:**
```powershell
.\start-server.ps1
```

**What it does:**
1. Stops all existing Node.js processes
2. Clears ports to prevent conflicts
3. Verifies workspace structure
4. Starts server with full output capture
5. Detects when server is ready
6. Displays clear URLs for access

---

### 2. **monitor-server.ps1** - Health Monitor
**Purpose:** Continuously monitor server health and alert on failures

**Features:**
- ✅ Checks server every 10 seconds (configurable)
- ✅ Tracks consecutive failures
- ✅ Sounds audio alert on critical failures
- ✅ Shows process information
- ✅ Displays uptime statistics
- ✅ Non-invasive (runs in separate window)

**Usage:**
```powershell
# Monitor default port (3000)
.\monitor-server.ps1

# Monitor custom port
.\monitor-server.ps1 -Port 3001 -CheckIntervalSeconds 15
```

**Alert Levels:**
- ✅ GREEN: Server healthy
- ❌ RED: Server down (with failure count)
- 🚨 CRITICAL: 3+ consecutive failures (audio alert + recommendations)

---

### 3. **quick-start.ps1** - Interactive Menu
**Purpose:** Easy-to-use menu for all server operations

**Features:**
- ✅ Interactive menu system
- ✅ Start server with safeguards
- ✅ Start server + monitor (2 windows)
- ✅ Check server status
- ✅ Stop all servers
- ✅ Quick restart

**Usage:**
```powershell
.\quick-start.ps1
```

**Menu Options:**
```
1) Start server (with safeguards)
2) Start server + health monitor (2 windows)  ← RECOMMENDED
3) Check server status
4) Stop all servers
5) Quick restart
6) Exit
```

---

## 🎯 Recommended Workflow

### **For Daily Development:**
```powershell
# Option 1: Start server with monitoring (BEST)
.\quick-start.ps1
# Then select option 2

# Option 2: Manual start
.\start-server.ps1
```

### **For Troubleshooting:**
```powershell
# Check if server is running
.\quick-start.ps1
# Select option 3

# Force restart
.\quick-start.ps1
# Select option 5
```

---

## 🌐 Server URLs

Once started, access the application at:

- **Main App:** http://127.0.0.1:3000/
- **Admin Dashboard:** http://127.0.0.1:3000/#/admin
- **Therapist Cards:** http://127.0.0.1:3000/#/admin → "Therapist Cards"

---

## ⚠️ Important Rules

### DO:
✅ Use `.\quick-start.ps1` for easy management
✅ Keep server terminal window open
✅ Use option 2 to run server + monitor
✅ Check monitor window for health status

### DON'T:
❌ Close the server terminal window
❌ Run `pnpm dev` directly (use scripts instead)
❌ Run multiple commands in server terminal
❌ Ignore red alerts from monitor

---

## 🔧 Troubleshooting

### Server won't start?
```powershell
# 1. Stop everything
.\quick-start.ps1
# Select option 4

# 2. Check for zombie processes
Get-Process | Where-Object {$_.ProcessName -like "*node*"}

# 3. Quick restart
.\quick-start.ps1
# Select option 5
```

### Server keeps going offline?
```powershell
# Start with monitoring
.\quick-start.ps1
# Select option 2

# Watch the monitor window for:
# - Consecutive failures
# - Process information
# - Error messages
```

### Port already in use?
```powershell
# Check what's using port 3000
netstat -ano | findstr :3000

# Kill specific process
Stop-Process -Id [PID] -Force

# Or use quick restart
.\quick-start.ps1
# Select option 5
```

---

## 📊 Features Overview

| Feature | start-server.ps1 | monitor-server.ps1 | quick-start.ps1 |
|---------|------------------|-------------------|-----------------|
| Start server | ✅ | ❌ | ✅ |
| Health checks | ❌ | ✅ | ❌ |
| Auto cleanup | ✅ | ❌ | ✅ |
| Status display | ✅ | ✅ | ✅ |
| Audio alerts | ❌ | ✅ | ❌ |
| Interactive menu | ❌ | ❌ | ✅ |
| Multi-window | ❌ | ❌ | ✅ |

---

## 🎯 Success Indicators

When server is running properly, you'll see:

```
╔════════════════════════════════════════════════════════════════╗
║              ✅ SERVER READY AND LISTENING!                     ║
╚════════════════════════════════════════════════════════════════╝

🌐 Main App: http://127.0.0.1:3000/
🔧 Admin Dashboard: http://127.0.0.1:3000/#/admin
```

Monitor window will show:
```
[15:30:45] Check #1 - ✅ HEALTHY (HTTP 200)
[15:30:55] Check #2 - ✅ HEALTHY (HTTP 200)
```

---

## 📝 Notes

- Scripts require PowerShell 5.1 or higher
- Server runs on port 3000 by default (fallback: 3001, 3002)
- All scripts are located in workspace root
- Flag file `.server-running` tracks server state
- Audio alerts require system sound enabled

---

## 🚀 Quick Reference

```powershell
# Best way to start (recommended)
.\quick-start.ps1  # Option 2

# Manual start with safeguards
.\start-server.ps1

# Monitor existing server
.\monitor-server.ps1

# Check status
.\quick-start.ps1  # Option 3

# Emergency stop
.\quick-start.ps1  # Option 4
```

---

**Last Updated:** 2026-01-17
**System Status:** ✅ Production Ready
