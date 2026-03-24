# Update DigitalOcean Spaces Credentials

## Current Status
✅ Bucket exists: `dakamela-uploads`  
✅ Region: `lon1`  
✅ Files uploaded to `attached assets/` folder  
❌ API credentials still set to `change-me`

## Steps to Fix

### 1. Generate Spaces API Keys

1. Go to [DigitalOcean API Tokens](https://cloud.digitalocean.com/account/api/spaces)
2. Click **Generate New Key**
3. Give it a name like "dakamela-app-production"
4. **Copy both the Key and Secret immediately** (you won't be able to see the secret again)

### 2. Update App Platform Environment Variables

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click on your `imiklomelo-kadakamela` app
3. Go to **Settings** → **App-Level Environment Variables** (or the `web` component settings)
4. Find and update these two variables:
   - `DO_SPACES_KEY` → Replace `change-me` with your **Access Key**
   - `DO_SPACES_SECRET` → Replace `change-me` with your **Secret Key**
5. Click **Save**
6. The app will automatically redeploy

### 3. Verify After Deployment

After the app redeploys, check the logs for:
```
[Spaces] Configured: bucket="dakamela-uploads", region="lon1"
```

Then test an asset URL:
```
https://your-app-url.ondigitalocean.app/api/assets/DK_LOGO_1769944557082.png
```

It should now proxy the file from:
```
https://dakamela-uploads.lon1.cdn.digitaloceanspaces.com/attached%20assets/DK_LOGO_1769944557082.png
```

## Why This is Needed

The app uses a **proxy pattern** for assets:
- Frontend requests: `/api/assets/filename.png`
- Server fetches from: `attached assets/filename.png` in DO Spaces
- Server streams the file to the client

This requires valid API credentials to authenticate with DigitalOcean Spaces.

## Security Note

⚠️ **Never commit real API keys to git!** The `.do/app.yaml` file has `change-me` placeholders. Always set real credentials in the App Platform dashboard, not in the YAML file.
