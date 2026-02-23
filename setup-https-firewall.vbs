Set UAC = CreateObject("Shell.Application")
UAC.ShellExecute "netsh", "advfirewall firewall add rule name=""HTTPS 5173"" dir=in action=allow protocol=TCP localport=5173", "", "runas", 0
UAC.ShellExecute "netsh", "advfirewall firewall add rule name=""HTTPS 5000"" dir=in action=allow protocol=TCP localport=5000", "", "runas", 0
MsgBox "HTTPS firewall rules added successfully!", vbInformation, "Shoe Store Setup"
