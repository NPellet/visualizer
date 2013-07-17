Clazz.declarePackage ("J.adapter.readers.pymol");
Clazz.load (["J.adapter.smarter.Atom"], "J.adapter.readers.pymol.PyMOLAtom", null, function () {
c$ = Clazz.decorateAsClass (function () {
this.label = null;
this.bsReps = null;
this.cartoonType = 0;
this.flags = 0;
this.bonded = false;
this.uniqueID = -1;
Clazz.instantialize (this, arguments);
}, J.adapter.readers.pymol, "PyMOLAtom", J.adapter.smarter.Atom);
});
