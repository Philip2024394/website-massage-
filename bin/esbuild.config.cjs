const esbuild = require('esbuild')
const fs = require('fs')
const path = require('path')

async function buildApp() {
  try {
    console.log('🚀 Building with esbuild (bypassing Rollup)...')
    
    // First run TypeScript compiler
    console.log('Running TypeScript compiler...')
    const { execSync } = require('child_process')
    execSync('npx tsc --noEmit', { stdio: 'inherit' })
    
    await esbuild.build({
      entryPoints: ['index.tsx'],
      bundle: true,
      outdir: 'dist',
      format: 'esm',
      platform: 'browser',
      target: 'es2020',
      minify: true,
      sourcemap: false,
      splitting: true,
      chunkNames: '[name]-[hash]',
      assetNames: '[name]-[hash]',
      loader: {
        '.png': 'file',
        '.jpg': 'file',
        '.jpeg': 'file',
        '.svg': 'file',
        '.gif': 'file',
        '.webp': 'file',
        '.css': 'css',
        '.tsx': 'tsx',
        '.ts': 'ts',
        '.jsx': 'jsx',
        '.js': 'js'
      },
      define: {
        'process.env.NODE_ENV': '"production"',
        'global': 'globalThis'
      },
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/shared': path.resolve(__dirname, './src/shared'),
        '@/apps': path.resolve(__dirname, './src/apps'),
        '@/admin': path.resolve(__dirname, './src/apps/admin'),
        '@/agent': path.resolve(__dirname, './src/apps/agent'),
        '@/client': path.resolve(__dirname, './src/apps/client'),
        '@/therapist': path.resolve(__dirname, './src/apps/therapist'),
        '@/place': path.resolve(__dirname, './src/apps/place'),
        '@/hotel': path.resolve(__dirname, './src/apps/hotel'),
        '@/villa': path.resolve(__dirname, './src/apps/villa'),
      },
      jsx: 'automatic',
      jsxDev: false
    })
    
    // Copy and process index.html
    console.log('Processing index.html...')
    const indexHtml = fs.readFileSync('public/index.html', 'utf8')
    
    // Find generated CSS files
    const cssFiles = fs.readdirSync('dist').filter(file => file.endsWith('.css'))
    console.log('Found CSS files:', cssFiles)
    
    // Create CSS link tags
    const cssLinks = cssFiles.map(file => `<link rel="stylesheet" href="/${file}">`).join('\n    ')
    
    const processedHtml = indexHtml
      .replace('/index.tsx?v=20241031100500', '/index.js')
      .replace('src="/index.tsx?v=20241031100500"', 'src="/index.js"')
      .replace('</head>', `    ${cssLinks}\n</head>`)
    
    fs.writeFileSync('dist/index.html', processedHtml)
    
    // Copy any static assets EXCEPT index.html (we already processed it)
    if (fs.existsSync('public')) {
      const publicFiles = fs.readdirSync('public', { withFileTypes: true })
      for (const file of publicFiles) {
        if (file.name === 'index.html') continue // Skip index.html - we already processed it

        const sourcePath = path.join('public', file.name)
        const destPath = path.join('dist', file.name)

        try {
          if (file.isDirectory()) {
            // Prefer Node's built-in recursive copy (Node 16+). This avoids shell quoting issues on CI.
            if (fs.cpSync) {
              fs.mkdirSync(destPath, { recursive: true })
              fs.cpSync(sourcePath, destPath, { recursive: true })
            } else {
              // Fallback to platform-specific commands when fs.cpSync is unavailable
              const { execSync } = require('child_process')
              if (process.platform === 'win32') {
                // xcopy on Windows (dest folder must end with a backslash)
                execSync(`xcopy /E /I /Y "${sourcePath}" "${destPath}\\"`, { stdio: 'inherit' })
              } else {
                // cp on POSIX
                execSync(`cp -r "${sourcePath}" "${destPath}"`, { stdio: 'inherit' })
              }
            }
          } else {
            // Ensure parent folder exists
            fs.mkdirSync(path.dirname(destPath), { recursive: true })
            fs.copyFileSync(sourcePath, destPath)
          }
          console.log(file.name)
        } catch (err) {
          // Log and continue - keep build resilient
          console.warn(`Could not copy ${file.name}:`, err && err.message ? err.message : err)
        }
      }
    }
    
    console.log('✅ ESBuild completed successfully! No Rollup native binaries needed.')
    
  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

buildApp()