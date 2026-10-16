Add-Type -AssemblyName System.Drawing
$root = Split-Path $PSScriptRoot -Parent
$source = [Drawing.Bitmap]::new((Join-Path $root 'public/ziezo-logo.png'))
$left=$source.Width; $top=$source.Height; $right=0; $bottom=0
for($y=0;$y -lt $source.Height;$y++){for($x=0;$x -lt $source.Width;$x++){ $pixel=$source.GetPixel($x,$y); if($pixel.A -gt 100 -and $pixel.R -gt 180 -and $pixel.G -gt 180 -and $pixel.B -gt 180){$left=[Math]::Min($left,$x);$right=[Math]::Max($right,$x);$top=[Math]::Min($top,$y);$bottom=[Math]::Max($bottom,$y)}}}
$crop=[Drawing.Rectangle]::new($left,$top,$right-$left+1,$bottom-$top+1)
function Save-IconPng([int]$size,[string]$path){
 $canvas=[Drawing.Bitmap]::new($size,$size);$g=[Drawing.Graphics]::FromImage($canvas);$g.Clear([Drawing.Color]::Black);$g.InterpolationMode=[Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
 $scale=($size*.74)/[Math]::Max($crop.Width,$crop.Height);$w=[int]($crop.Width*$scale);$h=[int]($crop.Height*$scale)
 $target=[Drawing.Rectangle]::new([int](($size-$w)/2),[int](($size-$h)/2),$w,$h);$g.DrawImage($source,$target,$crop,[Drawing.GraphicsUnit]::Pixel);$canvas.Save($path,[Drawing.Imaging.ImageFormat]::Png);$g.Dispose();$canvas.Dispose()
}
foreach($size in @(16,32,48,64,128,192,256,512)){Save-IconPng $size (Join-Path $root "public/icons/icon-$size.png")}
Copy-Item -LiteralPath (Join-Path $root 'public/icons/icon-512.png') -Destination (Join-Path $root 'desktop/assets/icon.png') -Force
Save-IconPng 180 (Join-Path $root 'public/apple-touch-icon.png')
$ico=[IO.File]::Create((Join-Path $root 'desktop/assets/icon.ico'));$writer=[IO.BinaryWriter]::new($ico);$writer.Write([uint16]0);$writer.Write([uint16]1);$writer.Write([uint16]6);$offset=6+16*6
foreach($size in @(16,32,48,64,128,256)){$bytes=[IO.File]::ReadAllBytes((Join-Path $root "public/icons/icon-$size.png"));$dimension=if($size -eq 256){0}else{$size};$writer.Write([byte]$dimension);$writer.Write([byte]$dimension);$writer.Write([byte]0);$writer.Write([byte]0);$writer.Write([uint16]1);$writer.Write([uint16]32);$writer.Write([uint32]$bytes.Length);$writer.Write([uint32]$offset);$offset+=$bytes.Length}
foreach($size in @(16,32,48,64,128,256)){$writer.Write([IO.File]::ReadAllBytes((Join-Path $root "public/icons/icon-$size.png")))};$writer.Dispose();$ico.Dispose()
Copy-Item -LiteralPath (Join-Path $root 'desktop/assets/icon.ico') -Destination (Join-Path $root 'public/favicon.ico') -Force
$sidebar=[Drawing.Bitmap]::new(164,314);$g=[Drawing.Graphics]::FromImage($sidebar);$g.Clear([Drawing.Color]::Black);$icon=[Drawing.Image]::FromFile((Join-Path $root 'desktop/assets/icon.png'));$g.DrawImage($icon,12,50,140,140);$font=[Drawing.Font]::new('Arial',12,[Drawing.FontStyle]::Bold);$g.DrawString('ZIEZO STREAM',$font,[Drawing.Brushes]::White,15,200);$g.DrawString('2.0',$font,[Drawing.Brushes]::White,65,225);$sidebar.Save((Join-Path $root 'desktop/assets/installer-sidebar.bmp'),[Drawing.Imaging.ImageFormat]::Bmp);$font.Dispose();$icon.Dispose();$g.Dispose();$sidebar.Dispose();$source.Dispose()
