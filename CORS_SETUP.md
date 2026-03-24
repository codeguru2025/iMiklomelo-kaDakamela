# Fix Logo Upload Failure - CORS Configuration Required

## Problem

Logo uploads are failing with `ERR_FAILED` when trying to upload to DigitalOcean Spaces:

```
dakamela-uploads.lon1.digitaloceanspaces.com/uploads/...?X-Amz-Algorithm=...
Failed to load resource: net::ERR_FAILED
Upload failed: TypeError: Failed to fetch
```

This is a **CORS (Cross-Origin Resource Sharing) issue**. The browser is blocking the upload because the DO Spaces bucket doesn't allow cross-origin PUT requests from your app domain.

## Solution: Configure CORS on DO Spaces

### Step 1: Go to Your Space Settings

1. Go to https://cloud.digitalocean.com/spaces/dakamela-uploads
2. Click on **Settings** tab
3. Scroll down to **CORS Configurations**

### Step 2: Add CORS Rule

Click **Add CORS Configuration** and enter:

```json
{
  "AllowedOrigins": [
    "https://dakamela-n729i.ondigitalocean.app",
    "http://localhost:5000",
    "http://localhost:5173"
  ],
  "AllowedMethods": [
    "GET",
    "PUT",
    "POST",
    "DELETE",
    "HEAD"
  ],
  "AllowedHeaders": [
    "*"
  ],
  "MaxAgeSeconds": 3600
}
```

**Important**: Replace `https://dakamela-n729i.ondigitalocean.app` with your actual production domain if you have a custom domain.

### Step 3: Save and Test

1. Click **Save**
2. Wait a few seconds for the configuration to propagate
3. Try uploading a logo again

## Why This Happens

When your frontend (running on `dakamela-n729i.ondigitalocean.app`) tries to upload directly to DO Spaces (running on `dakamela-uploads.lon1.digitaloceanspaces.com`), the browser sees this as a cross-origin request and blocks it unless the server (DO Spaces) explicitly allows it via CORS headers.

The presigned URL flow requires:
1. ✅ Your app requests a presigned URL from your backend (same origin - works)
2. ❌ Browser uploads file directly to DO Spaces (cross-origin - **blocked without CORS**)

## Alternative: Use Server Proxy (Not Recommended)

If you can't configure CORS, you could proxy uploads through your server, but this is slower and uses more bandwidth:

```typescript
// Instead of client uploading directly to presigned URL
// Upload to your server, which then uploads to Spaces
app.post("/api/uploads/proxy", upload.single('file'), async (req, res) => {
  // Upload req.file to Spaces from server
});
```

**Don't use this approach** - just configure CORS properly.

## Verification

After configuring CORS, you should see in the browser console:

```
[Upload] Generating presigned URL for: logo.png (image/png)
[Upload] Generated URL for: attached assets/uuid.png
```

And the upload should succeed without `ERR_FAILED`.
