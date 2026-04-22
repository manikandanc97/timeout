$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$outputRoot = Join-Path $repoRoot 'dist/themeforest'
$stagingRoot = Join-Path $outputRoot 'staging'
$packageRoot = Join-Path $stagingRoot 'timeout-hrm'
$uploadRoot = Join-Path $outputRoot 'upload'
$previewRoot = Join-Path $outputRoot 'preview-assets'
$zipPath = Join-Path $uploadRoot 'timeout-hrm-main.zip'

$rootFiles = @(
  '.env.example',
  'INSTALLATION.md',
  'README.md',
  'package.json',
  'package-lock.json',
  'vercel.json'
)

$rootDirs = @(
  'backend',
  'frontend',
  'documentation'
)

$removePatterns = @(
  'backend/.env',
  'backend/node_modules',
  'frontend/.env.local',
  'frontend/.env.production.local',
  'frontend/node_modules',
  'frontend/.next',
  'frontend/out',
  'coverage'
)

if (Test-Path $outputRoot) {
  Remove-Item -LiteralPath $outputRoot -Recurse -Force
}

New-Item -ItemType Directory -Path $packageRoot -Force | Out-Null
New-Item -ItemType Directory -Path $uploadRoot -Force | Out-Null
New-Item -ItemType Directory -Path $previewRoot -Force | Out-Null

foreach ($file in $rootFiles) {
  $source = Join-Path $repoRoot $file
  if (Test-Path $source) {
    Copy-Item -LiteralPath $source -Destination (Join-Path $packageRoot $file)
  }
}

foreach ($dir in $rootDirs) {
  $source = Join-Path $repoRoot $dir
  if (Test-Path $source) {
    Copy-Item -LiteralPath $source -Destination (Join-Path $packageRoot $dir) -Recurse
  }
}

foreach ($pattern in $removePatterns) {
  $target = Join-Path $packageRoot $pattern
  if (Test-Path $target) {
    Remove-Item -LiteralPath $target -Recurse -Force
  }
}

Get-ChildItem -Path $packageRoot -Filter '*.tsbuildinfo' -Recurse -File | Remove-Item -Force
Get-ChildItem -Path $packageRoot -Filter '*.log' -Recurse -File | Remove-Item -Force

$previewReadmeSource = Join-Path $repoRoot 'themeforest/preview-assets/README.md'
$previewChecklistSource = Join-Path $repoRoot 'documentation/THEMEFOREST_SUBMISSION_CHECKLIST.md'
$buyerGuideSource = Join-Path $repoRoot 'documentation/BUYER_GUIDE.html'

if (Test-Path $previewReadmeSource) {
  Copy-Item -LiteralPath $previewReadmeSource -Destination (Join-Path $previewRoot 'README.md')
}

if (Test-Path $previewChecklistSource) {
  Copy-Item -LiteralPath $previewChecklistSource -Destination (Join-Path $previewRoot 'checklist.txt')
}

if (Test-Path $buyerGuideSource) {
  Copy-Item -LiteralPath $buyerGuideSource -Destination (Join-Path $uploadRoot 'BUYER_GUIDE.html')
}

Compress-Archive -Path (Join-Path $packageRoot '*') -DestinationPath $zipPath -CompressionLevel Optimal -Force

Remove-Item -LiteralPath $stagingRoot -Recurse -Force

Write-Host "ThemeForest package ready:"
Write-Host "  Main ZIP: $zipPath"
Write-Host "  Preview assets folder: $previewRoot"
