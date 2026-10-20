// Build shim: Neon connections on Vercel inject DATABASE_URL-style names
// (possibly with a custom prefix), while prisma/schema.prisma expects
// POSTGRES_PRISMA_URL / POSTGRES_URL_NON_POOLING. Resolve whichever pooled /
// direct connection strings exist and map them before running the pipeline.
const { execSync } = require('child_process');

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

if (!pooled) {
  console.error(
    '[vercel-build] No database URL found in env (looked for *DATABASE_URL / *POSTGRES_URL / POSTGRES_PRISMA_URL). ' +
      'Is the Neon store connected to this project?'
  );
  process.exit(1);
}

process.env.POSTGRES_PRISMA_URL = pooled;
process.env.POSTGRES_URL_NON_POOLING = direct;
console.log('[vercel-build] Database env resolved. Running prisma generate, db push, next build.');

for (const cmd of ['npx prisma generate', 'npx prisma db push --accept-data-loss', 'npx next build']) {
  console.log(`[vercel-build] $ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', env: process.env });
}
