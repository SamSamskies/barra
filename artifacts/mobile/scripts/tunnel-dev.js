#!/usr/bin/env node
/**
 * Starts Expo with a stable localtunnel URL so Expo Go preserves
 * AsyncStorage between restarts (unlike ngrok, which gives a new
 * random URL every time and wipes storage).
 *
 * URL will always be: https://<SUBDOMAIN>.loca.lt
 * Change SUBDOMAIN below if someone else has claimed yours.
 */

const { spawn } = require('child_process');
const localtunnel = require('localtunnel');

const SUBDOMAIN = 'barra-calisthenx';
const PORT = parseInt(process.env.PORT || '8081', 10);

async function main() {
  console.log(`\n🔗 Opening tunnel → https://${SUBDOMAIN}.loca.lt (port ${PORT})...\n`);

  let tunnel;
  try {
    tunnel = await localtunnel({ port: PORT, subdomain: SUBDOMAIN });
  } catch (err) {
    console.error(`❌ Could not claim subdomain "${SUBDOMAIN}". Try changing SUBDOMAIN in scripts/tunnel-dev.js.`);
    console.error(err.message);
    process.exit(1);
  }

  if (tunnel.url !== `https://${SUBDOMAIN}.loca.lt`) {
    console.warn(`⚠️  Subdomain "${SUBDOMAIN}" was taken — got ${tunnel.url} instead.`);
    console.warn(`   AsyncStorage may reset if this URL changes. Edit SUBDOMAIN in scripts/tunnel-dev.js to fix this.\n`);
  } else {
    console.log(`✅ Tunnel stable at: ${tunnel.url}\n`);
  }

  const tunnelHost = new URL(tunnel.url).hostname;

  tunnel.on('error', err => {
    console.error('Tunnel error:', err.message);
  });

  tunnel.on('close', () => {
    console.log('Tunnel closed.');
    process.exit(0);
  });

  const env = {
    ...process.env,
    REACT_NATIVE_PACKAGER_HOSTNAME: tunnelHost,
    EXPO_PUBLIC_DOMAIN: process.env.REPLIT_DEV_DOMAIN || '',
    EXPO_PUBLIC_REPL_ID: process.env.REPL_ID || '',
  };

  const expo = spawn(
    'pnpm',
    ['exec', 'expo', 'start', '--port', String(PORT), '--host', 'lan'],
    { env, stdio: 'inherit', cwd: __dirname + '/..' }
  );

  expo.on('exit', code => {
    tunnel.close();
    process.exit(code ?? 0);
  });

  const shutdown = () => {
    tunnel.close();
    expo.kill('SIGTERM');
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
