param(
  [string[]]$Files = @(
    'src/app/page.tsx',
    'src/components/local-demo-app.tsx',
    'src/app/reports/page.tsx',
    'src/app/dashboard/page.tsx',
    'src/components/upload-client.tsx',
    'src/app/transactions/page.tsx',
    'src/app/discrepancies/page.tsx'
  )
)

$encoding1252 = [System.Text.Encoding]::GetEncoding(1252)

function mojibake([byte[]]$bytes) {
  return $encoding1252.GetString($bytes)
}

$replacements = @(
  @{ From = (mojibake 0xC3,0xA1); To = [string][char]0x00E1 }, # Ã¡ -> á
  @{ From = (mojibake 0xC3,0xA2); To = [string][char]0x00E2 }, # Ã¢ -> â
  @{ From = (mojibake 0xC3,0xA3); To = [string][char]0x00E3 }, # Ã£ -> ã
  @{ From = (mojibake 0xC3,0xA7); To = [string][char]0x00E7 }, # Ã§ -> ç
  @{ From = (mojibake 0xC3,0xA9); To = [string][char]0x00E9 }, # Ã© -> é
  @{ From = (mojibake 0xC3,0xAA); To = [string][char]0x00EA }, # Ãª -> ê
  @{ From = (mojibake 0xC3,0xAD); To = [string][char]0x00ED }, # Ã­ -> í
  @{ From = (mojibake 0xC3,0xB3); To = [string][char]0x00F3 }, # Ã³ -> ó
  @{ From = (mojibake 0xC3,0xB4); To = [string][char]0x00F4 }, # Ã´ -> ô
  @{ From = (mojibake 0xC3,0xB5); To = [string][char]0x00F5 }, # Ãµ -> õ
  @{ From = (mojibake 0xC3,0xBA); To = [string][char]0x00FA }, # Ãº -> ú
  @{ From = (mojibake 0xC3,0xBC); To = [string][char]0x00FC }, # Ã¼ -> ü
  @{ From = (mojibake 0xC3,0x89); To = [string][char]0x00C9 }, # Ã‰ -> É
  @{ From = (mojibake 0xC3,0x9A); To = [string][char]0x00DA }, # Ãš -> Ú
  @{ From = (mojibake 0xC3,0x93); To = [string][char]0x00D3 }, # Ã“ -> Ó
  @{ From = (mojibake 0xC3,0x80); To = [string][char]0x00C0 }, # Ã€ -> À
  @{ From = (mojibake 0xC3,0x87); To = [string][char]0x00C7 }, # Ã‡ -> Ç
  @{ From = (mojibake 0xC2,0xA0); To = ' ' }                    # NBSP -> space
)

foreach ($file in $Files) {
  if (-not (Test-Path -LiteralPath $file)) { continue }

  $content = Get-Content -LiteralPath $file -Raw
  foreach ($item in $replacements) {
    $content = $content.Replace($item.From, $item.To)
  }

  Set-Content -LiteralPath $file -Value $content -Encoding utf8
}
