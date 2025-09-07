#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting build optimization...');

// 1. Clean previous builds
console.log('🧹 Cleaning previous builds...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

// 2. Build with optimizations
console.log('📦 Building with optimizations...');
execSync('npm run build', { stdio: 'inherit' });

// 3. Analyze bundle size
console.log('📊 Analyzing bundle size...');
const distPath = path.join(__dirname, '..', 'dist');
const assetsPath = path.join(distPath, 'assets');

if (fs.existsSync(assetsPath)) {
  const files = fs.readdirSync(assetsPath);
  let totalSize = 0;
  
  files.forEach(file => {
    const filePath = path.join(assetsPath, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    totalSize += stats.size;
    console.log(`  📄 ${file}: ${sizeKB} KB`);
  });
  
  console.log(`📈 Total bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
  
  // Warn if bundle is too large
  if (totalSize > 1024 * 1024) { // 1MB
    console.log('⚠️  Warning: Bundle size is over 1MB. Consider further optimization.');
  } else {
    console.log('✅ Bundle size is optimized!');
  }
}

// 4. Generate performance report
console.log('📋 Generating performance report...');
const report = {
  timestamp: new Date().toISOString(),
  optimizations: [
    'Code splitting with manual chunks',
    'Tree shaking enabled',
    'Minification with Terser',
    'Console logs removed in production',
    'CSS purging enabled',
    'Image optimization',
    'Lazy loading components',
    'Compression headers configured'
  ],
  recommendations: [
    'Consider using a CDN for static assets',
    'Implement service worker for caching',
    'Add preloading for critical resources',
    'Monitor Core Web Vitals'
  ]
};

fs.writeFileSync(
  path.join(distPath, 'performance-report.json'),
  JSON.stringify(report, null, 2)
);

console.log('✅ Build optimization complete!');
console.log('📊 Performance report saved to dist/performance-report.json');
