#!/usr/bin/env node
// start-paperclip.cjs — idempotent Paperclip startup helper
// Applies any pending migrations that fail due to "already exists" errors,
// then starts the server via paperclipai run.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const PG_CTL = 'C:\\Users\\Anthony\\AppData\\Local\\npm-cache\\_npx\\43414d9b790239bb\\node_modules\\@embedded-postgres\\windows-x64\\native\\bin\\pg_ctl.exe';
const PG_DATA = 'C:\\Users\\Anthony\\.paperclip\\instances\\default\\db';
const PG_PORT = 54329;
const PG_CONN = `postgres://paperclip:paperclip@127.0.0.1:${PG_PORT}/paperclip`;
const CLI_MIGRATIONS_DIR = 'C:\\Users\\Anthony\\AppData\\Local\\npm-cache\\_npx\\43414d9b790239bb\\node_modules\\@paperclipai\\db\\dist\\migrations';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function startPostgres() {
  try {
    execSync(`"${PG_CTL}" start -D "${PG_DATA}" -o "-p ${PG_PORT}" -l "${PG_DATA}\\pg.log" -w`, { stdio: 'pipe' });
    console.log('PostgreSQL started');
  } catch (e) {
    const msg = e.stderr?.toString() || e.message;
    if (msg.includes('already running') || msg.includes('server is running')) {
      console.log('PostgreSQL already running');
    } else {
      console.log('PostgreSQL start output:', msg.slice(0, 200));
    }
  }
  await sleep(3000);
}

async function stopPostgres() {
  try {
    execSync(`"${PG_CTL}" stop -D "${PG_DATA}" -m fast`, { stdio: 'pipe' });
    console.log('PostgreSQL stopped');
  } catch (e) { /* already stopped */ }
}

async function applyPendingMigrations() {
  // Find the CLI's migrations dir — search for it in npx cache if default path missing
  let migrationsDir = CLI_MIGRATIONS_DIR;
  if (!fs.existsSync(migrationsDir)) {
    // Search npx cache for @paperclipai/db migrations
    const npxCache = 'C:\\Users\\Anthony\\AppData\\Local\\npm-cache\\_npx';
    const dirs = fs.readdirSync(npxCache).map(d => path.join(npxCache, d, 'node_modules', '@paperclipai', 'db', 'dist', 'migrations'));
    migrationsDir = dirs.find(d => fs.existsSync(d));
    if (!migrationsDir) { console.log('Cannot find CLI migrations dir, skipping pre-fix'); return; }
  }

  const postgres = require('C:\\Users\\Anthony\\Desktop\\paperclip\\node_modules\\.pnpm\\postgres@3.4.8\\node_modules\\postgres');

  let sql;
  try {
    sql = postgres(PG_CONN, { max: 1, onnotice: () => {}, connect_timeout: 10 });

    // Get current journal
    const journal = await sql`SELECT hash FROM drizzle.__drizzle_migrations`;
    const applied = new Set(journal.map(r => r.hash));
    const tsRows = await sql`SELECT MAX(created_at) as ts FROM drizzle.__drizzle_migrations`;
    let maxTs = Number(tsRows[0].ts) || Date.now();

    // Find all migration files and check which are pending
    const migFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    let fixed = 0;
    for (const migFile of migFiles) {
      const content = fs.readFileSync(path.join(migrationsDir, migFile), 'utf8');
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      if (applied.has(hash)) continue;

      // Pending migration — try to apply idempotently
      const statements = content.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s);
      let allOk = true;
      for (const stmt of statements) {
        try {
          await sql.unsafe(stmt);
        } catch (err) {
          const alreadyExists = ['42P07', '42P01', '42710', '23505'].includes(err.code) ||
            err.message.includes('already exists');
          if (!alreadyExists) { allOk = false; break; }
        }
      }

      if (allOk) {
        maxTs += 1000;
        await sql`INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES (${hash}, ${maxTs})`;
        console.log(`  Fixed: ${migFile}`);
        fixed++;
      }
    }

    if (fixed > 0) console.log(`Applied ${fixed} pending migration(s) idempotently`);
    else console.log('No pending migrations needed fixing');

  } catch (err) {
    console.log('Migration pre-fix skipped:', err.message.slice(0, 100));
  } finally {
    if (sql) await sql.end().catch(() => {});
  }
}

async function main() {
  console.log('Starting Paperclip...\n');

  // 1. Start embedded postgres
  await startPostgres();

  // 2. Apply any pending migrations idempotently
  console.log('Checking migrations...');
  await applyPendingMigrations();

  // 3. Stop postgres so paperclipai can manage it
  await stopPostgres();
  await sleep(1000);

  // 4. Start paperclipai (takes over postgres lifecycle)
  console.log('\nLaunching paperclipai server...');
  const proc = spawn('npx', ['paperclipai', 'run', '--instance', 'default'], {
    stdio: 'inherit',
    shell: true,
    cwd: 'C:\\Users\\Anthony\\Desktop\\um_website',
  });

  proc.on('exit', code => {
    console.log(`paperclipai exited with code ${code}`);
    process.exit(code || 0);
  });

  process.on('SIGINT', () => proc.kill('SIGINT'));
  process.on('SIGTERM', () => proc.kill('SIGTERM'));
}

main().catch(err => { console.error(err); process.exit(1); });
