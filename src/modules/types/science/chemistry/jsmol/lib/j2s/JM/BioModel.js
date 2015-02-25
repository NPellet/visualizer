Clazz.declarePackage ("JM");
Clazz.load (["JM.Model"], "JM.BioModel", ["java.lang.Float", "java.util.Hashtable", "JU.AU", "$.BS", "$.Lst", "$.P3", "$.PT", "$.SB", "J.api.Interface", "J.c.STR", "JM.AtomCollection", "JM.AlphaPolymer", "$.AminoPolymer", "$.Monomer", "$.Resolver", "JU.BSUtil", "$.Escape", "JV.Viewer"], function () {
c$ = Clazz.decorateAsClass (function () {
this.bioPolymerCount = 0;
this.bioPolymers = null;
Clazz.instantialize (this, arguments);
}, JM, "BioModel", JM.Model);
Clazz.makeConstructor (c$, 
function (modelSet, modelIndex, trajectoryBaseIndex, jmolData, properties, auxiliaryInfo) {
Clazz.superConstructor (this, JM.BioModel, []);
this.set (modelSet, modelIndex, trajectoryBaseIndex, jmolData, properties, auxiliaryInfo);
this.isBioModel = true;
modelSet.bioModel = this;
this.clearBioPolymers ();
}, "JM.ModelSet,~N,~N,~S,java.util.Properties,java.util.Map");
Clazz.overrideMethod (c$, "freeze", 
function () {
this.freezeM ();
this.bioPolymers = JU.AU.arrayCopyObject (this.bioPolymers, this.bioPolymerCount);
});
Clazz.defineMethod (c$, "addSecondaryStructure", 
function (type, structureID, serialID, strandCount, startChainID, startSeqcode, endChainID, endSeqcode, istart, iend, bsAssigned) {
for (var i = this.bioPolymerCount; --i >= 0; ) if (Clazz.instanceOf (this.bioPolymers[i], JM.AlphaPolymer)) (this.bioPolymers[i]).addStructure (type, structureID, serialID, strandCount, startChainID, startSeqcode, endChainID, endSeqcode, istart, iend, bsAssigned);

}, "J.c.STR,~S,~N,~N,~N,~N,~N,~N,~N,~N,JU.BS");
Clazz.overrideMethod (c$, "calculateStructures", 
function (asDSSP, doReport, dsspIgnoreHydrogen, setStructure, includeAlpha) {
if (this.bioPolymerCount == 0 || !setStructure && !asDSSP) return "";
this.ms.proteinStructureTainted = this.structureTainted = true;
if (setStructure) for (var i = this.bioPolymerCount; --i >= 0; ) if (!asDSSP || this.bioPolymers[i].monomers[0].getNitrogenAtom () != null) this.bioPolymers[i].clearStructures ();

if (!asDSSP || includeAlpha) for (var i = this.bioPolymerCount; --i >= 0; ) if (Clazz.instanceOf (this.bioPolymers[i], JM.AlphaPolymer)) (this.bioPolymers[i]).calculateStructures (includeAlpha);

return (asDSSP ? this.calculateDssx (null, doReport, dsspIgnoreHydrogen, setStructure) : "");
}, "~B,~B,~B,~B,~B");
Clazz.defineMethod (c$, "calculateDssx", 
 function (vHBonds, doReport, dsspIgnoreHydrogen, setStructure) {
var haveProt = false;
var haveNucl = false;
for (var i = 0; i < this.bioPolymerCount && !(haveProt && haveNucl); i++) {
if (this.bioPolymers[i].isNucleic ()) haveNucl = true;
 else if (Clazz.instanceOf (this.bioPolymers[i], JM.AminoPolymer)) haveProt = true;
}
var s = "";
if (haveProt) s += (J.api.Interface.getOption ("dssx.DSSP", this.ms.vwr, "ms")).calculateDssp (this.bioPolymers, this.bioPolymerCount, vHBonds, doReport, dsspIgnoreHydrogen, setStructure);
if (haveNucl && this.auxiliaryInfo.containsKey ("dssr") && vHBonds != null) s += this.ms.vwr.getAnnotationParser ().getHBonds (this.ms, this.modelIndex, vHBonds, doReport);
return s;
}, "JU.Lst,~B,~B,~B");
Clazz.overrideMethod (c$, "setConformation", 
function (bsConformation) {
if (this.nAltLocs > 0) for (var i = this.bioPolymerCount; --i >= 0; ) this.bioPolymers[i].setConformation (bsConformation);

}, "JU.BS");
Clazz.overrideMethod (c$, "getPdbConformation", 
function (bsConformation, conformationIndex) {
if (this.nAltLocs > 0) for (var i = this.bioPolymerCount; --i >= 0; ) this.bioPolymers[i].getConformation (bsConformation, conformationIndex);

return true;
}, "JU.BS,~N");
Clazz.defineMethod (c$, "getBioPolymerCount", 
function () {
return this.bioPolymerCount;
});
Clazz.defineMethod (c$, "getBioPolymer", 
function (polymerIndex) {
return this.bioPolymers[polymerIndex];
}, "~N");
Clazz.overrideMethod (c$, "getDefaultLargePDBRendering", 
function (sb, maxAtoms) {
var bs =  new JU.BS ();
if (this.getBondCount () == 0) bs = this.bsAtoms;
if (bs !== this.bsAtoms) for (var i = 0; i < this.bioPolymerCount; i++) this.bioPolymers[i].getRange (bs);

if (bs.nextSetBit (0) < 0) return;
var bs2 =  new JU.BS ();
if (bs === this.bsAtoms) {
bs2 = bs;
} else {
for (var i = 0; i < this.bioPolymerCount; i++) if (this.bioPolymers[i].getType () == 0) this.bioPolymers[i].getRange (bs2);

}if (bs2.nextSetBit (0) >= 0) sb.append ("select ").append (JU.Escape.eBS (bs2)).append (";backbone only;");
if (this.ac <= maxAtoms) return;
sb.append ("select ").append (JU.Escape.eBS (bs)).append (" & connected; wireframe only;");
if (bs !== this.bsAtoms) {
bs2.clearAll ();
bs2.or (this.bsAtoms);
bs2.andNot (bs);
if (bs2.nextSetBit (0) >= 0) sb.append ("select " + JU.Escape.eBS (bs2) + " & !connected;stars 0.5;spacefill off;");
}}, "JU.SB,~N");
Clazz.overrideMethod (c$, "fixIndices", 
function (modelIndex, nAtomsDeleted, bsDeleted) {
this.fixIndicesM (modelIndex, nAtomsDeleted, bsDeleted);
for (var i = 0; i < this.bioPolymerCount; i++) this.bioPolymers[i].recalculateLeadMidpointsAndWingVectors ();

}, "~N,~N,JU.BS");
Clazz.overrideMethod (c$, "setStructureList", 
function (structureList) {
this.bioPolymers = JU.AU.arrayCopyObject (this.bioPolymers, this.bioPolymerCount);
for (var i = this.bioPolymerCount; --i >= 0; ) this.bioPolymers[i].setStructureList (structureList);

}, "java.util.Map");
Clazz.overrideMethod (c$, "getPolymerPointsAndVectors", 
function (bs, vList, isTraceAlpha, sheetSmoothing) {
var last = 2147483646;
for (var ip = 0; ip < this.bioPolymerCount; ip++) last = this.bioPolymers[ip].getPolymerPointsAndVectors (last, bs, vList, isTraceAlpha, sheetSmoothing);

}, "JU.BS,JU.Lst,~B,~N");
Clazz.overrideMethod (c$, "getBioBranches", 
function (biobranches) {
var bsBranch;
for (var j = 0; j < this.bioPolymerCount; j++) {
bsBranch =  new JU.BS ();
this.bioPolymers[j].getRange (bsBranch);
var iAtom = bsBranch.nextSetBit (0);
if (iAtom >= 0) {
if (biobranches == null) biobranches =  new JU.Lst ();
biobranches.addLast (bsBranch);
}}
return biobranches;
}, "JU.Lst");
Clazz.defineMethod (c$, "addBioPolymer", 
 function (polymer) {
if (this.bioPolymers.length == 0) this.clearBioPolymers ();
if (this.bioPolymerCount == this.bioPolymers.length) this.bioPolymers = JU.AU.doubleLength (this.bioPolymers);
polymer.bioPolymerIndexInModel = this.bioPolymerCount;
this.bioPolymers[this.bioPolymerCount++] = polymer;
}, "JM.BioPolymer");
Clazz.overrideMethod (c$, "clearBioPolymers", 
function () {
this.bioPolymers =  new Array (8);
this.bioPolymerCount = 0;
});
Clazz.overrideMethod (c$, "getAllPolymerInfo", 
function (bs, finalInfo, modelVector) {
var modelInfo =  new java.util.Hashtable ();
var info =  new JU.Lst ();
for (var ip = 0; ip < this.bioPolymerCount; ip++) {
var polyInfo = this.bioPolymers[ip].getPolymerInfo (bs);
if (!polyInfo.isEmpty ()) info.addLast (polyInfo);
}
if (info.size () > 0) {
modelInfo.put ("modelIndex", Integer.$valueOf (this.modelIndex));
modelInfo.put ("polymers", info);
modelVector.addLast (modelInfo);
}}, "JU.BS,java.util.Map,JU.Lst");
Clazz.overrideMethod (c$, "getChimeInfo", 
function (sb, nHetero) {
var n = 0;
var models = this.ms.am;
var modelCount = this.ms.mc;
var ac = this.ms.ac;
var atoms = this.ms.at;
sb.append ("\nMolecule name ....... " + this.ms.getInfoM ("COMPND"));
sb.append ("\nSecondary Structure . PDB Data Records");
sb.append ("\nBrookhaven Code ..... " + this.ms.modelSetName);
for (var i = modelCount; --i >= 0; ) n += models[i].getChainCount (false);

sb.append ("\nNumber of Chains .... " + n);
n = 0;
for (var i = modelCount; --i >= 0; ) n += models[i].getGroupCountHetero (false);

nHetero = 0;
for (var i = modelCount; --i >= 0; ) nHetero += models[i].getGroupCountHetero (true);

sb.append ("\nNumber of Groups .... " + n);
if (nHetero > 0) sb.append (" (" + nHetero + ")");
for (var i = ac; --i >= 0; ) if (atoms[i].isHetero ()) nHetero++;

this.getChimeInfoM (sb, nHetero);
var nH = 0;
var nS = 0;
var nT = 0;
var id;
var lastid = -1;
for (var i = 0; i < ac; i++) {
if (atoms[i].mi != 0) break;
if ((id = atoms[i].getStrucNo ()) != lastid && id != 0) {
lastid = id;
switch (atoms[i].getProteinStructureType ()) {
case J.c.STR.HELIX:
nH++;
break;
case J.c.STR.SHEET:
nS++;
break;
case J.c.STR.TURN:
nT++;
break;
}
}}
sb.append ("\nNumber of Helices ... " + nH);
sb.append ("\nNumber of Strands ... " + nS);
sb.append ("\nNumber of Turns ..... " + nT);
}, "JU.SB,~N");
Clazz.overrideMethod (c$, "getFullPDBHeader", 
function () {
if (this.modelIndex < 0) return "";
var info = this.auxiliaryInfo.get ("fileHeader");
if (info != null) return info;
info = this.ms.vwr.getCurrentFileAsString ("biomodel");
var ichMin = info.length;
for (var i = JM.BioModel.pdbRecords.length; --i >= 0; ) {
var ichFound;
var strRecord = JM.BioModel.pdbRecords[i];
switch (ichFound = (info.startsWith (strRecord) ? 0 : info.indexOf ("\n" + strRecord))) {
case -1:
continue;
case 0:
this.auxiliaryInfo.put ("fileHeader", "");
return "";
default:
if (ichFound < ichMin) ichMin = ++ichFound;
}
}
info = info.substring (0, ichMin);
this.auxiliaryInfo.put ("fileHeader", info);
return info;
});
Clazz.overrideMethod (c$, "getPdbData", 
function (vwr, type, ctype, isDraw, bsSelected, out, tokens, pdbCONECT, bsWritten) {
var bothEnds = false;
var qtype = (ctype != 'R' ? 'r' : type.length > 13 && type.indexOf ("ramachandran ") >= 0 ? type.charAt (13) : 'R');
if (qtype == 'r') qtype = vwr.getQuaternionFrame ();
var mStep = vwr.getInt (553648146);
var derivType = (type.indexOf ("diff") < 0 ? 0 : type.indexOf ("2") < 0 ? 1 : 2);
if (!isDraw) {
out.append ("REMARK   6 Jmol PDB-encoded data: " + type + ";");
if (ctype != 'R') {
out.append ("  quaternionFrame = \"" + qtype + "\"");
bothEnds = true;
}out.append ("\nREMARK   6 Jmol Version ").append (JV.Viewer.getJmolVersion ()).append ("\n");
if (ctype == 'R') out.append ("REMARK   6 Jmol data min = {-180 -180 -180} max = {180 180 180} unScaledXyz = xyz * {1 1 1} + {0 0 0} plotScale = {100 100 100}\n");
 else out.append ("REMARK   6 Jmol data min = {-1 -1 -1} max = {1 1 1} unScaledXyz = xyz * {0.1 0.1 0.1} + {0 0 0} plotScale = {100 100 100}\n");
}var ptTemp =  new JU.P3 ();
for (var p = 0; p < this.bioPolymerCount; p++) this.bioPolymers[p].getPdbData (vwr, ctype, qtype, mStep, derivType, this.bsAtoms, bsSelected, bothEnds, isDraw, p == 0, tokens, out, pdbCONECT, bsWritten, ptTemp);

}, "JV.Viewer,~S,~S,~B,JU.BS,JU.OC,~A,JU.SB,JU.BS");
Clazz.overrideMethod (c$, "getSequenceBits", 
function (ms, specInfo, bs) {
var bsResult =  new JU.BS ();
if (bs == null) bs = ms.vwr.getAllAtoms ();
var am = ms.am;
for (var i = ms.mc; --i >= 0; ) if (am[i].isBioModel) {
var m = am[i];
var lenInfo = specInfo.length;
for (var ip = 0; ip < m.bioPolymerCount; ip++) {
var sequence = m.bioPolymers[ip].getSequence ();
var j = -1;
while ((j = sequence.indexOf (specInfo, ++j)) >= 0) m.bioPolymers[ip].getPolymerSequenceAtoms (j, lenInfo, bs, bsResult);

}
}
return bsResult;
}, "JM.ModelSet,~S,JU.BS");
Clazz.overrideMethod (c$, "getBasePairBits", 
function (ms, specInfo) {
var bsA = null;
var bsB = null;
var vHBonds =  new JU.Lst ();
if (specInfo.length == 0) {
bsA = bsB = ms.vwr.getAllAtoms ();
ms.calcRasmolHydrogenBonds (bsA, bsB, vHBonds, true, 1, false, null);
} else {
for (var i = 0; i < specInfo.length; ) {
bsA = ms.getSequenceBits (specInfo.substring (i, ++i), null);
if (bsA.cardinality () == 0) continue;
bsB = ms.getSequenceBits (specInfo.substring (i, ++i), null);
if (bsB.cardinality () == 0) continue;
ms.calcRasmolHydrogenBonds (bsA, bsB, vHBonds, true, 1, false, null);
}
}var bsAtoms =  new JU.BS ();
for (var i = vHBonds.size (); --i >= 0; ) {
var b = vHBonds.get (i);
bsAtoms.set (b.atom1.i);
bsAtoms.set (b.atom2.i);
}
return bsAtoms;
}, "JM.ModelSet,~S");
Clazz.overrideMethod (c$, "resetRasmolBonds", 
function (model, bs) {
var m = model;
JM.BioModel.clearRasmolHydrogenBonds (model.ms, m, null);
m.getRasmolHydrogenBonds (bs, bs, null, false, 2147483647, false, null);
}, "JM.Model,JU.BS");
Clazz.overrideMethod (c$, "calcRasmolHydrogenBonds", 
function (ms, bsA, bsB, vHBonds, nucleicOnly, nMax, dsspIgnoreHydrogens, bsHBonds) {
var am = ms.am;
if (vHBonds == null) {
var bsAtoms = bsA;
if (bsB != null && !bsA.equals (bsB)) (bsAtoms = JU.BSUtil.copy (bsA)).or (bsB);
var bsDelete =  new JU.BS ();
var bsOK =  new JU.BS ();
var models = ms.am;
var bonds = ms.bo;
for (var i = ms.bondCount; --i >= 0; ) {
var bond = bonds[i];
if ((bond.order & 28672) == 0) continue;
if (bsAtoms.get (bond.atom1.i)) bsDelete.set (i);
 else bsOK.set (models[bond.atom1.mi].trajectoryBaseIndex);
}
for (var i = ms.mc; --i >= 0; ) if (models[i].isBioModel) (models[i]).hasRasmolHBonds = bsOK.get (i);

if (bsDelete.nextSetBit (0) >= 0) ms.deleteBonds (bsDelete, false);
}for (var i = ms.mc; --i >= 0; ) if (am[i].isBioModel && !ms.isTrajectorySubFrame (i)) (am[i]).getRasmolHydrogenBonds (bsA, bsB, vHBonds, nucleicOnly, nMax, dsspIgnoreHydrogens, bsHBonds);

}, "JM.ModelSet,JU.BS,JU.BS,JU.Lst,~B,~N,~B,JU.BS");
Clazz.defineMethod (c$, "getRasmolHydrogenBonds", 
 function (bsA, bsB, vHBonds, nucleicOnly, nMax, dsspIgnoreHydrogens, bsHBonds) {
var doAdd = (vHBonds == null);
if (doAdd) vHBonds =  new JU.Lst ();
if (nMax < 0) nMax = 2147483647;
var asDSSX = (bsB == null);
var bp;
var bp1;
if (asDSSX && this.bioPolymerCount > 0) {
this.calculateDssx (vHBonds, false, dsspIgnoreHydrogens, false);
} else {
for (var i = this.bioPolymerCount; --i >= 0; ) {
bp = this.bioPolymers[i];
var type = bp.getType ();
if ((nucleicOnly || type != 1) && type != 2) continue;
var isRNA = bp.isRna ();
var isAmino = (type == 1);
if (isAmino) bp.calcRasmolHydrogenBonds (null, bsA, bsB, vHBonds, nMax, null, true, false);
for (var j = this.bioPolymerCount; --j >= 0; ) {
if ((bp1 = this.bioPolymers[j]) != null && (isRNA || i != j) && type == bp1.getType ()) {
bp1.calcRasmolHydrogenBonds (bp, bsA, bsB, vHBonds, nMax, null, true, false);
}}
}
}if (vHBonds.size () == 0 || !doAdd) return;
this.hasRasmolHBonds = true;
for (var i = 0; i < vHBonds.size (); i++) {
var bond = vHBonds.get (i);
var atom1 = bond.atom1;
var atom2 = bond.atom2;
if (atom1.isBonded (atom2)) continue;
var index = this.ms.addHBond (atom1, atom2, bond.order, bond.getEnergy ());
if (bsHBonds != null) bsHBonds.set (index);
}
}, "JU.BS,JU.BS,JU.Lst,~B,~N,~B,JU.BS");
c$.clearRasmolHydrogenBonds = Clazz.defineMethod (c$, "clearRasmolHydrogenBonds", 
 function (ms, bm, bsAtoms) {
var bsDelete =  new JU.BS ();
bm.hasRasmolHBonds = false;
var models = ms.am;
var bonds = ms.bo;
for (var i = ms.bondCount; --i >= 0; ) {
var bond = bonds[i];
var atom1 = bond.atom1;
var m = models[atom1.mi];
if (m.trajectoryBaseIndex != bm.modelIndex || (bond.order & 28672) == 0) continue;
if (bsAtoms != null && !bsAtoms.get (atom1.i)) {
bm.hasRasmolHBonds = true;
continue;
}bsDelete.set (i);
}
if (bsDelete.nextSetBit (0) >= 0) ms.deleteBonds (bsDelete, false);
}, "JM.ModelSet,JM.BioModel,JU.BS");
Clazz.overrideMethod (c$, "getFullProteinStructureState", 
function (ms, bsAtoms2, taintedOnly, needPhiPsi, mode) {
for (var i = 0, mc = ms.mc; i < mc; i++) if (ms.am[i].isBioModel) return JM.BioModel.getProteinStructureState (ms, ms.am[i], this.bsAtoms, taintedOnly, needPhiPsi, mode);

return "";
}, "JM.ModelSet,JU.BS,~B,~B,~N");
c$.getProteinStructureState = Clazz.defineMethod (c$, "getProteinStructureState", 
function (ms, m, bsAtoms, taintedOnly, needPhiPsi, mode) {
var showMode = (mode == 3);
var pdbFileMode = (mode == 1);
var scriptMode = (mode == 0);
var bs = null;
var cmd =  new JU.SB ();
var sbTurn =  new JU.SB ();
var sbHelix =  new JU.SB ();
var sbSheet =  new JU.SB ();
var type = J.c.STR.NONE;
var subtype = J.c.STR.NONE;
var id = 0;
var iLastAtom = 0;
var iLastModel = -1;
var lastId = -1;
var res1 = 0;
var res2 = 0;
var sid = "";
var group1 = "";
var group2 = "";
var chain1 = "";
var chain2 = "";
var n = 0;
var nHelix = 0;
var nTurn = 0;
var nSheet = 0;
var bsTainted = null;
var models = ms.am;
var atoms = ms.at;
var ac = ms.ac;
if (taintedOnly) {
if (!ms.proteinStructureTainted) return "";
bsTainted =  new JU.BS ();
for (var i = m.firstAtomIndex; i < ac; i++) if (models[atoms[i].mi].structureTainted) bsTainted.set (i);

bsTainted.set (ac);
}for (var i = 0; i <= ac; i++) if (i == ac || bsAtoms == null || bsAtoms.get (i)) {
if (taintedOnly && !bsTainted.get (i)) continue;
id = 0;
if (i == ac || (id = atoms[i].getStrucNo ()) != lastId) {
if (bs != null) {
switch (type) {
case J.c.STR.HELIX:
case J.c.STR.TURN:
case J.c.STR.SHEET:
n++;
if (scriptMode) {
var iModel = atoms[iLastAtom].mi;
var comment = "    \t# model=" + ms.getModelNumberDotted (iModel);
if (iLastModel != iModel) {
iLastModel = iModel;
cmd.append ("  structure none ").append (JU.Escape.eBS (ms.getModelAtomBitSetIncludingDeleted (iModel, false))).append (comment).append (";\n");
}comment += " & (" + res1 + " - " + res2 + ")";
var stype = subtype.getBioStructureTypeName (false);
cmd.append ("  structure ").append (stype).append (" ").append (JU.Escape.eBS (bs)).append (comment).append (";\n");
} else {
var str;
var nx;
var sb;
switch (type) {
case J.c.STR.HELIX:
nx = ++nHelix;
if (sid == null || pdbFileMode) sid = JU.PT.formatStringI ("%3N %3N", "N", nx);
str = "HELIX  %ID %3GROUPA %1CA %4RESA  %3GROUPB %1CB %4RESB";
sb = sbHelix;
var stype = null;
switch (subtype) {
case J.c.STR.HELIX:
case J.c.STR.HELIXALPHA:
stype = "  1";
break;
case J.c.STR.HELIX310:
stype = "  5";
break;
case J.c.STR.HELIXPI:
stype = "  3";
break;
}
if (stype != null) str += stype;
break;
case J.c.STR.SHEET:
nx = ++nSheet;
if (sid == null || pdbFileMode) {
sid = JU.PT.formatStringI ("%3N %3A 0", "N", nx);
sid = JU.PT.formatStringS (sid, "A", "S" + nx);
}str = "SHEET  %ID %3GROUPA %1CA%4RESA  %3GROUPB %1CB%4RESB";
sb = sbSheet;
break;
case J.c.STR.TURN:
default:
nx = ++nTurn;
if (sid == null || pdbFileMode) sid = JU.PT.formatStringI ("%3N %3N", "N", nx);
str = "TURN   %ID %3GROUPA %1CA%4RESA  %3GROUPB %1CB%4RESB";
sb = sbTurn;
break;
}
str = JU.PT.formatStringS (str, "ID", sid);
str = JU.PT.formatStringS (str, "GROUPA", group1);
str = JU.PT.formatStringS (str, "CA", chain1);
str = JU.PT.formatStringI (str, "RESA", res1);
str = JU.PT.formatStringS (str, "GROUPB", group2);
str = JU.PT.formatStringS (str, "CB", chain2);
str = JU.PT.formatStringI (str, "RESB", res2);
sb.append (str);
if (showMode) sb.append (" strucno= ").appendI (lastId);
sb.append ("\n");
}}
bs = null;
}if (id == 0 || bsAtoms != null && needPhiPsi && (Float.isNaN (atoms[i].getGroupParameter (1112539145)) || Float.isNaN (atoms[i].getGroupParameter (1112539146)))) continue;
}var ch = atoms[i].getChainIDStr ();
if (bs == null) {
bs =  new JU.BS ();
res1 = atoms[i].getResno ();
group1 = atoms[i].getGroup3 (false);
chain1 = ch;
}type = atoms[i].getProteinStructureType ();
subtype = atoms[i].getProteinStructureSubType ();
sid = atoms[i].getProteinStructureTag ();
bs.set (i);
lastId = id;
res2 = atoms[i].getResno ();
group2 = atoms[i].getGroup3 (false);
chain2 = ch;
iLastAtom = i;
}
if (n > 0) cmd.append ("\n");
return (scriptMode ? cmd.toString () : sbHelix.appendSB (sbSheet).appendSB (sbTurn).appendSB (cmd).toString ());
}, "JM.ModelSet,JM.BioModel,JU.BS,~B,~B,~N");
Clazz.overrideMethod (c$, "calculateAllPolymers", 
function (ms, groups, groupCount, baseGroupIndex, modelsExcluded) {
for (var i = 0, mc = ms.mc; i < mc; i++) if ((modelsExcluded == null || !modelsExcluded.get (i)) && ms.am[i].isBioModel) {
JM.BioModel.calculatePolymers (ms, groups, groupCount, baseGroupIndex, modelsExcluded);
return;
}
}, "JM.ModelSet,~A,~N,~N,JU.BS");
c$.calculatePolymers = Clazz.defineMethod (c$, "calculatePolymers", 
 function (ms, groups, groupCount, baseGroupIndex, modelsExcluded) {
var checkConnections = !ms.vwr.getBoolean (603979892);
if (groups == null) {
groups = ms.getGroups ();
groupCount = groups.length;
}if (modelsExcluded != null) for (var j = 0; j < groupCount; ++j) {
var group = groups[j];
if (Clazz.instanceOf (group, JM.Monomer)) {
var monomer = group;
if (monomer.bioPolymer != null && (!modelsExcluded.get (monomer.getModelIndex ()))) monomer.setBioPolymer (null, -1);
}}
for (var j = baseGroupIndex; j < groupCount; ++j) {
var g = groups[j];
var model = g.getModel ();
if (!model.isBioModel || !(Clazz.instanceOf (g, JM.Monomer))) continue;
var doCheck = checkConnections && !ms.isJmolDataFrameForModel (ms.at[g.firstAtomIndex].mi);
var bp = ((g).bioPolymer == null ? JM.Resolver.allocateBioPolymer (groups, j, doCheck) : null);
if (bp == null || bp.monomerCount == 0) continue;
(model).addBioPolymer (bp);
j += bp.monomerCount - 1;
}
}, "JM.ModelSet,~A,~N,~N,JU.BS");
Clazz.overrideMethod (c$, "getGroupsWithinAll", 
function (ms, nResidues, bs) {
var bsResult =  new JU.BS ();
var bsCheck = ms.getIterativeModels (false);
for (var iModel = ms.mc; --iModel >= 0; ) if (bsCheck.get (iModel) && ms.am[iModel].isBioModel) {
var m = ms.am[iModel];
for (var i = m.bioPolymerCount; --i >= 0; ) m.bioPolymers[i].getRangeGroups (nResidues, bs, bsResult);

}
return bsResult;
}, "JM.ModelSet,~N,JU.BS");
Clazz.overrideMethod (c$, "getSelectCodeRange", 
function (ms, info) {
var bs =  new JU.BS ();
var seqcodeA = info[0];
var seqcodeB = info[1];
var chainID = info[2];
var caseSensitive = ms.vwr.getBoolean (603979823);
if (chainID >= 0 && chainID < 300 && !caseSensitive) chainID = JM.AtomCollection.chainToUpper (chainID);
for (var iModel = ms.mc; --iModel >= 0; ) if (ms.am[iModel].isBioModel) {
var m = ms.am[iModel];
var id;
for (var i = m.chainCount; --i >= 0; ) {
var chain = m.chains[i];
if (chainID == -1 || chainID == (id = chain.chainID) || !caseSensitive && id > 0 && id < 300 && chainID == JM.AtomCollection.chainToUpper (id)) for (var index = 0; index >= 0; ) index = chain.selectSeqcodeRange (index, seqcodeA, seqcodeB, bs);

}
}
return bs;
}, "JM.ModelSet,~A");
Clazz.overrideMethod (c$, "calculateStruts", 
function (ms, bs1, bs2) {
ms.vwr.setModelVisibility ();
ms.makeConnections2 (0, 3.4028235E38, 32768, 12291, bs1, bs2, null, false, false, 0);
var iAtom = bs1.nextSetBit (0);
if (iAtom < 0) return 0;
var m = ms.am[ms.at[iAtom].mi];
if (!m.isBioModel) return 0;
var vCA =  new JU.Lst ();
var a1 = null;
var bsCheck;
if (bs1.equals (bs2)) {
bsCheck = bs1;
} else {
bsCheck = JU.BSUtil.copy (bs1);
bsCheck.or (bs2);
}var atoms = ms.at;
var vwr = ms.vwr;
bsCheck.and (vwr.getModelUndeletedAtomsBitSet (m.modelIndex));
for (var i = bsCheck.nextSetBit (0); i >= 0; i = bsCheck.nextSetBit (i + 1)) if (atoms[i].checkVisible () && atoms[i].atomID == 2 && atoms[i].getGroupID () != 5) vCA.addLast ((a1 = atoms[i]));

if (vCA.size () == 0) return 0;
var thresh = vwr.getFloat (570425408);
var mad = Clazz.floatToShort (vwr.getFloat (570425406) * 2000);
var delta = vwr.getInt (553648184);
var strutsMultiple = vwr.getBoolean (603979955);
var struts = (m).getBioPolymer (a1.getPolymerIndexInModel ()).calculateStruts (ms, bs1, bs2, vCA, thresh, delta, strutsMultiple);
for (var i = 0; i < struts.size (); i++) {
var o = struts.get (i);
ms.bondAtoms (o[0], o[1], 32768, mad, null, 0, false, true);
}
return struts.size ();
}, "JM.ModelSet,JU.BS,JU.BS");
Clazz.overrideMethod (c$, "recalculatePoints", 
function (ms, modelIndex) {
if (modelIndex < 0) {
for (var i = ms.mc; --i >= 0; ) if (!ms.isTrajectorySubFrame (i) && ms.am[i].isBioModel) (ms.am[i]).recalculateLeadMidpointsAndWingVectors ();

return;
}if (!ms.isTrajectorySubFrame (modelIndex) && ms.am[modelIndex].isBioModel) (ms.am[modelIndex]).recalculateLeadMidpointsAndWingVectors ();
}, "JM.ModelSet,~N");
Clazz.defineMethod (c$, "recalculateLeadMidpointsAndWingVectors", 
 function () {
for (var ip = 0; ip < this.bioPolymerCount; ip++) this.bioPolymers[ip].recalculateLeadMidpointsAndWingVectors ();

});
Clazz.overrideMethod (c$, "calcSelectedMonomersCount", 
function (bsSelected) {
for (var i = this.bioPolymerCount; --i >= 0; ) this.bioPolymers[i].calcSelectedMonomersCount (bsSelected);

}, "JU.BS");
Clazz.overrideMethod (c$, "getBioPolymerCountInModel", 
function (ms, modelIndex) {
if (modelIndex < 0) {
var polymerCount = 0;
for (var i = ms.mc; --i >= 0; ) if (!ms.isTrajectorySubFrame (i)) polymerCount += ms.am[i].getBioPolymerCount ();

return polymerCount;
}return (ms.isTrajectorySubFrame (modelIndex) ? 0 : ms.am[modelIndex].getBioPolymerCount ());
}, "JM.ModelSet,~N");
Clazz.overrideMethod (c$, "calculateStraightnessAll", 
function (ms) {
var ctype = 'S';
var qtype = ms.vwr.getQuaternionFrame ();
var mStep = ms.vwr.getInt (553648146);
for (var i = ms.mc; --i >= 0; ) if (ms.am[i].isBioModel) {
var m = ms.am[i];
var ptTemp =  new JU.P3 ();
for (var p = 0; p < m.bioPolymerCount; p++) m.bioPolymers[p].getPdbData (ms.vwr, ctype, qtype, mStep, 2, null, null, false, false, false, null, null, null,  new JU.BS (), ptTemp);

}
ms.haveStraightness = true;
}, "JM.ModelSet");
Clazz.defineStatics (c$,
"pdbRecords", ["ATOM  ", "MODEL ", "HETATM"]);
});
