@echo off
REM ============================================================
REM  Mock Trial Simulator launcher
REM  Double-click this file to start the server and open Chrome.
REM ============================================================
cd /d "%~dp0"

echo Starting the Mock Trial server on http://localhost:8080 ...
start "MockTrialServer" /min node server.js

REM Give the server a moment to come up
timeout /t 2 /nobreak >nul

echo Opening the app in Chrome ...
start "" chrome "http://localhost:8080/mock_trial.html"

echo.
echo If Chrome did not open, paste this into Chrome's address bar:
echo     http://localhost:8080/mock_trial.html
echo.
echo NOTE: For the AI to respond, make sure Ollama is running in another
echo window:  ollama serve     (with the llama3 model pulled: ollama pull llama3)
echo.
echo You can close THIS window once the app has opened.
pause
