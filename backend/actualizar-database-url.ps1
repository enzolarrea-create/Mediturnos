# Script para actualizar DATABASE_URL en .env
# Uso: .\actualizar-database-url.ps1 "postgresql://nueva-url-aqui"

param(
    [Parameter(Mandatory=$true)]
    [string]$NewDatabaseUrl
)

$envFile = ".\.env"

if (-not (Test-Path $envFile)) {
    Write-Host "❌ Error: No se encontró el archivo .env" -ForegroundColor Red
    Write-Host "Asegúrate de estar en la carpeta backend/" -ForegroundColor Yellow
    exit 1
}

Write-Host "📝 Actualizando DATABASE_URL en .env..." -ForegroundColor Cyan

# Leer el archivo .env
$content = Get-Content $envFile

# Reemplazar la línea DATABASE_URL
$updated = $false
$newContent = $content | ForEach-Object {
    if ($_ -match '^DATABASE_URL=') {
        $updated = $true
        "DATABASE_URL=`"$NewDatabaseUrl`""
    } else {
        $_
    }
}

if (-not $updated) {
    Write-Host "⚠️  No se encontró DATABASE_URL en .env, agregándola..." -ForegroundColor Yellow
    $newContent += "DATABASE_URL=`"$NewDatabaseUrl`""
}

# Guardar el archivo
$newContent | Set-Content $envFile -Encoding UTF8

Write-Host "✅ DATABASE_URL actualizada correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. npm run prisma:generate" -ForegroundColor White
Write-Host "   2. npx prisma migrate dev --name init_supabase" -ForegroundColor White
Write-Host "   3. npx prisma studio (para verificar)" -ForegroundColor White

