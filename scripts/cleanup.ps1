# PowerShell cleanup script
Write-Host "🧹 Cleaning up build artifacts..." -ForegroundColor Blue

# Remove dist directory
if (Test-Path dist) {
    Remove-Item -Recurse -Force dist
    Write-Host "✅ Removed dist directory" -ForegroundColor Green
}

# Remove .wrangler directory
if (Test-Path .wrangler) {
    Remove-Item -Recurse -Force .wrangler
    Write-Host "✅ Removed .wrangler directory" -ForegroundColor Green
}

# Remove node_modules (optional)
if ((Read-Host "Do you want to remove node_modules? (y/n)") -eq 'y') {
    if (Test-Path node_modules) {
        Remove-Item -Recurse -Force node_modules
        Write-Host "✅ Removed node_modules directory" -ForegroundColor Green
    }
}

Write-Host "✨ Cleanup complete!" -ForegroundColor Blue
