import { build } from 'esbuild'
import { glob } from 'glob'
import path from 'path'

async function buildApp() {
  try {
    // Find all TypeScript/JavaScript entry points
    const entryPoints = await glob('src/**/*.{ts,tsx}', { 
      ignore: ['**/*.d.ts', '**/*.test.*', '**/*.spec.*'] 
    })
    
    console.log('🚀 Building with esbuild...')
    
    await build({
      entryPoints: ['src/main.tsx'],
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
        '.css': 'css'
      },
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      plugins: [
        {
          name: 'css-processor',
          setup(build) {
            // Handle CSS imports
            build.onLoad({ filter: /\.css$/ }, async (args) => {
              const fs = await import('fs/promises')
              const contents = await fs.readFile(args.path, 'utf8')
              return {
                contents,
                loader: 'css'
              }
            })
          }
        }
      ]
    })
    
    // Copy index.html
    const fs = await import('fs/promises')
    const indexHtml = await fs.readFile('index.html', 'utf8')
    const processedHtml = indexHtml.replace('/src/main.tsx', '/main.js')
    await fs.writeFile('dist/index.html', processedHtml)
    
    console.log('✅ Build completed successfully!')
    
  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

buildApp()