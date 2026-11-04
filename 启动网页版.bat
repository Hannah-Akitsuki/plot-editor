@echo off
chcp 65001 >nul
title 剧情编辑器 网页版服务
echo ============================================
echo   剧情编辑器 网页版服务（保持本窗口开着）
echo   本机访问:  http://localhost:8898/index.html
echo   iPad 访问: http://(本机IP):8898/index.html
echo   本机IP见下行（IPv4 地址）:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do echo    http:%%a:8898/index.html
echo ============================================
echo 关闭本窗口即停止服务。
where py >nul 2>nul && (py -3 -m http.server 8898 --bind 0.0.0.0) || (python -m http.server 8898 --bind 0.0.0.0)
pause
