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
Dim httpLocation As Object

Private Sub Class_Initialize()
    Set fixDict = CreateObject("Scripting.Dictionary")
    With fixDict
        .Add "latlng", Nothing
        End With
    
    Set mapDict = CreateObject("Scripting.Dictionary")
    With mapDict
        .Add "id", 0
        .Add "fault", ""
        .Add "latlng", Nothing
        .Add "bearing", 0
        .Add "velocity", 0
        .Add "altitude", 0
        .Add "gpstime", #1/1/2000#
        .Add "radius", Nothing      '0 to 4
        .Add "color", ""
        .Add "opacity", 0           '0.0 to 1.0
        .Add "fill", False
        .Add "fillColor", ""
        .Add "fillOpacity", 0       '0.0 to 1.0
        .Add "weight", 0            '0 to 4
        End With
    End Sub

Private Sub Class_Terminate()
    ResetPoints
    Set mapDict = Nothing
    Set fixDict = Nothing
    Set httpLocation = Nothing
    End Sub

Public Function postJSON(endpoint As String, json As String) As Boolean
    Const thistask = "postJSON"
    
    Dim urlLocation As String
    Dim strReturn As String
    
    On Error GoTo Error_Handler
    
    urlLocation = "http://localhost:5000" + endpoint
    'Debug.Print urlLocation
    Set httpLocation = CreateObject("WinHttp.WinHttpRequest.5.1")
    httpLocation.Open "POST", urlLocation, True
    httpLocation.SetRequestHeader "Content-Type", "application/json"
    httpLocation.Send json
    httpLocation.WaitForResponse
    strReturn = httpLocation.ResponseText
    'Debug.Print httpLocation.ResponseText
    Set httpLocation = Nothing
    postJSON = True
    Exit Function
    
Error_Handler:
    If Err.Number = -2147012867 Then
        'LogEvent thistask, "*Map not open"
        postJSON = False
        Exit Function
        End If
    
    LogEvent thistask
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
    Dim size As Long
    size = dict.Count

    json = "{"
    Dim i As Integer
    i = 0
    For Each key In dict.Keys
        i = i + 1
        Dim vType As Integer
        Dim value As String
        
        'Debug.Print VarType(dict(key))
        
        If VarType(dict(key)) = vbString Then
            value = """" + dict(key) + """"
        ElseIf VarType(dict(key)) = vbLong Then
            'Debug.Print dict(key)
            value = CStr(dict(key))
        ElseIf VarType(dict(key)) = vbDouble Then
            value = CStr(dict(key))
        ElseIf VarType(dict(key)) = vbInteger Then
            value = CStr(dict(key))
        ElseIf VarType(dict(key)) = vbBoolean Then
            value = CStr(dict(key))
        Else 'If VarType(dict(key)) = vbArray Then 'is array value 8192 + value type
            Dim s As String
            Dim a As Variant
            a = dict(key)
            value = stringifyArray(dict(key))
        End If
        json = json + """" + key + """: " + value
        If i = size Then
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

Public Function GPSMapFix(Lat As Double, Lon As Double) As Boolean
    Dim json As String
    Dim coords As Variant
    
    With fixDict
        If Lat <> 0# Then
            coords = Array(Lat, Lon)
            .Item("latlng") = coords
            json = compileJSON(fixDict)
            'Me.JsonTxt.Caption = JSONString
            GPSMapFix = postJSON("/location", json)
            'Debug.Print json
        Else
            GPSMapFix = False
            End If
        End With
    End Function

Public Function AddPoint(ID As Long, FType As String, Lat As Double, Lon As Double, Brg As Double, Vel As Double, Alt As Double, _
    gpstime As Date, radius As Integer, color As String, opacity As Integer, fill As Boolean, fillcolor As String, fillopacity As Integer, weight As Integer) As Boolean
    
    Dim json As String
    Dim coords As Variant
    
    With mapDict
        If Lat <> 0 Then
            .Item("id") = ID
            .Item("fault") = FType
            coords = Array(Lat, Lon)
            .Item("latlng") = coords
            .Item("bearing") = Round(Brg, 1)
            .Item("velocity") = Round(Vel, 1)
            .Item("altitude") = Round(Alt, 1)
            .Item("gpstime") = Format(gpstime, "yyyy-mm-dd HH:mm:ss")
            .Item("radius") = radius
            .Item("color") = "#" + color
            .Item("opacity") = opacity
            .Item("fill") = "True"
            .Item("fillColor") = "#" + fillcolor
            .Item("fillOpacity") = fillopacity
            .Item("weight") = weight

            json = compileJSON(mapDict)
            Debug.Print json
            AddPoint = postJSON("/insertpoint", json)
        Else
            AddPoint = False
            End If
        End With
    End Function

Public Function UpdatePoint(ByRef dict As Object) As Boolean

    End Function

Public Function DeletePoint(ID As Long) As Boolean
    Dim json As String
    
    With mapDict
        .Item("id") = ID
        json = compileJSON(mapDict)
        DeletePoint = postJSON("/deletePoint", json)
        End With
    End Function

Public Function ResetPoints() As Boolean
    ResetPoints = postJSON("/reset", "")
    End Function
