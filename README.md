# 🎺 The Fact Trumpet

Live fact-checking of Trump's daily statements, speeches, and posts.

---

## How to Deploy (Step by Step)

### Step 1 — Install Node.js
1. Go to **nodejs.org**
2. Download the **LTS** version (big green button)
3. Install it (just click Next through the installer)
4. To verify: open Terminal (Mac) or Command Prompt (Windows) and type `node --version` — you should see a number like `v20.x.x`

---

### Step 2 — Put the files on GitHub
1. Go to **github.com** and log in
2. Click the **+** button top right → **New repository**
3. Name it `fact-trumpet`
4. Make it **Public**
5. Click **Create repository**
6. On the next page, click **uploading an existing file**
7. Drag ALL the files and folders from this project into the upload area
   - `pages/` folder (with `index.js`, `_app.js`, `api/factcheck.js`)
   - `styles/` folder (with `globals.css`)
   - `package.json`
   - `next.config.js`
   - `README.md`
8. Click **Commit changes**

---

### Step 3 — Deploy on Vercel
1. Go to **vercel.com** and log in with GitHub
2. Click **Add New Project**
3. Find `fact-trumpet` in the list → click **Import**
4. Leave all settings as default
5. Click **Deploy**
6. Wait ~2 minutes for it to build

---

### Step 4 — Add your Anthropic API Key
This is the important one — without it the app won't work.

1. In Vercel, go to your project
2. Click **Settings** (top menu)
3. Click **Environment Variables** (left menu)
4. Click **Add New**
5. In the **Key** box type: `ANTHROPIC_API_KEY`
6. In the **Value** box paste your API key (starts with `sk-ant-...`)
7. Click **Save**
8. Go back to **Deployments** and click **Redeploy** → **Redeploy** again

---

### Step 5 — You're live! 🎉
Vercel gives you a URL like `fact-trumpet.vercel.app`
Share it with anyone — it works on mobile and desktop.

---

## How it works
- User taps "Blow the Trumpet!"
- Your server (Vercel) searches today's Trump news using Claude's web search
- Claude fact-checks everything found
- Results appear in ~15 seconds
- Every tap gets fresh, live results from today's news

## Cost
- Vercel hosting: **Free**
- Anthropic API: ~$0.01 per fact-check session (very cheap)
- Add $5 credit to console.anthropic.com — lasts months

---

## Need help?
If anything goes wrong, the most common fixes:
- Make sure the `ANTHROPIC_API_KEY` environment variable is set correctly
- Make sure you redeployed after adding the key
- Check Vercel logs: Project → Deployments → click a deployment → View logs
