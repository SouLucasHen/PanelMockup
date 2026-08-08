@echo off
cd /d "%~dp0"

echo ============================================
echo   Limpeza - Base Hensa Studio
echo ============================================
echo.

REM Pergunta primeiro, roda uma vez so com a flag certa
echo Deseja remover tambem a pasta dist/ e o hns-vue-source.zip? (S/N)
set /p EXTRA=
if /I "%EXTRA%"=="S" (
    node cleanup.js --all
) else (
    node cleanup.js
)

echo.
echo Concluido! Pressione qualquer tecla para fechar.
pause >nul
