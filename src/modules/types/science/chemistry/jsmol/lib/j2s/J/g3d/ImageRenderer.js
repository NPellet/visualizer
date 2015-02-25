Clazz.declarePackage ("J.g3d");
c$ = Clazz.declareType (J.g3d, "ImageRenderer");
c$.plotImage = Clazz.defineMethod (c$, "plotImage", 
function (x, y, z, image, g3d, jmolRenderer, antialias, argbBackground, textWidth, textHeight) {
var isBackground = (x == -2147483648);
var bgcolor = (isBackground ? g3d.bgcolor : argbBackground);
if (isBackground) {
x = 0;
z = 2147483646;
textWidth = g3d.width;
textHeight = g3d.height;
}if (x + textWidth <= 0 || x >= g3d.width || y + textHeight <= 0 || y >= g3d.height) return;
var g;
{
g = null;
}var buffer = g3d.apiPlatform.drawImageToBuffer (g, g3d.platform.offscreenImage, image, textWidth, textHeight, isBackground ? bgcolor : 0);
if (buffer == null) return;
var zbuf = g3d.zbuf;
var width = g3d.width;
var p = g3d.pixel;
var height = g3d.height;
var tlog = g3d.translucencyLog;
if (jmolRenderer != null || (x < 0 || x + textWidth > width || y < 0 || y + textHeight > height)) {
if (jmolRenderer == null) jmolRenderer = g3d;
for (var i = 0, offset = 0; i < textHeight; i++) for (var j = 0; j < textWidth; j++) jmolRenderer.plotImagePixel (buffer[offset++], x + j, y + i, z, 8, bgcolor, width, height, zbuf, p, tlog);


} else {
for (var i = 0, offset = 0, pbufOffset = y * width + x; i < textHeight; i++, pbufOffset += (width - textWidth)) for (var j = 0; j < textWidth; j++, pbufOffset++, offset++) if (z < zbuf[pbufOffset]) p.addPixel (pbufOffset, z, buffer[offset]);


}}, "~N,~N,~N,~O,J.g3d.Graphics3D,J.api.JmolRendererInterface,~B,~N,~N,~N");
