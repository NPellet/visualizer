Clazz.declarePackage ("J.adapter.readers.cif");
Clazz.load (["J.adapter.smarter.AtomSetCollectionReader"], "J.adapter.readers.cif.ModulationReader", ["java.lang.Float", "java.util.Hashtable", "JU.List", "$.M3", "$.M4", "$.P3", "$.SB", "$.V3", "J.util.Escape", "$.Logger", "$.Modulation", "$.ModulationSet"], function () {
c$ = Clazz.decorateAsClass (function () {
this.allowRotations = true;
this.modVib = false;
this.modAxes = null;
this.modAverage = false;
this.modType = null;
this.checkSpecial = true;
this.modDebug = false;
this.modSelected = -1;
this.modDim = 0;
this.incommensurate = false;
this.atoms = null;
this.q1 = null;
this.q1Norm = null;
this.htModulation = null;
this.htAtomMods = null;
this.htSubsystems = null;
this.suffix = null;
this.q123 = null;
this.qlen = null;
this.haveOccupancy = false;
this.qs = null;
this.iopLast = -1;
this.gammaE = null;
this.gammaIS = null;
this.nOps = 0;
Clazz.instantialize (this, arguments);
}, J.adapter.readers.cif, "ModulationReader", J.adapter.smarter.AtomSetCollectionReader);
$_M(c$, "initializeModulation", 
function () {
this.modDebug = this.checkFilterKey ("MODDEBUG");
this.modAxes = this.getFilter ("MODAXES=");
this.modType = this.getFilter ("MODTYPE=");
this.modSelected = this.parseIntStr ("" + this.getFilter ("MOD="));
this.modVib = this.checkFilterKey ("MODVIB");
this.modAverage = this.checkFilterKey ("MODAVE");
this.checkSpecial = !this.checkFilterKey ("NOSPECIAL");
this.atomSetCollection.setCheckSpecial (this.checkSpecial);
this.allowRotations = !this.checkFilterKey ("NOSYM");
});
$_M(c$, "setModDim", 
function (ndim) {
if (this.modAverage) return;
this.modDim = ndim;
if (this.modDim > 3) {
this.appendLoadNote ("Too high modulation dimension (" + this.modDim + ") -- reading average structure");
this.modDim = 0;
this.modAverage = true;
} else {
this.appendLoadNote ("Modulation dimension = " + this.modDim);
this.htModulation =  new java.util.Hashtable ();
}this.incommensurate = (this.modDim > 0);
}, "~N");
$_M(c$, "getModulationVector", 
function (id) {
return this.htModulation.get (id + "@0");
}, "~S");
$_M(c$, "addModulation", 
function (map, id, pt, iModel) {
var ch = id.charAt (0);
switch (ch) {
case 'O':
case 'D':
case 'U':
if (this.modType != null && this.modType.indexOf (ch) < 0 || this.modSelected > 0 && this.modSelected != 1) return;
break;
}
if (this.modSelected > 0 && id.contains ("_q_")) switch (this.modSelected) {
case 1:
pt.y = pt.z = 0;
break;
case 2:
pt.x = pt.z = 0;
break;
case 3:
pt.x = pt.y = 0;
break;
}
if (pt.x == 0 && pt.y == 0 && pt.z == 0) return;
if (map == null) map = this.htModulation;
id += "@" + (iModel >= 0 ? iModel : this.atomSetCollection.getCurrentAtomSetIndex ());
J.util.Logger.info ("Adding " + id + " " + pt);
map.put (id, pt);
}, "java.util.Map,~S,JU.P3,~N");
$_M(c$, "setModulation", 
function () {
if (!this.incommensurate || this.htModulation == null) return;
if (this.modDebug) J.util.Logger.debugging = J.util.Logger.debuggingHigh = true;
this.setModulationForStructure (this.atomSetCollection.getCurrentAtomSetIndex ());
if (this.modDebug) J.util.Logger.debugging = J.util.Logger.debuggingHigh = false;
});
$_M(c$, "finalizeModulation", 
function () {
if (!this.incommensurate) return;
if (!this.modVib) this.addJmolScript ("modulation on" + (this.haveOccupancy ? ";display occupancy > 0.5" : ""));
});
$_M(c$, "getMod", 
($fz = function (key) {
return this.htModulation.get (key + this.suffix);
}, $fz.isPrivate = true, $fz), "~S");
$_M(c$, "setModulationForStructure", 
($fz = function (iModel) {
this.suffix = "@" + iModel;
var key;
if (this.htModulation.containsKey ("X_" + this.suffix)) return;
this.htModulation.put ("X_" + this.suffix,  new JU.P3 ());
this.q123 =  new JU.M3 ();
this.qlen =  Clazz.newDoubleArray (this.modDim, 0);
for (var i = 0; i < this.modDim; i++) {
var pt = this.getMod ("W_" + (i + 1));
if (pt == null) {
J.util.Logger.info ("Not enough cell wave vectors for d=" + this.modDim);
return;
}this.appendLoadNote ("W_" + (i + 1) + " = " + pt);
if (i == 0) this.q1 = JU.P3.newP (pt);
this.q123.setRowV (i, pt);
this.qlen[i] = pt.length ();
}
this.q1Norm = JU.V3.new3 (this.q1.x == 0 ? 0 : 1, this.q1.y == 0 ? 0 : 1, this.q1.z == 0 ? 0 : 1);
var qlist100 = JU.P3.new3 (1, 0, 0);
var pt;
var n = this.atomSetCollection.getAtomCount ();
var map =  new java.util.Hashtable ();
for (var e, $e = this.htModulation.entrySet ().iterator (); $e.hasNext () && ((e = $e.next ()) || true);) {
if ((key = this.checkKey (e.getKey ())) == null) continue;
pt = e.getValue ();
switch (key.charAt (0)) {
case 'O':
this.haveOccupancy = true;
case 'D':
if (pt.z == 1 && key.charAt (2) != 'S') {
var a = pt.x;
var d = 2 * 3.141592653589793 * pt.y;
pt.x = (a * Math.cos (d));
pt.y = (a * Math.sin (-d));
pt.z = 0;
J.util.Logger.info ("msCIF setting " + key + " " + pt);
}break;
case 'W':
if (this.modDim > 1) {
continue;
}case 'F':
if (key.indexOf ("_q_") >= 0) {
this.appendLoadNote ("Wave vector " + key + "=" + pt);
} else {
var ptHarmonic = this.getQCoefs (pt);
if (ptHarmonic == null) {
this.appendLoadNote ("Cannot match atom wave vector " + key + " " + pt + " to a cell wave vector or its harmonic");
} else {
var k2 = key + "_q_";
if (!this.htModulation.containsKey (k2 + this.suffix)) {
this.addModulation (map, k2, ptHarmonic, iModel);
if (key.startsWith ("F_")) this.appendLoadNote ("atom wave vector " + key + " = " + pt + " fn = " + ptHarmonic);
}}}break;
}
}
if (!map.isEmpty ()) this.htModulation.putAll (map);
var haveAtomMods = false;
for (var e, $e = this.htModulation.entrySet ().iterator (); $e.hasNext () && ((e = $e.next ()) || true);) {
if ((key = this.checkKey (e.getKey ())) == null) continue;
var params = e.getValue ();
var atomName = key.substring (key.indexOf (";") + 1);
var pt_ = atomName.indexOf ("#=");
if (pt_ >= 0) {
params = this.getMod (atomName.substring (pt_ + 2));
atomName = atomName.substring (0, pt_);
}if (J.util.Logger.debuggingHigh) J.util.Logger.debug ("SetModulation: " + key + " " + params);
var type = key.charCodeAt (0);
pt_ = key.indexOf ("#") + 1;
var utens = null;
switch (type) {
case 'U':
utens = key.substring (4, key.indexOf (";"));
case 'O':
case 'D':
var id = key.charAt (2);
var axis = key.charAt (pt_);
type = (id == 'S' ? 1 : id == '0' ? 3 : type == 79 ? 2 : type == 85 ? 4 : 0);
if (this.htAtomMods == null) this.htAtomMods =  new java.util.Hashtable ();
var fn = (id == 'S' ? 0 : this.parseIntStr (key.substring (2)));
if (fn == 0) {
this.addAtomModulation (atomName, axis, type, params, utens, qlist100);
} else {
var qlist = this.getMod ("F_" + fn + "_q_");
if (qlist == null) {
J.util.Logger.error ("Missing qlist for F_" + fn);
this.appendLoadNote ("Missing cell wave vector for atom wave vector " + fn + " for " + key + " " + params);
} else {
this.addAtomModulation (atomName, axis, type, params, utens, qlist);
}}haveAtomMods = true;
break;
}
}
if (!haveAtomMods) return;
this.atoms = this.atomSetCollection.getAtoms ();
this.symmetry = this.atomSetCollection.getSymmetry ();
this.iopLast = -1;
var sb =  new JU.SB ();
for (var i = this.atomSetCollection.getLastAtomSetAtomIndex (); i < n; i++) this.modulateAtom (this.atoms[i], sb);

this.atomSetCollection.setAtomSetAtomProperty ("modt", sb.toString (), -1);
this.htAtomMods = null;
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "getQCoefs", 
($fz = function (p) {
if (this.qs == null) {
this.qs =  new Array (3);
for (var i = 0; i < 3; i++) this.qs[i] = this.getMod ("W_" + (i + 1));

}var pt =  new JU.P3 ();
for (var i = 0; i < 3; i++) if (this.qs[i] != null) {
var fn = p.dot (this.qs[i]) / this.qs[i].dot (this.qs[i]);
var ifn = Math.round (fn);
if (Math.abs (fn - ifn) < 0.001) {
switch (i) {
case 0:
pt.x = ifn;
break;
case 1:
pt.y = ifn;
break;
case 2:
pt.z = ifn;
break;
}
return pt;
}}
var jmin = (this.modDim < 2 ? 0 : -3);
var jmax = (this.modDim < 2 ? 0 : 3);
var kmin = (this.modDim < 3 ? 0 : -3);
var kmax = (this.modDim < 3 ? 0 : 3);
for (var i = -3; i <= 3; i++) for (var j = jmin; j <= jmax; j++) for (var k = kmin; k <= kmax; k++) {
pt.setT (this.qs[0]);
pt.scale (i);
if (this.qs[1] != null) pt.scaleAdd2 (j, this.qs[1], pt);
if (this.qs[2] != null) pt.scaleAdd2 (k, this.qs[2], pt);
if (pt.distanceSquared (p) < 0.0001) {
pt.set (i, j, 0);
return pt;
}}


return null;
}, $fz.isPrivate = true, $fz), "JU.P3");
$_M(c$, "addAtomModulation", 
($fz = function (atomName, axis, type, params, utens, qcoefs) {
var list = this.htAtomMods.get (atomName);
if (list == null) this.htAtomMods.put (atomName, list =  new JU.List ());
list.addLast ( new J.util.Modulation (axis, type, params, utens, qcoefs));
}, $fz.isPrivate = true, $fz), "~S,~S,~N,JU.P3,~S,JU.P3");
$_M(c$, "checkKey", 
($fz = function (key) {
var pt_ = key.indexOf (this.suffix);
return (pt_ < 0 ? null : key.substring (0, pt_));
}, $fz.isPrivate = true, $fz), "~S");
$_M(c$, "modulateAtom", 
function (a, sb) {
var list = this.htAtomMods.get (a.atomName);
if (list == null || this.symmetry == null || a.bsSymmetry == null) return;
var iop = a.bsSymmetry.nextSetBit (0);
if (iop < 0) iop = 0;
if (J.util.Logger.debuggingHigh) J.util.Logger.debug ("\nsetModulation: i=" + a.index + " " + a.atomName + " xyz=" + a + " occ=" + a.foccupancy);
if (iop != this.iopLast) {
this.iopLast = iop;
this.gammaE =  new JU.M3 ();
this.symmetry.getSpaceGroupOperation (iop).getRotationScale (this.gammaE);
this.gammaIS = this.symmetry.getOperationGammaIS (iop);
this.nOps = this.symmetry.getSpaceGroupOperationCount ();
}if (J.util.Logger.debugging) {
J.util.Logger.debug ("setModulation iop = " + iop + " " + this.symmetry.getSpaceGroupXyz (iop, false) + " " + a.bsSymmetry);
}var q123w = JU.M4.newMV (this.q123,  new JU.V3 ());
this.setSubsystemMatrix (a.atomName, q123w);
var ms =  new J.util.ModulationSet (a.index + " " + a.atomName, JU.P3.newP (a), this.modDim, list, this.gammaE, this.gammaIS, q123w, this.qlen);
ms.calculate ();
if (!Float.isNaN (ms.vOcc)) {
var pt = this.getMod ("J_O#0;" + a.atomName);
var occ0 = ms.vOcc0;
var occ;
if (Float.isNaN (occ0)) {
occ = ms.vOcc;
} else if (pt == null) {
occ = a.foccupancy + ms.vOcc;
} else if (a.vib != null) {
var site_mult = a.vib.x;
var o_site = a.foccupancy * site_mult / this.nOps / pt.y;
occ = o_site * (pt.y + ms.vOcc);
} else {
occ = pt.x * (pt.y + ms.vOcc);
}a.foccupancy = Math.min (1, Math.max (0, occ));
a.vib = ms;
} else if (ms.htUij != null) {
if (J.util.Logger.debuggingHigh) {
J.util.Logger.debug ("setModulation Uij(initial)=" + J.util.Escape.eAF (a.anisoBorU));
J.util.Logger.debug ("setModulation tensor=" + J.util.Escape.e ((a.tensors.get (0)).getInfo ("all")));
}for (var e, $e = ms.htUij.entrySet ().iterator (); $e.hasNext () && ((e = $e.next ()) || true);) this.addUStr (a, e.getKey (), e.getValue ().floatValue ());

if (a.tensors != null) (a.tensors.get (0)).isUnmodulated = true;
var t = this.atomSetCollection.addRotatedTensor (a, this.symmetry.getTensor (a.anisoBorU), iop, false);
t.isModulated = true;
if (J.util.Logger.debuggingHigh) {
J.util.Logger.debug ("setModulation Uij(final)=" + J.util.Escape.eAF (a.anisoBorU) + "\n");
J.util.Logger.debug ("setModulation tensor=" + (a.tensors.get (0)).getInfo ("all"));
}} else {
a.vib = ms;
}if (this.modVib || a.foccupancy != 0) {
var t = this.q1Norm.dot (a);
if (Math.abs (t - Clazz.floatToInt (t)) > 0.001) t = Clazz.doubleToInt (Math.floor (t));
sb.append ((Clazz.floatToInt (t)) + "\n");
}this.symmetry.toCartesian (ms, true);
}, "J.adapter.smarter.Atom,JU.SB");
$_M(c$, "setSubsystemMatrix", 
($fz = function (atomName, q123w) {
var o;
if (true || this.htSubsystems == null || (o = this.htSubsystems.get (";" + atomName)) == null) return;
var subcode = o;
var wmatrix = this.htSubsystems.get (subcode);
q123w.mulM4 (wmatrix);
}, $fz.isPrivate = true, $fz), "~S,JU.M4");
$_M(c$, "addSubsystem", 
function (code, m4, atomName) {
if (this.htSubsystems == null) this.htSubsystems =  new java.util.Hashtable ();
if (m4 == null) this.htSubsystems.put (";" + atomName, code);
 else this.htSubsystems.put (code, m4);
}, "~S,JU.M4,~S");
$_M(c$, "addUStr", 
($fz = function (atom, id, val) {
var i = Clazz.doubleToInt ("U11U22U33U12U13U23OTPUISO".indexOf (id) / 3);
if (J.util.Logger.debuggingHigh) J.util.Logger.debug ("MOD RDR adding " + id + " " + i + " " + val + " to " + atom.anisoBorU[i]);
this.setU (atom, i, val + atom.anisoBorU[i]);
}, $fz.isPrivate = true, $fz), "J.adapter.smarter.Atom,~S,~N");
$_M(c$, "setU", 
function (atom, i, val) {
var data = this.atomSetCollection.getAnisoBorU (atom);
if (data == null) this.atomSetCollection.setAnisoBorU (atom, data =  Clazz.newFloatArray (8, 0), 8);
data[i] = val;
}, "J.adapter.smarter.Atom,~N,~N");
Clazz.defineStatics (c$,
"U_LIST", "U11U22U33U12U13U23OTPUISO");
});
