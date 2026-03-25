# Fix 403 Forbidden - Bucket Policy Required

## Problem

Even though **File Listing is Enabled**, images are still returning **403 Forbidden** because a bucket policy is blocking public read access.

The warning in DO Spaces settings says:
> "Any existing bucket policy or bucket ACL set via S3 API may override this setting."

## Solution: Add Bucket Policy for Public Read Access

### Option 1: Using DigitalOcean Web Interface (Recommended)

Unfortunately, DigitalOcean Spaces doesn't have a UI for bucket policies. You need to use the API or AWS CLI.

### Option 2: Using AWS CLI (S3-Compatible)

1. **Install AWS CLI** (if not already installed):
   ```bash
   # Windows (using Chocolatey)
   choco install awscli
   
   # Or download from: https://aws.amazon.com/cli/
   ```

2. **Configure AWS CLI for DigitalOcean Spaces**:
   ```bash
   aws configure --profile digitalocean
   ```
   
   Enter:
   - **AWS Access Key ID**: Your DO Spaces Access Key
   - **AWS Secret Access Key**: Your DO Spaces Secret Key
   - **Default region name**: `lon1`
   - **Default output format**: `json`

3. **Create a bucket policy file** (`bucket-policy.json`):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::dakamela-uploads/*"
       }
     ]
   }
   ```

4. **Apply the bucket policy**:
   ```bash
   aws s3api put-bucket-policy \
     --bucket dakamela-uploads \
     --policy file://bucket-policy.json \
     --endpoint-url https://lon1.digitaloceanspaces.com \
     --profile digitalocean
   ```

### Option 3: Using Python Script

Create a file `set-bucket-policy.py`:

```python
import boto3
import json

# Configure DigitalOcean Spaces credentials
session = boto3.session.Session()
client = session.client('s3',
    region_name='lon1',
    endpoint_url='https://lon1.digitaloceanspaces.com',
    aws_access_key_id='YOUR_DO_SPACES_KEY',
    aws_secret_access_key='YOUR_DO_SPACES_SECRET'
)

# Bucket policy to allow public read access
bucket_policy = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::dakamela-uploads/*"
        }
    ]
}

# Apply the policy
client.put_bucket_policy(
    Bucket='dakamela-uploads',
    Policy=json.dumps(bucket_policy)
)

print("✅ Bucket policy applied successfully!")
```

Run:
```bash
pip install boto3
python set-bucket-policy.py
```

## What This Does

The bucket policy allows **anyone** (`"Principal": "*"`) to perform `s3:GetObject` (read) on all objects in the bucket (`dakamela-uploads/*`).

This is safe because:
- Only read access is granted (not write/delete)
- You control what gets uploaded via your authenticated API
- This is the standard configuration for public CDN assets

## Verify It Works

After applying the bucket policy, test by visiting:
```
https://dakamela-uploads.lon1.cdn.digitaloceanspaces.com/attached%20assets/DK_LOGO_1769944557082.png
```

You should see the image load instead of getting 403 Forbidden.

## Alternative: Make Individual Files Public

If you don't want to use a bucket policy, you can make each file public when uploading by setting the ACL. The code already does this:

```typescript
ACL: "public-read"  // Already set in server/spaces.ts
```

But this requires the bucket to not have a restrictive policy blocking it.

## Recommended Approach

**Use the bucket policy** (Option 2 or 3 above) because:
- ✅ Works for all current and future files
- ✅ Simpler than managing individual file ACLs
- ✅ Standard practice for public CDN assets
- ✅ One-time setup
