
param([int]$Port = 8080)

$SiteRoot = Get-Location
$V4 = [System.Net.IPAddress]::Any
$Listener = [System.Net.HttpListener]::new()
$Listener.Prefixes.Add("http://localhost:$($Port)/")

try {
    $Listener.Start()
    Write-Host "Server started at http://localhost:$($Port)/"
    Write-Host "Press Ctrl+C to stop."

    while ($Listener.IsListening) {
        $Context = $Listener.GetContext()
        $Request = $Context.Request
        $Response = $Context.Response

        $UrlPath = $Request.Url.LocalPath
        if ($UrlPath -eq "/") { $UrlPath = "/index.html" }
        
        # Simple path join, removing leading slash
        $RelPath = $UrlPath.Substring(1)
        if ($RelPath -eq "") { $RelPath = "index.html" }
        
        $FilePath = Join-Path $SiteRoot $RelPath

        if (Test-Path $FilePath -PathType Leaf) {
            try {
                $Bytes = [System.IO.File]::ReadAllBytes($FilePath)
                $Response.ContentLength64 = $Bytes.Length
                $Response.StatusCode = 200
                $Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
            }
            catch {
                $Response.StatusCode = 500
            }
        }
        else {
            $Response.StatusCode = 404
        }
        $Response.Close()
    }
}
catch {
    Write-Error $_
}
finally {
    $Listener.Stop()
}
