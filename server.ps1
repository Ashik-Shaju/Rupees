$Listener = New-Object System.Net.HttpListener
$Listener.Prefixes.Add("http://localhost:8080/")
$Listener.Start()
Write-Host "Listening on http://localhost:8080/"

try {
    while ($Listener.IsListening) {
        $Context = $Listener.GetContext()
        $Request = $Context.Request
        $Response = $Context.Response

        $url = $Request.Url.LocalPath
        if ($url -eq "/") { $url = "/index.html" }
        
        $filePath = Join-Path (Get-Location).Path $url
        
        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($ext) {
                ".html" { $Response.ContentType = "text/html" }
                ".css"  { $Response.ContentType = "text/css" }
                ".js"   { $Response.ContentType = "application/javascript" }
                ".json" { $Response.ContentType = "application/json" }
                ".png"  { $Response.ContentType = "image/png" }
                ".jpg"  { $Response.ContentType = "image/jpeg" }
                ".svg"  { $Response.ContentType = "image/svg+xml" }
                default { $Response.ContentType = "application/octet-stream" }
            }
            
            $content = [System.IO.File]::ReadAllBytes($filePath)
            $Response.ContentLength64 = $content.Length
            $Response.OutputStream.Write($content, 0, $content.Length)
            $Response.StatusCode = 200
        } else {
            $Response.StatusCode = 404
        }
        
        $Response.Close()
    }
} finally {
    $Listener.Stop()
}
