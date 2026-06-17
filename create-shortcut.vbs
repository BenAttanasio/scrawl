Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get paths
strDesktop = WshShell.SpecialFolders("Desktop")
strAppDir = fso.GetParentFolderName(WScript.ScriptFullName)
strExe = strAppDir & "\dist\win-unpacked\Scrawl.exe"

' Create shortcut on Desktop
Set oShortcut = WshShell.CreateShortcut(strDesktop & "\Scrawl.lnk")
oShortcut.TargetPath = strExe
oShortcut.WorkingDirectory = strAppDir & "\dist\win-unpacked"
oShortcut.Description = "Scrawl - Desktop Drawing Overlay"
oShortcut.Save

MsgBox "Scrawl shortcut created on your Desktop!", vbInformation, "Scrawl"
