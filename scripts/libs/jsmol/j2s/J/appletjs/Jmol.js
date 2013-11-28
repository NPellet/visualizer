Clazz.declarePackage ("J.appletjs");
Clazz.load (["J.api.JmolStatusListener", "$.JmolSyncInterface", "java.util.Hashtable"], "J.appletjs.Jmol", ["java.lang.Boolean", "java.net.URL", "javajs.awt.Dimension", "JU.List", "$.PT", "$.SB", "J.appletjs.JmolAppletRegistry", "J.constant.EnumCallback", "J.i18n.GT", "J.util.Escape", "$.Logger", "$.Parser", "J.viewer.JC", "$.Viewer"], function () {
c$ = Clazz.decorateAsClass (function () {
this.language = null;
this.doTranslate = true;
this.haveDocumentAccess = false;
this.isStereoSlave = false;
this.loading = false;
this.mayScript = true;
this.htmlName = null;
this.fullName = null;
this.syncId = null;
this.outputBuffer = null;
this.gRight = null;
this.viewer = null;
this.b$ = null;
this.viewerOptions = null;
this.htParams = null;
this.jmol = null;
this.haveNotifiedError = false;
if (!Clazz.isClassDefined ("J.appletjs.Jmol.MyStatusListener")) {
J.appletjs.Jmol.$Jmol$MyStatusListener$ ();
}
Clazz.instantialize (this, arguments);
}, J.appletjs, "Jmol", null, J.api.JmolSyncInterface);
Clazz.prepareFields (c$, function () {
this.b$ =  new java.util.Hashtable ();
this.htParams =  new java.util.Hashtable ();
});
Clazz.makeConstructor (c$, 
function (viewerOptions) {
if (viewerOptions == null) viewerOptions =  new java.util.Hashtable ();
this.viewerOptions = viewerOptions;
for (var entry, $entry = viewerOptions.entrySet ().iterator (); $entry.hasNext () && ((entry = $entry.next ()) || true);) this.htParams.put (entry.getKey ().toLowerCase (), entry.getValue ());

this.init ();
}, "java.util.Map");
$_M(c$, "jmolReady", 
function () {
System.out.println ("Jmol applet " + this.fullName + " ready");
this.viewer.getBooleanProperty ("__appletReady");
});
$_M(c$, "destroy", 
function () {
this.gRight = null;
J.appletjs.JmolAppletRegistry.checkOut (this.fullName);
this.viewer.setModeMouse (-1);
this.viewer.getBooleanProperty ("__appletDestroyed");
this.viewer = null;
System.out.println ("Jmol applet " + this.fullName + " destroyed");
});
$_M(c$, "setStereoGraphics", 
function (isStereo) {
{
}return null;
}, "~B");
$_M(c$, "init", 
function () {
this.jmol = this;
this.htmlName = this.getParameter ("name");
this.syncId = this.getParameter ("syncId");
this.fullName = this.htmlName + "__" + this.syncId + "__";
System.out.println ("Jmol JavaScript applet " + this.fullName + " initializing");
this.setLogging ();
J.i18n.GT.ignoreApplicationBundle ();
this.viewerOptions.remove ("debug");
this.viewerOptions.put ("fullName", this.fullName);
this.haveDocumentAccess = "true".equalsIgnoreCase ("" + this.getValue ("allowjavascript", "true"));
J.appletjs.JmolAppletRegistry.checkIn (this.fullName, this);
this.initWindows ();
this.initApplication ();
});
$_M(c$, "initWindows", 
($fz = function () {
this.viewerOptions.put ("applet", Boolean.TRUE);
if (this.getParameter ("statusListener") == null) this.viewerOptions.put ("statusListener", Clazz.innerTypeInstance (J.appletjs.Jmol.MyStatusListener, this, null));
this.viewer =  new J.viewer.Viewer (this.viewerOptions);
this.mayScript = true;
}, $fz.isPrivate = true, $fz));
$_M(c$, "initApplication", 
($fz = function () {
this.viewer.pushHoldRepaint ();
var emulate = this.getValueLowerCase ("emulate", "jmol");
this.setStringProperty ("defaults", emulate.equals ("chime") ? "RasMol" : "Jmol");
this.setStringProperty ("backgroundColor", this.getValue ("bgcolor", this.getValue ("boxbgcolor", "black")));
this.loading = true;
for (var item, $item = 0, $$item = J.constant.EnumCallback.values (); $item < $$item.length && ((item = $$item[$item]) || true); $item++) {
this.setValue (item.name () + "Callback", null);
}
this.loading = false;
this.language = this.getParameter ("language");
 new J.i18n.GT (this.viewer, this.language);
if (this.language != null) System.out.print ("requested language=" + this.language + "; ");
this.doTranslate = (!"none".equals (this.language) && this.getBooleanValue ("doTranslate", true));
this.language = J.i18n.GT.getLanguage ();
System.out.println ("language=" + this.language);
if (this.b$.get (J.constant.EnumCallback.SCRIPT) == null && this.b$.get (J.constant.EnumCallback.ERROR) == null) if (this.b$.get (J.constant.EnumCallback.MESSAGE) != null) {
if (this.doTranslate && (this.getValue ("doTranslate", null) == null)) {
this.doTranslate = false;
J.util.Logger.warn ("Note -- Presence of message callback disables translation; to enable message translation use jmolSetTranslation(true) prior to jmolApplet()");
}if (this.doTranslate) J.util.Logger.warn ("Note -- Automatic language translation may affect parsing of message callbacks messages; use scriptCallback or errorCallback to process errors");
}if (!this.doTranslate) {
J.i18n.GT.setDoTranslate (false);
J.util.Logger.warn ("Note -- language translation disabled");
}if (!this.getBooleanValue ("popupMenu", true)) this.viewer.getProperty ("DATA_API", "disablePopupMenu", null);
var scriptParam = this.getValue ("script", "");
this.viewer.popHoldRepaint ("applet init");
if (scriptParam.length > 0) this.scriptProcessor (scriptParam, null, 1);
this.jmolReady ();
}, $fz.isPrivate = true, $fz));
$_M(c$, "setLogging", 
($fz = function () {
var iLevel = (this.getValue ("logLevel", (this.getBooleanValue ("debug", false) ? "5" : "4"))).charCodeAt (0) - 48;
if (iLevel != 4) System.out.println ("setting logLevel=" + iLevel + " -- To change, use script \"set logLevel [0-5]\"");
J.util.Logger.setLogLevel (iLevel);
}, $fz.isPrivate = true, $fz));
$_M(c$, "getParameter", 
($fz = function (paramName) {
var o = this.htParams.get (paramName.toLowerCase ());
return (o == null ? null :  String.instantialize (o.toString ()));
}, $fz.isPrivate = true, $fz), "~S");
$_M(c$, "getBooleanValue", 
($fz = function (propertyName, defaultValue) {
var value = this.getValue (propertyName, defaultValue ? "true" : "");
return (value.equalsIgnoreCase ("true") || value.equalsIgnoreCase ("on") || value.equalsIgnoreCase ("yes"));
}, $fz.isPrivate = true, $fz), "~S,~B");
$_M(c$, "getValue", 
($fz = function (propertyName, defaultValue) {
var stringValue = this.getParameter (propertyName);
System.out.println ("getValue " + propertyName + " = " + stringValue);
if (stringValue != null) return stringValue;
return defaultValue;
}, $fz.isPrivate = true, $fz), "~S,~S");
$_M(c$, "getValueLowerCase", 
($fz = function (paramName, defaultValue) {
var value = this.getValue (paramName, defaultValue);
if (value != null) {
value = value.trim ().toLowerCase ();
if (value.length == 0) value = null;
}return value;
}, $fz.isPrivate = true, $fz), "~S,~S");
$_M(c$, "setValue", 
($fz = function (name, defaultValue) {
this.setStringProperty (name, this.getValue (name, defaultValue));
}, $fz.isPrivate = true, $fz), "~S,~S");
$_M(c$, "setStringProperty", 
($fz = function (name, value) {
if (value == null) return;
J.util.Logger.info (name + " = \"" + value + "\"");
this.viewer.setStringProperty (name, value);
}, $fz.isPrivate = true, $fz), "~S,~S");
$_M(c$, "sendJsTextStatus", 
function (message) {
System.out.println (message);
}, "~S");
$_M(c$, "sendJsTextareaStatus", 
function (message) {
System.out.println (message);
}, "~S");
$_M(c$, "handleEvent", 
function (e) {
if (this.viewer == null) return false;
return this.viewer.processMouseEvent (e.id, e.x, e.y, e.modifiers, e.when);
}, "java.awt.Event");
$_M(c$, "scriptProcessor", 
($fz = function (script, statusParams, processType) {
if (script == null || script.length == 0) return "";
switch (processType) {
case 0:
var err = this.viewer.scriptCheck (script);
return (Clazz.instanceOf (err, String) ? err : "");
case 1:
if (statusParams != null) return this.viewer.scriptWaitStatus (script, statusParams).toString ();
return this.viewer.scriptWait (script);
case 2:
default:
return this.viewer.script (script);
}
}, $fz.isPrivate = true, $fz), "~S,~S,~N");
$_M(c$, "script", 
function (script) {
this.scriptNoWait (script);
}, "~S");
$_M(c$, "scriptNoWait", 
function (script) {
if (script == null || script.length == 0) return "";
return this.scriptProcessor (script, null, 2);
}, "~S");
$_M(c$, "scriptCheck", 
function (script) {
if (script == null || script.length == 0) return "";
return this.scriptProcessor (script, null, 0);
}, "~S");
$_M(c$, "scriptWait", 
function (script) {
return this.scriptWait (script, null);
}, "~S");
$_M(c$, "scriptWait", 
function (script, statusParams) {
if (script == null || script.length == 0) return "";
this.outputBuffer = null;
return this.scriptProcessor (script, statusParams, 1);
}, "~S,~S");
$_M(c$, "scriptWaitOutput", 
function (script) {
if (script == null || script.length == 0) return "";
this.outputBuffer =  new JU.SB ();
this.viewer.scriptWaitStatus (script, "");
var str = (this.outputBuffer == null ? "" : this.outputBuffer.toString ());
this.outputBuffer = null;
return str;
}, "~S");
$_M(c$, "syncScript", 
function (script) {
this.viewer.syncScript (script, "~", 0);
}, "~S");
$_M(c$, "getAppletInfo", 
function () {
return J.i18n.GT._ ("Jmol Applet version {0} {1}.\n\nAn OpenScience project.\n\nSee http://www.jmol.org for more information", [J.viewer.JC.version, J.viewer.JC.date]) + "\nhtmlName = " + J.util.Escape.eS (this.htmlName) + "\nsyncId = " + J.util.Escape.eS (this.syncId) + "\ndocumentBase = " + J.util.Escape.eS ("" + this.viewerOptions.get ("documentBase")) + "\ncodeBase = " + J.util.Escape.eS ("" + this.viewerOptions.get ("codePath"));
});
$_V(c$, "getProperty", 
function (infoType, paramInfo) {
{
paramInfo || (paramInfo = "");
}return this.viewer.getProperty (null, infoType, paramInfo);
}, "~S,~S");
$_V(c$, "getPropertyAsString", 
function (infoType, paramInfo) {
{
paramInfo || (paramInfo = "");
}return this.viewer.getProperty ("readable", infoType, paramInfo).toString ();
}, "~S,~S");
$_V(c$, "getPropertyAsJSON", 
function (infoType, paramInfo) {
{
paramInfo || (paramInfo = "");
}return this.viewer.getProperty ("JSON", infoType, paramInfo).toString ();
}, "~S,~S");
$_M(c$, "loadInlineString", 
function (strModel, script, isAppend) {
var errMsg = this.viewer.loadInlineAppend (strModel, isAppend);
if (errMsg == null) this.script (script);
return errMsg;
}, "~S,~S,~B");
$_M(c$, "loadInlineArray", 
function (strModels, script, isAppend) {
if (strModels == null || strModels.length == 0) return null;
var errMsg = this.viewer.loadInline (strModels, isAppend);
if (errMsg == null) this.script (script);
return errMsg;
}, "~A,~S,~B");
$_V(c$, "register", 
function (id, jsi) {
J.appletjs.JmolAppletRegistry.checkIn (id, jsi);
}, "~S,J.api.JmolSyncInterface");
$_M(c$, "doNotifySync", 
function (info, appletName) {
var syncCallback = this.b$.get (J.constant.EnumCallback.SYNC);
if (!this.mayScript || syncCallback == null || !this.haveDocumentAccess && !syncCallback.startsWith ("Jmol.")) return info;
J.util.Logger.info ("Jmol.notifySync " + appletName + " >> " + info);
try {
{
if (syncCallback=="Jmol._mySyncCallback")
return Jmol._mySyncCallback(this.htmlName, info, appletName);
var f = eval(syncCallback);
return f(this.htmlName, info, appletName);
}} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
if (!this.haveNotifiedError) if (J.util.Logger.debugging) {
J.util.Logger.debug ("syncCallback call error to " + syncCallback + ": " + e);
}this.haveNotifiedError = true;
} else {
throw e;
}
}
return info;
}, "~S,~S");
$_M(c$, "doEval", 
function (strEval) {
try {
{
return "" + eval(strEval);
}} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
J.util.Logger.error ("# error evaluating " + strEval + ":" + e.toString ());
} else {
throw e;
}
}
return "";
}, "~S");
$_M(c$, "doFunctionXY", 
function (functionName, nX, nY) {
var fxy =  Clazz.newFloatArray (Math.abs (nX), Math.abs (nY), 0);
if (!this.mayScript || !this.haveDocumentAccess || nX == 0 || nY == 0) return fxy;
try {
if (nX > 0 && nY > 0) {
for (var i = 0; i < nX; i++) for (var j = 0; j < nY; j++) {
{
fxy[i][j] = eval(functionName)(this.htmlName, i, j);
}}

} else if (nY > 0) {
var data;
{
data = eval(functionName)(this.htmlName, nX, nY);
}nX = Math.abs (nX);
var fdata =  Clazz.newFloatArray (nX * nY, 0);
J.util.Parser.parseStringInfestedFloatArray (data, null, fdata);
for (var i = 0, ipt = 0; i < nX; i++) {
for (var j = 0; j < nY; j++, ipt++) {
fxy[i][j] = fdata[ipt];
}
}
} else {
{
data = eval(functionName)(htmlName, nX, nY, fxy);
}}} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
J.util.Logger.error ("Exception " + e + " with nX, nY: " + nX + " " + nY);
} else {
throw e;
}
}
return fxy;
}, "~S,~N,~N");
$_M(c$, "doFunctionXYZ", 
function (functionName, nX, nY, nZ) {
var fxyz =  Clazz.newFloatArray (Math.abs (nX), Math.abs (nY), Math.abs (nZ), 0);
if (!this.mayScript || !this.haveDocumentAccess || nX == 0 || nY == 0 || nZ == 0) return fxyz;
try {
{
eval(functionName)(this.htmlName, nX, nY, nZ, fxyz);
}} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
J.util.Logger.error ("Exception " + e + " for " + functionName + " with nX, nY, nZ: " + nX + " " + nY + " " + nZ);
} else {
throw e;
}
}
return fxyz;
}, "~S,~N,~N,~N");
$_M(c$, "doShowUrl", 
function (urlString) {
if (J.util.Logger.debugging) {
J.util.Logger.debug ("showUrl(" + urlString + ")");
}if (urlString != null && urlString.length > 0) {
try {
var url =  new java.net.URL (Clazz.castNullAs ("java.net.URL"), urlString, null);
{
window.open(url);
}} catch (mue) {
if (Clazz.exceptionOf (mue, java.net.MalformedURLException)) {
return false;
} else {
throw mue;
}
}
}return true;
}, "~S");
c$.doSendCallback = $_M(c$, "doSendCallback", 
function (strInfo, callback, data) {
if (callback == null || callback.length == 0) {
} else if (callback.equals ("alert")) {
{
alert(strInfo); return "";
}} else {
var tokens = JU.PT.split (callback, ".");
{
try{
var o = window[tokens[0]];
for (i = 1; i < tokens.length; i++){
o = o[tokens[i]]
}
return o(data[0],data[1],data[2],data[3],data[4],data[5],data[6],data[7]);
} catch (e) {
System.out.println(callback + " failed " + e);
}
}}return "";
}, "~S,~S,~A");
c$.$Jmol$MyStatusListener$ = function () {
Clazz.pu$h ();
c$ = Clazz.decorateAsClass (function () {
Clazz.prepareCallback (this, arguments);
Clazz.instantialize (this, arguments);
}, J.appletjs.Jmol, "MyStatusListener", null, J.api.JmolStatusListener);
$_V(c$, "getRegistryInfo", 
function () {
J.appletjs.JmolAppletRegistry.checkIn (null, null);
return J.appletjs.JmolAppletRegistry.htRegistry;
});
$_V(c$, "resizeInnerPanel", 
function (a) {
return  new javajs.awt.Dimension (0, 0);
}, "~S");
$_V(c$, "notifyEnabled", 
function (a) {
switch (a) {
case J.constant.EnumCallback.ANIMFRAME:
case J.constant.EnumCallback.ECHO:
case J.constant.EnumCallback.ERROR:
case J.constant.EnumCallback.EVAL:
case J.constant.EnumCallback.LOADSTRUCT:
case J.constant.EnumCallback.MEASURE:
case J.constant.EnumCallback.MESSAGE:
case J.constant.EnumCallback.PICK:
case J.constant.EnumCallback.STRUCTUREMODIFIED:
case J.constant.EnumCallback.SYNC:
case J.constant.EnumCallback.SCRIPT:
return true;
case J.constant.EnumCallback.APPLETREADY:
case J.constant.EnumCallback.ATOMMOVED:
case J.constant.EnumCallback.CLICK:
case J.constant.EnumCallback.HOVER:
case J.constant.EnumCallback.MINIMIZATION:
case J.constant.EnumCallback.RESIZE:
break;
}
return (this.b$["J.appletjs.Jmol"].b$.get (a) != null);
}, "J.constant.EnumCallback");
$_M(c$, "notifyCallback", 
function (a, b) {
var c = this.b$["J.appletjs.Jmol"].b$.get (a);
var d = (c != null && (b == null || b[0] == null));
var e = false;
if (b != null) b[0] = this.b$["J.appletjs.Jmol"].htmlName;
var f = (b == null || b[1] == null ? null : b[1].toString ());
switch (a) {
case J.constant.EnumCallback.APPLETREADY:
b[3] = this.b$["J.appletjs.Jmol"].jmol;
break;
case J.constant.EnumCallback.ERROR:
case J.constant.EnumCallback.EVAL:
case J.constant.EnumCallback.HOVER:
case J.constant.EnumCallback.MINIMIZATION:
case J.constant.EnumCallback.RESIZE:
break;
case J.constant.EnumCallback.CLICK:
if ("alert".equals (c)) f = "x=" + b[1] + " y=" + b[2] + " action=" + b[3] + " clickCount=" + b[4];
break;
case J.constant.EnumCallback.ANIMFRAME:
var g = b[1];
var h = g[0];
var i = g[1];
var j = g[2];
var k = g[3];
var l = g[4];
var m = (h <= -2);
var n = (k < 0 ? -1 : 1);
var o = (l < 0 ? -1 : 1);
if (d) {
b = [this.b$["J.appletjs.Jmol"].htmlName, Integer.$valueOf (Math.max (h, -2 - h)), Integer.$valueOf (i), Integer.$valueOf (j), Integer.$valueOf (Math.abs (k)), Integer.$valueOf (Math.abs (l)), Integer.$valueOf (m ? 1 : 0), Integer.$valueOf (n), Integer.$valueOf (o)];
}break;
case J.constant.EnumCallback.ECHO:
var p = (b.length == 2);
var q = (p || (b[2]).intValue () == 1);
if (!d) {
if (q) e = true;
d = (!p && (c = this.b$["J.appletjs.Jmol"].b$.get ((a = J.constant.EnumCallback.MESSAGE))) != null);
}if (!e) this.output (f);
break;
case J.constant.EnumCallback.LOADSTRUCT:
var r = b[4];
if (r != null) {
r = (r.indexOf ("NOTE:") >= 0 ? "" : J.i18n.GT._ ("File Error:")) + r;
this.showStatus (r);
this.notifyCallback (J.constant.EnumCallback.MESSAGE, ["", r]);
return;
}break;
case J.constant.EnumCallback.MEASURE:
if (!d) d = ((c = this.b$["J.appletjs.Jmol"].b$.get ((a = J.constant.EnumCallback.MESSAGE))) != null);
var s = b[3];
if (s.indexOf ("Picked") >= 0 || s.indexOf ("Sequence") >= 0) {
this.showStatus (f);
e = true;
} else if (s.indexOf ("Completed") >= 0) {
f = s + ": " + f;
e = true;
}break;
case J.constant.EnumCallback.MESSAGE:
e = !d;
d = new Boolean (d & (f != null)).valueOf ();
if (!e) this.output (f);
break;
case J.constant.EnumCallback.PICK:
this.showStatus (f);
e = true;
break;
case J.constant.EnumCallback.SCRIPT:
var t = (b[3]).intValue ();
if (t > 0) {
this.notifyScriptTermination ();
} else if (!d) {
d = ((c = this.b$["J.appletjs.Jmol"].b$.get ((a = J.constant.EnumCallback.MESSAGE))) != null);
}this.output (f);
this.showStatus (f);
break;
case J.constant.EnumCallback.STRUCTUREMODIFIED:
this.notifyStructureModified ((b[1]).intValue (), (b[2]).intValue ());
break;
case J.constant.EnumCallback.SYNC:
this.sendScript (f, b[2], true, d);
return;
}
if (e) {
var u = this.b$["J.appletjs.Jmol"].viewer.getProperty ("DATA_API", "getAppConsole", null);
if (u != null) {
u.notifyCallback (a, b);
this.output (f);
this.b$["J.appletjs.Jmol"].sendJsTextareaStatus (f);
}}if (!d || !this.b$["J.appletjs.Jmol"].mayScript || c == null || !this.b$["J.appletjs.Jmol"].haveDocumentAccess && !c.startsWith ("Jmol.")) return;
try {
J.appletjs.Jmol.doSendCallback (f, c, b);
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
if (!this.b$["J.appletjs.Jmol"].haveNotifiedError) if (J.util.Logger.debugging) {
J.util.Logger.debug (a.name () + "Callback call error to " + c + ": " + e);
}this.b$["J.appletjs.Jmol"].haveNotifiedError = true;
} else {
throw e;
}
}
}, "J.constant.EnumCallback,~A");
$_M(c$, "notifyStructureModified", 
($fz = function (a, b) {
}, $fz.isPrivate = true, $fz), "~N,~N");
$_M(c$, "output", 
($fz = function (a) {
if (this.b$["J.appletjs.Jmol"].outputBuffer != null && a != null) this.b$["J.appletjs.Jmol"].outputBuffer.append (a).appendC ('\n');
}, $fz.isPrivate = true, $fz), "~S");
$_M(c$, "notifyScriptTermination", 
($fz = function () {
}, $fz.isPrivate = true, $fz));
$_V(c$, "setCallbackFunction", 
function (a, b) {
if (a.equalsIgnoreCase ("modelkit")) return;
if (a.equalsIgnoreCase ("language")) {
this.consoleMessage ("");
this.consoleMessage (null);
return;
}var c = J.constant.EnumCallback.getCallback (a);
if (c != null && (this.b$["J.appletjs.Jmol"].loading || c !== J.constant.EnumCallback.EVAL)) {
if (b == null) this.b$["J.appletjs.Jmol"].b$.remove (c);
 else this.b$["J.appletjs.Jmol"].b$.put (c, b);
return;
}this.consoleMessage ("Available callbacks include: " + J.constant.EnumCallback.getNameList ().$replace (';', ' ').trim ());
}, "~S,~S");
$_V(c$, "eval", 
function (a) {
var b = a.indexOf ("\1");
if (b >= 0) return this.sendScript (a.substring (b + 1), a.substring (0, b), false, false);
if (!this.b$["J.appletjs.Jmol"].haveDocumentAccess) return "NO EVAL ALLOWED";
if (this.b$["J.appletjs.Jmol"].b$.get (J.constant.EnumCallback.EVAL) != null) {
this.notifyCallback (J.constant.EnumCallback.EVAL, [null, a]);
return "";
}return this.b$["J.appletjs.Jmol"].doEval (a);
}, "~S");
$_V(c$, "createImage", 
function (a, b, c, d) {
return null;
}, "~S,~S,~O,~N");
$_V(c$, "functionXY", 
function (a, b, c) {
return this.b$["J.appletjs.Jmol"].doFunctionXY (a, b, c);
}, "~S,~N,~N");
$_V(c$, "functionXYZ", 
function (a, b, c, d) {
return this.b$["J.appletjs.Jmol"].doFunctionXYZ (a, b, c, d);
}, "~S,~N,~N,~N");
$_V(c$, "showUrl", 
function (a) {
if (!this.b$["J.appletjs.Jmol"].doShowUrl (a)) this.consoleMessage ("Malformed URL:" + a);
}, "~S");
$_M(c$, "finalize", 
function () {
if (J.util.Logger.debugging) J.util.Logger.debug ("MyStatusListener finalize " + this);
Clazz.superCall (this, J.appletjs.Jmol.MyStatusListener, "finalize", []);
});
$_M(c$, "showStatus", 
($fz = function (a) {
try {
System.out.println (a);
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
} else {
throw e;
}
}
}, $fz.isPrivate = true, $fz), "~S");
$_M(c$, "consoleMessage", 
($fz = function (a) {
this.notifyCallback (J.constant.EnumCallback.ECHO, ["", a]);
}, $fz.isPrivate = true, $fz), "~S");
$_M(c$, "sendScript", 
($fz = function (a, b, c, d) {
if (d) {
a = this.b$["J.appletjs.Jmol"].doNotifySync (a, b);
if (a == null || a.length == 0 || a.equals ("0")) return "";
}var e =  new JU.List ();
J.appletjs.JmolAppletRegistry.findApplets (b, this.b$["J.appletjs.Jmol"].syncId, this.b$["J.appletjs.Jmol"].fullName, e);
var f = e.size ();
if (f == 0) {
if (!d && !b.equals ("*")) J.util.Logger.error (this.b$["J.appletjs.Jmol"].fullName + " couldn't find applet " + b);
return "";
}var g = (c ? null :  new JU.SB ());
var h = (c && a.equals ("GET_GRAPHICS"));
var i = (c && a.equals ("SET_GRAPHICS_OFF"));
if (h) this.b$["J.appletjs.Jmol"].gRight = null;
for (var j = 0; j < f; j++) {
var k = e.get (j);
var l = J.appletjs.JmolAppletRegistry.htRegistry.get (k);
var m = true;
if (J.util.Logger.debugging) J.util.Logger.debug (this.b$["J.appletjs.Jmol"].fullName + " sending to " + k + ": " + a);
try {
if (m && (h || i)) {
this.b$["J.appletjs.Jmol"].gRight = (l).setStereoGraphics (h);
return "";
}if (c) l.syncScript (a);
 else if (m) g.append ((l).scriptWait (a, "output")).append ("\n");
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
var n = this.b$["J.appletjs.Jmol"].htmlName + " couldn't send to " + k + ": " + a + ": " + e;
J.util.Logger.error (n);
if (!c) g.append (n);
} else {
throw e;
}
}
}
return (c ? "" : g.toString ());
}, $fz.isPrivate = true, $fz), "~S,~S,~B,~B");
$_V(c$, "getProperty", 
function (a) {
return null;
}, "~S");
c$ = Clazz.p0p ();
};
Clazz.defineStatics (c$,
"SCRIPT_CHECK", 0,
"SCRIPT_WAIT", 1,
"SCRIPT_NOWAIT", 2);
});
