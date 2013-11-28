Clazz.declarePackage ("J.util");
Clazz.load (["J.api.JmolModulationSet", "J.util.Vibration"], "J.util.ModulationSet", ["java.lang.Float", "java.util.Hashtable", "JU.M3", "$.V3", "J.util.Escape", "$.Logger"], function () {
c$ = Clazz.decorateAsClass (function () {
this.vOcc = NaN;
this.htUij = null;
this.vOcc0 = 0;
this.id = null;
this.x456 = null;
this.prevSetting = null;
this.mods = null;
this.gammaE = null;
this.t = 2147483647;
this.qlen = null;
this.modDim = 0;
this.enabled = false;
Clazz.instantialize (this, arguments);
}, J.util, "ModulationSet", J.util.Vibration, J.api.JmolModulationSet);
$_V(c$, "isEnabled", 
function () {
return this.enabled;
});
Clazz.makeConstructor (c$, 
function (id, r, modDim, mods, gammaE, gammaIS, q123w, qlen) {
Clazz.superConstructor (this, J.util.ModulationSet, []);
this.id = id;
this.modDim = modDim;
this.mods = mods;
this.gammaE = gammaE;
var gammaIinv =  new JU.M3 ();
gammaIS.getRotationScale (gammaIinv);
var sI =  new JU.V3 ();
gammaIS.get (sI);
gammaIinv.invert ();
this.x456 = JU.V3.newV (r);
q123w.transform (this.x456);
this.x456.sub (sI);
gammaIinv.transform (this.x456);
if (J.util.Logger.debuggingHigh) J.util.Logger.debug ("MODSET create r=" + J.util.Escape.eP (r) + " si=" + J.util.Escape.eP (sI) + " ginv=" + gammaIinv.toString ().$replace ('\n', ' ') + " x4=" + this.x456.x);
this.qlen = qlen;
}, "~S,JU.P3,~N,JU.List,JU.M3,JU.M4,JU.M4,~A");
$_M(c$, "calculate", 
function () {
this.x = this.y = this.z = 0;
this.htUij = null;
this.vOcc = NaN;
var offset = (this.t == 2147483647 ? 0 : this.qlen[0] * this.t);
for (var i = this.mods.size (); --i >= 0; ) this.mods.get (i).apply (this, offset);

this.gammaE.transform (this);
});
$_M(c$, "addUTens", 
function (utens, v) {
if (this.htUij == null) this.htUij =  new java.util.Hashtable ();
var f = this.htUij.get (utens);
if (J.util.Logger.debuggingHigh) J.util.Logger.debug ("MODSET " + this.id + " utens=" + utens + " f=" + f + " v=" + v);
if (f != null) v += f.floatValue ();
this.htUij.put (utens, Float.$valueOf (v));
}, "~S,~N");
$_V(c$, "setModT", 
function (isOn, t) {
if (t == 2147483647) {
if (this.enabled == isOn) return 0;
this.enabled = isOn;
this.scale (-1);
return (this.enabled ? 2 : 1);
}if (this.modDim > 1 || t == this.t) return 4;
if (this.prevSetting == null) this.prevSetting =  new JU.V3 ();
this.prevSetting.setT (this);
this.t = t;
this.calculate ();
this.enabled = false;
return 3;
}, "~B,~N");
$_V(c$, "getState", 
function () {
return "modulation " + (!this.enabled ? "OFF" : this.t == 2147483647 ? "ON" : "" + this.t);
});
$_V(c$, "getPrevSetting", 
function () {
return this.prevSetting;
});
});
