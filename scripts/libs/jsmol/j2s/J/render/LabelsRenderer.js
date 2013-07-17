Clazz.declarePackage ("J.render");
Clazz.load (["J.render.ShapeRenderer", "J.util.P3", "$.P3i"], "J.render.LabelsRenderer", ["J.render.TextRenderer", "J.shape.Labels", "$.Object2d", "$.Text"], function () {
c$ = Clazz.decorateAsClass (function () {
this.fidPrevious = 0;
this.font3d = null;
this.ascent = 0;
this.descent = 0;
this.minZ = null;
this.zCutoff = 0;
this.xy = null;
this.pTemp = null;
this.screen = null;
Clazz.instantialize (this, arguments);
}, J.render, "LabelsRenderer", J.render.ShapeRenderer);
Clazz.prepareFields (c$, function () {
this.minZ =  Clazz.newIntArray (1, 0);
this.xy =  Clazz.newFloatArray (3, 0);
this.pTemp =  new J.util.P3 ();
this.screen =  new J.util.P3i ();
});
Clazz.overrideMethod (c$, "render", 
function () {
this.fidPrevious = 0;
this.zCutoff = this.viewer.getZShadeStart ();
var labels = this.shape;
var labelStrings = labels.strings;
var bgcolixes = labels.bgcolixes;
if (this.isExport) bgcolixes = this.g3d.getBgColixes (bgcolixes);
var fids = labels.fids;
var offsets = labels.offsets;
if (labelStrings == null) return false;
var atoms = this.modelSet.atoms;
var backgroundColixContrast = this.viewer.getColixBackgroundContrast ();
var backgroundColor = this.viewer.getBackgroundArgb ();
var sppm = this.viewer.getScalePixelsPerAngstrom (true);
var scalePixelsPerMicron = (this.viewer.getBoolean (603979845) ? sppm * 10000 : 0);
var imageFontScaling = this.viewer.getImageFontScaling ();
var iGroup = -1;
this.minZ[0] = 2147483647;
var isAntialiased = this.g3d.isAntialiased ();
for (var i = labelStrings.length; --i >= 0; ) {
var atom = atoms[i];
if (!atom.isVisible (this.myVisibilityFlag)) continue;
var label = labelStrings[i];
if (label == null || label.length == 0 || labels.mads != null && labels.mads[i] < 0) continue;
var colix = labels.getColix2 (i, atom, false);
var bgcolix = labels.getColix2 (i, atom, true);
if (bgcolix == 0 && this.g3d.getColorArgbOrGray (colix) == backgroundColor) colix = backgroundColixContrast;
var fid = ((fids == null || i >= fids.length || fids[i] == 0) ? labels.zeroFontId : fids[i]);
var offsetFull = (offsets == null || i >= offsets.length ? 0 : offsets[i]);
var labelsFront = ((offsetFull & 32) != 0);
var labelsGroup = ((offsetFull & 16) != 0);
var isExact = ((offsetFull & 128) != 0);
var offset = offsetFull >> 8;
var textAlign = J.shape.Labels.getAlignment (offsetFull);
var pointer = offsetFull & 3;
var zSlab = atom.screenZ - Clazz.doubleToInt (atom.screenDiameter / 2) - 3;
if (this.zCutoff > 0 && zSlab > this.zCutoff) continue;
if (zSlab < 1) zSlab = 1;
var zBox = zSlab;
if (labelsGroup) {
var group = atom.getGroup ();
var ig = group.getGroupIndex ();
if (ig != iGroup) {
group.getMinZ (atoms, this.minZ);
iGroup = ig;
}zBox = this.minZ[0];
} else if (labelsFront) {
zBox = 1;
}if (zBox < 1) zBox = 1;
var text = labels.getLabel (i);
var boxXY = (!this.isExport || this.viewer.creatingImage ? labels.getBox (i) :  Clazz.newFloatArray (5, 0));
if (boxXY == null) labels.putBox (i, boxXY =  Clazz.newFloatArray (5, 0));
if (text != null) {
if (text.font == null) text.setFontFromFid (fid);
if (text.pymolOffset == null) {
text.setXYZs (atom.screenX, atom.screenY, zBox, zSlab);
} else {
if (text.pymolOffset[0] == 1) this.pTemp.setT (atom);
 else this.pTemp.set (0, 0, 0);
this.pTemp.x += text.pymolOffset[4];
this.pTemp.y += text.pymolOffset[5];
this.pTemp.z += text.pymolOffset[6];
this.viewer.transformPtScr (this.pTemp, this.screen);
text.setXYZs (this.screen.x, this.screen.y, this.screen.z, zSlab);
}if (text.pymolOffset == null) {
text.setColix (colix);
text.setBgColix (bgcolix);
} else {
text.setScalePixelsPerMicron (sppm);
}} else {
var isLeft = (textAlign == 1 || textAlign == 0);
if (fid != this.fidPrevious || this.ascent == 0) {
this.g3d.setFontFid (fid);
this.fidPrevious = fid;
this.font3d = this.g3d.getFont3DCurrent ();
if (isLeft) {
this.ascent = this.font3d.getAscent ();
this.descent = this.font3d.getDescent ();
}}var isSimple = isLeft && (imageFontScaling == 1 && scalePixelsPerMicron == 0 && label.indexOf ("|") < 0 && label.indexOf ("<su") < 0);
if (isSimple) {
var doPointer = ((pointer & 1) != 0);
var pointerColix = ((pointer & 2) != 0 && bgcolix != 0 ? bgcolix : colix);
boxXY[0] = atom.screenX;
boxXY[1] = atom.screenY;
J.render.TextRenderer.renderSimpleLabel (this.g3d, this.font3d, label, colix, bgcolix, boxXY, zBox, zSlab, J.shape.Object2d.getXOffset (offset), J.shape.Object2d.getYOffset (offset), this.ascent, this.descent, doPointer, pointerColix, isExact);
atom = null;
} else {
text = J.shape.Text.newLabel (this.g3d.getGData (), this.font3d, label, colix, bgcolix, textAlign, 0, null);
text.setXYZs (atom.screenX, atom.screenY, zBox, zSlab);
labels.putLabel (i, text);
}}if (atom != null) {
text.setOffset (offset);
if (textAlign != 0 && text.pymolOffset == null) text.setAlignment (textAlign);
text.setPointer (pointer);
J.render.TextRenderer.render (text, this.viewer, this.g3d, scalePixelsPerMicron, imageFontScaling, isExact, boxXY, this.xy);
}if (isAntialiased) {
boxXY[0] /= 2;
boxXY[1] /= 2;
}boxXY[4] = zBox;
}
return false;
});
});
