# Run this PowerShell script as Administrator on Windows
# This will forward Windows localhost:3002 to WSL2 instance

$wslIp = (wsl hostname -I).Trim().Split()[0]
Write-Host "WSL2 IP: $wslIp"

# Remove any existing port proxy
netsh interface portproxy delete v4tov4 listenport=3002 listenaddress=0.0.0.0

# Add new port proxy
netsh interface portproxy add v4tov4 listenport=3002 listenaddress=0.0.0.0 connectport=3002 connectaddress=$wslIp

Write-Host "Port forwarding set up successfully!"
Write-Host "You can now access your Next.js app at http://localhost:3002"

# Show current port proxies
netsh interface portproxy show all