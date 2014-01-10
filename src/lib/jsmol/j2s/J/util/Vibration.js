Clazz.declarePackage ("J.util");
Clazz.load (["JU.V3"], "J.util.Vibration", null, function () {
c$ = Clazz.declareType (J.util, "Vibration", JU.V3);
$_M(c$, "setTempPoint", 
function (pt, t, scale) {
pt.scaleAdd2 ((Math.cos (t * 6.283185307179586) * scale), this, pt);
}, "JU.P3,~N,~N");
Clazz.defineStatics (c$,
"twoPI", 6.283185307179586);
});
