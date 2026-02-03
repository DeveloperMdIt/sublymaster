# PowerShell Script to replace all localhost:3000 URLs with API_ENDPOINTS

$files = @(
    "C:\Users\Micha-PC\.gemini\antigravity\scratch\sublimaster\frontend\src\CanvasEditor.jsx",
    "C:\Users\Micha-PC\.gemini\antigravity\scratch\sublimaster\frontend\src\AdminDashboard.jsx"
)

foreach ($file in $files) {
    Write-Host "Processing: $file"
    
    $content = Get-Content $file -Raw
    
    # Replace all localhost URLs
    $content = $content -replace "http://localhost:3000/api/", "/api/"
    
    # Save
    Set-Content $file -Value $content -NoNewline
    
    Write-Host "✓ Done"
}

Write-Host "`n✅ All URLs converted to relative paths!"
