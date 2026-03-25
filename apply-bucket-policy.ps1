# Apply Bucket Policy to DigitalOcean Spaces
# This script sets public read access for the dakamela-uploads bucket

Write-Host "=== DigitalOcean Spaces Bucket Policy Setup ===" -ForegroundColor Cyan
Write-Host ""

# Prompt for credentials
Write-Host "Enter your DigitalOcean Spaces credentials:" -ForegroundColor Yellow
$accessKey = Read-Host "DO Spaces Access Key"
$secretKey = Read-Host "DO Spaces Secret Key" -AsSecureString
$secretKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secretKey))

Write-Host ""
Write-Host "Configuring AWS CLI..." -ForegroundColor Green

# Configure AWS CLI
$awsConfigDir = "$env:USERPROFILE\.aws"
if (-not (Test-Path $awsConfigDir)) {
    New-Item -ItemType Directory -Path $awsConfigDir | Out-Null
}

# Create credentials file
$credentialsContent = @"
[digitalocean]
aws_access_key_id = $accessKey
aws_secret_access_key = $secretKeyPlain
"@

Set-Content -Path "$awsConfigDir\credentials" -Value $credentialsContent

# Create config file
$configContent = @"
[profile digitalocean]
region = lon1
output = json
"@

Set-Content -Path "$awsConfigDir\config" -Value $configContent

Write-Host "AWS CLI configured successfully!" -ForegroundColor Green
Write-Host ""

# Find AWS CLI executable
$awsPaths = @(
    "C:\Program Files\Amazon\AWSCLIV2\aws.exe",
    "C:\Program Files (x86)\Amazon\AWSCLIV2\aws.exe",
    "$env:LOCALAPPDATA\Programs\Amazon\AWSCLIV2\aws.exe"
)

$awsExe = $null
foreach ($path in $awsPaths) {
    if (Test-Path $path) {
        $awsExe = $path
        break
    }
}

if (-not $awsExe) {
    Write-Host "ERROR: AWS CLI not found. Please install it first." -ForegroundColor Red
    Write-Host "Download from: https://awscli.amazonaws.com/AWSCLIV2.msi" -ForegroundColor Yellow
    exit 1
}

Write-Host "Found AWS CLI at: $awsExe" -ForegroundColor Green
Write-Host ""

# Apply bucket policy
Write-Host "Applying bucket policy..." -ForegroundColor Green

$policyPath = Join-Path $PSScriptRoot "bucket-policy.json"

if (-not (Test-Path $policyPath)) {
    Write-Host "ERROR: bucket-policy.json not found!" -ForegroundColor Red
    exit 1
}

try {
    & $awsExe s3api put-bucket-policy `
        --bucket dakamela-uploads `
        --policy "file://$policyPath" `
        --endpoint-url https://lon1.digitaloceanspaces.com `
        --profile digitalocean

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ SUCCESS! Bucket policy applied successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Testing image access..." -ForegroundColor Cyan
        
        $testUrl = "https://dakamela-uploads.lon1.cdn.digitaloceanspaces.com/attached%20assets/DK_LOGO_1769944557082.png"
        Write-Host "Test URL: $testUrl" -ForegroundColor Gray
        
        try {
            $response = Invoke-WebRequest -Uri $testUrl -Method Head -ErrorAction Stop
            Write-Host "✅ Image is now publicly accessible! (Status: $($response.StatusCode))" -ForegroundColor Green
        } catch {
            if ($_.Exception.Response.StatusCode -eq 403) {
                Write-Host "⚠️  Still getting 403. Wait a few seconds for changes to propagate..." -ForegroundColor Yellow
            } else {
                Write-Host "Test result: $($_.Exception.Message)" -ForegroundColor Gray
            }
        }
        
        Write-Host ""
        Write-Host "All images should now load on your app!" -ForegroundColor Green
        Write-Host "Visit: https://dakamela-n729i.ondigitalocean.app" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Failed to apply bucket policy" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
