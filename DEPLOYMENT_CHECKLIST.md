# Vercel Deployment Checklist

Your application is ready for deployment! The build process has been verified locally.

Follow these steps to deploy to Vercel:

## 1. Push to GitHub
Ensure all your latest changes are committed and pushed to your GitHub repository.

```bash
git add .
git commit -m "Ready for deployment: Fix build errors and secure sessions"
git push origin main
```

## 2. Import Project in Vercel
1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your `ryth-bazar` repository.

## 3. Configure Environment Variables
In the Vercel Project Settings (under "Environment Variables"), add the following keys. You can find these values in your local `.env` or Firebase Console.

| Variable Name | Description |
| :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Your Firebase API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Your Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Your Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Your Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase Messaging Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Your Firebase App ID |
| `NEXT_PUBLIC_APP_URL` | (Optional) Your production URL (e.g., https://ryth-bazar.vercel.app) |

## 4. Build Settings
Vercel should automatically detect the settings, but verify:
-   **Framework Preset**: Next.js
-   **Build Command**: `next build` (or `npm run build`)
-   **Output Directory**: `.next`
-   **Install Command**: `npm install`

## 5. Deploy
Click **"Deploy"**. Vercel will build your application. Since we verified `npm run build` locally, it should succeed.

## 6. Post-Deployment Verification
Once deployed, visit your live URL and test:
-   **Login**: Try logging in with a Customer (Google/WhatsApp) and Admin credentials.
-   **Sessions**: Verify that closing the tab and reopening keeps you logged in.
-   **Access Control**: Try accessing `/admin` as a customer (should redirect) and `/shop` as a guest (should redirect).

## Troubleshooting
If the build fails on Vercel but works locally:
-   Check "Ignore Build Command" in settings if you want to skip linting on Vercel, though we fixed the errors so it shouldn't be needed.
-   Ensure all Environment Variables are pasted correctly without extra spaces/quotes.
