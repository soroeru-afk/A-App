Set ws = CreateObject("Wscript.Shell")
ws.Run "cmd /c start http://localhost:3009 && node dist/server.cjs", 7, False
