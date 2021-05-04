VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Mapping"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Compare Database

Private mapDict As Object
Private fixDict As Object
Dim WinHttpRequest As Object
Dim host As String


Private Sub Class_Initialize()
    
    Set fixDict = CreateObject("Scripting.Dictionary")
    host = "localhost:5000"
    With fixDict
        .Add "latlng", Nothing
        .Add "bearing", 0
        .Add "velocity", 0
        End With
    
    Set mapDict = CreateObject("Scripting.Dictionary")
    With mapDict
        .Add "id", 0
        .Add "fault", ""
        .Add "latlng", Nothing
        .Add "altitude", 0
        .Add "gpstime", #1/1/2000#
        .Add "radius", Nothing      '0 to 4
        .Add "color", ""
        .Add "opacity", 0           '0.0 to 1.0
        .Add "fill", "True"
        .Add "fillColor", ""
        .Add "fillOpacity", 0       '0.0 to 1.0
        .Add "weight", 0            '0 to 4
        End With
    End Sub

Private Sub Class_Terminate()
    'ResetPoints
    Set mapDict = Nothing
    Set fixDict = Nothing
    Set httpLocation = Nothing
    End Sub
Public Function GPSMapFix(Lat As Double, Lon As Double, Brg As Double, Vel As Double) As Boolean
    Dim json As String
    Dim coords As Variant
    
    With fixDict
        If Lat <> 0# Then
            coords = Array(Lat, Lon)
            .Item("latlng") = coords
            .Item("bearing") = Round(Brg, 1)
            .Item("velocity") = Round(Vel, 1)
            json = compileJSON(fixDict)
            'Me.JsonTxt.Caption = JSONString
            GPSMapFix = postJSON("/location", json)
            'Debug.Print json
        Else
            GPSMapFix = False
            End If
        End With
    End Function
    

'Public Function AddPoint(id As Long, fType As String, Lat As Double, Lon As Double, Alt As Double, _
    gpstime As Date, radius As Integer, color As String, opacity As Integer, fill As Boolean, fillcolor As String, fillopacity As Integer, weight As Integer) As Boolean
    Public Function AddPoint(point As FaultPoint) As Boolean

    Dim json As String
    Dim coords As Variant
    With mapDict
        'If Lat <> 0 Then
        .Item("id") = point.id
        .Item("fault") = point.fType
        coords = Array(point.Lat, point.Lon)
        .Item("latlng") = coords
        .Item("altitude") = Round(point.Alt, 1)
        .Item("gpstime") = Format(point.gpstime, "yyyy-mm-dd HH:mm:ss")
        .Item("radius") = point.radius
        .Item("color") = "#" + point.color
        .Item("opacity") = point.opacity
        .Item("fill") = IIf(fill, "true", "false")
        .Item("fillColor") = "#" + point.fillcolor
        .Item("fillOpacity") = point.fillopacity
        .Item("weight") = point.weight
        json = compileJSON(mapDict)
        Debug.Print json
        AddPoint = postJSON("/insertPoint", json)
        'Else
            'AddPoint = False
            'End If
    End With
End Function

Public Function UpdatePoint(id As Long, fType As String, Lat As Double, Lon As Double, Brg As Double, Vel As Double, Alt As Double, _
    gpstime As Date, radius As Integer, color As String, opacity As Integer, fill As Boolean, fillcolor As String, fillopacity As Integer, weight As Integer) As Boolean

    End Function

Public Function DeletePoint(id As Long) As Boolean
    
    Dim json As String
    json = "{""id"": " & id & "}"
    DeletePoint = postJSON("/deletePoint", json)

    End Function

Public Function ResetPoints() As Boolean
    Dim urlLocation As String
    Dim strReturn As String
    Dim req As Boolean
    Dim res As String
    Dim resText As String
    Dim resStatus As String
    Set WinHttpRequest = CreateObject("WinHttp.WinHttpRequest.5.1")
    urlLocation = "http://" + host + "/reset"
    req = WinHttpRequest.Open("GET", urlLocation, False)
    
    On Error GoTo errHand:
    ResetPoints = False
    
    WinHttpRequest.SetRequestHeader "Content-Type", "application/json"
    WinHttpRequest.Send
    res = WinHttpRequest.WaitForResponse
    resText = WinHttpRequest.ResponseText
    resStatus = WinHttpRequest.Status
    Set WinHttpRequest = Nothing
    ResetPoints = res
    
errHand:
    Select Case Err.Number
        Case -2147012867 'Code for Connection not established
            Debug.Print Error(Err.Number)
        Case -2147012894 'Code for Timeout
            Debug.Print Error(Err.Number)
        Case -2147012891 'Code for Invalid URL
            Debug.Print Error(Err.Number)
        Case Else 'Add more Errorcodes here if wanted
            Debug.Print Error(Err.Number)
    End Select
End Function
Private Function wktToLatLng(wkt As String) As String
'MULTILINESTRING ((174.892731953107 -36.9395173499249,174.89293639596 -36.939548976714,174.89311445909 -36.9395806034901,174.893269439962 _
'-36.9396069591267,174.893404636042 -36.9396333147543,174.893566211845 -36.9396649414953))

End Function

Private Function mapEditToLatLng(mapEdit As String) As String

    Dim gme As String
    gme = "(-36.939112,174.889622),(-36.939073,174.889640),(-36.939042,174.889678),(-36.939020,174.889740),(-36.939013,174.889820),(-36.939023,174.889910)"
    Dim js As String
    js = Replace(gme, "(", "[")
    Debug.Print js

End Function

Public Function postJSON(endpoint As String, json As String) As Boolean
    Const thisTask = "postJSON"
    Dim urlLocation As String
    Dim strReturn As String
    On Error GoTo Error_Handler
    
    urlLocation = "http://" + host + endpoint
    Set WinHttpRequest = CreateObject("WinHttp.WinHttpRequest.5.1")
    WinHttpRequest.Open "POST", urlLocation, True
    WinHttpRequest.SetRequestHeader "Content-Type", "application/json"
    WinHttpRequest.Send json
    WinHttpRequest.WaitForResponse
    strReturn = WinHttpRequest.ResponseText
    'Debug.Print httpLocation.ResponseText
    Set WinHttpRequest = Nothing
    postJSON = True
    Exit Function
    
Error_Handler:
    If Err.Number = 91 Then
        'LogEvent thisTask, "*91 Error"
        'Resume Next
        'Exit Function
        MsgBox (Error(Err.Number))
        End If
    
    If Err.Number = -2147012867 Then
        'LogEvent thisTask, "*Map not open"
        postJSON = False
        Exit Function
        End If
    
    LogEvent thisTask
    postJSON = False
    Exit Function
    End Function

Private Function stringifyArray(ByRef a As Variant) As String
        Dim str As String
        Dim value As Variant
        Dim length As Long
        Dim i As Long
        i = 0
        length = arrLength(a)
        str = "["
        For Each value In a
            i = i + 1
            If i <= length Then
                If i Mod 2 = 1 Then 'latitude'
                    str = str + "[" + CStr(value) + ","
                Else:  'longitude'
                    If i <> length Then
                        str = str + CStr(value) + "],"
                    Else:
                        str = str + CStr(value) + "]"
                    End If
                End If
            Else:
                str = str + "]"
            End If
        Next
        str = str + "]"
        stringifyArray = str
    End Function
    
Private Function compileJSON(ByRef dict As Object) As String
    Dim key As Variant
    Dim json As String
    Dim Size As Long
    Size = dict.Count

    json = "{"
    Dim i As Integer
    i = 0
    For Each key In dict.Keys
        i = i + 1
        Dim vType As Integer
        Dim value As String
        If VarType(dict(key)) = vbString Then
            value = """" + dict(key) + """"
        ElseIf VarType(dict(key)) = vbLong Then
            value = CStr(dict(key))
        ElseIf VarType(dict(key)) = vbDouble Then
            value = CStr(dict(key))
        ElseIf VarType(dict(key)) = vbInteger Then
            value = CStr(dict(key))
        ElseIf VarType(dict(key)) = vbBoolean Then
        ElseIf IsArray(dict(key)) Then 'is array value 8192 + value type
            Dim s As String
            Dim a As Variant
            a = dict(key)
            value = stringifyArray(dict(key))
        Else:
            'handle error
        End If
        json = json + """" + key + """: " + value
        If i = Size Then
        Else
            json = json + ","
        End If
    Next
    json = json + "}"
    compileJSON = json

End Function
    
Public Function arrLength(a As Variant) As Long
    If IsEmpty(a) Then
        arrLength = 0
    Else
        arrLength = UBound(a) - LBound(a) + 1
    End If
End Function




