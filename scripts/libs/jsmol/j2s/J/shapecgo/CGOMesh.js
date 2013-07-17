Clazz.declarePackage ("J.shapecgo");
Clazz.load (["J.shapespecial.DrawMesh"], "J.shapecgo.CGOMesh", ["J.util.Logger"], function () {
c$ = Clazz.decorateAsClass (function () {
this.cmds = null;
Clazz.instantialize (this, arguments);
}, J.shapecgo, "CGOMesh", J.shapespecial.DrawMesh);
c$.getSize = $_M(c$, "getSize", 
function (i) {
return (i >= 0 && i < J.shapecgo.CGOMesh.sizes.length ? J.shapecgo.CGOMesh.sizes[i] : -1);
}, "~N");
$_M(c$, "set", 
function (list) {
this.width = 200;
this.diameter = 0;
try {
this.cmds = list.get (1);
if (this.cmds == null) this.cmds = list.get (0);
this.cmds = this.cmds.get (1);
var n = this.cmds.size ();
for (var i = 0; i < n; i++) {
var type = (this.cmds.get (i)).intValue ();
if (type == 0) break;
var len = J.shapecgo.CGOMesh.getSize (type);
if (len < 0) {
J.util.Logger.error ("CGO unknown type: " + type);
return false;
}J.util.Logger.info ("CGO " + this.thisID + " type " + type + " len " + len);
i += len;
}
return true;
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
J.util.Logger.error ("CGOMesh error: " + e);
this.cmds = null;
return false;
} else {
throw e;
}
}
}, "J.util.JmolList");
Clazz.defineStatics (c$,
"sizes", [0, 0, 1, 0, 3, 3, 3, 4, 27, 13, 1, 1, 1, 1, 13, 15, 1, 35, 13, 3, 2, 3, 9, 1, 2, 1, 14, 16, 1, 2],
"STOP", 0,
"NULL", 1,
"BEGIN", 2,
"END", 3,
"VERTEX", 4,
"NORMAL", 5,
"COLOR", 6,
"SPHERE", 7,
"TRIANGLE", 8,
"CYLINDER", 9,
"LINEWIDTH", 10,
"WIDTHSCALE", 11,
"ENABLE", 12,
"DISABLE", 13,
"SAUSAGE", 14,
"CUSTOM_CYLINDER", 15,
"DOTWIDTH", 16,
"ALPHA_TRIANGLE", 17,
"ELLIPSOID", 18,
"FONT", 19,
"FONT_SCALE", 20,
"FONT_VERTEX", 21,
"FONT_AXES", 22,
"CHAR", 23,
"INDENT", 24,
"ALPHA", 25,
"QUADRIC", 26,
"CONE", 27,
"RESET_NORMAL", 28,
"PICK_COLOR", 29);
});
