# Script de PowerShell para automatizar el despliegue del ChatBot Gemini
# Este script instala dependencias e inicia el servidor sin configurar APIs

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Iniciando despliegue del ChatBot Gemini" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Node.js está instalado
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js no está instalado. Por favor instálalo antes de continuar." -ForegroundColor Red
    exit 1
}

# Verificar si npm está instalado
Write-Host "Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "npm instalado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: npm no está instalado." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Instalar dependencias
Write-Host "Instalando dependencias (npm install)..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al instalar dependencias." -ForegroundColor Red
    exit 1
}

Write-Host "Dependencias instaladas correctamente." -ForegroundColor Green
Write-Host ""

# Verificar si existe el archivo .env
if (-not (Test-Path ".env")) {
    Write-Host "ADVERTENCIA: No se encontró el archivo .env" -ForegroundColor Yellow
    Write-Host "El servidor se iniciará pero no funcionará sin la API key de Gemini." -ForegroundColor Yellow
    Write-Host "Crea un archivo .env con: GEMINI_API_KEY=tu_api_key_aqui" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "Archivo .env encontrado." -ForegroundColor Green
    Write-Host ""
}

# Iniciar el servidor
Write-Host "Iniciando servidor..." -ForegroundColor Yellow
Write-Host "El servidor estará disponible en http://localhost:3000" -ForegroundColor Cyan
Write-Host "Presiona Ctrl+C para detener el servidor." -ForegroundColor Cyan
Write-Host ""

npm start
