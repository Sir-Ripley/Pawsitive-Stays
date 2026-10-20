// DIAGNOSTIC BUILD (bisect branch): like the production shim, but a failing
// step writes its error to public/build-diagnostics.txt and the build
// continues so the error can be read from the deployed preview.
const { execSync } = require('child_process');
const fs = require('fs');

function pickUrl(kind) {
  const keys = Object.keys(process.env).filter(
    (k) => process.env[k] && /(DATABASE_URL|POSTGRES_URL|PRISMA_URL)/.test(k)
  );
  const isDirect = (k) => /UNPOOLED|NON_POOLING|DIRECT/.test(k);
  const pool = kind === 'pooled' ? keys.filter((k) => !isDirect(k)) : keys.filter((k) => isDirect(k));
  pool.sort();
  return pool.length ? process.env[pool[0]] : undefined;
}

const pooled = process.env.POSTGRES_PRISMA_URL || pickUrl('pooled');
const direct = process.env.POSTGRES_URL_NON_POOLING || pickUrl('direct') || pooled;
process.env.POSTGRES_PRISMA_URL = pooled || '';
process.env.POSTGRES_URL_NON_POOLING = direct || '';

const keyNames = Object.keys(process.env).filter((k) => /(DATABASE_URL|POSTGRES_URL|PRISMA_URL)/.test(k));
let report = `env keys seen: ${keyNames.join(', ') || '(none)'}\npooled resolved: ${pooled ? 'yes' : 'NO'}\ndirect resolved: ${direct ? 'yes' : 'NO'}\n`;

function run(label, cmd) {
  try {
    const out = execSync(cmd, { stdio: 'pipe', env: process.env });
    report += `\n[${label}] OK\n`;
    return true;
  } catch (e) {
    report += `\n[${label}] FAILED (exit ${e.status})\n--- stdout tail ---\n${(e.stdout || '').toString().slice(-2500)}\n--- stderr tail ---\n${(e.stderr || '').toString().slice(-2500)}\n`;
    return false;
  }
}

run('generate', 'npx prisma generate');
run('dbpush', 'npx prisma db push');
fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/build-diagnostics.txt', report);
console.log(report);
// Build the app regardless so the preview deploys and serves the report.
execSync('npx next build', { stdio: 'inherit', env: process.env });
