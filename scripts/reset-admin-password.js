// Create or reset a superadmin login for the ZMR admin area (/admin/login).
//
// Run from your own computer, never from a public place:
//
//   $env:DATABASE_URL = "<Production DATABASE_URL from Vercel>"   (PowerShell)
//   node scripts/reset-admin-password.js you@example.com
//   node scripts/reset-admin-password.js you@example.com --deactivate-other-superadmins
//
// - The password is typed at a hidden prompt (twice). It is never printed, logged,
//   stored in a file or passed on the command line.
// - The account is created if it does not exist, otherwise its password is replaced.
//   Either way it becomes an active SUPER_ADMIN and all its existing sessions end.
// - --deactivate-other-superadmins also switches off every other superadmin account
//   (for example an old shared login) and ends their sessions. Nothing is deleted.
// - The database host is shown and you must type YES before anything changes.

const readline = require('node:readline');
const bcrypt = require('bcryptjs');

// Read DATABASE_URL before Prisma is loaded: @prisma/client also reads the project's
// .env file, and this tool must only ever use the database you set explicitly.
const EXPLICIT_DATABASE_URL = process.env.DATABASE_URL;

const BCRYPT_COST = 12; // same as src/lib/auth.ts
const MIN_LENGTH = 12;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(msg) {
  console.error(`\n✖ ${msg}`);
  process.exit(1);
}

/** Ask a question; with hidden=true nothing typed is echoed. */
function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => {
        // Show the question, then hide every typed character.
        if (s.includes(question)) rl.output.write(question);
        else if (s === '\r\n' || s === '\n' || s === '\r') rl.output.write('\n');
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer);
    });
  });
}

function describeDatabase(url) {
  try {
    const u = new URL(url);
    return `${u.hostname}${u.pathname}`; // host and database name only, never credentials
  } catch {
    return '(unparsable DATABASE_URL)';
  }
}

async function main() {
  const args = process.argv.slice(2);
  const email = (args.find((a) => !a.startsWith('--')) || '').trim().toLowerCase();
  const deactivateOthers = args.includes('--deactivate-other-superadmins');

  if (!email || !EMAIL_RE.test(email)) {
    fail('Usage: node scripts/reset-admin-password.js you@example.com [--deactivate-other-superadmins]');
  }
  if (!EXPLICIT_DATABASE_URL) {
    fail('DATABASE_URL is not set in this terminal. Copy the Production value from Vercel → Settings → Environment Variables, then: $env:DATABASE_URL = "..."');
  }
  if (!process.stdin.isTTY) {
    fail('Run this in an interactive terminal (PowerShell, Command Prompt or Terminal) so the password stays hidden.');
  }

  console.log('\nZMR admin login reset');
  console.log(`  Database: ${describeDatabase(EXPLICIT_DATABASE_URL)}`);
  console.log(`  Account:  ${email} (will be an active superadmin)`);
  if (deactivateOthers) console.log('  Also:     deactivate every OTHER superadmin account');

  const password = await ask(`\nNew password (at least ${MIN_LENGTH} characters, hidden): `, true);
  if (password.length < MIN_LENGTH) fail(`The password must be at least ${MIN_LENGTH} characters.`);
  if (password.trim() !== password) fail('The password must not start or end with a space.');
  const again = await ask('Type it again: ', true);
  if (again !== password) fail('The two passwords do not match. Nothing was changed.');

  const confirm = await ask('\nType YES to apply these changes to the database above: ');
  if (confirm.trim() !== 'YES') fail('Cancelled. Nothing was changed.');

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient({ datasources: { db: { url: EXPLICIT_DATABASE_URL } } });
  try {
    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.adminUser.findUnique({ where: { email } });
      const user = existing
        ? await tx.adminUser.update({
            where: { email },
            data: { passwordHash, role: 'SUPER_ADMIN', isActive: true, sessionVersion: { increment: 1 } },
          })
        : await tx.adminUser.create({
            data: { email, name: email.split('@')[0], passwordHash, role: 'SUPER_ADMIN', isActive: true },
          });
      let deactivated = [];
      if (deactivateOthers) {
        const others = await tx.adminUser.findMany({
          where: { role: 'SUPER_ADMIN', isActive: true, NOT: { id: user.id } },
          select: { id: true, email: true },
        });
        for (const o of others) {
          await tx.adminUser.update({ where: { id: o.id }, data: { isActive: false, sessionVersion: { increment: 1 } } });
        }
        deactivated = others.map((o) => o.email);
      }
      return { created: !existing, deactivated };
    });

    console.log(`\n✔ ${result.created ? 'Created' : 'Updated'} superadmin ${email}. Existing sessions for this account have ended.`);
    if (deactivateOthers) {
      console.log(result.deactivated.length
        ? `✔ Deactivated other superadmin account(s): ${result.deactivated.join(', ')}`
        : '  No other active superadmin accounts were found.');
    }
    console.log('\nSign in at /admin/login with this email and the password you just typed.');
    console.log('Close this window afterwards so the database address is not left in the terminal session.\n');
  } catch (e) {
    fail(`Database error: ${e.message.split('\n').pop()}`);
  } finally {
    await prisma.$disconnect();
  }
}

main();
