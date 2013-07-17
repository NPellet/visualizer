Clazz.declarePackage ("J.rendercgo");
Clazz.load (["J.renderspecial.DrawRenderer", "J.util.V3"], "J.rendercgo.CGORenderer", ["J.shapecgo.CGOMesh", "J.util.ColorUtil", "$.Logger"], function () {
c$ = Clazz.decorateAsClass (function () {
this.cgoMesh = null;
this.cmds = null;
this.vTemp1 = null;
Clazz.instantialize (this, arguments);
}, J.rendercgo, "CGORenderer", J.renderspecial.DrawRenderer);
Clazz.prepareFields (c$, function () {
this.vTemp1 =  new J.util.V3 ();
});
Clazz.overrideMethod (c$, "render", 
function () {
this.needTranslucent = false;
this.imageFontScaling = this.viewer.getImageFontScaling ();
var cgo = this.shape;
for (var i = cgo.meshCount; --i >= 0; ) this.renderMesh (this.cgoMesh = cgo.meshes[i]);

return this.needTranslucent;
});
Clazz.overrideMethod (c$, "renderMesh", 
function (mesh) {
this.mesh = mesh;
this.cmds = this.cgoMesh.cmds;
var n = this.cmds.size ();
var mode = 0;
var nPts = 0;
if (!this.g3d.setColix (this.cgoMesh.colix)) {
this.needTranslucent = true;
return true;
}for (var i = 0; i < n; i++) {
var type = this.getInt (i);
if (type == 0) break;
var len = J.shapecgo.CGOMesh.getSize (type);
if (len < 0) {
J.util.Logger.error ("CGO unknown type: " + type);
return false;
}switch (type) {
default:
System.out.println ("CGO ? " + type);
case 28:
i += len;
break;
case 1:
continue;
case 2:
mode = this.getInt (++i);
case 3:
nPts = 0;
break;
case 4:
if (nPts++ == 0) {
i = this.getPoint (++i, this.vpt0);
this.viewer.transformPtScr (this.vpt0, this.pt0i);
continue;
}i = this.getPoint (++i, this.vpt1);
this.viewer.transformPtScr (this.vpt1, this.$pt1i);
var pt = this.vpt0;
this.vpt0 = this.vpt1;
this.vpt1 = pt;
var spt = this.pt0i;
this.pt0i = this.$pt1i;
this.$pt1i = spt;
this.drawLine (1, 2, false, this.vpt0, this.vpt1, this.pt0i, this.$pt1i);
break;
case 10:
this.diameter = this.getInt (++i);
break;
case 14:
i = this.getPoint (++i, this.vpt0);
this.viewer.transformPtScr (this.vpt0, this.pt0i);
i = this.getPoint (++i, this.vpt1);
this.viewer.transformPtScr (this.vpt1, this.$pt1i);
i = this.getPoint (++i, this.vTemp);
i = this.getPoint (++i, this.vTemp2);
this.g3d.setColor (J.util.ColorUtil.colorPtToInt (this.vTemp));
this.drawLine (1, 2, false, this.vpt0, this.vpt1, this.pt0i, this.$pt1i);
break;
case 8:
i = this.getPoint (++i, this.vpt0);
this.viewer.transformPtScr (this.vpt0, this.pt0i);
i = this.getPoint (++i, this.vpt1);
this.viewer.transformPtScr (this.vpt1, this.$pt1i);
i = this.getPoint (++i, this.vpt2);
this.viewer.transformPtScr (this.vpt2, this.pt2i);
i = this.getPoint (++i, this.vTemp);
i = this.getPoint (++i, this.vTemp);
i = this.getPoint (++i, this.vTemp);
i = this.getPoint (++i, this.vTemp);
i = this.getPoint (++i, this.vTemp1);
i = this.getPoint (++i, this.vTemp2);
this.g3d.setColor (J.util.ColorUtil.colorPtToInt (this.vTemp));
this.drawLine (1, 2, false, this.vpt0, this.vpt1, this.pt0i, this.$pt1i);
this.g3d.setColor (J.util.ColorUtil.colorPtToInt (this.vTemp1));
this.drawLine (1, 2, false, this.vpt1, this.vpt2, this.$pt1i, this.pt2i);
this.g3d.setColor (J.util.ColorUtil.colorPtToInt (this.vTemp2));
this.drawLine (1, 2, false, this.vpt2, this.vpt0, this.pt2i, this.pt0i);
break;
}
}
return true;
}, "J.shape.Mesh");
$_M(c$, "getPoint", 
($fz = function (i, pt) {
pt.set (this.getFloat (i++), this.getFloat (i++), this.getFloat (i));
return i;
}, $fz.isPrivate = true, $fz), "~N,J.util.Tuple3f");
$_M(c$, "getInt", 
($fz = function (i) {
return (this.cmds.get (i)).intValue ();
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "getFloat", 
($fz = function (i) {
return (this.cmds.get (i)).floatValue ();
}, $fz.isPrivate = true, $fz), "~N");
});
