# Fix Images Not Loading - DO Spaces Credentials Required

## Problem

Images are not loading because the DigitalOcean Spaces credentials are not configured in the App Platform dashboard.

Current status in `.do/app.yaml`:
```yaml
DO_SPACES_KEY: change-me        # ❌ Placeholder
DO_SPACES_SECRET: change-me     # ❌ Placeholder
```

## Solution: Update DO Spaces Credentials in App Platform

### Step 1: Get Your DO Spaces Access Keys

1. Go to https://cloud.digitalocean.com/account/api/spaces
2. Click **Generate New Key**
3. Name it: `dakamela-app-access`
4. Copy both:
   - **Access Key** (looks like: `DO00ABC123XYZ...`)
   - **Secret Key** (looks like: `abc123xyz...`)
   - ⚠️ **Save the Secret Key immediately** - you can't view it again!

### Step 2: Update Environment Variables in App Platform

1. Go to https://cloud.digitalocean.com/apps
2. Click your **dakamela** app
3. Click **Settings** tab
4. Scroll to **Environment Variables**
5. Find and update these two variables:

   **DO_SPACES_KEY**:
   - Click **Edit**
   - Paste your **Access Key**
   - Click **Save**

   **DO_SPACES_SECRET**:
   - Click **Edit**
   - Paste your **Secret Key**
   - Click **Save**

6. Click **Save** at the bottom of the page
7. App will automatically redeploy (takes 2-3 minutes)

### Step 3: Verify Images Load

After deployment completes:

1. Visit your app URL
2. Check that images load:
   - ✅ Logo in header
   - ✅ Hero images on home page
   - ✅ Kingdom Blue logo (main sponsor)
   - ✅ Award ceremony images
   - ✅ Camping plan on accommodation page

## Why This Happens

The `app.yaml` file has placeholder values (`change-me`) for security reasons. These placeholders are never committed to git. The actual credentials must be set in the DigitalOcean App Platform dashboard.

## Security Note

- ✅ **Never** commit real credentials to git
- ✅ **Always** use the App Platform dashboard to set sensitive values
- ✅ The `.gitignore` prevents `.env` files from being committed
- ✅ Credentials are encrypted in the App Platform

## After Fixing

Once credentials are updated:
- All images will load from DO Spaces CDN
- Uploads will work (presigned URLs)
- Asset delivery will be fast (CDN)
- No more 403 or 500 errors on images

## Alternative: Use Existing Keys

If you already have DO Spaces keys for the `dakamela-uploads` bucket:
1. Use those existing keys instead of generating new ones
2. Follow Step 2 above to update the environment variables
