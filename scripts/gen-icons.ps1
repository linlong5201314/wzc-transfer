# Generate PWA icons (PNG) using .NET System.Drawing
# Usage: powershell -ExecutionPolicy Bypass -File scripts\gen-icons.ps1
Add-Type -AssemblyName System.Drawing

# Chinese character "chuan" (transfer) - U+4F20
$CHAR = [char]0x4F20

function New-Icon {
    param([int]$Size, [string]$Path)
    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $rect = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(99, 102, 241),
        [System.Drawing.Color]::FromArgb(168, 85, 247),
        135.0
    )
    $g.FillRectangle($brush, $rect)

    $fontSize = [int]($Size * 0.55)
    $font = New-Object System.Drawing.Font(
        'Microsoft YaHei',
        $fontSize,
        [System.Drawing.FontStyle]::Bold,
        [System.Drawing.GraphicsUnit]::Pixel
    )
    $fmt = New-Object System.Drawing.StringFormat
    $fmt.Alignment = [System.Drawing.StringAlignment]::Center
    $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center

    $rectF = New-Object System.Drawing.RectangleF(0.0, 0.0, [float]$Size, [float]$Size)
    $g.DrawString([string]$CHAR, $font, [System.Drawing.Brushes]::White, $rectF, $fmt)

    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose()
    $bmp.Dispose()
    $font.Dispose()
    $brush.Dispose()
    Write-Host "Created $Path"
}

$root = Split-Path -Parent $PSScriptRoot
New-Icon -Size 192 -Path (Join-Path $root 'icon-192.png')
New-Icon -Size 512 -Path (Join-Path $root 'icon-512.png')
New-Icon -Size 180 -Path (Join-Path $root 'apple-touch-icon.png')
Write-Host "Done!"
