Add-Type -AssemblyName System.Windows.Forms

# Obtiene el directorio del ejecutable actual
#$scriptPath = [System.IO.Path]::GetDirectoryName([System.Reflection.Assembly]::GetExecutingAssembly().Location)
$exePath = [System.IO.Path]::Combine($scriptPath, "launcher_windows_nogui.exe")

# Crear una nueva forma
$form = New-Object System.Windows.Forms.Form
$form.Text = "WiPersona Windows Launcher"
$form.Size = New-Object System.Drawing.Size(350, 100)
$form.StartPosition = "CenterScreen"

# Añadir botón 'Start server'
$startButton = New-Object System.Windows.Forms.Button
$startButton.Location = New-Object System.Drawing.Point(10, 10)
$startButton.Size = New-Object System.Drawing.Size(85, 23)
$startButton.Text = "Start server"
$startButton.Add_Click({Start-Process -FilePath $exePath -ArgumentList "-s"})
$form.Controls.Add($startButton)

# Añadir botón 'Stop server'
$stopButton = New-Object System.Windows.Forms.Button
$stopButton.Location = New-Object System.Drawing.Point(105, 10)
$stopButton.Size = New-Object System.Drawing.Size(85, 23)
$stopButton.Text = "Stop server"
$stopButton.Add_Click({Start-Process -FilePath $exePath -ArgumentList "-k"})
$form.Controls.Add($stopButton)

# Añadir botón 'Open browser'
$openButton = New-Object System.Windows.Forms.Button
$openButton.Location = New-Object System.Drawing.Point(200, 10)
$openButton.Size = New-Object System.Drawing.Size(85, 23)
$openButton.Text = "Open browser"
$openButton.Add_Click({Start-Process -FilePath $exePath -ArgumentList "-b"})
$form.Controls.Add($openButton)

# Mostrar la forma
$form.ShowDialog()
