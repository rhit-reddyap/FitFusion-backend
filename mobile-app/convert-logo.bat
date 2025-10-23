@echo off
echo ========================================
echo    FitFusion Logo Conversion Helper
echo ========================================
echo.
echo This script will help you convert the SVG logos to PNG format.
echo.
echo Files to convert:
echo 1. fitfusion-icon.svg -> icon.png (1024x1024)
echo 2. fitfusion-icon.svg -> adaptive-icon.png (1024x1024)  
echo 3. fitfusion-splash.svg -> splash-icon.png (1200x1200)
echo 4. fitfusion-icon.svg -> favicon.png (512x512)
echo.
echo Recommended online converters:
echo - https://convertio.co/svg-png/
echo - https://cloudconvert.com/svg-to-png
echo - https://www.freeconvert.com/svg-to-png
echo.
echo After conversion, replace the files in the assets/ folder.
echo.
echo Press any key to open the logo preview...
pause >nul
start assets/logo-preview.html
echo.
echo Logo preview opened in browser!
echo.
echo Next steps:
echo 1. Convert SVG files to PNG using online converter
echo 2. Replace the PNG files in assets/ folder
echo 3. Run: npx expo start --clear
echo 4. Test the app icon and splash screen
echo.
pause
