Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = scriptDir

' 1. Check if server is ALREADY active on port 3009
On Error Resume Next
Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
http.open "GET", "http://localhost:3009/status", False
http.setTimeouts 300, 300, 300, 300
http.send

If Err.Number <> 0 Or http.status <> 200 Then
    ' 2. Find full path of python.exe or pythonw.exe on this PC
    localApp = WshShell.ExpandEnvironmentStrings("%LOCALAPPDATA%")
    pyCandidates = Array( _
        localApp & "\Programs\Python\Python314\python.exe", _
        localApp & "\Programs\Python\Python314\pythonw.exe", _
        localApp & "\Programs\Python\Python313\python.exe", _
        localApp & "\Programs\Python\Python313\pythonw.exe", _
        localApp & "\Programs\Python\Python312\python.exe", _
        localApp & "\Programs\Python\Python312\pythonw.exe", _
        localApp & "\Programs\Python\Python311\python.exe", _
        localApp & "\Programs\Python\Python311\pythonw.exe", _
        localApp & "\Programs\Python\Python310\python.exe", _
        localApp & "\Programs\Python\Python310\pythonw.exe", _
        "C:\Python314\python.exe", _
        "C:\Python313\python.exe", _
        "C:\Python312\python.exe", _
        "C:\Python311\python.exe", _
        "C:\Python310\python.exe" _
    )
    
    pyExe = ""
    For Each p In pyCandidates
        If fso.FileExists(p) Then
            pyExe = p
            Exit For
        End If
    Next

    If pyExe = "" Then
        pyExe = "python.exe"
    End If

    ' 3. Launch Python engine completely silent in background (0 black window, port 3009 guaranteed)
    WshShell.Run """" & pyExe & """ """ & scriptDir & "\solid_movie_maker.py""", 0, False
    WScript.Sleep 1000
End If
On Error GoTo 0

' 4. Open app in Chrome / Edge / Default browser
chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
chromePathX86 = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
edgePath64 = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"

appFlags = " --app=http://localhost:3009"

If fso.FileExists(chromePath) Then
    WshShell.Run """" & chromePath & """" & appFlags, 1, False
ElseIf fso.FileExists(chromePathX86) Then
    WshShell.Run """" & chromePathX86 & """" & appFlags, 1, False
ElseIf fso.FileExists(edgePath) Then
    WshShell.Run """" & edgePath & """" & appFlags, 1, False
ElseIf fso.FileExists(edgePath64) Then
    WshShell.Run """" & edgePath64 & """" & appFlags, 1, False
Else
    WshShell.Run "http://localhost:3009", 1, False
End If
