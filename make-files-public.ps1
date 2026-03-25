# Make all files in DO Spaces bucket public by setting ACL to public-read
# This is an alternative to setting a bucket policy

param(
    [Parameter(Mandatory=$true)]
    [string]$AccessKey,
    
    [Parameter(Mandatory=$true)]
    [string]$SecretKey
)

$bucket = "dakamela-uploads"
$region = "lon1"
$endpoint = "https://$bucket.$region.digitaloceanspaces.com"

# List of files to make public (from cdn.ts)
$files = @(
    "attached assets/DK_LOGO_1769944557082.png",
    "attached assets/CK_Logo_1770117291903.jpeg",
    "attached assets/kbf_logo_1770113825582.png",
    "attached assets/Chief_Dakamela_Awards_Camping_Plan_1769945860736.png",
    "attached assets/IMG_0740_1770114288425.jpg",
    "attached assets/IMG_0739_1770114288425.jpg",
    "attached assets/IMG_0738_1770114288426.jpg",
    "attached assets/IMG_0732_1770114288426.jpg",
    "attached assets/IMG_0730_1770114288427.jpg",
    "attached assets/IMG_0729_1770114288428.jpg",
    "attached assets/IMG_0728_1770114288428.jpg",
    "attached assets/IMG_0731_1770114288427.jpg",
    "attached assets/IMG_0727_1770114288428.jpg",
    "attached assets/IMG_0725_(1)_1770114288429.jpg"
)

function Set-ObjectACL {
    param(
        [string]$ObjectKey,
        [string]$AccessKey,
        [string]$SecretKey
    )
    
    $method = "PUT"
    $resource = "/$bucket/$ObjectKey"
    $uri = "$endpoint/$ObjectKey`?acl"
    $date = [DateTime]::UtcNow.ToString("ddd, dd MMM yyyy HH:mm:ss +0000")
    
    # ACL XML for public-read
    $aclXml = @"
<?xml version="1.0" encoding="UTF-8"?>
<AccessControlPolicy>
  <Owner>
    <ID>$AccessKey</ID>
  </Owner>
  <AccessControlList>
    <Grant>
      <Grantee xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="CanonicalUser">
        <ID>$AccessKey</ID>
      </Grantee>
      <Permission>FULL_CONTROL</Permission>
    </Grant>
    <Grant>
      <Grantee xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="Group">
        <URI>http://acs.amazonaws.com/groups/global/AllUsers</URI>
      </Grantee>
      <Permission>READ</Permission>
    </Grant>
  </AccessControlList>
</AccessControlPolicy>
"@
    
    # Create signature
    $stringToSign = "$method`n`napplication/xml`n$date`n$resource`?acl"
    $hmac = New-Object System.Security.Cryptography.HMACSHA1
    $hmac.Key = [Text.Encoding]::UTF8.GetBytes($SecretKey)
    $signature = [Convert]::ToBase64String($hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($stringToSign)))
    
    # Headers
    $headers = @{
        "Host" = "$bucket.$region.digitaloceanspaces.com"
        "Date" = $date
        "Content-Type" = "application/xml"
        "Authorization" = "AWS $AccessKey`:$signature"
    }
    
    try {
        Invoke-WebRequest -Uri $uri -Method $method -Headers $headers -Body $aclXml -ContentType "application/xml" | Out-Null
        return $true
    } catch {
        return $false
    }
}

Write-Host "Making files public in $bucket..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($file in $files) {
    Write-Host "Processing: $file" -NoNewline
    
    if (Set-ObjectACL -ObjectKey $file -AccessKey $AccessKey -SecretKey $SecretKey) {
        Write-Host " ✅" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host " ❌" -ForegroundColor Red
        $failCount++
    }
    
    Start-Sleep -Milliseconds 200
}

Write-Host ""
Write-Host "Results: $successCount succeeded, $failCount failed" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Yellow" })

if ($successCount -gt 0) {
    Write-Host ""
    Write-Host "Testing image access..." -ForegroundColor Cyan
    Start-Sleep -Seconds 1
    
    $testUrl = "https://dakamela-uploads.lon1.cdn.digitaloceanspaces.com/attached%20assets/DK_LOGO_1769944557082.png"
    try {
        $response = Invoke-WebRequest -Uri $testUrl -Method Head
        Write-Host "✅ Images are now publicly accessible!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Visit your app: https://dakamela-n729i.ondigitalocean.app" -ForegroundColor Cyan
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 403) {
            Write-Host "⚠️  Still 403 - try refreshing your app in a few seconds" -ForegroundColor Yellow
        } else {
            Write-Host "Test: $($_.Exception.Message)" -ForegroundColor Gray
        }
    }
}
