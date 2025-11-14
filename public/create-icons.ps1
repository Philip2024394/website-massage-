Add-Type -AssemblyName System.Drawing

$sizes = @(72, 96, 128, 192, 384, 512)

foreach ($size in $sizes) {
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Orange background
    $orange = [System.Drawing.Color]::FromArgb(249, 115, 22)
    $graphics.Clear($orange)
    
    # White circle
    $circleSize = [int]($size * 0.6)
    $x = [int](($size - $circleSize) / 2)
    $graphics.FillEllipse([System.Drawing.Brushes]::White, $x, $x, $circleSize, $circleSize)
    
    # Orange "I" text
    $fontSize = [int]($size * 0.25)
    $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    $brush = New-Object System.Drawing.SolidBrush($orange)
    
    $textX = [int]($size * 0.42)
    $textY = [int]($size * 0.35)
    $graphics.DrawString("I", $font, $brush, $textX, $textY)
    
    # Save
    $bitmap.Save("icon-$size.png", [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Cleanup
    $graphics.Dispose()
    $bitmap.Dispose()
    $font.Dispose()
    $brush.Dispose()
    
    Write-Host "Created icon-$size.png"
}