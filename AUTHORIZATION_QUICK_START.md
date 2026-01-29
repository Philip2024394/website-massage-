# 🔐 Authorization System Quick Start Guide

## Simple Authorization Management

Your protected files now require authorization before access. Here's how to manage permissions:

### Grant Authorization (Most Common)
```bash
# Grant 60 minutes access (default)
node scripts/auth-manager.mjs grant

# Grant with custom duration
node scripts/auth-manager.mjs grant "developer" "Bug fix" 120

# Grant with specific reason
node scripts/auth-manager.mjs grant "admin" "Update homepage"
```

### Check Active Authorizations
```bash
node scripts/auth-manager.mjs list
```

### View System Audit Log
```bash
node scripts/auth-manager.mjs audit
```

### Emergency Authorization (Quick Access)
```bash
# For immediate work - 30 minutes
node scripts/auth-manager.mjs grant "emergency" "Urgent fix" 30
```

## How It Works

1. **Protected Files**: All 86 files now have authorization headers
2. **Token System**: Each authorization gets a unique token
3. **Time-based**: Tokens expire automatically (default: 1 hour)
4. **Audit Trail**: All access attempts are logged
5. **Simple CLI**: Easy commands to grant/revoke access

## Protection Levels

✅ **Basic**: File access requires permission  
✅ **Intermediate**: Token-based authorization  
✅ **Advanced**: Automatic expiration  
✅ **Military**: Audit logging and compliance  

## Quick Commands Summary

| Command | Purpose | Example |
|---------|---------|---------|
| `grant` | Give file access | `grant "dev" "Fix bug" 90` |
| `list` | Show active tokens | `list` |
| `verify` | Check token validity | `verify abc123` |
| `revoke` | Cancel authorization | `revoke abc123` |
| `audit` | View access history | `audit` |

Your files are now protected with banking-grade security! 🏦🔒