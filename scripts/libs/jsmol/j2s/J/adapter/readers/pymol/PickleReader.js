Clazz.declarePackage ("J.adapter.readers.pymol");
Clazz.load (["java.util.Hashtable", "J.util.JmolList"], "J.adapter.readers.pymol.PickleReader", ["java.lang.Double", "$.Long", "J.util.Logger", "$.SB"], function () {
c$ = Clazz.decorateAsClass (function () {
this.binaryDoc = null;
this.stack = null;
this.marks = null;
this.build = null;
this.logging = false;
this.viewer = null;
this.id = 0;
this.memo = null;
this.markCount = 0;
Clazz.instantialize (this, arguments);
}, J.adapter.readers.pymol, "PickleReader");
Clazz.prepareFields (c$, function () {
this.stack =  new J.util.JmolList ();
this.marks =  new J.util.JmolList ();
this.build =  new J.util.JmolList ();
this.memo =  new java.util.Hashtable ();
});
Clazz.makeConstructor (c$, 
function (doc, viewer) {
this.binaryDoc = doc;
this.viewer = viewer;
}, "J.api.JmolDocument,J.viewer.Viewer");
$_M(c$, "log", 
($fz = function (s) {
this.viewer.log (s + "\0");
}, $fz.isPrivate = true, $fz), "~S");
$_M(c$, "getMap", 
function (logging) {
this.logging = logging;
var s;
var b;
var i;
var mark;
var d;
var o;
var a;
var map;
var l;
var going = true;
while (going) {
b = this.binaryDoc.readByte ();
switch (b) {
case 125:
this.push ( new java.util.Hashtable ());
break;
case 97:
o = this.pop ();
(this.peek ()).addLast (o);
break;
case 101:
l = this.getObjects (this.getMark ());
(this.peek ()).addAll (l);
break;
case 71:
d = this.binaryDoc.readDouble ();
this.push (Double.$valueOf (d));
break;
case 74:
i = this.binaryDoc.readIntLE ();
this.push (Integer.$valueOf (i));
break;
case 75:
i = this.binaryDoc.readByte () & 0xff;
this.push (Integer.$valueOf (i));
break;
case 77:
i = (this.binaryDoc.readByte () & 0xff | ((this.binaryDoc.readByte () & 0xff) << 8)) & 0xffff;
this.push (Integer.$valueOf (i));
break;
case 113:
i = this.binaryDoc.readByte ();
o = this.peek ();
if (Clazz.instanceOf (o, String)) {
this.memo.put (Integer.$valueOf (i), this.peek ());
}break;
case 114:
i = this.binaryDoc.readIntLE ();
o = this.peek ();
if (Clazz.instanceOf (o, String) && this.markCount < 6) {
if (this.markCount == 3 && "movie".equals (this.stack.get (this.marks.get (1).intValue () - 2))) break;
this.memo.put (Integer.$valueOf (i), this.peek ());
}break;
case 104:
i = this.binaryDoc.readByte ();
o = this.memo.get (Integer.$valueOf (i));
this.push (o == null ? "BINGET" + (++this.id) : o);
break;
case 106:
i = this.binaryDoc.readIntLE ();
o = this.memo.get (Integer.$valueOf (i));
if (o == null) {
System.out.println ("did not find memo item for " + i);
this.push ("LONG_BINGET" + (++this.id));
} else {
this.push (o);
}break;
case 85:
i = this.binaryDoc.readByte () & 0xff;
a =  Clazz.newByteArray (i, 0);
this.binaryDoc.readByteArray (a, 0, i);
s =  String.instantialize (a, "UTF-8");
this.push (s);
break;
case 84:
i = this.binaryDoc.readIntLE ();
a =  Clazz.newByteArray (i, 0);
this.binaryDoc.readByteArray (a, 0, i);
s =  String.instantialize (a, "UTF-8");
this.push (s);
break;
case 87:
i = this.binaryDoc.readIntLE ();
a =  Clazz.newByteArray (i, 0);
this.binaryDoc.readByteArray (a, 0, i);
s =  String.instantialize (a, "UTF-8");
this.push (s);
break;
case 93:
this.push ( new J.util.JmolList ());
break;
case 99:
l =  new J.util.JmolList ();
l.addLast ("global");
l.addLast (this.readString ());
l.addLast (this.readString ());
this.push (l);
break;
case 98:
o = this.pop ();
this.build.addLast (o);
break;
case 40:
i = this.stack.size ();
if (logging) this.log ("\n " + Integer.toHexString (this.binaryDoc.getPosition ()) + " [");
this.marks.addLast (Integer.$valueOf (i));
this.markCount++;
break;
case 78:
this.push (null);
break;
case 111:
this.push (this.getObjects (this.getMark ()));
break;
case 115:
o = this.pop ();
if (!(Clazz.instanceOf (this.peek (), String))) System.out.println (this.peek () + " is not a string");
s = this.pop ();
(this.peek ()).put (s, o);
break;
case 117:
mark = this.getMark ();
l = this.getObjects (mark);
o = this.peek ();
if (Clazz.instanceOf (o, J.util.JmolList)) {
for (i = 0; i < l.size (); i++) (o).addLast (l.get (i));

} else {
map = o;
for (i = l.size (); --i >= 0; ) {
o = l.get (i);
s = l.get (--i);
map.put (s, o);
}
}break;
case 46:
going = false;
break;
case 116:
this.push (this.getObjects (this.getMark ()));
break;
case 73:
s = this.readString ();
try {
this.push (Integer.$valueOf (Integer.parseInt (s)));
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
var ll = Long.parseLong (s);
this.push (Integer.$valueOf ((ll & 0xFFFFFFFF)));
System.out.println ("INT too large: " + s + " @ " + this.binaryDoc.getPosition ());
this.push (Integer.$valueOf (2147483647));
} else {
throw e;
}
}
break;
default:
J.util.Logger.error ("Pickle reader error: " + b + " " + this.binaryDoc.getPosition ());
}
}
if (logging) this.log ("");
System.out.println ("PyMOL Pickle reader cached " + this.memo.size () + " tokens");
this.memo = null;
map = this.stack.remove (0);
if (map.size () == 0) for (i = this.stack.size (); --i >= 0; ) {
o = this.stack.get (i--);
s = this.stack.get (i);
map.put (s, o);
}
return map;
}, "~B");
$_M(c$, "getObjects", 
($fz = function (mark) {
var n = this.stack.size () - mark;
var args =  new J.util.JmolList ();
for (var j = 0; j < n; j++) args.addLast (null);

for (var j = n, i = this.stack.size (); --i >= mark; ) args.set (--j, this.stack.remove (i));

return args;
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "readString", 
($fz = function () {
var sb =  new J.util.SB ();
while (true) {
var b = this.binaryDoc.readByte ();
if (b == 0xA) break;
sb.appendC (String.fromCharCode (b));
}
return sb.toString ();
}, $fz.isPrivate = true, $fz));
$_M(c$, "getMark", 
($fz = function () {
return this.marks.remove (--this.markCount).intValue ();
}, $fz.isPrivate = true, $fz));
$_M(c$, "push", 
($fz = function (o) {
if (this.logging && (Clazz.instanceOf (o, String) || Clazz.instanceOf (o, Double) || Clazz.instanceOf (o, Integer))) this.log ((Clazz.instanceOf (o, String) ? "'" + o + "'" : o) + ", ");
this.stack.addLast (o);
}, $fz.isPrivate = true, $fz), "~O");
$_M(c$, "peek", 
($fz = function () {
return this.stack.get (this.stack.size () - 1);
}, $fz.isPrivate = true, $fz));
$_M(c$, "pop", 
($fz = function () {
return this.stack.remove (this.stack.size () - 1);
}, $fz.isPrivate = true, $fz));
Clazz.defineStatics (c$,
"APPEND", 97,
"APPENDS", 101,
"BINFLOAT", 71,
"BININT", 74,
"BININT1", 75,
"BININT2", 77,
"BINPUT", 113,
"BINSTRING", 84,
"BINUNICODE", 87,
"BUILD", 98,
"EMPTY_DICT", 125,
"EMPTY_LIST", 93,
"GLOBAL", 99,
"LONG_BINPUT", 114,
"MARK", 40,
"NONE", 78,
"OBJ", 111,
"SETITEM", 115,
"SETITEMS", 117,
"SHORT_BINSTRING", 85,
"STOP", 46,
"BINGET", 104,
"LONG_BINGET", 106,
"TUPLE", 116,
"INT", 73);
});
