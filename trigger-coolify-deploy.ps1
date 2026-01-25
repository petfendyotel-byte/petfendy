# Coolify Webhook Deploy Trigger
# Bu script Coolify'da webhook URL'i ile otomatik deploy tetikler

param(
    [Parameter(Mandatory=$false)]
    [string]$WebhookUrl = ""
)

Write-Host "🚀 Coolify Deploy Trigger" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Webhook URL kontrolü
if ([string]::IsNullOrEmpty($WebhookUrl)) {
    Write-Host "❌ Webhook URL gerekli!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Kullanım:" -ForegroundColor Yellow
    Write-Host "  .\trigger-coolify-deploy.ps1 -WebhookUrl 'https://your-coolify-webhook-url'" -ForegroundColor White
    Write-Host ""
    Write-Host "Webhook URL'i almak için:" -ForegroundColor Yellow
    Write-Host "  1. Coolify → Application → Webhooks" -ForegroundColor White
    Write-Host "  2. 'Deploy Webhook' URL'ini kopyala" -ForegroundColor White
    exit 1
}

Write-Host "📝 Webhook URL: $WebhookUrl" -ForegroundColor Gray
Write-Host ""

try {
    Write-Host "🔄 Deploy tetikleniyor..." -ForegroundColor Blue
    
    # Webhook'u tetikle
    $response = Invoke-WebRequest -Uri $WebhookUrl -Method POST -UseBasicParsing
    
    if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 201) {
        Write-Host "✅ Deploy başarıyla tetiklendi!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Coolify'da deployment'ı takip edebilirsin:" -ForegroundColor Cyan
        Write-Host "   http://46.224.248.228:8000" -ForegroundColor White
        Write-Host ""
        Write-Host "⏳ Build süreci 5-10 dakika sürebilir..." -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  Beklenmeyen yanıt: $($response.StatusCode)" -ForegroundColor Yellow
        Write-Host $response.Content
    }
} catch {
    Write-Host "❌ Hata oluştu!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Webhook URL'i doğru mu kontrol et!" -ForegroundColor Yellow
    exit 1
}
