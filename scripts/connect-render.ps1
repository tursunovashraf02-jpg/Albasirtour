# Render + MongoDB Atlas ulash skripti
# Ishlatish: PowerShell da loyiha ildizidan:
#   .\scripts\connect-render.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "backend\.env"

Write-Host "`n=== Albasirtour: Render + MongoDB Atlas ulash ===`n" -ForegroundColor Cyan

# 1. MongoDB connection string
Write-Host "1. MongoDB Atlas connection string kerak." -ForegroundColor Yellow
Write-Host "   Atlas → Database → Connect → Drivers → Python`n"
$mongoUrl = Read-Host "MONGO_URL ni kiriting (mongodb+srv://...)"

if (-not $mongoUrl.StartsWith("mongodb")) {
    Write-Host "XATO: Connection string mongodb:// yoki mongodb+srv:// bilan boshlanishi kerak" -ForegroundColor Red
    exit 1
}

$dbName = Read-Host "DB_NAME [albasirtour]"
if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "albasirtour" }

$jwtSecret = Read-Host "JWT_SECRET (bo'sh qoldirsangiz avtomatik yaratiladi)"
if ([string]::IsNullOrWhiteSpace($jwtSecret)) {
    $jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 40 | ForEach-Object { [char]$_ })
}

$adminPass = Read-Host "ADMIN_PASSWORD [Admin@2026]"
if ([string]::IsNullOrWhiteSpace($adminPass)) { $adminPass = "Admin@2026" }

$cors = Read-Host "CORS_ORIGINS (frontend URL, masalan https://albasirtour.vercel.app)"
if ([string]::IsNullOrWhiteSpace($cors)) { $cors = "https://albasirtour.vercel.app,http://localhost:3000" }

# 2. Lokal .env yozish
$envContent = @"
MONGO_URL=$mongoUrl
DB_NAME=$dbName
JWT_SECRET=$jwtSecret
ADMIN_PHONE=+998900000001
ADMIN_PASSWORD=$adminPass
ADMIN_EMAIL=admin@albasirtour.com
DEMO_USER_PHONE=+998900000002
DEMO_USER_EMAIL=user@albasirtour.com
DEMO_USER_PASSWORD=User@2026
CORS_ORIGINS=$cors
"@
Set-Content -Path $envFile -Value $envContent -Encoding UTF8
Write-Host "`nOK: backend/.env yaratildi" -ForegroundColor Green

# 3. MongoDB ulanishni tekshirish
Write-Host "`n2. MongoDB ulanish tekshirilmoqda..." -ForegroundColor Yellow
Push-Location (Join-Path $root "backend")
try {
    python check_db.py
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`nMongoDB ulanmadi. Atlas Network Access da 0.0.0.0/0 qo'shilganini tekshiring." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Python topilmadi yoki check_db.py ishlamadi: $_" -ForegroundColor Red
} finally {
    Pop-Location
}

# 4. Render uchun env ro'yxati
Write-Host "`n=== 3. RENDER DASHBOARD GA QO'YING ===`n" -ForegroundColor Cyan
Write-Host "Render.com → albasirtour-api → Environment → Add Environment Variable`n"

$renderVars = @{
    "MONGO_URL"      = $mongoUrl
    "DB_NAME"        = $dbName
    "JWT_SECRET"     = $jwtSecret
    "ADMIN_PASSWORD" = $adminPass
    "ADMIN_PHONE"    = "+998900000001"
    "CORS_ORIGINS"   = $cors
}

foreach ($key in $renderVars.Keys) {
    Write-Host "$key = $($renderVars[$key])"
}

Write-Host "`n=== ATLAS TEKSHIRUV ===`n" -ForegroundColor Cyan
Write-Host "- Network Access: 0.0.0.0/0 (Allow from anywhere) — Render uchun shart"
Write-Host "- Database user: readWrite huquqi bor bo'lishi kerak"
Write-Host "`nRender da env qo'shgach: Manual Deploy yoki avtomatik redeploy kuting."
Write-Host "Tekshirish: https://SIZNING-RENDER-URL.onrender.com/api/`n"
