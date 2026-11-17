# Quita las entradas de carpeta del .pptx (fallan en OneDrive/SharePoint) y exporta el PDF con PowerPoint.
# Uso, desde esta carpeta:  powershell -ExecutionPolicy Bypass -File exportar_pdf.ps1
$ErrorActionPreference = "Stop"
$pptx = Join-Path $PSScriptRoot "PresentationFinal.pptx"
$pdf = Join-Path $PSScriptRoot "PresentationFinal.pdf"

py -3 -c @"
import shutil, sys, zipfile
src = sys.argv[1]; tmp = src + '.tmp'
with zipfile.ZipFile(src) as a, zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as b:
    for i in a.infolist():
        if not i.filename.endswith('/'):
            b.writestr(i, a.read(i.filename))
shutil.move(tmp, src)
"@ $pptx

$app = New-Object -ComObject PowerPoint.Application
try {
    $doc = $app.Presentations.Open($pptx, $true, $false, $false)
    $doc.SaveAs($pdf, 32)   # 32 = ppSaveAsPDF
    $doc.Close()
} finally {
    $app.Quit()
}
Write-Host "PDF: $pdf"
