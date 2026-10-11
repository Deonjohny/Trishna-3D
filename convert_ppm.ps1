$ppm = [System.IO.File]::ReadAllBytes('public/extracted.ppm')
$newlineCount = 0
$offset = 0
while ($newlineCount -lt 3 -and $offset -lt $ppm.Length) {
    if ($ppm[$offset] -eq 10) { $newlineCount++ }
    $offset++
}

$width = 1536
$height = 1024
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap $width, $height, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$rect = New-Object System.Drawing.Rectangle 0, 0, $width, $height
$data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)

# GDI+ Format24bppRgb expects BGR order, PPM is RGB order. Let's convert in a loop or byte array.
$stride = [Math]::Abs($data.Stride)
$totalBytes = $stride * $height
$bgr = New-Object byte[] $totalBytes

$srcIdx = $offset
for ($y = 0; $y -lt $height; $y++) {
    $rowStart = $y * $stride
    for ($x = 0; $x -lt $width; $x++) {
        $r = $ppm[$srcIdx]
        $g = $ppm[$srcIdx + 1]
        $b = $ppm[$srcIdx + 2]
        $srcIdx += 3
        
        $destIdx = $rowStart + ($x * 3)
        $bgr[$destIdx] = $b
        $bgr[$destIdx + 1] = $g
        $bgr[$destIdx + 2] = $r
    }
}

[System.Runtime.InteropServices.Marshal]::Copy($bgr, 0, $data.Scan0, $totalBytes)
$bmp.UnlockBits($data)
$bmp.Save('public/extracted.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Output 'Successfully saved public/extracted.png'
