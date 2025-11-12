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
      entryPoints: ['main.tsx'],
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
    const indexHtml = fs.readFileSync('index.html', 'utf8')
    const processedHtml = indexHtml.replace('/src/main.tsx', '/main.js')
    fs.writeFileSync('dist/index.html', processedHtml)
    
    // Copy any static assets
    if (fs.existsSync('public')) {
      const { execSync } = require('child_process')
      execSync('cp -r public/* dist/ 2>/dev/null || xcopy /E /I /Y public\\* dist\\ 2>nul || true', { stdio: 'inherit' })
    }
    
    console.log('✅ ESBuild completed successfully! No Rollup native binaries needed.')
    
  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

buildApp()