# Setting a new admin login

Use this when nobody can sign in at `https://zmr-mobility.vercel.app/admin/login`, or to
replace the old shared login with your own. You choose the email and password yourself;
the password is typed at a hidden prompt and is never stored in code or files.

You need: access to the Vercel project **zmr-mobility** settings, and Node.js 20+ and Git
on your computer.

1. Get the database address. In Vercel, open **zmr-mobility → Settings → Environment
   Variables**, find `DATABASE_URL` for **Production** and copy its value. Treat it like a
   password: don't paste it into chat, email or code.
2. In PowerShell:
   ```
   cd C:\Users\jemis\ZMR-Website-Work\ZMRMobility
   git pull
   npm install
   npx prisma generate
   $env:DATABASE_URL = "paste-the-value-here"
   node scripts/reset-admin-password.js your-email@example.com --deactivate-other-superadmins
   ```
   Leave out `--deactivate-other-superadmins` to keep other superadmin accounts active.
3. Check that the database shown is the production one (not `localhost`). Type your new
   password (at least 12 characters) twice, then type `YES`.
4. Close PowerShell (this clears the copied database address), then sign in at
   `/admin/login` with your email and new password.

What it does: creates or updates that account as an active superadmin and ends its
existing sessions. With the option, it also deactivates every other superadmin account,
for example the old one from the original setup. Nothing is deleted, and other superadmins
can be re-activated later from **Admin → Users** (a superadmin can manage admin accounts).

After signing in, other staff can be added under **Admin → Users**; each gets their own
one-time password.
