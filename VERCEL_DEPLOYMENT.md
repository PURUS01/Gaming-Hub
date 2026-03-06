# Vercel Deployment Guide

## Step 1: Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following environment variables:

### Required Firebase Environment Variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### How to Get Firebase Credentials:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Scroll down to **Your apps** section
5. Click on the web app (or create one if you haven't)
6. Copy the values from the `firebaseConfig` object

### Setting Environment Variables:

- **For Production**: Add to "Production" environment
- **For Preview**: Add to "Preview" environment (optional, uses production if not set)
- **For Development**: Add to "Development" environment (optional)

**Important**: Make sure to add all 6 variables. Missing any one will cause build failures.

## Step 2: Deploy

1. Push your code to GitHub
2. Vercel will automatically detect the push and start building
3. Check the build logs for any errors

## Common Build Errors and Solutions:

### Error: "Firebase is not initialized" or "Environment variable missing"

**Solution**: Make sure all 6 `NEXT_PUBLIC_FIREBASE_*` environment variables are set in Vercel.

### Error: TypeScript errors

**Solution**: Run `npm run build` locally first to check for TypeScript errors:
```bash
npm run build
```

### Error: Module not found

**Solution**: Make sure all dependencies are in `package.json` and run:
```bash
npm install
```

## Step 3: Verify Deployment

After successful deployment:
1. Visit your Vercel URL
2. Test the login/signup functionality
3. Test creating a room
4. Check browser console for any errors

## Troubleshooting

If the build still fails:
1. Check the full build logs in Vercel dashboard
2. Look for specific error messages
3. Ensure all environment variables are correctly set
4. Make sure there are no typos in variable names
