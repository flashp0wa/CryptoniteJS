$sql = Get-service | Where-Object -Property Name -eq 'MSSQLSERVER'

if ($sql.Status -eq 'Running') {
    Write-Host "SQL Server is already running"
} else {
    Write-Host "SQL Server is not running"
    write-host "Starting SQL Server"
    Start-Service -Name 'MSSQLSERVER'
    Write-Host "SQL Server started"
}

Write-Host "Starting Cryptonite Services"
Write-Host "Starting Cryptonite Server"
Start-Process powershell -ArgumentList { set-location 'C:\Users\wd976098\OneDrive - Siemens Healthineers\GitHub\Crypt0nite\CryptoniteJS'; npm run prod;}
Write-Host "Starting Cryptonite GUI"
Start-Process powershell -ArgumentList { set-location "C:\Users\wd976098\OneDrive - Siemens Healthineers\GitHub\Crypt0nite\Cryptonite"; npm run dev;}
write-host "Starting Cryptonite DOC"
Start-Process powershell -ArgumentList { set-location "C:\Users\wd976098\OneDrive - Siemens Healthineers\GitHub\Crypt0nite\CryptoniteDOC"; retype watch;}