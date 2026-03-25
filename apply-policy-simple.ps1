# Apply Bucket Policy using S3 API directly (no AWS CLI needed)

param(
    [Parameter(Mandatory=$true)]
    [string]$AccessKey,
    
    [Parameter(Mandatory=$true)]
    [string]$SecretKey
)

$bucket = "dakamela-uploads"
$region = "lon1"
$endpoint = "https://$bucket.$region.digitaloceanspaces.com"

# Read the policy file
$policyPath = Join-Path $PSScriptRoot "bucket-policy.json"
if (-not (Test-Path $policyPath)) {
    Write-Host "ERROR: bucket-policy.json not found!" -ForegroundColor Red
    exit 1
}

$policyContent = Get-Content $policyPath -Raw

# S3 API request details
$method = "PUT"
$uri = "$endpoint/?policy"
$contentType = "application/json"
$date = [DateTime]::UtcNow.ToString("ddd, dd MMM yyyy HH:mm:ss +0000")

# Create signature
$stringToSign = "$method`n`n$contentType`n$date`n/$bucket/?policy"
$hmac = New-Object System.Security.Cryptography.HMACSHA1
$hmac.Key = [Text.Encoding]::UTF8.GetBytes($SecretKey)
$signature = [Convert]::ToBase64String($hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($stringToSign)))

# Headers
$headers = @{
    "Host" = "$bucket.$region.digitaloceanspaces.com"
    "Date" = $date
    "Content-Type" = $contentType
    "Authorization" = "AWS $AccessKey`:$signature"
}

Write-Host "Applying bucket policy to $bucket..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri $uri -Method $method -Headers $headers -Body $policyContent -ContentType $contentType
    
    Write-Host ""
    Write-Host "✅ SUCCESS! Bucket policy applied!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Testing image access..." -ForegroundColor Cyan
    
    Start-Sleep -Seconds 2
    
    $testUrl = "https://dakamela-uploads.lon1.cdn.digitaloceanspaces.com/attached%20assets/DK_LOGO_1769944557082.png"
    try {
        $testResponse = Invoke-WebRequest -Uri $testUrl -Method Head
        Write-Host "✅ Images are now publicly accessible!" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 403) {
            Write-Host "⚠️  Still 403 - changes may take a few seconds to propagate" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "Visit your app: https://dakamela-n729i.ondigitalocean.app" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error applying policy:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Gray
    }
}
