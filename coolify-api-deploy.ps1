# Coolify API Deployment Script
# Coolify API kullanarak otomatik deployment

param(
    [Parameter(Mandatory=$false)]
    [string]$ApiToken = "",
    
    [Parameter(Mandatory=$false)]
    [string]$CoolifyUrl = "http://46.224.248.228:8000",
    
    [Parameter(Mandatory=$false)]
    [string]$ApplicationUuid = "vckgcw40o0wkcsswsc4okgkc"
)

Write-Host "🚀 Coolify API Deployment" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# API Token kontrolü
if ([string]::IsNullOrEmpty($ApiToken)) {
    Write-Host "❌ API Token gerekli!" -ForegroundColor Red
    Write-Host ""
    Write-Host "API Token almak için:" -ForegroundColor Yellow
    Write-Host "  1. Coolify → Profile/Settings → API Tokens" -ForegroundColor White
    Write-Host "  2. 'Create Token' tıkla" -ForegroundColor White
    Write-Host "  3. Token'ı kopyala" -ForegroundColor White
    Write-Host ""
    Write-Host "Kullanım:" -ForegroundColor Yellow
    Write-Host "  .\coolify-api-deploy.ps1 -ApiToken 'your-api-token'" -ForegroundColor White
    exit 1
}

Write-Host "📝 Coolify URL: $CoolifyUrl" -ForegroundColor Gray
Write-Host "📝 Application UUID: $ApplicationUuid" -ForegroundColor Gray
Write-Host ""

# API Headers
$headers = @{
    "Authorization" = "Bearer $ApiToken"
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

try {
    Write-Host "🔍 Application bilgileri alınıyor..." -ForegroundColor Blue
    
    # Application bilgilerini al
    $appUrl = "$CoolifyUrl/api/v1/applications/$ApplicationUuid"
    $appResponse = Invoke-RestMethod -Uri $appUrl -Method GET -Headers $headers
    
    Write-Host "✅ Application bulundu: $($appResponse.name)" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "🚀 Deployment başlatılıyor..." -ForegroundColor Blue
    
    # Deployment başlat
    $deployUrl = "$CoolifyUrl/api/v1/applications/$ApplicationUuid/deploy"
    $deployResponse = Invoke-RestMethod -Uri $deployUrl -Method POST -Headers $headers
    
    Write-Host "✅ Deployment başarıyla başlatıldı!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Deployment ID: $($deployResponse.deployment_uuid)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📈 Coolify'da deployment'ı takip edebilirsin:" -ForegroundColor Cyan
    Write-Host "   $CoolifyUrl/project/rsg4w0ogssskosooko80g4ws/environment/jgoc08cwccgwkw800oogss8g" -ForegroundColor White
    Write-Host ""
    Write-Host "⏳ Build süreci 5-10 dakika sürebilir..." -ForegroundColor Yellow
    Write-Host ""
    
    # Deployment durumunu takip et (opsiyonel)
    Write-Host "🔄 Deployment durumu kontrol ediliyor..." -ForegroundColor Blue
    
    $maxAttempts = 60  # 5 dakika (5 saniyede bir kontrol)
    $attempt = 0
    
    while ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 5
        $attempt++
        
        try {
            $statusUrl = "$CoolifyUrl/api/v1/deployments/$($deployResponse.deployment_uuid)"
            $statusResponse = Invoke-RestMethod -Uri $statusUrl -Method GET -Headers $headers
            
            $status = $statusResponse.status
            
            Write-Host "[$attempt/$maxAttempts] Status: $status" -ForegroundColor Gray
            
            if ($status -eq "finished" -or $status -eq "success") {
                Write-Host ""
                Write-Host "🎉 Deployment başarıyla tamamlandı!" -ForegroundColor Green
                Write-Host ""
                Write-Host "🌐 Application URL: $($appResponse.fqdn)" -ForegroundColor Cyan
                break
            } elseif ($status -eq "failed" -or $status -eq "error") {
                Write-Host ""
                Write-Host "❌ Deployment başarısız oldu!" -ForegroundColor Red
                Write-Host "Logs için Coolify'ı kontrol et." -ForegroundColor Yellow
                exit 1
            }
        } catch {
            # Status endpoint çalışmıyorsa devam et
            Write-Host "." -NoNewline -ForegroundColor Gray
        }
    }
    
    if ($attempt -ge $maxAttempts) {
        Write-Host ""
        Write-Host "⏰ Timeout: Deployment hala devam ediyor..." -ForegroundColor Yellow
        Write-Host "Coolify'da manuel kontrol et." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Hata oluştu!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "HTTP Status Code: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 401) {
            Write-Host ""
            Write-Host "API Token geçersiz veya süresi dolmuş!" -ForegroundColor Yellow
            Write-Host "Yeni bir token oluştur ve tekrar dene." -ForegroundColor Yellow
        }
    }
    
    exit 1
}
