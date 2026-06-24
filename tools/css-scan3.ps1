$path = "e:\web-khanh-linh-trans\app\globals.css"
$css = Get-Content $path -Raw
$lines = $css -split "`n"
$sels = @{}
$re = '^\s*([a-zA-Z0-9\.\#\:\[\*][^\{]+)\s*\{'
for ($i=0; $i -lt $lines.Length; $i++) {
  if ($lines[$i] -match $re) {
    $selStr = $matches[1].Trim()
    if ($selStr -ne '') {
      $parts = $selStr -split ','
      foreach ($p in $parts) {
        $s = $p.Trim()
        if ($s -ne '') {
          if (-not $sels.ContainsKey($s)) { $sels[$s] = @() }
          $sels[$s] += ($i+1)
        }
      }
    }
  }
}
$dup = $sels.GetEnumerator() | Where-Object {$_.Value.Count -gt 1} | Sort-Object Name
$dup | ForEach-Object { Write-Output ("$($_.Name) -> $($_.Value -join ',')") }
Write-Output "TOTAL_DUP_SELECTORS: $($dup.Count)"
