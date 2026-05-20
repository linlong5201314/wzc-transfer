# Generate PWA PNG icons: paper plane on tri-color gradient
# Usage: powershell -ExecutionPolicy Bypass -File scripts\gen-icons.ps1
Add-Type -AssemblyName System.Drawing

function New-Icon {
    param([int]$Size, [string]$Path)
    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    # transparent base
    $g.Clear([System.Drawing.Color]::Transparent)

    # rounded square path
    $radius = [int]($Size * 0.21875)  # 112/512 = 0.21875
    $rectPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $rectPath.AddArc(0, 0, $radius * 2, $radius * 2, 180, 90)
    $rectPath.AddArc($Size - $radius * 2, 0, $radius * 2, $radius * 2, 270, 90)
    $rectPath.AddArc($Size - $radius * 2, $Size - $radius * 2, $radius * 2, $radius * 2, 0, 90)
    $rectPath.AddArc(0, $Size - $radius * 2, $radius * 2, $radius * 2, 90, 90)
    $rectPath.CloseFigure()

    # tri-color gradient fill
    $rectF = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rectF,
        [System.Drawing.Color]::FromArgb(236, 72, 153),
        [System.Drawing.Color]::FromArgb(99, 102, 241),
        135.0
    )
    $blend = New-Object System.Drawing.Drawing2D.ColorBlend(3)
    $blend.Colors = @(
        [System.Drawing.Color]::FromArgb(236, 72, 153),  # ec4899 pink
        [System.Drawing.Color]::FromArgb(168, 85, 247),  # a855f7 purple
        [System.Drawing.Color]::FromArgb(99, 102, 241)   # 6366f1 indigo
    )
    $blend.Positions = @(0.0, 0.5, 1.0)
    $brush.InterpolationColors = $blend
    $g.FillPath($brush, $rectPath)

    # top inner shine
    $shineRect = New-Object System.Drawing.Rectangle(0, 0, $Size, [int]($Size * 0.47))
    $shineBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $shineRect,
        [System.Drawing.Color]::FromArgb(40, 255, 255, 255),
        [System.Drawing.Color]::FromArgb(0, 255, 255, 255),
        90.0
    )
    $shinePath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $shinePath.AddArc(0, 0, $radius * 2, $radius * 2, 180, 90)
    $shinePath.AddArc($Size - $radius * 2, 0, $radius * 2, $radius * 2, 270, 90)
    $shinePath.AddLine($Size, [int]($Size * 0.47), 0, [int]($Size * 0.47))
    $shinePath.CloseFigure()
    $g.FillPath($shineBrush, $shinePath)

    # paper plane white fill (scaled from 512 viewBox)
    $scale = $Size / 512.0
    $points = New-Object System.Drawing.PointF[] 4
    $points[0] = New-Object System.Drawing.PointF([float](469 * $scale), [float](43 * $scale))
    $points[1] = New-Object System.Drawing.PointF([float](320 * $scale), [float](469 * $scale))
    $points[2] = New-Object System.Drawing.PointF([float](235 * $scale), [float](277 * $scale))
    $points[3] = New-Object System.Drawing.PointF([float](43 * $scale), [float](192 * $scale))
    $g.FillPolygon([System.Drawing.Brushes]::White, $points)

    # fold crease (subtle purple line)
    $foldStroke = [float]([math]::Max(2.0, $Size * 0.012))
    $foldPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(90, 168, 85, 247), $foldStroke)
    $foldPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $foldPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawLine(
        $foldPen,
        [float](469 * $scale), [float](43 * $scale),
        [float](235 * $scale), [float](277 * $scale)
    )

    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose(); $bmp.Dispose()
    $brush.Dispose(); $shineBrush.Dispose()
    $foldPen.Dispose()
    $rectPath.Dispose(); $shinePath.Dispose()
    Write-Host "Created $Path ($Size x $Size)"
}

$root = Split-Path -Parent $PSScriptRoot
New-Icon -Size 192 -Path (Join-Path $root 'icon-192.png')
New-Icon -Size 512 -Path (Join-Path $root 'icon-512.png')
New-Icon -Size 180 -Path (Join-Path $root 'apple-touch-icon.png')
Write-Host "Done!"
