param (
    [Parameter(Mandatory=$false)]
    [int]$Port = 3000
)

Write-Host "Looking for processes using port $Port..."

$processInfo = netstat -ano | Select-String ":$Port "

if ($processInfo) {
    $processInfoLines = $processInfo | ForEach-Object { $_ }
    
    foreach ($line in $processInfoLines) {
        if ($line -match "(\d+)$") {
            $pid = $matches[1]
            
            # Get process name
            try {
                $process = Get-Process -Id $pid -ErrorAction Stop
                $processName = $process.ProcessName
                
                Write-Host "Found process using port $Port - PID: $pid, Name: $processName"
                
                # Ask for confirmation before killing
                $confirmation = Read-Host "Do you want to kill this process? (y/n)"
                if ($confirmation -eq 'y') {
                    Stop-Process -Id $pid -Force
                    Write-Host "Process $processName (PID: $pid) has been terminated"
                } else {
                    Write-Host "Process termination cancelled"
                }
            } catch {
                Write-Host "Could not find process with PID $pid"
            }
        }
    }
} else {
    Write-Host "No process found using port $Port"
} 