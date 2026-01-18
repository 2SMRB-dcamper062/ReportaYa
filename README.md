<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1g21ZoRrExI23KwJ8xruil3Mydw3kGIfw

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Prepare for GitHub

1. Ensure sensitive files are not committed: `serviceAccount.json`, any `.env*` files. The repository includes a `.gitignore` that excludes these.
2. Create a GitHub repository (on github.com) and copy the remote URL.
3. Commands to initialize and push (run in project root):

```bash
# initialize git (if not already)
git init
git add .
git commit -m "Initial commit"
# add remote (replace URL below with your repo URL)
git remote add origin git@github.com:youruser/your-repo.git
# push main (create branch main if needed)
git branch -M main
git push -u origin main
```

Notes:
- If you use HTTPS instead of SSH, use the HTTPS remote URL.
- Do NOT commit `serviceAccount.json`. If you need to share it, transfer it securely.

