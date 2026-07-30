$ports = 8000, 5173, 5174, 5175
Get-NetTCPConnection -LocalPort $ports -State Listen -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object {
    Write-Host "Killing PID $_"
    Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
  }
Write-Host "Ports cleared."
