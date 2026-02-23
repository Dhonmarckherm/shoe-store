Set UAC = CreateObject("Shell.Application")
UAC.ShellExecute "netsh", "advfirewall firewall add rule name=""Vite 5173"" dir=in action=allow protocol=TCP localport=5173", "", "runas", 0
UAC.ShellExecute "netsh", "advfirewall firewall add rule name=""Node 5000"" dir=in action=allow protocol=TCP localport=5000", "", "runas", 0
UAC.ShellExecute "netsh", "advfirewall firewall add rule name=""Node.js Dev"" dir=in action=allow program=""C:\Program Files\nodejs\node.exe"" enable=yes", "", "runas", 0
MsgBox "Firewall rules added successfully!", vbInformation, "Shoe Store Setup"
