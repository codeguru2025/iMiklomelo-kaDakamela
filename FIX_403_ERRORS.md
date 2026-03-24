# Fix 403 Forbidden Errors on DO Spaces Assets

## Problem

All assets are returning **403 Forbidden** errors:

```
dakamela-uploads.lon1.cdn.digitaloceanspaces.com/attached%20assets/DK_LOGO_1769944557082.png
Failed to load resource: the server responded with a status of 403
```

This means the **DO Spaces bucket is set to private** and doesn't allow public read access, even though the code sets `ACL: "public-read"` on individual files.

## Solution: Make Bucket Public

### Step 1: Change Bucket Permissions

1. Go to https://cloud.digitalocean.com/spaces/dakamela-uploads
2. Click on **Settings** tab
3. Scroll to **File Listing** section
4. Change from **Private** to **Public**
5. Click **Save**

### Step 2: Verify Public Access

After making the bucket public, test by visiting:
```
https://dakamela-uploads.lon1.cdn.digitaloceanspaces.com/attached%20assets/DK_LOGO_1769944557082.png
```

It should now load the image instead of returning 403.

## Why This Happens

DigitalOcean Spaces has **two levels of access control**:

1. **Bucket-level permissions** (Public or Private)
   - Controls whether the bucket allows any public access at all
   - Set in the Spaces dashboard under Settings

2. **Object-level ACL** (public-read, private, etc.)
   - Controls individual file permissions
   - Set in the code when uploading: `ACL: "public-read"`

Even if you set `ACL: "public-read"` on files, they will return 403 if the **bucket itself is set to Private**.

## Security Note

Making the bucket public is safe because:
- Only files explicitly uploaded with `ACL: "public-read"` are accessible
- You control what gets uploaded through your authenticated API
- The bucket doesn't list files publicly (file listing can remain disabled)
- This is the standard configuration for CDN-served assets

## Alternative: Use Presigned URLs for Private Files

If you want to keep the bucket private, you'd need to generate presigned URLs for every file access:

```typescript
// Instead of direct CDN URLs
const url = await getPresignedReadUrl(objectKey, 3600);
```

But this is slower, more complex, and not recommended for public assets like logos and images.
