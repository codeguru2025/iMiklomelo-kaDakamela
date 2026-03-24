# Critical Fixes Required - Action Items

## Current Status from Logs

```
✅ [Spaces] Configured: bucket="dakamela-uploads", region="lon1"
✅ [Upload] Generating presigned URL - WORKING
❌ 403 Forbidden on all CDN assets
❌ 500 errors on all API endpoints (database connection failing)
```

---

## 🔴 CRITICAL FIX #1: Make DO Spaces Bucket Public

**Problem**: All assets return 403 Forbidden
```
dakamela-uploads.lon1.cdn.digitaloceanspaces.com/attached%20assets/DK_LOGO_1769944557082.png
Status: 403 Forbidden
```

**Fix**:
1. Go to https://cloud.digitalocean.com/spaces/dakamela-uploads
2. Click **Settings** tab
3. Find **File Listing** section
4. Change from **Private** → **Public**
5. Click **Save**

**Why**: Even though the code sets `ACL: "public-read"`, the bucket-level permission blocks all public access.

---

## 🔴 CRITICAL FIX #2: Update DATABASE_URL Environment Variable

**Problem**: All API endpoints return 500 errors
```
GET /api/past-events 500 :: {"error":"Failed to fetch past events"}
GET /api/sponsors 500 :: {"error":"Failed to fetch sponsors"}
GET /api/announcements 500 :: {"error":"Failed to fetch announcements"}
GET /api/companies 500 :: {"error":"Failed to fetch companies"}
```

**Current Value**: `postgresql://doadmin:...` (direct connection string)

**Required Value**: `${dakamela.DATABASE_URL}` (database binding)

**Fix**:
1. Go to https://cloud.digitalocean.com/apps
2. Click your app → **web** service
3. Go to **Environment Variables**
4. Find `DATABASE_URL`
5. Click **Edit**
6. Change value to: `${dakamela.DATABASE_URL}`
7. Click **Save**
8. App will redeploy automatically

**Why**: The database binding uses the internal network and proper SSL configuration for DO managed databases.

---

## 🟡 OPTIONAL FIX #3: Configure CORS (for uploads)

**Status**: Upload presigned URLs are being generated successfully, but we can't verify if uploads work until the 403 issue is fixed.

**Fix** (if uploads still fail after fixing #1):
1. Go to https://cloud.digitalocean.com/spaces/dakamela-uploads
2. Click **Settings** → **CORS Configurations**
3. Click **Add CORS Configuration**
4. Paste:
```json
{
  "AllowedOrigins": ["https://dakamela-n729i.ondigitalocean.app"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
  "AllowedHeaders": ["*"],
  "MaxAgeSeconds": 3600
}
```
5. Click **Save**

---

## Expected Results After Fixes

### After Fix #1 (Make Bucket Public):
- ✅ Favicon loads in browser tab
- ✅ Logo preview shows after upload
- ✅ All existing images load from CDN
- ✅ Manifest icons load correctly

### After Fix #2 (Update DATABASE_URL):
- ✅ Database seeding succeeds on startup
- ✅ `/api/past-events` returns data
- ✅ `/api/sponsors` returns data
- ✅ `/api/announcements` returns data
- ✅ `/api/companies` returns data
- ✅ Company creation works

### After Fix #3 (CORS - if needed):
- ✅ Logo uploads complete successfully
- ✅ No `ERR_FAILED` errors in console

---

## Priority Order

1. **Fix #2 first** (DATABASE_URL) - This will fix all API endpoints
2. **Fix #1 second** (Make bucket public) - This will fix all asset loading
3. **Fix #3 if needed** (CORS) - Only if uploads still fail after #1

---

## Verification Commands

After each fix, check the deployment logs at:
https://cloud.digitalocean.com/apps/[your-app-id]/logs

**Look for**:
```
✅ Database seeding complete!
✅ [Spaces] Configured: bucket="dakamela-uploads", region="lon1"
✅ Camps seeded
✅ Camp services seeded
```

**Test in browser**:
1. Visit your app
2. Check favicon loads
3. Try uploading a logo
4. Verify API endpoints return data (check Network tab)
