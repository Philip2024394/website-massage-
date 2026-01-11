# Deployment Configuration

## ✅ Active Deployment Platform: **Netlify**

This project is deployed using **Netlify**, not Vercel.

### Netlify Configuration
- **Config File**: `netlify.toml` (root directory)
- **Build Command**: `pnpm run build:netlify`
- **Publish Directory**: `dist`
- **Live Site**: Connected via Netlify dashboard

### Files Related to Netlify
- `netlify.toml` - Main configuration file
- `.github/workflows/deploy.yml` - GitHub Actions for GitHub Pages (not Netlify)

### ⚠️ Vercel Files (Not Used)
The following files exist but are **NOT USED** for deployment:
- `bin/vercel.json` - Kept for reference only
- `.vercelignore` - Prevents accidental Vercel deployments

### Disabling Vercel Deployments

If you see Vercel build errors in GitHub:

1. **Go to GitHub Repository Settings**
2. **Navigate to**: Settings → Integrations & Services → Vercel
3. **Remove** or **disconnect** the Vercel integration
4. Alternatively, add `.vercelignore` file (already added) to ignore all files

### Local Development
```bash
pnpm install
pnpm run dev
```

### Building for Production
```bash
pnpm run build:netlify
```

### Deployment Process
- Push to `main` branch → Netlify automatically deploys
- No manual deployment needed
- Netlify manages the entire build and deployment process

---

**Note**: If you want to use Vercel in the future, you'll need to:
1. Remove `.vercelignore`
2. Enable Vercel integration in GitHub
3. Update `bin/vercel.json` configuration
