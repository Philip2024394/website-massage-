#!/usr/bin/env node
// Auto-open Chrome for Vite dev server on Windows
// Starts the dev server (pnpm dev) then opens Chrome once reachable.

import { spawn } from 'child_process';
import fs from 'fs';
import http from 'http';

// Ensure port matches package.json dev script
const port = process.env.VITE_PORT || 3005;
const url = `http://localhost:${port}`;

// Start dev server
const dev = spawn('pnpm', ['dev'], { stdio: 'inherit', shell: true });

function locateChrome() {
  const candidates = [
    process.env['ProgramFiles'] + '\\Google\\Chrome\\Application\\chrome.exe',
    process.env['ProgramFiles(x86)'] + '\\Google\\Chrome\\Application\\chrome.exe',
    process.env['LocalAppData'] + '\\Google\\Chrome\\Application\\chrome.exe',
    'chrome'
  ].filter(Boolean);

  for (const exe of candidates) {
    try {
      if (exe === 'chrome' || fs.existsSync(exe)) return exe;
    } catch {}
  }
  return null;
}

function openChrome(target) {
  const exe = locateChrome();
  if (!exe) {
    console.warn('⚠️ Could not find Chrome executable. Please ensure Chrome is installed or set as PATH.');
    return;
  }
  console.log('🚀 Opening Chrome at', target);
  spawn(exe, [target], { detached: true, stdio: 'ignore', shell: true });
}

function waitForServer() {
  http.get(url, (res) => {
    if (res.statusCode >= 200 && res.statusCode < 500) {
      console.log('✅ Dev server reachable. Launching Chrome...');
      openChrome(url);
    } else {
      setTimeout(waitForServer, 500);
    }
  }).on('error', () => setTimeout(waitForServer, 500));
}

waitForServer();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down dev server...');
  dev.kill('SIGINT');
  process.exit(0);
});
