Add-Type -AssemblyName System.Windows.Forms

$scriptDir = Get-Location

$exePath = [System.IO.Path]::Combine($scriptDir.Path, "windows_bin", "launcher_windows_nogui.exe")
$IconPath = [System.IO.Path]::Combine($scriptDir.Path, "data", "favicon.ico")

$form = New-Object System.Windows.Forms.Form
$form.Text = "WiPersona Windows Launcher"
$form.Size = New-Object System.Drawing.Size(350, 100)
$form.StartPosition = "CenterScreen"
$Form.Icon = New-Object system.drawing.icon ($IconPath)

$startButton = New-Object System.Windows.Forms.Button
$startButton.Location = New-Object System.Drawing.Point(10, 10)
$startButton.Size = New-Object System.Drawing.Size(85, 23)
$startButton.Text = "Start server"
$startButton.Add_Click({Start-Process -FilePath $exePath -ArgumentList "-s"})
$form.Controls.Add($startButton)

$stopButton = New-Object System.Windows.Forms.Button
$stopButton.Location = New-Object System.Drawing.Point(105, 10)
$stopButton.Size = New-Object System.Drawing.Size(85, 23)
$stopButton.Text = "Stop server"
$stopButton.Add_Click({Start-Process -FilePath $exePath -ArgumentList "-k"})
$form.Controls.Add($stopButton)

$openButton = New-Object System.Windows.Forms.Button
$openButton.Location = New-Object System.Drawing.Point(200, 10)
$openButton.Size = New-Object System.Drawing.Size(85, 23)
$openButton.Text = "Open browser"
$openButton.Add_Click({Start-Process -FilePath $exePath -ArgumentList "-b"})
$form.Controls.Add($openButton)

$form.ShowDialog()