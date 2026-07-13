# GitHub ga avtomatik yuklash
# Variant A — Token bilan (eng oson):
#   $env:GITHUB_TOKEN = "ghp_SIZNING_TOKEN"
#   .\scripts\upload-github.ps1
#
# Variant B — Brauzer orqali kirish:
#   gh auth login -h github.com -p https -w
#   .\scripts\upload-github.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$gh = Get-Command gh -ErrorAction SilentlyContinue
if (-not $gh) {
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

if ($env:GITHUB_TOKEN) {
    $env:GITHUB_TOKEN | gh auth login --with-token
}

gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nGitHub ga kirmagansiz!" -ForegroundColor Red
    Write-Host "1) Token: github.com → Settings → Developer settings → Tokens → Generate (repo huquqi)"
    Write-Host "   Keyin: `$env:GITHUB_TOKEN = 'ghp_...'; .\scripts\upload-github.ps1"
    Write-Host "2) Yoki: gh auth login -h github.com -p https -w"
    exit 1
}

git branch -M main 2>$null

$exists = gh repo view albasirtour --json name 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Yangi repo yaratilmoqda: albasirtour..." -ForegroundColor Cyan
    gh repo create albasirtour --public --source=. --remote=origin --push
} else {
    Write-Host "Repo mavjud, push qilinmoqda..." -ForegroundColor Cyan
    git remote remove origin 2>$null
    $user = (gh api user -q .login)
    git remote add origin "https://github.com/$user/albasirtour.git"
    git push -u origin main
}

if ($LASTEXITCODE -eq 0) {
    $user = (gh api user -q .login)
    Write-Host "`nTAYYOR! Repo: https://github.com/$user/albasirtour" -ForegroundColor Green
} else {
    Write-Host "Xato yuz berdi. Token yoki login ni tekshiring." -ForegroundColor Red
}
