Write-Host "Starting Medicine Stock Management Server..." -ForegroundColor Green
Write-Host ""
Write-Host "Server will start at http://localhost:8000" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Try Python 3 first, then Python 2
try {
    python -m http.server 8000
} catch {
    try {
        python3 -m http.server 8000
    } catch {
        Write-Host "Python not found. Please install Python or use another method." -ForegroundColor Red
        Write-Host "See README.md for alternative methods." -ForegroundColor Yellow
        pause
    }
}



