# PROJECT SECURITY NOTICE

## 🔒 DEVELOPMENT SERVER SECURITY

**CRITICAL**: Only the `indastreet-massage-platform` project should be served from this directory.

### ⚠️ SECURITY MEASURES IMPLEMENTED:

1. **Process Isolation**: All Node.js processes are terminated before starting dev server
2. **Port Protection**: Port 3000 is secured exclusively for this massage platform
3. **Cache Clearing**: Browser caches cleared to prevent cross-project contamination
4. **Project Verification**: Package.json verified to ensure correct project

### 🚀 SECURE STARTUP COMMAND:

Use the secure startup script:
```powershell
.\secure-dev-start.ps1
```

Or manual secure startup:
```powershell
taskkill /F /IM node.exe 2>$null; Start-Sleep 3; pnpm run dev
```

### 🔍 PROJECT VERIFICATION:

- **Name**: indastreet-massage-platform
- **Version**: 2.0.0
- **Description**: Modular massage booking platform with separate apps for each user type
- **Port**: 3000 (exclusive)
- **URL**: http://127.0.0.1:3000/

### ❌ NEVER RUN OTHER PROJECTS SIMULTANEOUSLY

To prevent contamination:
1. Always kill existing Node processes before starting
2. Verify you're in the correct directory (`website-massage-`)
3. Check package.json matches this project
4. Clear browser cache if switching between projects

### 🛡️ IF WRONG PROJECT APPEARS:

1. Immediately stop dev server (Ctrl+C)
2. Run: `taskkill /F /IM node.exe`
3. Clear browser cache: Ctrl+Shift+Delete
4. Navigate to correct directory
5. Verify package.json
6. Restart with security script

**Remember**: Only the massage booking platform should be accessible through the chat window and dev server!