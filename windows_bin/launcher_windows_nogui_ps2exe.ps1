# Determine the script directory
if ($PSScriptRoot) {
	$SCRIPT_DIR = $PSScriptRoot
} else {
	$SCRIPT_DIR = Split-Path -Parent (Convert-Path -LiteralPath ([System.Environment]::GetCommandLineArgs()[0]))
}

# Set DataPath relative to the script directory
$DataPath = Resolve-Path (Join-Path $SCRIPT_DIR '..\data')

function Show-Usage {
	Write-Host "Usage: $($MyInvocation.MyCommand.Name) [-s | -b | -k]"
	Write-Host "  -s: Start HTTP server"
	Write-Host "  -b: Open HTTP Address in browser"
	Write-Host "  -k: Stop server"
}

# Get command-line arguments
$commandLineArgs = [Environment]::GetCommandLineArgs()

if ($commandLineArgs.Length -le 1) {
	Write-Host "ERROR: No argument provided"
	Show-Usage
	exit 1
}

$arg = $commandLineArgs[1]

switch ($arg) {
	"-s" {
		Start-Process -FilePath "$SCRIPT_DIR\busybox.exe" -ArgumentList "httpd -v -f -p 2962 -h $DataPath" -NoNewWindow
	}
	"-b" {
		Start-Process "http://localhost:2962"
	}
	"-k" {
		Stop-Process -Name "busybox"
	}
	default {
		Write-Host "Not a valid argument"
		Show-Usage
		exit 1
	}
}
