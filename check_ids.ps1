$content = Get-Content js/app.js -Raw

$htmlIdRegex = \[regex\]"id=['""]([^'""]+)['""]"
$htmlIds = $htmlIdRegex.Matches($content) | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique

$getIdRegex = \[regex\]"getElementById\(['""]([^'""]+)['""]\)"
$getIds = $getIdRegex.Matches($content) | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique

Write-Host "--- IDs in HTML not queried by getElementById ---"
foreach ($id in $htmlIds) {
    if ($getIds -notcontains $id) {
        # Might be used by querySelector
        $qRegex = \[regex\]"querySelector(All)?\(['""]#$id['""]\)"
        if (-not $qRegex.IsMatch($content)) {
            Write-Host $id
        }
    }
}

Write-Host "--- getElementById IDs not in HTML ---"
foreach ($id in $getIds) {
    if ($htmlIds -notcontains $id -and $id -ne 'app-content' -and $id -ne 'modal-container') {
        Write-Host $id
    }
}
