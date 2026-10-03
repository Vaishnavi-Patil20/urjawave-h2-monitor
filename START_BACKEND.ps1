Set-Location "$PSScriptRoot\backend"
if (!(Test-Path node_modules)) { npm install }
npm start
