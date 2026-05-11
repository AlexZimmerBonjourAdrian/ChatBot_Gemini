# Script de PowerShell para abrir el ChatBot en el navegador

Write-Host "Abriendo ChatBot Gemini en el navegador..." -ForegroundColor Cyan

# Abrir el navegador en localhost:3000
Start-Process "http://localhost:3000"

Write-Host "Navegador abierto en http://localhost:3000" -ForegroundColor Green
