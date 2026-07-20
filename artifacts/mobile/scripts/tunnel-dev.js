#!/usr/bin/env node
/**
 * Dev entry point — works both on Replit and locally.
 *
 * • Loads .env from the project root (if present) so local devs can set
 *   NGROK_AUTHTOKEN / NGROK_STATIC_DOMAIN without touching the shell.
 * • When NGROK_AUTHTOKEN is set, Expo's tunnel uses your ngrok account.
 * • When NGROK_STATIC_DOMAIN is also set, the tunnel URL is stable across
 *   restarts so Expo Go preserves AsyncStorage (no progress loss).
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Load .env if present (simple key=value parser, no dependencies needed)
// ---------------------------------------------------------------------------
const envFile = path.join(ROOT, '.env');
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (key && val && !process.env[key]) {
      process.env[key] = val;
    }
  }
  console.log('📄 Loaded .env');
}

// ---------------------------------------------------------------------------
// Resolve port — Replit sets $PORT, locally default to 8081
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || '8081';

// ---------------------------------------------------------------------------
// Build the expo start command
// ---------------------------------------------------------------------------
const args = ['exec', 'expo', 'start', '--port', PORT, '--tunnel'];

// ngrok static domain: tell @expo/ngrok which subdomain/domain to use.
// NGROK_AUTHTOKEN is read automatically by @expo/ngrok from the environment.
if (process.env.NGROK_STATIC_DOMAIN) {
  // Pass as EXPO_TUNNEL_SUBDOMAIN so @expo/ngrok requests it.
  // For ngrok-free.app domains the full hostname is needed as the subdomain.
  process.env.EXPO_TUNNEL_SUBDOMAIN = process.env.NGROK_STATIC_DOMAIN.replace('.ngrok-free.app', '');
  console.log(`🔗 Requesting stable tunnel: ${process.env.NGROK_STATIC_DOMAIN}`);
} else if (process.env.NGROK_AUTHTOKEN) {
  console.log('🔑 ngrok authtoken found — using your account for the tunnel.');
} else {
  console.log('⚠️  No NGROK_AUTHTOKEN set — tunnel URL will change on each restart (progress may reset).');
  console.log('   Copy .env.example → .env and add your token to fix this.\n');
}

const env = {
  ...process.env,
  EXPO_PUBLIC_DOMAIN: process.env.REPLIT_DEV_DOMAIN || '',
  EXPO_PUBLIC_REPL_ID: process.env.REPL_ID || '',
};

const expo = spawn('pnpm', args, { env, stdio: 'inherit', cwd: ROOT });

expo.on('exit', code => process.exit(code ?? 0));

const shutdown = () => expo.kill('SIGTERM');
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
