#!/usr/bin/env node
/**
 * Dev entry point — works both on Replit and locally.
 *
 * • Loads .env from the project root (if present) so local devs can set
 *   NGROK_AUTHTOKEN / NGROK_STATIC_DOMAIN without touching the shell.
 * • When both are set AND the ngrok CLI (v3+) is available, starts a stable
 *   tunnel with your reserved domain (Expo's built-in --tunnel cannot use
 *   personal reserved domains — it always uses Expo's ngrok account).
 * • Otherwise falls back to `expo start --tunnel` (URL changes each restart).
 */

const { spawn, spawnSync, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const NGROK_API_PORT = 4040;

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
const children = [];

function shutdown(code = 0) {
  for (const child of children) {
    try {
      child.kill('SIGTERM');
    } catch {
      // ignore
    }
  }
  process.exit(code);
}

process.on('SIGTERM', () => shutdown(0));
process.on('SIGINT', () => shutdown(0));

function findNgrokCli() {
  try {
    const which = spawnSync('which', ['ngrok'], { encoding: 'utf8' });
    if (which.status === 0 && which.stdout.trim()) {
      return which.stdout.trim();
    }
  } catch {
    // ignore
  }
  return null;
}

function ngrokVersion(bin) {
  try {
    const out = execFileSync(bin, ['version'], { encoding: 'utf8' });
    const match = out.match(/(\d+)\./);
    return match ? Number(match[1]) : 0;
  } catch {
    return 0;
  }
}

function waitForNgrok(expectedDomain, timeoutMs = 20000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const req = http.get(`http://127.0.0.1:${NGROK_API_PORT}/api/tunnels`, res => {
        let body = '';
        res.on('data', chunk => (body += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            const tunnel = (data.tunnels || []).find(
              t => t.public_url && t.public_url.includes(expectedDomain),
            );
            if (tunnel) {
              resolve(tunnel.public_url);
              return;
            }
          } catch {
            // ignore parse errors while starting
          }
          if (Date.now() - started > timeoutMs) {
            reject(new Error('ngrok did not become ready in time'));
            return;
          }
          setTimeout(tick, 300);
        });
      });
      req.on('error', () => {
        if (Date.now() - started > timeoutMs) {
          reject(new Error('ngrok did not become ready in time'));
          return;
        }
        setTimeout(tick, 300);
      });
    };
    tick();
  });
}

function startExpo(extraEnv, useTunnel) {
  const args = ['exec', 'expo', 'start', '--port', PORT];
  if (useTunnel) args.push('--tunnel');

  const env = {
    ...process.env,
    ...extraEnv,
    EXPO_PUBLIC_DOMAIN: process.env.REPLIT_DEV_DOMAIN || '',
    EXPO_PUBLIC_REPL_ID: process.env.REPL_ID || '',
  };

  const expo = spawn('pnpm', args, { env, stdio: 'inherit', cwd: ROOT });
  children.push(expo);
  expo.on('exit', code => shutdown(code ?? 0));
}

async function startStableTunnel() {
  const domain = process.env.NGROK_STATIC_DOMAIN;
  const token = process.env.NGROK_AUTHTOKEN;
  const ngrokBin = findNgrokCli();

  if (!ngrokBin || ngrokVersion(ngrokBin) < 3) {
    console.log('⚠️  Stable domain needs the ngrok CLI v3+ on your PATH.');
    console.log('   Install: https://ngrok.com/download  (or `brew install ngrok`)');
    console.log('   Falling back to Expo tunnel (URL will change each restart).\n');
    return false;
  }

  console.log(`🔗 Starting stable tunnel: ${domain}`);

  let ngrokErr = '';
  const publicUrl = `https://${domain}`;
  const ngrok = spawn(
    ngrokBin,
    [
      'http',
      PORT,
      `--url=${publicUrl}`,
      `--authtoken=${token}`,
      '--log=stdout',
      '--log-format=logfmt',
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );
  children.push(ngrok);

  ngrok.stdout.on('data', data => {
    const msg = data.toString();
    if (/lvl=eror|lvl=crit/i.test(msg) || /\berr="[^"]+"/i.test(msg)) {
      ngrokErr += msg;
      process.stderr.write(msg);
    }
  });
  ngrok.stderr.on('data', data => {
    const msg = data.toString();
    // ngrok often prints banner/help on stderr; only surface real failures
    if (/ERROR:|ERR_NGROK|lvl=eror|lvl=crit/i.test(msg)) {
      ngrokErr += msg;
      process.stderr.write(msg);
    }
  });

  ngrok.on('exit', code => {
    if (code && code !== 0) {
      console.error(`ngrok exited with code ${code}`);
      if (ngrokErr) console.error(ngrokErr.trim());
      shutdown(code);
    }
  });

  try {
    await waitForNgrok(domain);
    console.log(`✅ Tunnel ready: ${publicUrl}`);
    console.log('   Expo Go will use this URL (progress persists across restarts).\n');
    startExpo({ EXPO_PACKAGER_PROXY_URL: publicUrl }, false);
    return true;
  } catch (err) {
    console.error(`❌ ${err.message}`);
    if (ngrokErr) console.error(ngrokErr.trim());
    return false;
  }
}

async function main() {
  if (process.env.NGROK_STATIC_DOMAIN && process.env.NGROK_AUTHTOKEN) {
    const ok = await startStableTunnel();
    if (ok) return;
  } else if (process.env.NGROK_AUTHTOKEN) {
    console.log('🔑 NGROK_AUTHTOKEN set, but Expo --tunnel uses Expo\'s ngrok account.');
    console.log('   Set NGROK_STATIC_DOMAIN + install ngrok CLI for a stable URL.\n');
  } else {
    console.log('⚠️  No NGROK_AUTHTOKEN set — tunnel URL will change on each restart (progress may reset).');
    console.log('   Copy .env.example → .env and add your token + static domain to fix this.\n');
  }

  console.log('🔗 Starting Expo tunnel…');
  startExpo({}, true);
}

main().catch(err => {
  console.error(err);
  shutdown(1);
});
