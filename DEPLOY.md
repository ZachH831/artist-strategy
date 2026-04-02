# Artist Strategy Tool — Deploy Guide

## Your project structure
```
artist-strategy/
├── index.html                  ← the app
├── netlify.toml                ← Netlify config
└── netlify/
    └── functions/
        └── strategy.js         ← serverless function (holds your API key)
```

---

## Step 1 — Push to GitHub

1. Go to github.com → click **"New repository"** (+ icon top right)
2. Name it `artist-strategy`, set to **Private**, click **"Create repository"**
3. On your computer, open **Terminal** and run these commands one at a time:

```bash
cd ~/Desktop
# (or wherever you want to put the folder)

# Download your project files first, then:
cd artist-strategy
git init
git add .
git commit -m "Initial deploy"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/artist-strategy.git
git push -u origin main
```

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

---

## Step 2 — Connect to Netlify

1. Go to **app.netlify.com** and log in
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** → authorize if needed → select `artist-strategy`
4. Build settings will auto-detect from `netlify.toml` — leave everything as-is
5. Click **"Deploy site"**

---

## Step 3 — Add your Anthropic API key

1. In Netlify, go to your site → **Site configuration** → **Environment variables**
2. Click **"Add a variable"**
3. Key: `ANTHROPIC_API_KEY`
4. Value: your Anthropic API key (from console.anthropic.com)
5. Click **"Save**"
6. Go to **Deploys** → click **"Trigger deploy"** → **"Deploy site"** to apply the new env variable

---

## Step 4 — You're live ✓

Your site will be at a URL like `https://random-name-123.netlify.app`

You can set a custom domain in Netlify under **Domain management** if you have one.

---

## How the paywall works

- User fills out form → gets **free preview** (Part 1 only)
- Paywall appears prompting them to pay $9 via your Stripe link
- After paying, Stripe sends them a receipt email with an **order ID** (starts with `cs_live_`)
- They paste that order ID into the unlock box → full strategy unlocks

**Note:** The current unlock verification checks that the order ID format looks valid (starts with `cs_live_`). This is a lightweight check. If you want airtight verification (so nobody can guess their way in), the next step would be adding a Stripe webhook — but for launch this is fine.

---

## To make changes later

Edit files locally → run `git add . && git commit -m "update" && git push` → Netlify auto-redeploys.
