# Put the WBPCC backend online (Firebase) — step by step

Time needed: about 20 minutes. Cost: ₹0 (Spark free plan, no card needed).

> **Good to know:** the website keeps showing its built-in placeholder content until
> backend step B2 connects pages to the database. Doing this setup now is safe — it
> changes nothing on the live website yet.

---

## Part A — in the Firebase website (only you can do this)

### 1. Pick the right Google account
The project should belong to the **party's official Google account**, not a personal one,
so it stays with the party if people change. Sign in to https://console.firebase.google.com with it.

### 2. Create the project
1. **Create a project** → name: `WBPCC Website`.
2. Firebase suggests a **project ID** (e.g. `wbpcc-website`). You can edit it now — **it can never change later.** Note it down.
3. Google Analytics: **turn it off** (not needed; less personal data collected).
4. **Create project.**

### 3. Turn on the database
1. Left menu → **Build → Firestore Database → Create database**.
2. Edition: **Standard**.
3. Location: **`asia-south1 (Mumbai)`** — closest to Bengal. ⚠️ Permanent.
4. Start in **production mode** (everything locked — our rules open exactly what's needed).

### 4. Turn on logins
1. **Build → Authentication → Get started**.
2. **Sign-in method → Email/Password → Enable** (leave "Email link" off) → **Save**.

### 5. Register the website
1. ⚙️ **Project settings → General → Your apps → Web `</>`**.
2. Nickname: `wbpcc-site`. Don't tick Firebase Hosting. **Register app.**
3. You'll see `apiKey`, `authDomain`, `projectId`, `appId`. **Send these 4 values to Claude.**
   They are public by design (every visitor's browser gets them) — safe to share.

### 6. Download the server key (secret!)
1. ⚙️ **Project settings → Service accounts → Generate new private key → Generate key**.
2. Save the file as `F:\JuniorProjects\secrets\wbpcc-service-account.json`
   — a folder **outside** `wbpcc`, so it can never end up on GitHub.
3. **Never** send this file or its contents to anyone, including Claude, and never paste it in chat.
   Anyone with it has full control of the database.

---

## Part B — in your terminal (in `F:\JuniorProjects\wbpcc`)

Replace `YOUR-PROJECT-ID` with the ID from step 2.

### 7–8. Upload the security rules
Uses the server key, so no Firebase CLI login is needed:
```powershell
npm run live:rules -- --project YOUR-PROJECT-ID --key F:\JuniorProjects\secrets\wbpcc-service-account.json
```
(The two database indexes in `firestore.indexes.json` need the Firebase CLI logged in with an
account that can see the project: `npm run deploy:rules -- --project YOUR-PROJECT-ID`. They're
only needed from step B2.)

### 9. Load the website's current content into the database
```powershell
npm run live:content -- --project YOUR-PROJECT-ID --key F:\JuniorProjects\secrets\wbpcc-service-account.json
```
Safe to re-run: anything already in the database is left untouched.

### 10. Create the first Admin login
Use the email of the person who will run the site (e.g. the office secretary):
```powershell
npm run live:admin -- --project YOUR-PROJECT-ID --key F:\JuniorProjects\secrets\wbpcc-service-account.json --email admin@yourdomain.org --name "Office secretary"
```
It prints a one-time link. Open it in a browser and set the password. That's the only
time anyone uses the terminal for logins — every other Admin, Contributor and Member
is added from the website's console (built in B2).

### 11. Check it worked
Firebase website → **Firestore Database**: you should see `pages`, `leaders`, `groups`,
`events`, `posts` … and in **Authentication → Users**, your Admin.

---

## Part C — Vercel (when you deploy the site)

How content gets to the public site: when Vercel **builds** the site, it first downloads the
latest published content from Firestore (`npm run pull`). When an Admin saves something in the
console, the site asks Vercel to rebuild — the change is live in about 2 minutes.

### 12. Environment variables
Vercel → your project → **Settings → Environment Variables**. Add these for **Production**
(and Preview if you use it):

| Name | Value | Sensitive? |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | from `.env.local` | no |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `wbpcc-website.firebaseapp.com` | no |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `wbpcc-website` | no |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | from `.env.local` | no |
| `FIREBASE_SERVICE_ACCOUNT` | open `F:\JuniorProjects\secrets\wbpcc-service-account.json` in Notepad, copy **everything**, paste | **yes — tick Sensitive** |
| `VERCEL_DEPLOY_HOOK_URL` | see step 13 | **yes — tick Sensitive** |

Never put `FIREBASE_KEY_FILE` on Vercel — that one is only for your computer.

**Email alerts for website forms** (optional — forms still save to Console → Inbox without it):

| Name | Value | Type |
|---|---|---|
| `RESEND_API_KEY` | from resend.com → API Keys (permission: *Sending access*) | **Secret** |
| `NOTIFY_EMAIL` | `sm.wbpcc@gmail.com` (this is also the default) | Config |

Create the Resend account **with sm.wbpcc@gmail.com** — on the free plan, alerts can only be
delivered to the account's own address until a domain is added. Alerts never contain the
person's name, phone or message; those stay in Console → Inbox (Admins only).

### 13. The "rebuild" link (deploy hook)
1. Vercel → project → **Settings → Git → Deploy Hooks**.
2. Name: `content-update`, branch: `main` → **Create Hook**.
3. Copy the URL it shows → add it as `VERCEL_DEPLOY_HOOK_URL` (step 12). Treat it like a password.
4. **Redeploy** once (Deployments → ⋯ → Redeploy) so the new variables are used.

### 14. Check it
Sign in at `https://<your-site>/en/signin` → **Admin** → `sm.wbpcc@gmail.com`. Edit a District
President in **Console → Leadership & organisation** → Confirm & submit. Vercel → Deployments
shows a new build starting; ~2 minutes later the change is on `/en/leadership`.

If a build can't reach Firebase it **fails on purpose**, so the previous version stays live —
it never silently goes back to placeholder content.

---

## What's safe where

| Thing | Where it lives | On GitHub? |
|---|---|---|
| 4 web-app values (`apiKey` …) | `.env.local` + Vercel settings | No (but not secret) |
| Service-account key | `F:\JuniorProjects\secrets\` + Vercel settings | **Never** |
| Security rules | `firestore.rules` | Yes |
| Demo logins in `docs/BACKEND.md` | Local emulator only — they don't exist online | Yes (harmless) |

`.gitignore` already blocks `.env*` files and any `*service-account*.json` inside the project.
