Clazz.declarePackage ("J.shapecgo");
Clazz.load (["J.shapespecial.Draw"], "J.shapecgo.CGO", ["J.shapecgo.CGOMesh", "J.util.ArrayUtil", "$.SB"], function () {
c$ = Clazz.decorateAsClass (function () {
this.cmeshes = null;
this.cgoMesh = null;
Clazz.instantialize (this, arguments);
}, J.shapecgo, "CGO", J.shapespecial.Draw);
Clazz.prepareFields (c$, function () {
this.cmeshes =  new Array (4);
});
$_M(c$, "initCGO", 
($fz = function () {
}, $fz.isPrivate = true, $fz));
Clazz.overrideMethod (c$, "allocMesh", 
function (thisID, m) {
var index = this.meshCount++;
this.meshes = this.cmeshes = J.util.ArrayUtil.ensureLength (this.cmeshes, this.meshCount * 2);
this.currentMesh = this.thisMesh = this.cgoMesh = this.cmeshes[index] = (m == null ?  new J.shapecgo.CGOMesh (thisID, this.colix, index) : m);
this.currentMesh.color = this.color;
this.currentMesh.index = index;
if (thisID != null && thisID !== "+PREVIOUS_MESH+" && this.htObjects != null) this.htObjects.put (thisID.toUpperCase (), this.currentMesh);
}, "~S,J.shape.Mesh");
Clazz.overrideMethod (c$, "setProperty", 
function (propertyName, value, bs) {
if ("init" === propertyName) {
this.initCGO ();
this.setPropertySuper ("init", value, bs);
return;
}if ("setCGO" === propertyName) {
var list = value;
this.setProperty ("init", null, null);
var n = list.size () - 1;
this.setProperty ("thisID", list.get (n), null);
propertyName = "set";
this.setProperty ("set", value, null);
return;
}if ("set" === propertyName) {
if (this.cgoMesh == null) {
this.allocMesh (null, null);
this.cgoMesh.colix = this.colix;
this.cgoMesh.color = this.color;
}this.cgoMesh.isValid = this.setCGO (value);
if (this.cgoMesh.isValid) {
this.scale (this.cgoMesh, this.newScale);
this.cgoMesh.initialize (1073741964, null, null);
this.cgoMesh.title = this.title;
this.cgoMesh.visible = true;
}return;
}if (propertyName === "deleteModelAtoms") {
var modelIndex = ((value)[2])[0];
for (var i = this.meshCount; --i >= 0; ) {
var m = this.cmeshes[i];
if (m == null) continue;
var deleteMesh = (m.modelIndex == modelIndex);
if (m.modelFlags != null) {
m.deleteAtoms (modelIndex);
deleteMesh = (m.modelFlags.length () == 0);
if (!deleteMesh) continue;
}if (deleteMesh) {
this.meshCount--;
if (this.meshes[i] === this.currentMesh) this.currentMesh = this.cgoMesh = null;
this.meshes = this.cmeshes = J.util.ArrayUtil.deleteElements (this.meshes, i, 1);
} else if (this.meshes[i].modelIndex > modelIndex) {
this.meshes[i].modelIndex--;
}}
this.resetObjects ();
return;
}this.setPropertySuper (propertyName, value, bs);
}, "~S,~O,J.util.BS");
Clazz.overrideMethod (c$, "setPropertySuper", 
function (propertyName, value, bs) {
this.currentMesh = this.cgoMesh;
this.setPropMC (propertyName, value, bs);
this.cgoMesh = this.currentMesh;
}, "~S,~O,J.util.BS");
$_M(c$, "setCGO", 
($fz = function (data) {
if (this.cgoMesh == null) this.allocMesh (null, null);
this.cgoMesh.clear ("cgo");
return this.cgoMesh.set (data);
}, $fz.isPrivate = true, $fz), "J.util.JmolList");
Clazz.overrideMethod (c$, "scale", 
function (mesh, newScale) {
}, "J.shape.Mesh,~N");
Clazz.overrideMethod (c$, "getCommand2", 
function (mesh, modelIndex) {
return "";
}, "J.shape.Mesh,~N");
Clazz.overrideMethod (c$, "getShapeState", 
function () {
var s =  new J.util.SB ();
return s.toString ();
});
});
