# WiPersona Windows Bin Folder

In distributed builds, this folder is expected to contain:

- `launcher_windows_nogui.ps1`
- `busybox.exe`

> [!Note]
> Both `launcher_windows.ps1` and `launcher_windows.exe` need to be in the root folder; this way, Itch will detect the program correctly.

> [!Note]
> It is preferable to exclude `launcher_windows_nogui_ps2exe.ps1` from distributed builds since it is only used to generate a proper .exe file.