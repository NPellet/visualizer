// j2sjmol.js 

// Java programming notes by Bob Hanson:
//   
//   There are a few motifs to avoid when optimizing Java code to work smoothly
//   with the J2S compiler:
//   
//   arrays: 
//   
// 1. an array with null elements cannot be typed and must be avoided.
// 2. instances of Java "instance of" involving arrays must be found and convered to calls to Clazz.isA...
// 3. new int[n][] must not be used. Use instead JU.AU.newInt2(n);
// 4. new int[] { 1, 2, 3 } has problems because it creates simply [ ] and not IntArray32
//   
//   numbers:
//   
// 1. Remember that EVERY number in JavaScript is a double -- doesn't matter if it is in IntArray32 or not. 
// 2. You cannot reliably use Java long, because doubles consume bits for the exponent which cannot be tested.
// 3. Bit 31 of an integer is unreliable, since (int) -1 is now  , not just 0zFFFFFFFF, and 
//    FFFFFFFF + 1 = 100000000, not 0. In JavaScript, 0xFFFFFFFF is 4294967295, not -1.
//    This means that writeInt(b) will fail if b is negative. What you need is instead
//    writeInt((int)(b & 0xFFFFFFFFl) so that JavaScript knocks off the high bits explicitly. 
//
//   general:
//
// 1. j2sRequireImport xxxx is needed if xxxx is a method used in a static function
// 2. URL.getContent() is not supported. Use other means based on URL.toString()
// 3. It is critical for performance to avoid any significant amount of function overloading.
//    In particular, methods such as xxx(int a, int b) and xxx(float a, int b) MUST be renamed,
//    because JavaScript only has Number, and there is absolutely no way to tell these apart.
//    It's probably bad Java programming, anyway.
// 4. Calls to super(...) can almost always be avoided. These trigger the SAEM
//    (searchAndExecuteMethod) call, and it is very destructive to performance.
//    Just find another way to do it.   

 // NOTES by Bob Hanson: 
 
 // This version of j2slib requires jQuery and works in both Chrome and MSIE locally,
 // though Chrome cannot read local data files, and MSIE cannot read local binary data files.

 // J2S class changes:

 // BH 9/29/2014 11:34:19 PM removing support for getClass().isArray() 
 // BH 8/29/2014 9:15:57 AM total reworking of Java2Script in preparation for all-asynchronous loading
 //                         (currently sync loading is only for 
 // 												   LOAD command and load() function without ASYNC
 //                            getInterface() 
 //                         see JSmol.js and Jmol._isAsync flag
 
 // BH 8/23/2014 10:04:19 AM cleaning up a few general methods; Clazz.removeArrayItem
 // BH 6/1/2014 10:58:46 AM fix for Clazz.isAP() not working
 // BH 5/26/2014 5:19:29 PM removing superConstructor call in creating Enum constants
 // BH 4/1/2014 7:55:54 PM removing all $fz references and instances where sub/super classes have same private function names
 // BH 4/1/2014 4:47:30 PM all $_X removed; this is taken care of by Google Closure Compiler
 // BH 4/1/2014 6:40:08 AM removing ClassLoader -- equals Clazz._Loader
 // BH 4/1/2014 6:40:08 AM removing ClassLoaderProgressMonitor -- equals ClazzLoaderProgressMonitor
 // BH 4/1/2014 6:17:21 AM removing Class  -- only used for "Class.forName" in Jmol, which ANT will now change to "Clazz._4Name"
 // BH 3/7/2014 9:05:06 AM Array.prototype.toString should not be aliased. -- http://sourceforge.net/p/jmol/bugs/560/ with Google Visualization

 // BH 1/30/2014 12:54:22 PM gave all field variables prefix underscore. This allows Google Closure Compiler to skip them.  
 // BH 12/3/2013 3:39:57 PM window["j2s.lib"].base implemented
 // BH 12/1/2013 5:34:21 AM removed ClazzLoaderProgressMonitor.initialize and all Clazz.event business; handled by Jmol.clearVars()
 // BH 11/30/2013 12:43:58 PM adding Clazz.arrayIs() -- avoids Number.constructor.toString() infinite recursion
 // BH 11/29/2013 6:33:51 AM adding Clazz._profiler -- reports use of SAEM
 // BH 11/10/2013 9:02:20 AM fixing fading in MSIE  
 // BH 11/3/2013 7:21:39 AM additional wrapping functions for better compressibility
 // BH 10/30/2013 8:10:58 AM added getClass().getResource() -- returning a relative string, not a URL
 // BH 10/30/2013 6:43:00 AM removed second System def and added System.$props and default System.property "line.separator" 
 // BH 6/15/2013 8:02:07 AM corrections to Class.isAS to return true if first element is null
 // BH 6/14/2013 4:41:09 PM corrections to Clazz.isAI and related methods to include check for null object
 // BH 3/17/2013 11:54:28 AM adds stackTrace for ERROR 

 // BH 3/13/2013 6:58:26 PM adds Clazz.clone(me) for BS clone 
 // BH 3/12/2013 6:30:53 AM fixes Clazz.exceptionOf for ERROR condition trapping
 // BH 3/2/2013 9:09:53 AM delete globals c$ and $fz
 // BH 3/2/2013 9:10:45 AM optimizing defineMethod using "look no further" "@" parameter designation (see "\\@" below -- removed 3/23/13)
 // BH 2/27/2013 optimizing getParamsType for common cases () and (Number)
 // BH 2/27/2013 optimizing SAEM delegation for hashCode and equals -- disallows overloading of equals(Object)
 
 // BH 2/23/2013 found String.replaceAll does not work -- solution was to never call it.
 // BH 2/9/2013 9:18:03 PM Int32Array/Float64Array fixed for MSIE9
 // BH 1/25/2013 1:55:31 AM moved package.js from j2s/java to j2s/core 
 // BH 1/17/2013 4:37:17 PM String.compareTo() added
 // BH 1/17/2013 4:52:22 PM Int32Array and Float64Array may not have .prototype.sort method
 // BH 1/16/2013 6:20:34 PM Float64Array not available in Safari 5.1
 // BH 1/14/2013 11:28:58 PM  Going to all doubles in JavaScript (Float64Array, not Float32Array)
 //   so that (new float[] {13.48f})[0] == 13.48f, effectively

 // BH 1/14/2013 12:53:41 AM  Fix for Opera 10 not loading any files
 // BH 1/13/2013 11:50:11 PM  Fix for MSIE not loading (nonbinary) files locally
 
 // BH 12/1/2012 9:52:26 AM Compiler note: Thread.start() cannot be executed within the constructor;
 
 // BH 11/24/2012 11:08:39 AM removed unneeded sections
 // BH 11/24/2012 10:23:22 AM  all XHR uses sync loading (ClazzLoader.setLoadingMode)
 // BH 11/21/2012 7:30:06 PM 	if (base)	map["@" + pkg] = base;  critical for multiple applets

 // BH 10/8/2012 3:27:41 PM         if (clazzName.indexOf("Array") >= 0) return "Array"; in Clazz.getClassName for function
 // BH removed Clazz.ie$plit = "\\2".split (/\\/).length == 1; unnecessary; using RegEx slows process significantly in all browsers
 // BH 10/6/12 added Int32Array, Float32Array, newArrayBH, upgraded java.lang and java.io
 // BH added Integer.bitCount in core.z.js
 // BH changed alert to Clazz.alert in java.lang.Class.js *.ClassLoader.js, java.lang.thread.js
 // BH removed toString from innerFunctionNames due to infinite recursion
 // BH note: Logger.error(null, e) does not work -- get no constructor for (String) (TypeError)
 // BH added j2s.lib.console
 // BH allowed for alias="."
 // BH removed alert def --> Clazz.alert
 // BH added wrapper at line 2856 
 // BH newArray fix at line 2205
 // BH System.getProperty fix at line 6693
 // BH added Enum .value() method at line 2183
 // BH added System.getSecurityManager() at end
 // BH added String.contains() at end
 // BH added System.gc() at end
 // BH added Clazz.exceptionOf = updated
 // BH added String.getBytes() at end
 

LoadClazz = function() {

if (!window["j2s.clazzloaded"])
	window["j2s.clazzloaded"] = false;

if (window["j2s.clazzloaded"])return;

window["j2s.clazzloaded"] = true;

window["j2s.object.native"] = true;

 // Clazz changes:

 /* http://j2s.sf.net/ *//******************************************************************************
 * Copyright (c) 2007 java2script.org and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Zhou Renjian - initial API and implementation
 *****************************************************************************/
/*******
 * @author zhou renjian
 * @create Nov 5, 2005
 *******/
 

/**
 * Class Clazz. All the methods are static in this class.
 */
/* static */
/*Class = */ Clazz = function () {};

;(function(Clazz) {

Clazz.__debuggingBH = false;
Clazz._globals = ["j2s.clazzloaded", "j2s.object.native"];
Clazz.setGlobal = function(a, v) {
	Clazz._globals.push(a);
	window[a] = v;
}

Clazz.getGlobals = function() {
	return Clazz._globals.sort().join("\n");
}

Clazz.setConsoleDiv = function(d) {
	window["j2s.lib"] && (window["j2s.lib"].console = d);
};

// BH Clazz.getProfile monitors exactly what is being delegated with SAEM,
// which could be a bottle-neck for function calling.

// Jmol.getProfile()

Clazz._profile = (window["j2s.doProfile"]  && self.JSON ? {} : null);

Clazz.getProfile = function() {
	var s = "";
	if (Clazz._profile) {
		var l = [];
		for (var i in Clazz._profile) {
			var n = "" + Clazz._profile[i];
			l.push("        ".substring(n.length) + n + "\t" + i);
		}
		s = l.sort().reverse().join("\r\n");
		Clazz._profile = {};
	}
	return s;
}

Clazz.addProfile = function(c, f, p) {
	var s = c.__CLASS_NAME__ + " " + f + " " + JSON.stringify(p);
	Clazz._profile[s] || (Clazz._profile[s] = 0);
	Clazz._profile[s]++;
}

NullObject = function () {};

/* protected */
Clazz._supportsNativeObject = window["j2s.object.native"];

if (Clazz._supportsNativeObject) {
	Clazz._O = function () {};
	Clazz._O.__CLASS_NAME__ = "Object";
	Clazz._O["getClass"] = function () { return Clazz._O; }; 
} else {
	Clazz._O = Object;
}

Clazz.Console = {};
Clazz.dateToString = Date.prototype.toString;


Clazz.getSignature = function(proto, name, func, isNew) {
	// BH pointing to signatures based on number of parameters
	// would only make SAEM somewhat faster; not worth it? 
	// better to just avoid SAEM altogether
	return (isNew ? proto[name] = func : proto[name]);
/*
	if (!isNew) return proto[name];
	if (proto[name])
		func.sigs = proto[name].sigs;
	proto[name] = func;
	if (!func.sigs) func.sigs = [];
	var n = (func.arguments ? func.arguments.length : 0);
	if (func.sigs[n])
		func.sigs[n] == -1; // overloaded for this number of parameters
	else                  // unique for this function
		func.sigs[n] = func;
	return func;
*/
};


Clazz.addProto = function(proto, name, func) {
	Clazz.getSignature(proto, name, func, true); // BH
};

;(function(proto) {
	Clazz.addProto(proto, "equals", function (obj) {
		return this == obj;
	});

	Clazz.addProto(proto, "hashCode", function () {
		try {
			return this.toString ().hashCode ();
		} catch (e) {
			var str = ":";
			for (var s in this) {
				str += s + ":"
			}
			return str.hashCode ();
		}
	});

	Clazz.addProto(proto, "getClass", function () {
	 return Clazz.getClass (this);
	});

	Clazz.addProto(proto, "clone", function () {
		return Clazz.clone(this);
	});

	Clazz.clone = function(me) {
		// BH allows @j2sNative access without super constructor
		var o = new me.constructor ();
		for (var i in me)
			o[i] = me[i];
		return o;
	}
/*
 * Methods for thread in Object
 */
	Clazz.addProto(proto, "finalize", function () {});
	Clazz.addProto(proto, "notify", function () {});
	Clazz.addProto(proto, "notifyAll", function () {});
	Clazz.addProto(proto, "wait", function () {});

	Clazz.addProto(proto, "to$tring", Object.prototype.toString);
	Clazz.addProto(proto, "toString", function () {
		return (this.__CLASS_NAME__ ? "[" + this.__CLASS_NAME__ + " object]" : this.to$tring.apply(this, arguments));
	});

	Clazz._extendedObjectMethods = [
			"equals", "hashCode", "getClass", "clone", "finalize", "notify", "notifyAll", "wait", "to$tring", "toString"
	];

})(Clazz._O.prototype);

Clazz.extendJO = function(c, name) {  
	if (name)
		c.__CLASS_NAME__ = c.prototype.__CLASS_NAME__ = name;
	if (Clazz._supportsNativeObject) {
		for (var i = 0; i < Clazz._extendedObjectMethods.length; i++) {
			var p = Clazz._extendedObjectMethods[i];
			Clazz.getSignature(c.prototype, p, Clazz._O.prototype[p], true);
		}
	}
};

/**
 * Try to fix bug on Safari
 */
//InternalFunction = Object;

Clazz.extractClassName = function(clazzStr) {
	// [object Int32Array]
	var clazzName = clazzStr.substring (1, clazzStr.length - 1);
	return (clazzName.indexOf("Array") >= 0 ? "Array" // BH -- for Float64Array and Int32Array
		: clazzName.indexOf ("object ") >= 0 ? clazzName.substring (7) // IE
		: clazzName);
}
/**
 * Return the class name of the given class or object.
 *
 * @param clazzHost given class or object
 * @return class name
 */
/* public */
Clazz.getClassName = function (obj) {
	if (obj == null)
		return "NullObject";
	if (obj instanceof Clazz.CastedNull)
		return obj.clazzName;
	switch(typeof obj) {
	case "number":
		return "Number";
	case "boolean":
		return "Boolean";
	case "string":
		// Always treat the constant string as String object.
		// This will be compatiable with Java String instance.
		return "String";
	case "function":
		if (obj.__CLASS_NAME__)
			return (arguments[1] ? obj.__CLASS_NAME__ : "Class"); /* user defined class name */
		var s = obj.toString();
		var idx0 = s.indexOf("function");
		if (idx0 < 0)
			return (s.charAt(0) == '[' ? Clazz.extractClassName(s) : s.replace(/[^a-zA-Z0-9]/g, ''));
		var idx1 = idx0 + 8;
		var idx2 = s.indexOf ("(", idx1);
		if (idx2 < 0)
			return "Object";
		s = s.substring (idx1, idx2);
		if (s.indexOf("Array") >= 0)
			return "Array";  // BH -- for Float64Array and Int32Array
		s = s.replace (/^\s+/, "").replace (/\s+$/, ""); // .trim ()
		return (s == "anonymous" || s == "" ? "Function" : s);
		 // BH -- for general functions, clazzName may be ""
	case "object":
		if (obj.__CLASS_NAME__) // user defined class name
			return obj.__CLASS_NAME__;
		if (!obj.constructor)
			return "Object"; // For HTML Element in IE
		if (!obj.constructor.__CLASS_NAME__) {
			if (obj instanceof Number)
				return "Number";
			if (obj instanceof Boolean)
				return "Boolean";
			if (obj instanceof Array)
				return "Array";
			var s = obj.toString();
			if (s.charAt(0) == '[')
				return Clazz.extractClassName(s);
		}
	}
	return Clazz.getClassName (obj.constructor, true);
};
/**
 * Return the class of the given class or object.
 *
 * @param clazzHost given class or object
 * @return class name
 */
/* public */
Clazz.getClass = function (clazzHost) {
	if (!clazzHost)
		return Clazz._O;	// null/undefined is always treated as Object
	if (typeof clazzHost == "function")
		return clazzHost;
	var clazzName;
	if (clazzHost instanceof Clazz.CastedNull) {
		clazzName = clazzHost.clazzName;
	} else {
		switch (typeof clazzHost) {
		case "string":
			return String;
	  case "object":
			if (!clazzHost.__CLASS_NAME__)
				return (clazzHost.constructor || Clazz._O);
			clazzName = clazzHost.__CLASS_NAME__;
		break;
		default:
			return clazzHost.constructor;
		}
	}
	return Clazz.evalType(clazzName, true);
};

/*
 * Copy members of class
 */
/* protected */
Clazz.extendsProperties = function (hostThis, hostSuper) {
	for (var o in hostSuper) {
		if (o != "b$" && o != "prototype" && o != "superClazz"
				&& o != "__CLASS_NAME__" && o != "implementz"
				&& !Clazz.checkInnerFunction (hostSuper, o)) {
			hostThis[o] = hostSuper[o];
		}
	}
};

/* private */
Clazz.checkInnerFunction = function (hostSuper, funName) {
	for (var k = 0; k < Clazz.innerFunctionNames.length; k++)
		if (funName == Clazz.innerFunctionNames[k] && 
				Clazz._innerFunctions[funName] === hostSuper[funName])
			return true;
	return false;
};

/*
 * Copy members of interface
 */
/* protected */
Clazz.implementsProperties = function (hostThis, hostSuper) {
	for (var o in hostSuper)
		if (o != "b$" 
				&& o != "prototype" && o != "superClazz"
				&& o != "__CLASS_NAME__" && o != "implementz"
				&& (typeof hostSuper[o] != "function" || !Clazz.checkInnerFunction(hostSuper, o)))
			hostThis[o] = hostThis.prototype[o] = hostSuper[o];
};

Clazz.args4InheritClass = function () {};
Clazz.inheritArgs = new Clazz.args4InheritClass ();

/**
 * Inherit class with "extends" keyword and also copy those static members. 
 * Example, as in Java, if NAME is a static member of ClassA, and ClassB 
 * extends ClassA then ClassB.NAME can be accessed in some ways.
 *
 * @param clazzThis child class to be extended
 * @param clazzSuper super class which is inherited from
 * @param objSuper super class instance
 */
/* protected */
Clazz.inheritClass = function (clazzThis, clazzSuper, objSuper) {
	//var thisClassName = Clazz.getClassName (clazzThis);
	Clazz.extendsProperties (clazzThis, clazzSuper);
	if (Clazz.unloadedClasses[Clazz.getClassName(clazzThis, true)]) {
		// Don't change clazzThis.protoype! Keep it!
	} else if (objSuper) {
		// ! Unsafe reference prototype to an instance!
		// Feb 19, 2006 --josson
		// OK for this reference to an instance, as this is anonymous instance,
		// which is not referenced elsewhere.
		// March 13, 2006
		clazzThis.prototype = objSuper; 
	} else if (clazzSuper !== Number) {
		clazzThis.prototype = new clazzSuper (Clazz.inheritArgs);
	} else { // Number
		clazzThis.prototype = new Number ();
	}
	clazzThis.superClazz = clazzSuper;
	/*
	 * Is it necessary to reassign the class name?
	 * Mar 10, 2006 --josson
	 */
	//clazzThis.__CLASS_NAME__ = thisClassName;
	clazzThis.prototype.__CLASS_NAME__ = clazzThis.__CLASS_NAME__;
};

/**
 * Implementation of Java's keyword "implements".
 * As in JavaScript there are on "implements" keyword implemented, a property
 * of "implementz" is added to the class to record the interfaces the class
 * is implemented.
 * 
 * @param clazzThis the class to implement
 * @param interfacez Array of interfaces
 */
/* public */
Clazz.implementOf = function (clazzThis, interfacez) {
	if (arguments.length >= 2) {
		if (!clazzThis.implementz)
			clazzThis.implementz = [];
		var impls = clazzThis.implementz;
		if (arguments.length == 2) {
			if (typeof interfacez == "function") {
				impls.push(interfacez);
				Clazz.implementsProperties (clazzThis, interfacez);
			} else if (interfacez instanceof Array) {
				for (var i = 0; i < interfacez.length; i++) {
					impls.push(interfacez[i]);
					Clazz.implementsProperties (clazzThis, interfacez[i]);
				}
			}
		} else {
			for (var i = 1; i < arguments.length; i++) {
				impls.push(arguments[i]);
				Clazz.implementsProperties(clazzThis, arguments[i]);
			}
		}
	}
};

/**
 * TODO: More should be done for interface's inheritance
 */
/* public */
Clazz.extendInterface = Clazz.implementOf;

/* protected */
Clazz.equalsOrExtendsLevel = function (clazzThis, clazzAncestor) {
	if (clazzThis === clazzAncestor)
		return 0;
	if (clazzThis.implementz) {
		var impls = clazzThis.implementz;
		for (var i = 0; i < impls.length; i++) {
			var level = Clazz.equalsOrExtendsLevel (impls[i], clazzAncestor);
			if (level >= 0)
				return level + 1;
		}
	}
	return -1;
};

/* protected */
Clazz.getInheritedLevel = function (clazzTarget, clazzBase) {
	if (clazzTarget === clazzBase)
		return 0;
	var isTgtStr = (typeof clazzTarget == "string");
	if (isTgtStr && ("void" == clazzTarget || "unknown" == clazzTarget))
		return -1;
	var isBaseStr = (typeof clazzBase == "string");
	if (isBaseStr && ("void" == clazzBase || "unknown" == clazzBase))
		return -1;
	if (clazzTarget === (isTgtStr ? "NullObject" : NullObject)) {
		switch (clazzBase) {
		case Number:
		case Boolean:
		case NullObject:
			break;
		default:
			return 0;
		}
	}
	if (isTgtStr)
		clazzTarget = Clazz.evalType(clazzTarget);
	if (isBaseStr)
		clazzBase = Clazz.evalType(clazzBase);
	if (!clazzBase || !clazzTarget)
		return -1;
	var level = 0;
	var zzalc = clazzTarget; // zzalc <--> clazz
	while (zzalc !== clazzBase && level < 10) {
		/* maybe clazzBase is interface */
		if (zzalc.implementz) {
			var impls = zzalc.implementz;
			for (var i = 0; i < impls.length; i++) {
				var implsLevel = Clazz.equalsOrExtendsLevel (impls[i], clazzBase);
				if (implsLevel >= 0)
					return level + implsLevel + 1;
			}
		}
		zzalc = zzalc.superClazz;
		if (!zzalc)
			return (clazzBase === Object || clazzBase === Clazz._O ? 
				// getInheritedLevel(String, CharSequence) == 1
				// getInheritedLevel(String, Object) == 1.5
				// So if both #test(CharSequence) and #test(Object) existed,
				// #test("hello") will correctly call #test(CharSequence)
				// instead of #test(Object).
				level + 1.5 // 1.5! Special!
			: -1);
		level++;
	}
	return level;
};


/**
 * Implements Java's keyword "instanceof" in JavaScript's way.
 * As in JavaScript part of the object inheritance is implemented in only-
 * JavaScript way.
 *
 * @param obj the object to be tested
 * @param clazz the class to be checked
 * @return whether the object is an instance of the class
 */
/* public */
Clazz.instanceOf = function (obj, clazz) {
	return (obj != null && clazz && (obj instanceof clazz || Clazz.getInheritedLevel(Clazz.getClassName(obj), clazz) >= 0));
};

/**
 * Call super method of the class. 
 * The same effect as Java's expression:
 * <code> super.* () </code>
 * 
 * @param objThis host object
 * @param clazzThis class of declaring method scope. It's hard to determine 
 * which super class is right class for "super.*()" call when it's in runtime
 * environment. For example,
 * 1. ClasssA has method #run()
 * 2. ClassB extends ClassA overriding method #run() with "super.run()" call
 * 3. ClassC extends ClassB
 * 4. objC is an instance of ClassC
 * Now we have to decide which super #run() method is to be invoked. Without
 * explicit clazzThis parameter, we only know that objC.getClass() is ClassC 
 * and current method scope is #run(). We do not known we are in scope 
 * ClassA#run() or scope of ClassB#run(). if ClassB is given, Clazz can search
 * all super methods that are before ClassB and get the correct super method.
 * This is the reason why there must be an extra clazzThis parameter.
 * @param funName method name to be called
 * @param funParams Array of method parameters
 */
/* public */
Clazz.superCall = function (objThis, clazzThis, funName, funParams) {
	var fx = null;
	var i = -1;
	var clazzFun = objThis[funName];

	if (clazzFun) {
		if (clazzFun.claxxOwner) { 
			// claxxOwner is a mark for methods that is single.
			if (clazzFun.claxxOwner !== clazzThis) {
				// This is a single method, call directly!
				fx = clazzFun;
			}
		} else if (!clazzFun.stacks && !(clazzFun.lastClaxxRef
					&& clazzFun.lastClaxxRef.prototype[funName]
					&& clazzFun.lastClaxxRef.prototype[funName].stacks)) { // super.toString
			fx = clazzFun;
		} else { // normal wrapped method
			var stacks = clazzFun.stacks;
			if (!stacks)
				stacks = clazzFun.lastClaxxRef.prototype[funName].stacks;
			for (i = stacks.length; --i >= 0;) {
				/*
				 * Once super call is computed precisely, there are no need 
				 * to calculate the inherited level but just an equals
				 * comparision
				 */
				//var level = Clazz.getInheritedLevel (clazzThis, stacks[i]);
				if (clazzThis === stacks[i]) { // level == 0
					if (i > 0) {
						i--;
						fx = stacks[i].prototype[funName];
					} else {
						/*
						 * Will this case be reachable?
						 * March 4, 2006
						 * Should never reach here if all things are converted
						 * by Java2Script
						 */
						fx = stacks[0].prototype[funName]["\\unknown"];
					}
					break;
				} else if (Clazz.getInheritedLevel (clazzThis, stacks[i]) > 0) {
					fx = stacks[i].prototype[funName];
					break;
				}
			} // end of for loop
		} // end of normal wrapped method
	} // end of clazzFun
	if (!fx) {
		if (funName != "construct") {
			Clazz.alert (["j2slib","no class found",(funParams).typeString])
			throw new Clazz.MethodNotFoundException (objThis, clazzThis, funName, 
					Clazz.getParamsType (funParams).typeString);	
		}
		/* there are members which are initialized out of the constructor */
		/* No super constructor! */
		return;
	}
	/* there are members which are initialized out of the constructor */
	if (i == 0 && funName == "construct") {
		var ss = clazzFun.stacks;
		if (ss && !ss[0].superClazz && ss[0].con$truct)
			ss[0].con$truct.apply (objThis, []);
	}
	/*# {$no.debug.support} >>x #*/
	/* not used in Jmol
	if (Clazz.tracingCalling) {
		var caller = arguments.callee.caller;
		if (caller === Clazz.superConstructor) {
			caller = caller.arguments.callee.caller;
		}
		Clazz._callingStackTraces.push(new Clazz.callingStack (caller, clazzThis));
		var ret = fx.apply (objThis, (funParams == null) ? [] : funParams);
		Clazz._callingStackTraces.pop();
		return ret;
	}
	*/
	/*# x<< #*/
	return fx.apply (objThis, funParams || []);
};

/* private */
/* removed BH see Clazz.removeArrayItem
ClazzLoader.removeFromArray = function (node, arr) {
	if (arr == null || node == null) {
		return false;
	}
	//var isPackedJS = (node.path
	//		&& node.path.indexOf (".z.js") == node.path.length - 5);
	//log ("... remove " + node.path + " :: " + isPackedJS);
	var j = 0;
	for (var i = 0; i < arr.length; i++) {
		if (!(arr[i] === node)// || (isPackedJS && arr[i].path == node.path)))
			if (j < i) {
				arr[j] = arr[i];
			}
			j++;
		}
	}
	arr.length = j;
	return false;
};
*/


Clazz.findArrayItem = function(arr, item) {
	if (arr && item)
		for (var i = arr.length; --i >= 0;)
			if (arr[i] === item)
				return i;
	return -1;
}

Clazz.removeArrayItem = function(arr, item) {
	var i = Clazz.findArrayItem(arr, item);
	if (i >= 0) {
		var n = arr.length - 1;
		for (; i < n; i++)
			arr[i] = arr[i + 1];
		arr.length--;
		return true;
	}
}

/**
 * Call super constructor of the class. 
 * The same effect as Java's expression: 
 * <code> super () </code>
 */
/* public */
Clazz.superConstructor = function (objThis, clazzThis, funParams) {
	Clazz.superCall (objThis, clazzThis, "construct", funParams);
	/* If there are members which are initialized out of the constructor */
	if (clazzThis.con$truct) {
		clazzThis.con$truct.apply (objThis, []);
	}
};

/**
 * Class for null with a given class as to be casted.
 * This class will be used as an implementation of Java's casting way.
 * For example,
 * <code> this.call ((String) null); </code>
 */
/* protcted */
Clazz.CastedNull = function (asClazz) {
	if (asClazz) {
		if (asClazz instanceof String) {
			this.clazzName = asClazz;
		} else if (asClazz instanceof Function) {
			this.clazzName = Clazz.getClassName (asClazz, true);
		} else {
			this.clazzName = "" + asClazz;
		}
	} else {
		this.clazzName = "Object";
	}
	this.toString = function () {
		return null;
	};
	this.valueOf = function () {
		return null;
	};
};

/**
 * API for Java's casting null.
 * @see Clazz.CastedNull
 *
 * @param asClazz given class
 * @return an instance of class Clazz.CastedNull
 */
/* public */
Clazz.castNullAs = function (asClazz) {
	return new Clazz.CastedNull (asClazz);
};

/** 
 * MethodException will be used as a signal to notify that the method is
 * not found in the current clazz hierarchy.
 */
/* private */
Clazz.MethodException = function () {
};
/* protected */
Clazz.MethodNotFoundException = function () {
	this.toString = function () {
		return "MethodNotFoundException";
	};
};

/* private */
Clazz.getParamsType = function (funParams) {
	// bh: optimization here for very common cases
	var n = funParams.length;
	switch (n) {
	case 0:
		var params = ["void"];
		params.typeString = "\\void";
		return params;
	case 1:
		// just so common
		var obj = funParams[0];
		if (obj && typeof obj == "number") {
			var params = ["Number"];
			params.typeString = "\\Number";
			return params;
		}
	}

	var params = [];
	params.hasCastedNull = false;
	if (funParams) {
		for (var i = 0; i < n; i++) {
			params[i] = Clazz.getClassName (funParams[i]);
			if (funParams[i] instanceof Clazz.CastedNull) {
				params.hasCastedNull = true;
			}
		}
	}
	params.typeString = "\\" + params.join ('\\');
	return params;
};




/**
 * Search the given class prototype, find the method with the same
 * method name and the same parameter signatures by the given 
 * parameters, and then run the method with the given parameters.
 *
 * @param objThis the current host object
 * @param claxxRef the current host object's class
 * @param fxName the method name
 * @param funParams the given arguments
 * @return the result of the specified method of the host object,
 * the return maybe void.
 * @throws Clazz.MethodNotFoundException if no matched method is found
 */
/* protected */
Clazz.searchAndExecuteMethod = function (objThis, claxxRef, fxName, funParams) {
	var fx = objThis[fxName];
	var params = Clazz.getParamsType (funParams);
	Clazz._profile && Clazz.addProfile(claxxRef, fxName, params);
	// Cache last matched method
	if (fx.lastParams == params.typeString && fx.lastClaxxRef === claxxRef) {
		var methodParams;
		if (params.hasCastedNull) {
			methodParams = [];
			// For Clazz.CastedNull instances, the type name is
			// already used to indentified the method in Clazz#searchMethod.
			for (var k = 0; k < funParams.length; k++)
				methodParams[k] = (funParams[k] instanceof Clazz.CastedNull ? null : funParams[k]);
		} else {
			methodParams = funParams;
		}
		return (fx.lastMethod ? fx.lastMethod.apply (objThis, methodParams) : null);
	}
	fx.lastParams = params.typeString;
	fx.lastClaxxRef = claxxRef;

	var stacks = fx.stacks;
	if (!stacks)
		stacks = claxxRef.prototype[fxName].stacks;
	var length = stacks.length;

	/*
	 * Search the inheritance stacks to get the given class' function
	 */
	var began = false; // began to search its super classes
	for (var i = length; --i >= 0;) {
		//if (Clazz.getInheritedLevel (claxxRef, stacks[i]) >= 0) {
		/*
		 * No need to calculate the inherited level as there always exist a 
		 * right claxxRef in the stacks, and the inherited level of stacks
		 * are in order.
		 */
		if (began || stacks[i] === claxxRef) {
			/*
			 * First try to search method within the same class scope
			 * with stacks[i] === claxxRef
			 */
			var clazzFun = stacks[i].prototype[fxName];

			var ret = Clazz.tryToSearchAndExecute (fxName, objThis, clazzFun, params,
					funParams/*, isSuper, clazzThis*/, fx);
			if (!(ret instanceof Clazz.MethodException)) {
				return ret;
			}
			/*
			 * As there are no such methods in current class, Clazz will try 
			 * to search its super class stacks. Here variable began indicates
			 * that super searchi is began, and there is no need checking
			 * <code>stacks[i] === claxxRef</code>
			 */
			began = true; 
		} // end of if
	} // end of for
	if ("construct" == fxName) {
		/*
		 * For non existed constructors, just return without throwing
		 * exceptions. In Java codes, extending Object can call super
		 * default Object#constructor, which is not defined in JS.
		 */
		return;
	}
	// TODO: should be java.lang.NoSuchMethodException
	throw new Clazz.MethodNotFoundException (objThis, claxxRef, 
			fxName, params.typeString);
};


/* private */
Clazz.tryToSearchAndExecute = function (fxName, objThis, clazzFun, params, funParams/*, 
		isSuper, clazzThis*/, fx) {
	var methods = [];
	var generic = true;
	for (var fn in clazzFun) {
		if (fn.charCodeAt (0) == 92) { // 92 == '\\'.charCodeAt (0)
			var ps = fn.substring (1).split ("\\");
			if (ps.length == params.length) {
				methods.push(ps);
			}
			generic = false;
			continue;
		}
		/*
		 * When there are only one method in the class, use the funParams
		 * to identify the parameter type.
		 *
		 * AbstractCollection.remove (Object)
		 * AbstractList.remove (int)
		 * ArrayList.remove (int)
		 *
		 * Then calling #remove (Object) method on ArrayList instance will 
		 * need to search up to the AbstractCollection.remove (Object),
		 * which contains only one method.
		 */
		/*
		 * See Clazz#defineMethod --Mar 10, 2006, josson
		 */
		if (generic && fn == "funParams" && clazzFun.funParams) {
			fn = clazzFun.funParams;
			var ps = fn.substring (1).split ("\\");
			if (ps.length == params.length)
				methods[0] = ps;
			break;
		}
	}
	if (methods.length == 0)
		return new Clazz.MethodException ();
	var method = Clazz.searchMethod (methods, params);
	if (method) {
		var f = null;
		if (generic) { /* Use the generic method */
			/*
			 * Will this case be reachable?
			 * March 4, 2006 josson
			 * 
			 * Reachable for calling #remove (Object) method on 
			 * ArrayList instance
			 * May 5, 2006 josson
			 */
			f = clazzFun; // call it directly
		} else {
			f = clazzFun["\\" + method];
		}
		//if (f) { // always not null
			var methodParams = null;
			if (params.hasCastedNull) {
				methodParams = [];
				for (var k = 0; k < funParams.length; k++) {
					if (funParams[k] instanceof Clazz.CastedNull) {
						/*
						 * For Clazz.CastedNull instances, the type name is
						 * already used to indentified the method in Clazz#
						 * searchMethod.
						 */
						methodParams[k] = null;
					} else {
						methodParams[k] = funParams[k];
					}
				}
			} else {
				methodParams = funParams;
			}
			/*# {$no.debug.support} >>x #*/
			/*
			if (Clazz.tracingCalling) {
				var caller = arguments.callee.caller; // SAEM
				caller = caller.arguments.callee.caller; // Delegating
				caller = caller.arguments.callee.caller; 
				var xpushed = f.exName == "construct" 
						&& Clazz.getInheritedLevel (f.exClazz, Throwable) >= 0
						&& !Clazz._initializingException;
				if (xpushed) {
					Clazz._initializingException = true;
					// constructor is wrapped
					var xcaller = caller.arguments.callee.caller // Delegate
							.arguments.callee.caller; // last method
					var fun = xcaller.arguments.callee;
					var owner = fun.claxxReference;
					if (owner == null) {
						owner = fun.exClazz;
					}
					if (owner == null) {
						owner = fun.claxxOwner;
					}
					// Keep the environment that Throwable instance is created
					Clazz._callingStackTraces.push(new Clazz.callingStack (xcaller, owner));
				}

				var noInnerWrapper = caller !== Clazz.instantialize 
						&& caller !== Clazz.superCall;
				if (noInnerWrapper) {
					var fun = caller.arguments.callee;
					var owner = fun.claxxReference;
					if (owner == null) {
						owner = fun.exClazz;
					}
					if (owner == null) {
						owner = fun.claxxOwner;
					}
					Clazz._callingStackTraces.push(new Clazz.callingStack (caller, owner));
				}
				fx.lastMethod = f;
				var ret = f.apply (objThis, methodParams);
				if (noInnerWrapper) {
					Clazz._callingStackTraces.pop();
				}
				if (xpushed) {
					Clazz._callingStackTraces.pop();
				}
				return ret;
			}
			*/
			/*# x<< #*/
			fx.lastMethod = f;
			return f.apply (objThis, methodParams);
		//}
	}
	//throw new Clazz.MethodException ();
	return new Clazz.MethodException ();
};

Clazz._initializingException = false;

/**
 * Search the existed polymorphic methods to get the matched method with
 * the given parameter types.
 *
 * @param existedMethods Array of string which contains method parameters
 * @param paramTypes Array of string that is parameter type.
 * @return string of method parameters seperated by "\\"
 */
/* private */
Clazz.searchMethod = function (roundOne, paramTypes) {
	// Filter out all the fitted methods for the given parameters
	var roundTwo = [];
	var len = roundOne.length;
	for (var i = 0; i < len; i++) {
		var fittedLevel = [];
		var isFitted = true;
		var len2 = roundOne[i].length;
		for (var j = 0; j < len2; j++) {
			fittedLevel[j] = Clazz.getInheritedLevel (paramTypes[j], 
					roundOne[i][j]);
			if (fittedLevel[j] < 0) {
				isFitted = false;
				break;
			}
		}
		if (isFitted) {
			fittedLevel[paramTypes.length] = i; // Keep index for later use
			roundTwo.push(fittedLevel);
		}
	}
	if (roundTwo.length == 0)
		return null;
	// Find out the best method according to the inheritance.
	var resultTwo = roundTwo;
	var min = resultTwo[0];
	for (var i = 1; i < resultTwo.length; i++) {
		var isVectorLesser = true;
		for (var j = 0; j < paramTypes.length; j++) {
			if (min[j] < resultTwo[i][j]) {
				isVectorLesser = false;;
				break;
			}
		}
		if (isVectorLesser)
			min = resultTwo[i];
	}
	var index = min[paramTypes.length]; // Get the previously stored index
	/*
	 * Return the method parameters' type string as indentifier of the
	 * choosen method.
	 */
	return roundOne[index].join ('\\');
};

/**
 * Generate delegating function for the given method name.
 *
 * @param claxxRef the specified class for the method
 * @funName method name of the specified method
 * @return the method delegate which will try to search the method
 * from the given class by the parameters
 */
/* private */
Clazz.generateDelegatingMethod = function (claxxRef, funName, fCall) {
	/*
	 * Delegating method.
	 * Each time the following expression will generate a new 
	 * function object.
	 */
	var delegating = function () {
		var r = arguments;
		return SAEM (this, r.callee.claxxReference, r.callee.methodName, r);
	};
	delegating.methodName = funName;
	delegating.claxxReference = claxxRef;
	return delegating;
};



SAEM = Clazz.searchAndExecuteMethod;

/* private */
Clazz.expExpandParameters = function ($0, $1) {
	switch ($1) {
	case 'N':
		return "Number";
	case 'B':
		return "Boolean";
	case 'S':
		return "String";
	case 'O':
		return "Object";
	case 'A':
		return "Array";
	}
	return "Unknown";
};

/*
 * Other developers may need to extend this formatParameters method
 * to deal complicated situation.
 */
/* protected */
Clazz.formatParameters = function (funParams) {
	return (funParams ? funParams.replace (/~([NABSO])/g, Clazz.expExpandParameters)
				.replace (/\s+/g, "").replace (/^|,/g, "\\")
				.replace (/\$/g, "org.eclipse.s") : "\\void");
};

/*
 * Override the existed methods which are in the same name.
 * Overriding methods is provided for the purpose that the JavaScript
 * does not need to search the whole hierarchied methods to find the
 * correct method to execute.
 * Be cautious about this method. Incorrectly using this method may
 * break the inheritance system.
 *
 * @param clazzThis host class in which the method to be defined
 * @param funName method name
 * @param funBody function object, e.g function () { ... }
 * @param funParams paramether signature, e.g ["string", "number"]
 */
/* public */
Clazz.overrideMethod = function (clazzThis, funName, funBody, funParams) {
	if (Clazz.assureInnerClass) Clazz.assureInnerClass (clazzThis, funBody);
	funBody.exName = funName;
	var fpName = Clazz.formatParameters (funParams);
	/*
	 * Replace old methods with new method. No super methods are kept.
	 */
	funBody.funParams = fpName; 
	funBody.claxxOwner = clazzThis;
	return Clazz.getSignature(clazzThis.prototype, funName, funBody, true);
};

/*
 * Define method for the class with the given method name and method
 * body and method parameter signature.
 *
 * @param clazzThis host class in which the method to be defined
 * @param funName method name
 * @param funBody function object, e.g function () { ... }
 * @param funParams paramether signature, e.g ["string", "number"]
 * @return method of the given name. The method may be funBody or a wrapper
 * of the given funBody.
 */
/* public */
Clazz.defineMethod = function (clazzThis, funName, funBody, funParams) {
	if (Clazz.assureInnerClass) Clazz.assureInnerClass (clazzThis, funBody);
	funBody.exName = funName;
	var fpName = Clazz.formatParameters (funParams);

	/*
	 * For method the first time is defined, just keep it rather than
	 * wrapping into deep hierarchies!
	 */

	// BH : signature based on nParams
	var proto = clazzThis.prototype;
	var f$ = Clazz.getSignature(proto, funName, funBody, false);
	if (!f$ || (f$.claxxOwner === clazzThis && f$.funParams == fpName)) {
		// property "funParams" will be used as a mark of only-one method
		funBody.funParams = fpName; 
		funBody.claxxOwner = clazzThis;
		funBody.exClazz = clazzThis; // make it traceable
		//delete $fz;           // BH -- delete global variables when no longer needed
		return Clazz.getSignature(proto, funName, funBody, true);
	}
	var oldFun = null;
	var oldStacks = [];
		if (!f$.stacks) {
			/* method is not defined by Clazz.defineMethod () */
			oldFun = f$;
			if (f$.claxxOwner) {
				oldStacks[0] = oldFun.claxxOwner;
			}
		} else {
			oldStacks = f$.stacks;
		}
		/*
	 * Method that is already defined in super class will be overridden
	 * with a new proxy method with class hierarchy stored in a stack.
	 * That is to say, the super methods are lost in this class' proxy
	 * method. 
	 * When method are being called, methods defined in the new proxy 
	 * method will be searched through first. And if no method fitted,
	 * it will then try to search method in the super class stacks.
	 */
	if (!f$.stacks || f$.claxxReference !== clazzThis) {
		//Generate a new delegating method for the class
		f$ = Clazz.getSignature(proto, funName, Clazz.generateDelegatingMethod (clazzThis, funName, f$), true);				
		// Keep the class inheritance stacks
		var arr = [];
		for (var i = 0; i < oldStacks.length; i++)
			arr[i] = oldStacks[i];
		f$.stacks = arr;
	}
	var ss = f$.stacks;
	if (Clazz.findArrayItem(ss, clazzThis) < 0) ss.push(clazzThis);

	if (oldFun) {
		if (oldFun.claxxOwner === clazzThis) {
			f$[oldFun.funParams] = oldFun;
			oldFun.claxxOwner = null;
			// property "funParams" will be used as a mark of only-one method
			oldFun.funParams = null; // null ? safe ? // safe for != null
		} else if (!oldFun.claxxOwner) {
			/*
			 * The function is not defined Clazz.defineMethod ().
			 * Try to fixup the method ...
			 * As a matter of lost method information, I just suppose
			 * the method to be fixed is with void parameter!
			 */
			f$["\\unknown"] = oldFun;
		}
	}
	funBody.exClazz = clazzThis; // make it traceable
	f$[fpName] = funBody;
	//delete $fz;           // BH -- delete global variables when no longer needed
	return f$;
};                                                

/**
 * Make constructor for the class with the given function body and parameters
 * signature.
 * 
 * @param clazzThis host class
 * @param funBody constructor body
 * @param funParams constructor parameters signature
 */
/* public */
Clazz.makeConstructor = function (clazzThis, funBody, funParams) {
	Clazz.defineMethod (clazzThis, "construct", funBody, funParams);
	if (clazzThis.con$truct) {
		clazzThis.con$truct.index = clazzThis.con$truct.stacks.length;
	}
	//clazzThis.con$truct = clazzThis.prototype.con$truct = null;
};

/**
 * Override constructor for the class with the given function body and
 * parameters signature.
 * 
 * @param clazzThis host class
 * @param funBody constructor body
 * @param funParams constructor parameters signature
 */
/* public */
Clazz.overrideConstructor = function (clazzThis, funBody, funParams) {
// $_k  @j2sOverrideConstructor
	Clazz.overrideMethod (clazzThis, "construct", funBody, funParams);
	if (clazzThis.con$truct) {
		clazzThis.con$truct.index = clazzThis.con$truct.stacks.length;
	}
	//clazzThis.con$truct = clazzThis.prototype.con$truct = null;
};

/*
 * all root packages. e.g. java.*, org.*, com.*
 */
/* protected */
Clazz.allPackage = {};

/**
 * Will be used to keep value of whether the class is defined or not.
 */
/* protected */
Clazz.allClasses = {};

Clazz.lastPackageName = null;
Clazz.lastPackage = null;

/* protected */
Clazz.unloadedClasses = [];

/* public */
Clazz.declarePackage = function (pkgName) {
	if (Clazz.lastPackageName == pkgName)
		return Clazz.lastPackage;
	if (pkgName && pkgName.length) {
		var pkgFrags = pkgName.split (/\./);
		var pkg = Clazz.allPackage;
		for (var i = 0; i < pkgFrags.length; i++) {
			if (!pkg[pkgFrags[i]]) {
				pkg[pkgFrags[i]] = { 
					__PKG_NAME__ : (pkg.__PKG_NAME__ ? 
						pkg.__PKG_NAME__ + "." + pkgFrags[i] : pkgFrags[i])
				}; 
				// pkg[pkgFrags[i]] = {};
				if (i == 0) {
					// eval ...
					Clazz.setGlobal(pkgFrags[i], pkg[pkgFrags[i]]);
				}
			}
			pkg = pkg[pkgFrags[i]]
		}
		Clazz.lastPackageName = pkgName;
		Clazz.lastPackage = pkg;
		return pkg;
	}
};

/* protected */
Clazz.evalType = function (typeStr, isQualified) {
	var idx = typeStr.lastIndexOf(".");
	if (idx != -1) {
		var pkgName = typeStr.substring (0, idx);
		var pkg = Clazz.declarePackage (pkgName);
		var clazzName = typeStr.substring (idx + 1);
		return pkg[clazzName];
	} 
	if (isQualified)
		return window[typeStr];
	switch (typeStr) {
	case "string":
		return String;
	case "number":
		return Number;
  case "object":
		return Clazz._O;
	case "boolean":
		return Boolean;
	case "function":
		return Function;
  case "void":
  case "undefined":
  case "unknown":
		return typeStr;
	case "NullObject":
		return NullObject;
	default:
		return window[typeStr];
	}
};

/**
 * Define a class or interface.
 *
 * @param qClazzName String presents the qualified name of the class
 * @param clazzFun Function of the body
 * @param clazzParent Clazz to inherit from, may be null
 * @param interfacez Clazz may implement one or many interfaces
 *   interfacez can be Clazz object or Array of Clazz objects.
 * @return Ruturn the modified Clazz object
 */
/* public */
Clazz.defineType = function (qClazzName, clazzFun, clazzParent, interfacez) {
	var cf = Clazz.unloadedClasses[qClazzName];
	if (cf) {
		clazzFun = cf;
	}
	var idx = qClazzName.lastIndexOf (".");
	if (idx != -1) {
		var pkgName = qClazzName.substring (0, idx);
		var pkg = Clazz.declarePackage (pkgName);
		var clazzName = qClazzName.substring (idx + 1);
		if (pkg[clazzName]) {
			// already defined! Should throw exception!
			return pkg[clazzName];
		}
		pkg[clazzName] = clazzFun;
	} else {
		if (window[qClazzName]) {
			// already defined! Should throw exception!
			return window[qClazzName];
		}
		Clazz.setGlobal(qClazzName, clazzFun);
	}
	Clazz.decorateAsType (clazzFun, qClazzName, clazzParent, interfacez);
	/*# {$no.javascript.support} >>x #*/
	var iFun = Clazz._innerFunctions;
	clazzFun.defineMethod = iFun.defineMethod;
	clazzFun.defineStaticMethod = iFun.defineStaticMethod;
	clazzFun.makeConstructor = iFun.makeConstructor;
	/*# x<< #*/
	return clazzFun;
};

Clazz.isSafari = (navigator.userAgent.indexOf ("Safari") != -1);
Clazz.isSafari4Plus = false;
if (Clazz.isSafari) {
	var ua = navigator.userAgent;
	var verIdx = ua.indexOf("Version/");
	if (verIdx  != -1) {
		var verStr = ua.substring(verIdx + 8);
		var verNumber = parseFloat(verStr);
		Clazz.isSafari4Plus = verNumber >= 4.0;
	}
}

/* protected */
Clazz.instantialize = function (objThis, args) {
	if (args && args.length == 1 && args[0] 
			&& args[0] instanceof Clazz.args4InheritClass) {
		return;
	}
	if (objThis instanceof Number) {
		objThis.valueOf = function () {
			return this;
		};
	}
	if (Clazz.isSafari4Plus) { // Fix bug of Safari 4.0+'s over-optimization
		var argsClone = [];
		for (var k = 0; k < args.length; k++) {
			argsClone[k] = args[k];
		}
		args = argsClone;
	}
	var c = objThis.construct;
	if (c) {
		if (!objThis.con$truct) { // no need to init fields
			c.apply (objThis, args);
		} else if (!objThis.getClass ().superClazz) { // the base class
			objThis.con$truct.apply (objThis, []);
			c.apply (objThis, args);
		} else if ((c.claxxOwner 
				&& c.claxxOwner === objThis.getClass ())
				|| (c.stacks 
				&& c.stacks[c.stacks.length - 1] == objThis.getClass ())) {
			/*
			 * This #construct is defined by this class itself.
			 * #construct will call Clazz.superConstructor, which will
			 * call #con$truct back
			 */
			c.apply (objThis, args);
		} else { // constructor is a super constructor
			if (c.claxxOwner && !c.claxxOwner.superClazz 
						&& c.claxxOwner.con$truct) {
				c.claxxOwner.con$truct.apply (objThis, []);
			} else if (c.stacks && c.stacks.length == 1
					&& !c.stacks[0].superClazz) {
				c.stacks[0].con$truct.apply (objThis, []);
			}
			c.apply (objThis, args);
			objThis.con$truct.apply (objThis, []);
		}
	} else if (objThis.con$truct) {
		objThis.con$truct.apply (objThis, []);
	}
};

/**
 * Once there are other methods registered to the Function.prototype, 
 * those method names should be add to the following Array.
 */
/*
 * static final member of interface may be a class, which may
 * be function.
 */
/* protected */
Clazz.innerFunctionNames = [
	"equals", "hashCode", /*"toString",*/ "getName", "getClassLoader", "getResource", "getResourceAsStream" /*# {$no.javascript.support} >>x #*/, "defineMethod", "defineStaticMethod",
	"makeConstructor" /*# x<< #*/
];

/*
 * Static methods
 */
Clazz._innerFunctions = {
	/*
	 * Similar to Object#equals
	 */
	equals : function (aFun) {
		return this === aFun;
	},

	hashCode : function () {
		return this.getName ().hashCode ();
	},

	toString : function () {
		return "class " + this.getName ();
	},

	/*
	 * Similar to Class#getName
	 */
	getName : function () {
		return Clazz.getClassName (this, true);
	},
	getClassLoader : function () {
		var clazzName = this.__CLASS_NAME__;
		var baseFolder = Clazz._Loader.getClasspathFor (clazzName);
		var x = baseFolder.lastIndexOf (clazzName.replace (/\./g, "/"));
		if (x != -1) {
			baseFolder = baseFolder.substring (0, x);
		} else {
			baseFolder = Clazz._Loader.getClasspathFor (clazzName, true);
		}
		var loader = Clazz._Loader.requireLoaderByBase (baseFolder);
		loader.getResourceAsStream = Clazz._innerFunctions.getResourceAsStream;
		loader.getResource = Clazz._innerFunctions.getResource; // BH
		return loader;
	},

	getResource : function(name) {
		return this.getResourceAsStream(name).url;
	},

	getResourceAsStream : function (name) {
		if (!name)
			return null;
		var is = null;
		if (java.io.InputStream) {
			is = new java.io.InputStream ();
		} else {
			is = new Clazz._O ();
			is.__CLASS_NAME__ = "java.io.InputStream";
			is.close = NullObject; // function () {};
		}
		is.read = function () { return 0; };
		name = name.replace (/\\/g, '/');
		var baseFolder = null;
		var clazzName = this.__CLASS_NAME__;
		if (arguments.length == 2 && name.indexOf ('/') != 0) { // additional argument
			name = "/" + name;
		}
		if (name.indexOf ('/') == 0) {
			//is.url = name.substring (1);
			if (arguments.length == 2) { // additional argument
				baseFolder = arguments[1];
				if (!baseFolder)
					baseFolder = Clazz._Loader.binaryFolders[0];
			} else if (Clazz._Loader) {
				baseFolder = Clazz._Loader.getClasspathFor (clazzName, true);
			}
			if (!baseFolder) {
				is.url = name.substring (1);
			} else {
				baseFolder = baseFolder.replace (/\\/g, '/');
				var length = baseFolder.length;
				var lastChar = baseFolder.charAt (length - 1);
				if (lastChar != '/') {
					baseFolder += "/";
				}
				is.url = baseFolder + name.substring (1);
			}
		} else {
			if (this.base) {
				baseFolder = this.base;
			} else if (Clazz._Loader) {
				baseFolder = Clazz._Loader.getClasspathFor (clazzName);
				var x = baseFolder.lastIndexOf (clazzName.replace (/\./g, "/"));
				if (x != -1) {
					baseFolder = baseFolder.substring (0, x);
				} else {
					//baseFolder = null;
					var y = -1;
					if (baseFolder.indexOf (".z.js") == baseFolder.length - 5
							&& (y = baseFolder.lastIndexOf ("/")) != -1) {
						baseFolder = baseFolder.substring (0, y + 1);
						var pkgs = clazzName.split (/\./);
						for (var k = 1; k < pkgs.length; k++) {
							var pkgURL = "/";
							for (var j = 0; j < k; j++) {
								pkgURL += pkgs[j] + "/";
							}
							if (pkgURL.length > baseFolder.length) {
								break;
							}
							if (baseFolder.indexOf (pkgURL) == baseFolder.length - pkgURL.length) {
								baseFolder = baseFolder.substring (0, baseFolder.length - pkgURL.length + 1);
								break;
							}
						}
					} else {
						baseFolder = Clazz._Loader.getClasspathFor (clazzName, true);
					}
				}
			} else {
				var bins = Clazz.binaryFolders;
				if (bins && bins.length) {
					baseFolder = bins[0];
				}
			}
			if (!baseFolder)
				baseFolder = "j2s/";
			baseFolder = baseFolder.replace (/\\/g, '/');
			var length = baseFolder.length;
			var lastChar = baseFolder.charAt (length - 1);
			if (lastChar != '/') {
				baseFolder += "/";
			}
			if (this.base) {
				is.url = baseFolder + name;
			} else {
				var idx = clazzName.lastIndexOf ('.');
				if (idx == -1 || this.base) {
					is.url = baseFolder + name;
				} else {
					is.url = baseFolder + clazzName.substring (0, idx)
							.replace (/\./g, '/') +  "/" + name;
				}
			}
		}
		return is;
	}/*# {$no.javascript.support} >>x #*/,

	/*
	 * For JavaScript programmers
	 */
	defineMethod : function (methodName, funBody, paramTypes) {
		Clazz.defineMethod (this, methodName, funBody, paramTypes);
	},

	/*
	 * For JavaScript programmers
	 */
	defineStaticMethod : function (methodName, funBody, paramTypes) {
		Clazz.defineMethod (this, methodName, funBody, paramTypes);
		this[methodName] = this.prototype[methodName];
	},

	/*
	 * For JavaScript programmers
	 */
	makeConstructor : function (funBody, paramTypes) {
		Clazz.makeConstructor (this, funBody, paramTypes);
	}
	/*# x<< #*/
};

/* private */
Clazz.decorateFunction = function (clazzFun, prefix, name, _decorateFunction) {
	var qName;
	if (!prefix) {
		// e.g. Clazz.declareInterface (null, "ICorePlugin", org.eclipse.ui.IPlugin);
		qName = name;
		Clazz.setGlobal(name, clazzFun);
	} else if (prefix.__PKG_NAME__) {
		// e.g. Clazz.declareInterface (org.eclipse.ui, "ICorePlugin", org.eclipse.ui.IPlugin);
		qName = prefix.__PKG_NAME__ + "." + name;
		prefix[name] = clazzFun;
		if (prefix === java.lang)
			Clazz.setGlobal(name, clazzFun);
	} else {
		// e.g. Clazz.declareInterface (org.eclipse.ui.Plugin, "ICorePlugin", org.eclipse.ui.IPlugin);
		qName = prefix.__CLASS_NAME__ + "." + name;
		prefix[name] = clazzFun;
	}
	Clazz.extendJO(clazzFun, qName);
	var inF = Clazz.innerFunctionNames;
	for (var i = 0; i < inF.length; i++) {
		clazzFun[inF[i]] = Clazz._innerFunctions[inF[i]];
	}

	if (Clazz._Loader) {
		var node = Clazz._Loader.findClass(qName);
		if (node && node.status == Clazz._Node.STATUS_KNOWN) {
			window.setTimeout((function(nnn) {
				return function() {
					Clazz._Loader.updateNode(nnn);
				};
			})(node), 1);
		}
	}
};
Clazz.currentPath= "";
/* proected */
Clazz.declareInterface = function (prefix, name, interfacez, _declareInterface) {
	var clazzFun = function () {};
	Clazz.decorateFunction (clazzFun, prefix, name);
	if (interfacez) {
		Clazz.implementOf (clazzFun, interfacez);
	}
	return clazzFun;
};

/* protected */
Clazz.decorateAsClass = function (clazzFun, prefix, name, clazzParent, 
		interfacez, parentClazzInstance, _decorateAsClass) {
	var prefixName = null;
	if (prefix) {
		prefixName = prefix.__PKG_NAME__;
		if (!prefixName)
			prefixName = prefix.__CLASS_NAME__;
	}
	var qName = (prefixName ? prefixName + "." : "") + name;
	var cf = Clazz.unloadedClasses[qName];
	if (cf) {
		clazzFun = cf;
	}
	var qName = null;
	Clazz.decorateFunction (clazzFun, prefix, name);
	if (parentClazzInstance) {
		Clazz.inheritClass (clazzFun, clazzParent, parentClazzInstance);
	} else if (clazzParent) {
		Clazz.inheritClass (clazzFun, clazzParent);
	}
	if (interfacez) {
		Clazz.implementOf (clazzFun, interfacez);
	}
	return clazzFun;
};

/* public */
Clazz.declareType = function (prefix, name, clazzParent, interfacez, 
		parentClazzInstance, _declareType) {
	var f = function () {
		Clazz.instantialize (this, arguments);
	};
	return Clazz.decorateAsClass (f, prefix, name, clazzParent, interfacez, 
			parentClazzInstance);
};

/* public */
Clazz.declareAnonymous = function (prefix, name, clazzParent, interfacez, 
		parentClazzInstance, _declareAnonymous) {
	var f = function () {
		Clazz.prepareCallback(this, arguments);
		Clazz.instantialize (this, arguments);
	};
	return Clazz.decorateAsClass (f, prefix, name, clazzParent, interfacez, 
			parentClazzInstance);
};

/* protected */
Clazz.decorateAsType = function (clazzFun, qClazzName, clazzParent, 
		interfacez, parentClazzInstance, inheritClazzFuns, _decorateAsType) {
	Clazz.extendJO(clazzFun, qClazzName);
	clazzFun.equals = Clazz._innerFunctions.equals;
	clazzFun.getName = Clazz._innerFunctions.getName;
	if (inheritClazzFuns) {
		for (var i = 0; i < Clazz.innerFunctionNames.length; i++) {
			var methodName = Clazz.innerFunctionNames[i];
			clazzFun[methodName] = Clazz._innerFunctions[methodName];
		}
	}
	if (parentClazzInstance) {
		Clazz.inheritClass (clazzFun, clazzParent, parentClazzInstance);
	} else if (clazzParent) {
		Clazz.inheritClass (clazzFun, clazzParent);
	}
	if (interfacez) {
		Clazz.implementOf (clazzFun, interfacez);
	}
	return clazzFun;
};

/* sgurin: native exception detection mechanism. Only NullPointerException detected and wrapped to java excepions */
/** private utility method for creating a general regexp that can be used later  
 * for detecting a certain kind of native exceptions. use with error messages like "blabla IDENTIFIER blabla"
 * @param msg String - the error message
 * @param spliterName String, must be contained once in msg
 * spliterRegex String, a string with the regexp literal for identifying the spitter in exception further error messages.
 */
Clazz._ex_reg=function (msg, spliterName, spliterRegex) {
	if(!spliterRegex) 
		spliterRegex="[^\\s]+";	
	var idx = msg.indexOf (spliterName), 
		str = msg.substring (0, idx) + spliterRegex + msg.substring(idx + spliterName.length), 
		regexp = new RegExp("^"+str+"$");
	return regexp;
};
// reproduce NullPointerException for knowing how to detect them, and create detector function Clazz._isNPEExceptionPredicate
var $$o$$ = null;
try {
	$$o$$.hello ();
} catch (e) {
	if(/Opera[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {// opera throws an exception with fixed messages like "Statement on line 23: Cannot convert undefined or null to Object Backtrace: Line....long text... " 
		var idx1 = e.message.indexOf(":"), idx2 = e.message.indexOf(":", idx1+2);
		Clazz._NPEMsgFragment = e.message.substr(idx1+1, idx2-idx1-20);
		Clazz._isNPEExceptionPredicate = function(e) {
			return e.message.indexOf(Clazz._NPEMsgFragment)!=-1;
		};
	}	
	else if(navigator.userAgent.toLowerCase().indexOf("webkit")!=-1) { //webkit, google chrome prints the property name accessed. 
		Clazz._exceptionNPERegExp = Clazz._ex_reg(e.message, "hello");
		Clazz._isNPEExceptionPredicate = function(e) {
			return Clazz._exceptionNPERegExp.test(e.message);
		};
	}
	else {// ie, firefox and others print the name of the object accessed: 
		Clazz._exceptionNPERegExp = Clazz._ex_reg(e.message, "$$o$$");
		Clazz._isNPEExceptionPredicate = function(e) {
			return Clazz._exceptionNPERegExp.test(e.message);
		};
	}		
};
/**sgurin
 * Implements Java's keyword "instanceof" in JavaScript's way **for exception objects**.
 * 
 * calls Clazz.instanceOf if e is a Java exception. If not, try to detect known native 
 * exceptions, like native NullPointerExceptions and wrap it into a Java exception and 
 * call Clazz.instanceOf again. if the native exception can't be wrapped, false is returned.
 * 
 * @param obj the object to be tested
 * @param clazz the class to be checked
 * @return whether the object is an instance of the class
 * @author: sgurin
 */
Clazz.exceptionOf=function(e, clazz) {
	if(e.__CLASS_NAME__)
		return Clazz.instanceOf(e, clazz);
	if(clazz == Error) {
		if (("" + e).indexOf("Error") >= 0) {
			System.out.println (Clazz.getStackTrace());
		}
		return (("" + e).indexOf("Error") >= 0);
		// everything here is a Java Exception, not a Java Error
	}
	return (clazz == Exception || clazz == Throwable
		|| clazz == NullPointerException && Clazz._isNPEExceptionPredicate(e));
};

Clazz.getStackTrace = function(n) {
	n || (n = 25);
	var s = "\n";
	var c = arguments.callee.caller;
	for (var i = 0; i < n; i++) {
		if (!c)break;
		s += (i + " " + (c.exName ? (c.claxxOwner ? c.claxxOwner.__CLASS_NAME__ + "."  : "") + c.exName 
		: (c.toString ? c.toString().substring(0, c.toString().indexOf("{")) : "<native method>"))) + "\n";
		c = c.caller
	}
	return s;
}

/* sgurin: preserve Number.prototype.toString */
Number.prototype._numberToString=Number.prototype.toString;


Clazz.declarePackage ("java.io");
//Clazz.declarePackage ("java.lang");
Clazz.declarePackage ("java.lang.annotation"); // java.lang
Clazz.declarePackage ("java.lang.instrument"); // java.lang
Clazz.declarePackage ("java.lang.management"); // java.lang
Clazz.declarePackage ("java.lang.reflect"); // java.lang
Clazz.declarePackage ("java.lang.ref");  // java.lang.ref
java.lang.ref.reflect = java.lang.reflect;
Clazz.declarePackage ("java.util");

/*
 * Consider these interfaces are basic!
 */
Clazz.declareInterface (java.io,"Closeable");
Clazz.declareInterface (java.io,"DataInput");
Clazz.declareInterface (java.io,"DataOutput");
Clazz.declareInterface (java.io,"Externalizable");
Clazz.declareInterface (java.io,"Flushable");
Clazz.declareInterface (java.io,"Serializable");
Clazz.declareInterface (java.lang,"Iterable");
Clazz.declareInterface (java.lang,"CharSequence");
Clazz.declareInterface (java.lang,"Cloneable");
Clazz.declareInterface (java.lang,"Appendable");
Clazz.declareInterface (java.lang,"Comparable");
Clazz.declareInterface (java.lang,"Runnable");
Clazz.declareInterface (java.util,"Comparator");

java.lang.ClassLoader = {
	__CLASS_NAME__ : "ClassLoader"
};

/******************************************************************************
 * Copyright (c) 2007 java2script.org and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Zhou Renjian - initial API and implementation
 *****************************************************************************/
/*******
 * @author zhou renjian
 * @create March 10, 2006
 *******/

if (window["Clazz"] && !window["Clazz"].unloadClass) {
/**
 * Once ClassExt.js is part of Class.js.
 * In order to make the Class.js as small as possible, part of its content
 * is moved into this ClassExt.js.
 *
 * See also http://j2s.sourceforge.net/j2sclazz/
 */
 
/**
 * Clazz.MethodNotFoundException is used to notify the developer about calling
 * methods with incorrect parameters.
 */
/* protected */
// Override the Clazz.MethodNotFoundException in Class.js to give details
Clazz.MethodNotFoundException = function (obj, clazz, method, params) {
	var paramStr = "";
	if (params) {
		paramStr = params.substring (1).replace (/\\/g, ",");
	}
	var leadingStr = "";
	if (method && method != "construct") {
		leadingStr = "Method";
	} else {
		leadingStr = "Constructor";
	}
	this.message = leadingStr + " " + Clazz.getClassName (clazz, true) + "." 
					+ method + "(" + paramStr + ") is not found!";
	this.toString = function () {
		return "MethodNotFoundException:" + this.message;
	}
};

/**
 * Prepare "callback" for instance of anonymous Class.
 * For example for the callback:
 *     this.callbacks.MyEditor.sayHello();
 *     
 * This is specifically for inner classes that are referring to 
 * outer class methods and fields.   
 *
 * @param objThis the host object for callback
 * @param args arguments object. args[0] will be classThisObj -- the "this"
 * object to be hooked
 * 
 * Attention: parameters should not be null!
 */
/* protected */
Clazz.prepareCallback = function (innerObj, args) {
	var outerObj = args[0];
	var cbName = "b$"; // "callbacks";
	if (innerObj && outerObj && outerObj !== window) {
		var className = Clazz.getClassName(outerObj, true);		
		var obs = {};
		if (innerObj[cbName]) // must make a copy!
			for (var s in innerObj[cbName])
				obs[s] = innerObj[cbName][s];
		innerObj[cbName] = obs;
		
		/*
		 * TODO: the following line is SWT-specific! Try to move it out!
		 */
		//			obs[className.replace (/org\.eclipse\.swt\./, "$wt.")] = outerObj;

  	// all references to outer class and its superclass objects must be here as well
		obs[className] = outerObj;
		var clazz = Clazz.getClass(outerObj);
		while (clazz.superClazz) {
			clazz = clazz.superClazz;
			/*
			 * TODO: the following line is SWT-specific! Try to move it out!
			 */
			//				obs[Clazz.getClassName (clazz, true)
			//						.replace (/org\.eclipse\.swt\./, "$wt.")] = outerObj;
			obs[Clazz.getClassName(clazz, true)] = outerObj;
		}
		var cbs = outerObj[cbName];
		if (cbs)
			for (var s in cbs)
				obs[s] = cbs[s];
	}
	// remove "this" argument
	// note that args is an instance of arguments -- NOT an array; does not have the .shift() method!
	for (var i = 0; i < args.length - 1; i++)
		args[i] = args[i + 1];
	args.length--;
};

/**
 * Construct instance of the given inner class.
 *
 * @param classInner given inner class, alway with name like "*$*"
 * @param innerObj this instance which can be used to call back.
 * @param finalVars final variables which the inner class may use
 * @return the constructed object
 *
 * @see Clazz#cloneFinals
 */
/* public */
Clazz.innerTypeInstance = function (clazzInner, innerObj, finalVars) {
	if (!clazzInner)
		clazzInner = arguments.callee.caller;
	var obj;
	if (finalVars || innerObj.$finals) {
			obj = new clazzInner(innerObj, Clazz.inheritArgs);
		// f$ is short for the once choosen "$finals"
		if (finalVars) {
			if (innerObj.f$) {
				var o = {};
				for (var attr in innerObj.f$)
					o[attr] = innerObj.f$[attr];
				for (var attr in finalVars)
					o[attr] = finalVars[attr];
				obj.f$ = o;
			} else {
				obj.f$ = finalVars;
			}
		} else if (innerObj.f$) {
			obj.f$ = innerObj.f$;
		}
	} else {
		switch (arguments.length) {
		case 3:
			return new clazzInner(innerObj);
		case 4:
			return (innerObj.__CLASS_NAME__ == clazzInner.__CLASS_NAME__
					&& arguments[3] === Clazz.inheritArgs ? innerObj : new clazzInner(innerObj, arguments[3]));
		case 5:
			return new clazzInner(innerObj, arguments[3], arguments[4]);
		case 6:
			return new clazzInner(innerObj, arguments[3], arguments[4], 
					arguments[5]);
		case 7:
			return new clazzInner(innerObj, arguments[3], arguments[4], 
					arguments[5], arguments[6]);
		case 8:
			return new clazzInner(innerObj, arguments[3], arguments[4], 
					arguments[5], arguments[6], arguments[7]);
		case 9:
			return new clazzInner(innerObj, arguments[3], arguments[4], 
					arguments[5], arguments[6], arguments[7], arguments[8]);
		case 10:
			return new clazzInner(innerObj, arguments[3], arguments[4], 
					arguments[5], arguments[6], arguments[7], arguments[8],
					arguments[9]);
		default:
			//Should construct instance manually.
			obj = new clazzInner(innerObj, Clazz.inheritArgs);
			break;
		}
	}
	var n = arguments.length - 3;
	var args = new Array(n);
	for (var i = n; --i >= 0;)
		args[i] = arguments[i + 3];
	Clazz.instantialize(obj, args);
	return obj;
};

/**
 * Clone variables whose modifier is "final".
 * Usage: var o = Clazz.cloneFinals ("name", name, "age", age);
 *
 * @return Object with all final variables
 */
/* protected */
Clazz.cloneFinals = function () {
	var o = {};
	var len = arguments.length / 2;
	for (var i = len; --i >= 0;)
		o[arguments[i + i]] = arguments[i + i + 1];
	return o;
};

/* public */
Clazz.isClassDefined = Clazz.isDefinedClass = function (clazzName) {
	if (!clazzName) 
		return false;		/* consider null or empty name as non-defined class */
	if (Clazz.allClasses[clazzName])
		return true;
	var pkgFrags = clazzName.split (/\./);
	var pkg = null;
	for (var i = 0; i < pkgFrags.length; i++)
		if (!(pkg = (pkg ? pkg[pkgFrags[i]] : Clazz.allPackage[pkgFrags[0]])))
			return false;
	return (pkg && (Clazz.allClasses[clazzName] = true));
};
/**
 * Define the enum constant.
 * @param classEnum enum type
 * @param enumName enum constant
 * @param enumOrdinal enum ordinal
 * @param initialParams enum constant constructor parameters
 * @return return defined enum constant
 */
/* public */
Clazz.defineEnumConstant = function (clazzEnum, enumName, enumOrdinal, initialParams, clazzEnumExt) {
	var o = (clazzEnumExt ? new clazzEnumExt() : new clazzEnum());
	// BH avoids unnecessary calls to SAEM
	o.$name = enumName;
	o.$ordinal = enumOrdinal;
	//Clazz.superConstructor (o, clazzEnum, [enumName, enumOrdinal]);
	if (initialParams && initialParams.length)
		o.construct.apply (o, initialParams);
	clazzEnum[enumName] = o;
	clazzEnum.prototype[enumName] = o;
	if (!clazzEnum["$ values"]) {         // BH added
		clazzEnum["$ values"] = []          // BH added
		clazzEnum.values = function() {     // BH added
			return this["$ values"];          // BH added
		};                                  // BH added
	}
	clazzEnum["$ values"].push(o);
	return o;
};

//////// (int) conversions //////////

Clazz.floatToInt = function (x) {
	return x < 0 ? Math.ceil(x) : Math.floor(x);
};

Clazz.floatToByte = Clazz.floatToShort = Clazz.floatToLong = Clazz.floatToInt;
Clazz.doubleToByte = Clazz.doubleToShort = Clazz.doubleToLong = Clazz.doubleToInt = Clazz.floatToInt;

Clazz.floatToChar = function (x) {
	return String.fromCharCode (x < 0 ? Math.ceil(x) : Math.floor(x));
};

Clazz.doubleToChar = Clazz.floatToChar;



//////// Array additions ////////////

if (self.Int32Array && self.Int32Array != Array) {
	Clazz.haveInt32 = true;
	if (!Int32Array.prototype.sort)
		Int32Array.prototype.sort = Array.prototype.sort
} else {
	Int32Array = function(n) {
		if (!n) n = 0;
		var b = new Array(n);
		b.toString = function(){return "[object Int32Array]"}
		for (var i = 0; i < n; i++)b[i] = 0
		return b;
	}
	Clazz.haveInt32 = false;
	Int32Array.prototype.sort = Array.prototype.sort
	Int32Array.prototype.int32Fake = function(){};
}

if (self.Float64Array && self.Float64Array != Array) {
	Clazz.haveFloat64 = true;
	if (!Float64Array.prototype.sort)
		Float64Array.prototype.sort = Array.prototype.sort
} else {
	Clazz.haveFloat64 = false;
	Float64Array = function(n) {
		if (!n) n = 0;
		var b = new Array(n);
		for (var i = 0; i < n; i++)b[i] = 0.0
		return b;
	};
	Float64Array.prototype.sort = Array.prototype.sort
	Float64Array.prototype.float64Fake = function() {}; // "present"
	Float64Array.prototype.toString = function() {return "[object Float64Array]"};
// Darn! Mozilla makes this a double, not a float. It's 64-bit.
// and Safari 5.1 doesn't have Float64Array 
}

/**
 * Make arrays.
 *
 * @return the created Array object
 */
/* public */
Clazz.newArray  = function () {
	if (arguments[0] instanceof Array) {
		// recursive, from newArray(n,m,value)
		// as newArray([m, value], newInt32Array)
		var args = arguments[0];
		var f = arguments[1];
	} else {
		var args = arguments;
		var f = Array;
	}
	if (args.length <= 1) 
		return []; // maybe never?
	var dim = args[0];
	if (typeof dim == "string") {
		dim = dim.charCodeAt (0); // char
	}
	var len = args.length - 1;
	var val = args[len];
	if (args.length == 2) {
		if (val == null)
			return new Array(dim);
		if (f === true && Clazz.haveInt32) return new Int32Array(dim);
		if (f === false && Clazz.haveFloat64) return new Float64Array(dim);
		if (f == Array && val == null) return new Array(dim);
		var arr = (f === true ? new Int32Array() : f === false ? new Float64Array() : new Array(dim));
		for (var i = dim; --i >= 0;)
			arr[i] = val;
		return arr;
	}
	var xargs = new Array (len);
	for (var i = 0; i < len; i++) {
		xargs[i] = args[i + 1];
	}
	var arr = new Array (dim);
	if (val == null || val >= 0 || len > 2)
		for (var i = 0; i < dim; i++) {
	 	// Call recursively!
			arr[i] = Clazz.newArray (xargs, f);
		}
	return arr;
};

Clazz.newArray32 = function(args, isInt32) {
	var dim = args[0];
	if (typeof dim == "string")
		dim = dim.charCodeAt (0); // char
	var len = args.length - 1;
	var val = args[len];
	switch (args.length) {
	case 0:
	case 1:
		alert ("ERROR IN newArray32 -- args length < 2");
		return new Array(0);
	case 2:
		if (val < 0)
			return new Array(dim);
	//  if (isInt32 ? !Clazz.haveInt32 : !Clazz.haveFloat64 ) {
			// no support for Int32Array in MSIE or Float64Array in Safari 5.1
			// so we must initialize ourselves
	//    var f = (isInt32 ? new Int32Array() : new Float64Array());
	//    for (var i = dim; --i >= 0;)
	//      f[i] = 0;
	//    return f;
	//  }
		try {
			return (isInt32 ? new Int32Array(dim) : new Float64Array(dim));
		}catch (e) {
			alert (dim + " " + arguments.callee.caller.arguments.callee.caller + e)
		}
	}
	var xargs = new Array(len);
	for (var i = len; --i >= 0;) {
		xargs[i] = args[i + 1];
	}
	var arr = new Array (dim);
	for (var i = 0; i < dim; i++) {
		// Call newArray referencing this array type
		// only for the final iteration, and only if val === 0
		arr[i] = Clazz.newArray (xargs, isInt32);
	}
	return arr;
};


/**
 * Make arrays.
 *
 * @return the created Array object
 */
/* public */
Clazz.newInt32Array  = function () {
	return Clazz.newArray32(arguments, true);
}

/**
 * Make arrays.
 *
 * @return the created Array object
 */
/* public */
Clazz.newFloat64Array  = function () {
	return Clazz.newArray32(arguments, false);
}

Clazz.newFloatArray = Clazz.newDoubleArray = Clazz.newFloat64Array;
Clazz.newIntArray = Clazz.newLongArray = Clazz.newShortArray = Clazz.newByteArray = Clazz.newInt32Array;
Clazz.newCharArray = Clazz.newBooleanArray = Clazz.newArray;

//$_AI=Clazz.newIntArray;
//$_AF=Clazz.newFloatArray;
//$_AD=Clazz.newDoubleArray;
//$_AL=Clazz.newLongArray;
//$_AS=Clazz.newShortArray;
//$_AB=Clazz.newByteArray;
//$_AC=Clazz.newCharArray;
//$_Ab=Clazz.newBooleanArray;


Clazz.arrayIs = function(a, what) {
	// for some reason, Number.constructor.toString() now gives "too much recursion"
	return a.constructor && a.constructor != Number && a.constructor.toString().indexOf(what) >= 0
}

Clazz.isAS = function(a) { // just checking first parameter
	return (a && typeof a == "object" && Clazz.arrayIs(a, " Array") && (typeof a[0] == "string" || typeof a[0] == "undefined"));
}

Clazz.isASS = function(a) {
	return (a && typeof a == "object" && Clazz.isAS(a[0]));
}

Clazz.isAP = function(a) {
	return (a && Clazz.getClassName(a[0]) == "JU.P3");
}

Clazz.isAI = function(a) {
	return (a && typeof a == "object" && (Clazz.haveInt32 ? Clazz.arrayIs(a, "Int32Array") : a.int32Fake ? true : false));
}

Clazz.isAII = function(a) { // assumes non-null a[0]
	return (a && typeof a == "object" && Clazz.isAI(a[0]));
}

Clazz.isAF = function(a) {
	return (a && typeof a == "object" && (Clazz.haveFloat64 ? Clazz.arrayIs(a, "Float64Array") : a.float64Fake ? true : false));
}

Clazz.isAFF = function(a) { // assumes non-null a[0]
	return (a && typeof a == "object" && Clazz.isAF(a[0]));
}

Clazz.isAFFF = function(a) { // assumes non-null a[0]
	return (a && typeof a == "object" && Clazz.isAFF(a[0]));
}

Clazz.isAFloat = function(a) { // just checking first parameter
	return (a && typeof a == "object" && Clazz.arrayIs(a, " Array") && Clazz.instanceOf(a[0], Float));
}


/**
 * Make the RunnableCompatiability instance as a JavaScript function.
 *
 * @param jsr Instance of RunnableCompatiability
 * @return JavaScript function instance represents the method run of jsr.
 */
/* public */
/*
Clazz.makeFunction = function (jsr) {
// never used in Jmol -- called by Enum, but not accessible to it -- part of SWT
	return function(e) {
		if (!e)
			e = window.event;
		if (jsr.setEvent)
			jsr.setEvent(e);
		jsr.run();
		switch (jsr.returnSet) {
		case 1: 
			return jsr.returnNumber;
		case 2:
			return jsr.returnBoolean;
		case 3:
			return jsr.returnObject;
		}
	};
};
*/

/* protected */
Clazz.defineStatics = function (clazz) {
	for (var j = arguments.length, i = (j - 1) / 2; --i >= 0;) {
		var val = arguments[--j]
		var name = arguments[--j];
		clazz[name] = clazz.prototype[name] = val;
	}
};

/* protected */
Clazz.prepareFields = function (clazz, fieldsFun) {
	var stacks = [];
	if (clazz.con$truct) {
		var ss = clazz.con$truct.stacks;
		var idx = 0;//clazz.con$truct.index;
		for (var i = idx; i < ss.length; i++) {
			stacks[i] = ss[i];
		}
	}
	Clazz.addProto(clazz.prototype, "con$truct", clazz.con$truct = function () {
		var stacks = arguments.callee.stacks;
		if (stacks) {
			for (var i = 0; i < stacks.length; i++) {
				stacks[i].apply (this, []);
			}
		}
	});
	stacks.push(fieldsFun);
	clazz.con$truct.stacks = stacks;
	clazz.con$truct.index = 0;
};

/*
 * Serialize those public or protected fields in class 
 * net.sf.j2s.ajax.SimpleSerializable.
 */
/* protected */
Clazz.registerSerializableFields = function (clazz) {
	var args = arguments;
	var length = args.length;
	var newArr = [];
	if (clazz.declared$Fields) {
		for (var i = 0; i < clazz.declared$Fields.length; i++) {
			newArr[i] = clazz.declared$Fields[i];
		}
	}
	clazz.declared$Fields = newArr;

	if (length > 0 && length % 2 == 1) {
		var fs = clazz.declared$Fields;
		var n = (length - 1) / 2;
		for (var i = 1; i <= n; i++) {
			var o = { name : args[i + i - 1], type : args[i + i] };
			var existed = false;
			for (var j = 0; j < fs.length; j++) {
				if (fs[j].name == o.name) { // reloaded classes
					fs[j].type = o.type; // update type
					existed = true;
					break;
				}
			}
			if (!existed)
				fs.push(o);
		}
	}
};

/*
 * Get the caller method for those methods that are wrapped by 
 * Clazz.searchAndExecuteMethod.
 *
 * @param args caller method's arguments
 * @return caller method, null if there is not wrapped by 
 * Clazz.searchAndExecuteMethod or is called directly.
 */
/* protected */
Clazz.getMixedCallerMethod = function (args) {
	var o = {};
	var argc = args.callee.caller; // Clazz.tryToSearchAndExecute
	if (argc && argc !== Clazz.tryToSearchAndExecute) // inherited method's apply
		argc = argc.arguments.callee.caller;
	if (argc !== Clazz.tryToSearchAndExecute
		|| (argc = argc.arguments.callee.caller) !== Clazz.searchAndExecuteMethod)
		return null;
	o.claxxRef = argc.arguments[1];
	o.fxName = argc.arguments[2];
	o.paramTypes = Clazz.getParamsType (argc.arguments[3]);	
	argc = argc.arguments.callee.caller // Clazz.generateDelegatingMethod 
					&& argc.arguments.callee.caller; // the private method's caller
	if (!argc)
		return null;
	o.caller = argc;
	return o;
};

/* BH -- The issue here is a subclass calling its private method FOO when
 *       there is also a private method of the same name in its super class.
 *       This can ALWAYS be avoided and, one could argue, is bad 
 *       program design anyway. In Jmol, the presence of this possibility
 *       creates over 8000 references to the global $fx, which was only
 *       checked in a few rare cases. We can then also remove $fz references.
 *         
 */

/*
 * Check and return super private method.
 * In order make private methods be executed correctly, some extra javascript
 * must be inserted into the beggining of the method body of the non-private 
 * methods that with the same method signature as following:
 * <code>
 *			var $private = Clazz.checkPrivateMethod (arguments);
 *			if ($private) {
 *				return $private.apply (this, arguments);
 *			}
 * </code>
 * Be cautious about this. The above codes should be insert by Java2Script
 * compiler or with double checks to make sure things work correctly.
 *
 * @param args caller method's arguments
 * @return private method if there are private method fitted for the current 
 * calling environment
 */
/* public */

/*** BH
Clazz.checkPrivateMethod = function (args) {
	var m = Clazz.getMixedCallerMethod (args);
	if (m == null) return null;
	var callerFx = m.claxxRef.prototype[m.caller.exName];
	if (callerFx == null) return null; // may not be in the class hierarchies
	var ppFun = null;
	if (callerFx.claxxOwner ) {
		ppFun = callerFx.claxxOwner.prototype[m.fxName];
	} else {
		var stacks = callerFx.stacks;
		for (var i = stacks.length - 1; i >= 0; i--) {
			var fx = stacks[i].prototype[m.caller.exName];
			if (fx === m.caller) {
				ppFun = stacks[i].prototype[m.fxName];
			} else if (fx ) {
				for (var fn in fx) {
					if (fn.indexOf ('\\') == 0 && fx[fn] === m.caller) {
						ppFun = stacks[i].prototype[m.fxName];
						break;
					}
				}
			}
			if (ppFun) {
				break;
			}
		}
	}
	if (ppFun && ppFun.claxxOwner == null) {
		ppFun = ppFun["\\" + m.paramTypes];
	}
	if (ppFun && ppFun.isPrivate && ppFun !== args.callee) {
		return ppFun;
	}
	return null;
};
*****/
//$fz = null; // for private method declaration
c$ = null;
Clazz.cStack = [];
Clazz.pu$h = function (c) {
	c && Clazz.cStack.push(c);
};

Clazz.p0p = function () {
	return Clazz.cStack.pop();
};

/*# {$no.debug.support} >>x #*/
/*
 * Option to switch on/off of stack traces.
 */
/* protect */
Clazz.tracingCalling = false;

/*
 * Use to mark that the Throwable instance is created or not.
 */
/* private */
Clazz._initializingException = false;

/* private */
Clazz.callingStack = function (caller, owner) {
	this.caller = caller;
	this.owner = owner;
};
Clazz._callingStackTraces = [];
/*# x<< #*/

/**
 * The first folder is considered as the primary folder.
 * And try to be compatiable with ClazzLoader system.
 */
/* private */


/*** not used in Jmol
 * *
if (window["ClazzLoader"] && ClazzLoader.binaryFolders) {
	Clazz.binaryFolders = ClazzLoader.binaryFolders;
} else {
	Clazz.binaryFolders = ["j2s/", "", "j2slib/"];
}

Clazz.addBinaryFolder = function (bin) {
	if (bin) {
		var bins = Clazz.binaryFolders;
		for (var i = 0; i < bins.length; i++) {
			if (bins[i] == bin) {
				return ;
			}
		}
		bins[bins.length] = bin;
	}
};
Clazz.removeBinaryFolder = function (bin) {
	if (bin) {
		var bins = Clazz.binaryFolders;
		for (var i = 0; i < bins.length; i++) {
			if (bins[i] == bin) {
				for (var j = i; j < bins.length - 1; j++) {
					bins[j] = bins[j + 1];
				}
				bins.length--;
				return bin;
			}
		}
	}
	return null;
};
Clazz.setPrimaryFolder = function (bin) {
	if (bin) {
		Clazz.removeBinaryFolder (bin);
		var bins = Clazz.binaryFolders;
		for (var i = bins.length - 1; i >= 0; i--) {
			bins[i + 1] = bins[i];
		}
		bins[0] = bin;
	}
};

***/



/**
 * This is a simple implementation for Clazz#load. It just ignore dependencies
 * of the class. This will be fine for jar *.z.js file.
 * It will be overriden by ClazzLoader#load.
 * For more details, see ClazzLoader.js
 */
/* protected */
/*
Clazz.load = function (musts, clazz, optionals, declaration) {
	// not used in Jmol
	if (declaration)
		declaration ();
};
*/

/*
 * Invade the Object prototype!
 * TODO: make sure that invading Object prototype does not affect other
 * existed library, such as Dojo, YUI, Prototype, ...
 */
java.lang.Object = Clazz._O;

Clazz._O.getName = Clazz._innerFunctions.getName;


System = {
	props : null, //new java.util.Properties (),
	$props : {},
	arraycopy : function (src, srcPos, dest, destPos, length) {
		if (src !== dest) {
			for (var i = 0; i < length; i++) {
				dest[destPos + i] = src[srcPos + i];
			}
		} else {
			var swap = [];
			for (var i = 0; i < length; i++) {
				swap[i] = src[srcPos + i];
			}
			for (var i = 0; i < length; i++) {
				dest[destPos + i] = swap[i];
			}
		}
	},
	currentTimeMillis : function () {
		return new Date ().getTime ();
	},
	gc : function() {}, // bh
	getProperties : function () {
		return System.props;
	},
	getProperty : function (key, def) {
		if (System.props)
			return System.props.getProperty (key, def);
		var v = System.$props[key];
		return (v ? v : arguments.length == 1 ? null : def ? def : key); // BH
	},
	getSecurityManager : function() { return null },  // bh
	setProperties : function (props) {
		System.props = props;
	},
	setProperty : function (key, val) {
		if (!System.props)
			return System.$props[key] = val; // BH
		System.props.setProperty (key, val);
	}
};

System.setProperty("line.separator", navigator.userAgent.indexOf("Windows")>=0?"\r\n" : "\n") //BH
System.setProperty("os.name", navigator.userAgent) //BH

System.out = new Clazz._O ();
System.out.__CLASS_NAME__ = "java.io.PrintStream";
System.out.print = function () {};
System.out.printf = function () {};
System.out.println = function () {};
System.out.write = function () {};

System.err = new Clazz._O ();
System.err.__CLASS_NAME__ = "java.io.PrintStream";
System.err.print = function () {};
System.err.printf = function () {};
System.err.println = function () {};
System.err.write = function () {};

Clazz.popup = Clazz.assert = Clazz.log = Clazz.error = window.alert;

Thread = function () {};
Thread.J2S_THREAD = Thread.prototype.J2S_THREAD = new Thread ();
Thread.currentThread = Thread.prototype.currentThread = function () {
	return this.J2S_THREAD;
};

/* not used in Jmol
Clazz.intCast = function (n) { // 32bit
	var b1 = (n & 0xff000000) >> 24;
	var b2 = (n & 0xff0000) >> 16;
	var b3 = (n & 0xff00) >> 8;
	var b4 = n & 0xff;
	if ((b1 & 0x80) != 0) {
		return -(((b1 & 0x7f) << 24) + (b2 << 16) + (b3 << 8) + b4 + 1);
	} else {
		return (b1 << 24) + (b2 << 16) + (b3 << 8) + b4;
	}
};
Clazz.shortCast = function (s) { // 16bit
	var b1 = (n & 0xff00) >> 8;
	var b2 = n & 0xff;
	if ((b1 & 0x80) != 0) {
		return -(((b1 & 0x7f) << 8) + b2 + 1);
	} else {
		return (b1 << 8) + b4;
	}
};

Clazz.byteCast = function (b) { // 8bit
	if ((b & 0x80) != 0) {
		return -((b & 0x7f) + 1);
	} else {
		return b & 0xff;
	}
};

Clazz.charCast = function (c) { // 8bit
	return String.fromCharCode (c & 0xff).charAt (0);
};

Clazz.floatCast = function (f) { // 32bit
	return f;
};

*/


/*
 * Try to fix JavaScript's shift operator defects on long type numbers.
 */

/* not used in Jmol

Clazz.longMasks = [];

Clazz.longReverseMasks = [];

Clazz.longBits = [];

(function () {
	var arr = [1];
	for (var i = 1; i < 53; i++) {
		arr[i] = arr[i - 1] + arr[i - 1]; // * 2 or << 1
	}
	Clazz.longBits = arr;
	Clazz.longMasks[52] = arr[52];
	for (var i = 51; i >= 0; i--) {
		Clazz.longMasks[i] = Clazz.longMasks[i + 1] + arr[i];
	}
	Clazz.longReverseMasks[0] = arr[0];
	for (var i = 1; i < 52; i++) {
		Clazz.longReverseMasks[i] = Clazz.longReverseMasks[i - 1] + arr[i];
	}
}) ();


Clazz.longLeftShift = function (l, o) { // 64bit
	if (o == 0) return l;
	if (o >= 64) return 0;
	if (o > 52) {
		error ("[Java2Script] Error : JavaScript does not support long shift!");
		return l;
	}
	if ((l & Clazz.longMasks[o - 1]) != 0) {
		error ("[Java2Script] Error : Such shift operator results in wrong calculation!");
		return l;
	}
	var high = l & Clazz.longMasks[52 - 32 + o];
	if (high != 0) {
		return high * Clazz.longBits[o] + (l & Clazz.longReverseMasks[32 - o]) << 0;
	} else {
		return l << o;
	}
};

Clazz.intLeftShift = function (n, o) { // 32bit
	return (n << o) & 0xffffffff;
};

Clazz.longRightShift = function (l, o) { // 64bit
	if ((l & Clazz.longMasks[52 - 32]) != 0) {
		return Math.round((l & Clazz.longMasks[52 - 32]) / Clazz.longBits[32 - o]) + (l & Clazz.longReverseMasks[o]) >> o;
	} else {
		return l >> o;
	}
};

Clazz.intRightShift = function (n, o) { // 32bit
	return n >> o; // no needs for this shifting wrapper
};

Clazz.long0RightShift = function (l, o) { // 64bit
	return l >>> o;
};

Clazz.int0RightShift = function (n, o) { // 64bit
	return n >>> o; // no needs for this shifting wrapper
};

*/
// Compress the common public API method in shorter name
//$_L=Clazz.load;
//$_W=Clazz.declareAnonymous;$_T=Clazz.declareType;
//$_J=Clazz.declarePackage;$_C=Clazz.decorateAsClass;
//$_Z=Clazz.instantialize;$_I=Clazz.declareInterface;$_D=Clazz.isClassDefined;
//$_H=Clazz.pu$h;$_P=Clazz.p0p;$_B=Clazz.prepareCallback;
//$_N=Clazz.innerTypeInstance;$_K=Clazz.makeConstructor;$_U=Clazz.superCall;$_R=Clazz.superConstructor;
//$_M=Clazz.defineMethod;$_V=Clazz.overrideMethod;$_S=Clazz.defineStatics;
//$_E=Clazz.defineEnumConstant;
//$_F=Clazz.cloneFinals;
//$_Y=Clazz.prepareFields;$_A=Clazz.newArray;$_O=Clazz.instanceOf;
//$_G=Clazz.inheritArgs;$_X=Clazz.checkPrivateMethod;$_Q=Clazz.makeFunction;
//$_s=Clazz.registerSerializableFields;
//$_k=Clazz.overrideConstructor;


var reflect = Clazz.declarePackage ("java.lang.reflect");
Clazz.declarePackage ("java.security");

Clazz.innerFunctionNames = Clazz.innerFunctionNames.concat (["getSuperclass",
		"isAssignableFrom", "getMethods", "getMethod", "getDeclaredMethods", 
		"getDeclaredMethod", "getConstructor", "getModifiers", /*"isArray",*/ "newInstance"]);

Clazz._innerFunctions.getSuperclass = function () {
	return this.superClazz;	
};
Clazz._innerFunctions.isAssignableFrom = function (clazz) {
	return Clazz.getInheritedLevel (clazz, this) >= 0;	
};
Clazz._innerFunctions.getConstructor = function () {
	return new java.lang.reflect.Constructor (this, [], [], 
			java.lang.reflect.Modifier.PUBLIC);
};
/**
 * TODO: fix bug for polymorphic methods!
 */
Clazz._innerFunctions.getDeclaredMethods = Clazz._innerFunctions.getMethods = function () {
	var ms = [];
	var p = this.prototype;
	for (var attr in p) {
		if (typeof p[attr] == "function" && !p[attr].__CLASS_NAME__) {
			/* there are polynormical methods. */
			ms.push(new java.lang.reflect.Method (this, attr,
					[], java.lang.Void, [], java.lang.reflect.Modifier.PUBLIC));
		}
	}
	p = this;
	for (var attr in p) {
		if (typeof p[attr] == "function" && !p[attr].__CLASS_NAME__) {
			ms.push(new java.lang.reflect.Method (this, attr,
					[], java.lang.Void, [], java.lang.reflect.Modifier.PUBLIC
					| java.lang.reflect.Modifier.STATIC));
		}
	}
	return ms;
};
Clazz._innerFunctions.getDeclaredMethod = Clazz._innerFunctions.getMethod = function (name, clazzes) {
	var p = this.prototype;
	for (var attr in p) {
		if (name == attr && typeof p[attr] == "function" 
				&& !p[attr].__CLASS_NAME__) {
			/* there are polynormical methods. */
			return new java.lang.reflect.Method (this, attr,
					[], java.lang.Void, [], java.lang.reflect.Modifier.PUBLIC);
		}
	}
	p = this;
	for (var attr in p) {
		if (name == attr && typeof p[attr] == "function" 
				&& !p[attr].__CLASS_NAME__) {
			return new java.lang.reflect.Method (this, attr,
					[], java.lang.Void, [], java.lang.reflect.Modifier.PUBLIC
					| java.lang.reflect.Modifier.STATIC);
		}
	}
	return null;
};
Clazz._innerFunctions.getModifiers = function () {
	return java.lang.reflect.Modifier.PUBLIC;
};
//Clazz._innerFunctions.isArray = function () {
//	return false;
//};
Clazz._innerFunctions.newInstance = function () {
	var clz = this;
	return new clz ();
};

//Object.newInstance = Clazz._innerFunctions.newInstance;
;(function(){  // BH added wrapper here
	var inF = Clazz.innerFunctionNames;
	for (var i = 0; i < inF.length; i++) {
		Clazz._O[inF[i]] = Clazz._innerFunctions[inF[i]];
		Array[inF[i]] = Clazz._innerFunctions[inF[i]];
	}
	//Array["isArray"] = function () {
	//	return true;
	//};
})();

/* For hotspot and unloading */

/* private */
Clazz.cleanDelegateMethod = function (m) {
	if (!m) 
		return;
	if (typeof m == "function" && m.lastMethod
			&& m.lastParams && m.lastClaxxRef) {
		m.lastMethod = null;
		m.lastParams = null;
		m.lastClaxxRef = null;
	}
};

/* public */
Clazz.unloadClass = function (qClazzName) {
	var cc = Clazz.evalType (qClazzName);
	if (cc) {
		Clazz.unloadedClasses[qClazzName] = cc;
		var clazzName = qClazzName;
		var pkgFrags = clazzName.split (/\./);
		var pkg = null;
		for (var i = 0; i < pkgFrags.length - 1; i++)
			pkg = (pkg ? pkg[pkgFrags[i]] : Clazz.allPackage[pkgFrags[0]]);
		if (!pkg) {
			Clazz.allPackage[pkgFrags[0]] = null;
			window[pkgFrags[0]] = null;
			// also try to unload inner or anonymous classes
			for (var c in window) {
				if (c.indexOf (qClazzName + "$") == 0) {
					Clazz.unloadClass (c);
					window[c] = null;
				}
			}
		} else {
			pkg[pkgFrags[pkgFrags.length - 1]] = null;
			// also try to unload inner or anonymous classes
			for (var c in pkg) {
				if (c.indexOf (pkgFrags[pkgFrags.length - 1] + "$") == 0) {
					Clazz.unloadClass (pkg.__PKG_NAME__ + "." + c);
					pkg[c] = null;
				}
			}
		}

		if (Clazz.allClasses[qClazzName]) {
			Clazz.allClasses[qClazzName] = false;
			// also try to unload inner or anonymous classes
			for (var c in Clazz.allClasses) {
				if (c.indexOf (qClazzName + "$") == 0) {
					Clazz.allClasses[c] = false;
				}
			}
		}

		for (var m in cc) {
			Clazz.cleanDelegateMethod (cc[m]);
		}
		for (var m in cc.prototype) {
			Clazz.cleanDelegateMethod (cc.prototype[m]);
		}

		if (Clazz._Loader) {
			Clazz._Loader.unloadClassExt (qClazzName);
		}

		return true;
	}
	return false;
};

}
/******************************************************************************
 * Copyright (c) 2007 java2script.org and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Zhou Renjian - initial API and implementation
 *****************************************************************************/
/*******
 * @author zhou renjian
 * @create July 10, 2006
 *******/

//if (window["ClazzNode"] == null) {
/**
 * TODO:
 * Make optimization over class dependency tree.
 */

/*
 * ClassLoader Summary
 * 
 * ClassLoader creates SCRIPT elements and setup class path and onload 
 * callback to continue class loading.
 *
 * In the onload callbacks, ClazzLoader will try to calculate the next-to-be-
 * load *.js and load it. In *.js, it will contains some codes like
 * Clazz.load (..., "$wt.widgets.Control", ...);
 * to provide information to build up the class dependency tree.
 *
 * Some known problems of different browsers:
 * 1. In IE, loading *.js through SCRIPT will first triggers onreadstatechange 
 * event, and then executes inner *.js source.
 * 2. In Firefox, loading *.js will first executes *.js source and then 
 * triggers onload event.
 * 3. In Opera, similar to IE, but trigger onload event. (TODO: More details 
 * should be studied. Currently, Opera supports no multiple-thread-loading)
 * 
 * For class dependency tree, actually, it is not a tree. It is a reference
 * net with nodes have n parents and n children. There is a root, which 
 * ClassLoader knows where to start searching and loading classes, for such
 * a net. Each node is a class. Each class may require a set of must-classes, 
 * which must be loaded before itself getting initialized, and also need a set
 * of optional classes, which also be loaded before being called.
 *
 * The class loading status will be in 6 stages.
 * 1. Unknown, the class is newly introduced by other class.
 * 2. Known, the class is already mentioned by other class.
 * 3. Loaded, *.js source is in memory, but may not be initialized yet. It 
 * requires all its must-classes be intiailized, which is in the next stage.
 * 4. Musts loaded, all must classes is already loaded and declared.
 * 5. Delcared, the class is already declared (ClazzLoader#isClassDefined).
 * 6. Optionals loaded, all optional classes is loaded and declared.
 *
 * The ClassLoader tries to load all necessary classes in order, and intialize
 * them in order. For such job, it will traverse the dependency tree, and try 
 * to next class to-be-loaded. Sometime, the class dependencies may be in one
 * or more cycles, which must be broken down so classes is loaded in correct
 * order.
 *
 * Loading order and intializing order is very important for the ClassLoader.
 * The following technical options are considered:
 * 1. SCRIPT is loading asynchronously, which means controling order must use
 * callback methods to continue.
 * 2. Multiple loading threads are later introduced, which requires the 
 * ClassLoader should use variables to record the class status.
 * 3. Different browsers have different loading orders, which means extra tests
 * should be tested to make sure loading order won't be broken.
 * 4. Java2Script simulator itself have some loading orders that must be 
 * honored, which means it should be integrated seamlessly to Clazz system.
 * 5. Packed *.z.js is introduced to avoid lots of small *.js which requires 
 * lots of HTTP connections, which means that packed *.z.js should be treated
 * specially (There will be mappings for such packed classes).
 * 6. *.js or *.css loading may fail according to network status, which means
 * another loading try should be performed, so ClazzLoader is more robust.
 * 7. SWT lazy loading is later introduced, which means that class loading
 * process may be paused and should be resumed later.
 *
 * Some known bugs:
 * <code>$_L(["$wt.graphics.Drawable","$wt.widgets.Widget"],
 *  "$wt.widgets.Control", ...</code>
 * has errors while must classes in different order such as
 * <code>$_L(["$wt.widgets.Widget", "$wt.graphics.Drawable"],
 *  "$wt.widgets.Control", ...</code>
 * has no error.
 * 
 * Other maybe bug scenarios:
 * 1. In <code>ClazzLoader.maxLoadingThreads = 1;</code> single loading thread 
 * mode, there are no errors, but in default multiple thread loading mode, 
 * there are errors.
 * 2. No errors in one browser, but has errors on other browsers (Browser 
 * script loading order differences).
 * 3. First time loading has errors, but reloading it gets no errors (Maybe 
 * HTTP connections timeout, but should not accur in local file system, or it
 * is a loading bug by using JavaScript timeout thread).
 */

/*
 * The following comments with "#" are special configurations for a much
 * smaller *.js file size.
 *
 * @see net.sf.j2s.lib/src/net/sf/j2s/lib/build/SmartJSCompressor.java
 */
/**
 * Static class loader class
 */
Clazz._Loader = function () {};


/**
 * Class dependency tree node
 */
/* private */
Clazz._Node = function () {
	Clazz._Loader.initNode(this);
};

;(function(Clazz, ClazzLoader, ClazzNode) {
ClazzLoader.initNode = function(node) {
	node.parents = [];
	node.musts = [];
	node.optionals = [];
	node.declaration = null;
	node.name = null; // id
	node.path = null;
	node.requires = null;
	node.requiresMap = null;
	node.onRequiredLoaded = null;
	node.status = 0;
	node.random = 0.13412;
}

ClazzNode.prototype.toString = function () {
	return this.name || this.path || "ClazzNode";
}

ClazzNode.STATUS_UNKNOWN = 0;
ClazzNode.STATUS_KNOWN = 1;
ClazzNode.STATUS_CONTENT_LOADED = 2;
ClazzNode.STATUS_MUSTS_LOADED = 3;
ClazzNode.STATUS_DECLARED = 4;
ClazzNode.STATUS_OPTIONALS_LOADED = 5;
/*# x<< #*/

						 
ClazzLoader.loaders = [];

ClazzLoader.requireLoaderByBase = function (base) {
	for (var i = 0; i < ClazzLoader.loaders.length; i++) {
		if (ClazzLoader.loaders[i].base == base) {
			return ClazzLoader.loaders[i];
		}
	}
	var loader = new ClazzLoader ();
	loader.base = base; 
	ClazzLoader.loaders.push(loader);
	return loader;
};

/**
 * Class dependency tree
 */
ClazzLoader.clazzTreeRoot = new ClazzNode ();

/**
 * Used to keep the status whether a given *.js path is loaded or not.
 */
/* private */
ClazzLoader.loadedScripts = {};

/**
 * Multiple threads are used to speed up *.js loading.
 */
/* private */
ClazzLoader.inLoadingThreads = 0;

/**
 * Maximum of loading threads
 */
/* protected */
ClazzLoader.maxLoadingThreads = 6;

ClazzLoader.userAgent = navigator.userAgent.toLowerCase ();
ClazzLoader.isOpera = (ClazzLoader.userAgent.indexOf ("opera") != -1);
ClazzLoader.isIE = (ClazzLoader.userAgent.indexOf ("msie") != -1) && !ClazzLoader.isOpera;
ClazzLoader.isGecko = (ClazzLoader.userAgent.indexOf ("gecko") != -1);
//ClazzLoader.isChrome = (ClazzLoader.userAgent.indexOf ("chrome") != -1);

/*
 * Opera has different loading order which will result in performance degrade!
 * So just return to single thread loading in Opera!
 *
 * FIXME: This different loading order also causes bugs in single thread!
 */
if (ClazzLoader.isOpera) {
	ClazzLoader.maxLoadingThreads = 1;
	var index = ClazzLoader.userAgent.indexOf ("opera/");
	if (index != -1) {
		var verNumber = 9.0;
		try {
			verNumber = parseFloat(ClazzLoader.userAgent.subString (index + 6));
		} catch (e) {}
		if (verNumber >= 9.6) {
			ClazzLoader.maxLoadingThreads = 6;
		}
	} 
}

/**
 * Try to be compatiable with Clazz system.
 * In original design ClazzLoader and Clazz are independent!
 *  -- zhourenjian @ December 23, 2006
 */
if (window["Clazz"] && Clazz.isClassDefined) {
	ClazzLoader.isClassDefined = Clazz.isClassDefined;
} else {
	ClazzLoader.definedClasses = {};
	ClazzLoader.isClassDefined = function (clazzName) {
		return ClazzLoader.definedClasses[clazzName] == true;
	};
}

/**
 * Expand the shortened list of class names.
 * For example:
 * J.util.Log, $.Display, $.Decorations
 * will be expanded to 
 * J.util.Log, J.util.Display, J.util.Decorations
 * where "$." stands for the previous class name's package.
 *
 * This method will be used to unwrap the required/optional classes list and 
 * the ignored classes list.
 */
/* private */
ClazzLoader.unwrapArray = function (arr) {
	if (!arr || arr.length == 0)
		return [];
	var last = null;
	for (var i = 0; i < arr.length; i++) {
		if (!arr[i])
			continue;
		if (arr[i].charAt (0) == '$') {
			if (arr[i].charAt (1) == '.') {
				if (!last)
					continue;
				var idx = last.lastIndexOf (".");
				if (idx != -1) {
					var prefix = last.substring (0, idx);
					arr[i] = prefix + arr[i].substring (1);
				}
			} else {
				arr[i] = "org.eclipse.s" + arr[i].substring (1);
			}
		}
		last = arr[i];
	}
	return arr;
};

/**
 * Used to keep to-be-loaded classes.
 */
/* private */
ClazzLoader.classQueue = [];

/* private */
ClazzLoader.classpathMap = {};

/* public */
ClazzLoader.loadPackageClasspath = function (pkg, base, isIndex, fSuccess, mode, pt) {
	var map = ClazzLoader.classpathMap;
	mode || (mode = 0);
	fSuccess || (fSuccess = null);
	pt || (pt = 0);

	/*
	 * In some situation, maybe,
	 * ClazzLoader.packageClasspath ("java", ..., true);
	 * is called after other ClazzLoader#packageClasspath, e.g.
	 * <code>
	 * ClazzLoader.packageClasspath ("org.eclipse.swt", "...", true);
	 * ClazzLoader.packageClasspath ("java", "...", true);
	 * </code>
	 * which is not recommended. But ClazzLoader should try to adjust orders
	 * which requires "java" to be declared before normal ClazzLoader
	 * #packageClasspath call before that line! And later that line
	 * should never initialize "java/package.js" again!
	 */
	var isPkgDeclared = (isIndex && map["@" + pkg]);
	if (mode == 0 && isIndex && !map["@java"] && pkg.indexOf ("java") != 0 && ClazzLoader.needPackage("java")) {
		ClazzLoader.loadPackage("java", fSuccess ? function(){ClazzLoader.loadPackageClasspath(pkg, base, isIndex, fSuccess, 1)} : null);
		if (fSuccess)
			return;
	}
	if (pkg instanceof Array) {
		ClazzLoader.unwrapArray(pkg);
		if (fSuccess) {
			if (pt < pkg.length)
				ClazzLoader.loadPackageClasspath (pkg[pt], base, isIndex, function(){ClazzLoader.loadPackageClasspath(pkg, base, isIndex, fSuccess, 1, pt + 1)}, 1);
			else
				fSuccess();
		} else {
			for (var i = 0; i < pkg.length; i++)
				ClazzLoader.loadPackageClasspath (pkg[i], base, isIndex, null);
		}
		return;
	}
	switch (pkg) {
	case "java.*":
		pkg = "java";
		// fall through
	case "java":
		if (base) {
			// support ajax for default
			var key = "@net.sf.j2s.ajax";
			if (!map[key])
				map[key] = base;
			key = "@net.sf.j2s";
			if (!map[key])
				map[key] = base;
		}		
		break;
	case "swt":
		pkg = "org.eclipse.swt";
		break;
	case "ajax":
		pkg = "net.sf.j2s.ajax";
		break;
	case "j2s":
		pkg = "net.sf.j2s";
		break;
	default:
		if (pkg.lastIndexOf(".*") == pkg.length - 2)
			pkg = pkg.substring(0, pkg.length - 2);
		break;
	}
	if (base) // critical for multiple applets
		map["@" + pkg] = base;
	if (isIndex && !isPkgDeclared && !window[pkg + ".registered"]) {
		ClazzLoader.pkgRefCount++;
		if (pkg == "java")
			pkg = "core" // JSmol -- moves java/package.js to core/package.js
		ClazzLoader.loadClass(pkg + ".package", function () {
					if (--ClazzLoader.pkgRefCount == 0)
						ClazzLoader.runtimeLoaded();
					//fSuccess && fSuccess();
				}, true, true, 1);
		return;
	}
	fSuccess && fSuccess();
};

/**
 * Load the given class ant its related classes.
 */
/* public */
ClazzLoader.loadClass = function (name, onRequiredLoaded, forced, async, mode) {

  mode || (mode = 0);
  (async == null) && (async = false);
  
 	if (typeof onRequiredLoaded == "boolean")
		return Clazz.evalType(name);

	// Make sure that ClazzLoader.packageClasspath ("java", base, true); 
	// is called before any ClazzLoader#loadClass is called.

	if (ClazzLoader.needPackage("java"))
		ClazzLoader.loadPackage("java");
	if (ClazzLoader.needPackage("core"))
		ClazzLoader.loadPackage("core");	

//	var swtPkg = "org.eclipse.swt";
//	if (name.indexOf (swtPkg) == 0 || name.indexOf ("$wt") == 0) {
//		ClazzLoader.assurePackageClasspath (swtPkg);
//	}
//	if (name.indexOf ("junit") == 0) {
//		ClazzLoader.assurePackageClasspath ("junit");
//	}

	// Any ClazzLoader#loadClass calls will be queued until java.* core classes are loaded.

	ClazzLoader.keepOnLoading = true;
	
	if (!forced && (ClazzLoader.pkgRefCount && name.lastIndexOf(".package") != name.length - 8
			|| name.indexOf("java.") != 0 && !ClazzLoader.isClassDefined(ClazzLoader.runtimeKeyClass)
		 )) {	
		ClazzLoader.queueBe4KeyClazz.push([name, onRequiredLoaded]);
		return;
	}
	var b;
	if ((b = ClazzLoader.isClassDefined(name)) || ClazzLoader.isClassExcluded(name)) {
		if (b && onRequiredLoaded) {
			var nn = ClazzLoader.findClass(name);
			if (!nn || nn.status >= ClazzNode.STATUS_OPTIONALS_LOADED) {
				if (async) {
					window.setTimeout(onRequiredLoaded, 25);
				} else {
					onRequiredLoaded();
				}
			}
		}
		return;
	}
	
	var path = ClazzLoader.getClasspathFor(name);
	var existed = ClazzLoader.loadedScripts[path];
	var qq = ClazzLoader.classQueue;
	if (!existed)
		for (var i = qq.length; --i >= 0;)
			if (qq[i].path == path || qq[i].name == name) {
				existed = true;
				break;
			}
	if (existed) {
		if (onRequiredLoaded) {
			var n = ClazzLoader.findClass(name);
			if (n) {
				if (!n.onRequiredLoaded) {
					n.onRequiredLoaded = onRequiredLoaded;
				} else if (onRequiredLoaded != n.onRequiredLoaded) {
					n.onRequiredLoaded = (function (nF, oF) { return function () { nF(); oF() };	}) (n.onRequiredLoaded, onRequiredLoaded);
				}
			}
		}
		return;
	}

	var n = (Clazz.unloadedClasses[name] && ClazzLoader.findClass(name) || new ClazzNode());
	n.name = name;
	n.path = path;
	n.isPackage = (path.lastIndexOf("package.js") == path.length - 10);
	ClazzLoader.mappingPathNameNode(path, name, n);
	n.onRequiredLoaded = onRequiredLoaded;
	n.status = ClazzNode.STATUS_KNOWN;
	var needBeingQueued = false;
	for (var i = qq.length; --i >= 0;) {
		if (qq[i].status != ClazzNode.STATUS_OPTIONALS_LOADED) {
			needBeingQueued = true;
			break;
		}
	}
	
	if (n.isPackage) {//forced
		// push class to queue
		var pt = qq.length;
		for (; --pt >= 0;) {
			if (qq[pt].isPackage) 
				break;
			qq[pt + 1] = qq[pt];
		}
		qq[++pt] = n;
	} else if (needBeingQueued) {
		qq.push(n);
	}
	if (!needBeingQueued) { // can be loaded directly
		var bSave = false;
		if (onRequiredLoaded) {	
			bSave = ClazzLoader.isLoadingEntryClass;
			ClazzLoader.isLoadingEntryClass = true;
		}
		ClazzLoader.addChildClassNode(ClazzLoader.clazzTreeRoot, n, true);
		ClazzLoader.loadScript(n.path, n.requiredBy, false, onRequiredLoaded ? function(){ ClazzLoader.isLoadingEntryClass = bSave; onRequiredLoaded()}: null);
	}
};

/*
 * Check whether given package's classpath is setup or not.
 * Only "java" and "org.eclipse.swt" are accepted in argument.
 */
/* private */
ClazzLoader.needPackage = function(pkg) {
  // note that false != null and true != null
	return (window[pkg + ".registered"] != null && !ClazzLoader.classpathMap["@" + pkg]);
}

/* private */
ClazzLoader.loadPackage = function(pkg, fSuccess) {
	fSuccess || (fSuccess = null);
	window[pkg + ".registered"] = false;
	ClazzLoader.loadPackageClasspath(pkg, 
		(ClazzLoader.J2SLibBase || (ClazzLoader.J2SLibBase = (ClazzLoader.getJ2SLibBase() || "j2s/"))), 
		true, fSuccess);
};

ClazzLoader.pkgRefCount = 0;

/**
 * Register classes to a given *.z.js path, so only a single *.z.js is loaded
 * for all those classes.
 */
/* public */
ClazzLoader.jarClasspath = function (jar, clazzes) {
	if (!(clazzes instanceof Array))
		clazzes = [classes];
	ClazzLoader.unwrapArray(clazzes);
	for (var i = clazzes.length; --i >= 0;)
		ClazzLoader.classpathMap["#" + clazzes[i]] = jar;
	ClazzLoader.classpathMap["$" + jar] = clazzes;
};

/**
 * Usually be used in .../package.js. All given packages will be registered
 * to the same classpath of given prefix package.
 */
/* public */
ClazzLoader.registerPackages = function (prefix, pkgs) {
	//ClazzLoader.checkInteractive ();
	var base = ClazzLoader.getClasspathFor (prefix + ".*", true);
	for (var i = 0; i < pkgs.length; i++) {
		if (window["Clazz"]) {
			Clazz.declarePackage (prefix + "." + pkgs[i]);
		}
		ClazzLoader.loadPackageClasspath (prefix + "." + pkgs[i], base);
	}
};

/**
 * Using multiple sites to load *.js in multiple threads. Using multiple
 * sites may avoid 2 HTTP 1.1 connections recommendation limit.
 * Here is a default implementation for http://archive.java2script.org.
 * In site archive.java2script.org, there are 6 sites:
 * 1. http://archive.java2script.org or http://a.java2script.org
 * 2. http://erchive.java2script.org or http://e.java2script.org
 * 3. http://irchive.java2script.org or http://i.java2script.org
 * 4. http://orchive.java2script.org or http://o.java2script.org
 * 5. http://urchive.java2script.org or http://u.java2script.org
 * 6. http://yrchive.java2script.org or http://y.java2script.org
 */
/* protected */
	/*
ClazzLoader.multipleSites = function (path) {
	var deltas = window["j2s.update.delta"];
	if (deltas && deltas instanceof Array && deltas.length >= 3) {
		var lastOldVersion = null;
		var lastNewVersion = null;
		for (var i = 0; i < deltas.length / 3; i++) {
			var oldVersion = deltas[i + i + i];
			if (oldVersion != "$") {
				lastOldVersion = oldVersion;
			}
			var newVersion = deltas[i + i + i + 1];
			if (newVersion != "$") {
				lastNewVersion = newVersion;
			}
			var relativePath = deltas[i + i + i + 2];
			var key = lastOldVersion + "/" + relativePath;
			var idx = path.indexOf (key);
			if (idx != -1 && idx == path.length - key.length) {
				path = path.substring (0, idx) + lastNewVersion + "/" + relativePath;
				break;
			}
		}
	}
	var length = path.length;
	if (ClazzLoader.maxLoadingThreads > 1 
			&& ((length > 15 && path.substring (0, 15) == "http://archive.")
			|| (length > 9 && path.substring (0, 9) == "http://a."))) {
		var index = path.lastIndexOf("/");
		if (index < length - 3) {
			var arr = ['a', 'e', 'i', 'o', 'u', 'y'];
			var c1 = path.charCodeAt (index + 1);
			var c2 = path.charCodeAt (index + 2);
			var idx = (length - index) * 3 + c1 * 5 + c2 * 7; // Hash
			return path.substring (0, 7) + arr[idx % 6] + path.substring (8);
		}
	}
	return path;
};
	*/

/**
 * Return the *.js path of the given class. Maybe the class is contained
 * in a *.z.js jar file.
 * @param clazz Given class that the path is to be calculated for. May
 * be java.package, or java.lang.String
 * @param forRoot Optional argument, if true, the return path will be root
 * of the given classs' package root path.
 * @param ext Optional argument, if given, it will replace the default ".js"
 * extension.
 */
/* public */
ClazzLoader.getClasspathFor = function (clazz, forRoot, ext) {
	var path = ClazzLoader.classpathMap["#" + clazz];
	if (!path || forRoot || ext) {
		var base;
		var idx;
		if (path) {
			clazz = clazz.replace(/\./g, "/");	
			if ((idx = path.lastIndexOf(clazz)) >= 0 
				|| (idx = clazz.lastIndexOf("/")) >= 0 
					&& (idx = path.lastIndexOf(clazz.substring(0, idx))) >= 0)
				base = path.substring(0, idx);
		} else {
			idx = clazz.length + 2;
			while ((idx = clazz.lastIndexOf(".", idx - 2)) >= 0)
				if ((base = ClazzLoader.classpathMap["@" + clazz.substring(0, idx)]))
					break;
			if (!forRoot)
				clazz = clazz.replace (/\./g, "/");	
		}
		if (base == null) {
			var bins = "binaryFolders";
			base = (window["Clazz"] && Clazz[bins] && Clazz[bins].length ? Clazz[bins][0] 
				: ClazzLoader[bins]	&& ClazzLoader[bins].length ? ClazzLoader[bins][0]
				: "j2s");
		}
		path = (base.lastIndexOf("/") == base.length - 1 ? base : base + "/") + (forRoot ? ""
			: clazz.lastIndexOf("/*") == clazz.length - 2 ? clazz.substring(0, idx + 1)
			: clazz + (!ext ? ".js" : ext.charAt(0) != '.' ? "." + ext : ext));
	}		
	return path;//ClazzLoader.multipleSites(path);
};

/* Used to keep ignored classes */
/* private */
ClazzLoader.excludeClassMap = {};

/**
 * To ignore some classes.
 */
/* public */
ClazzLoader.ignore = function () {
	var clazzes = (arguments.length == 1 && arguments[0] instanceof Array ?
			clazzes = arguments[0] : null);
	var n = (clazzes ? clazzes.length : arguments.length);
	if (!clazzes) {
		clazzes = new Array(n);
		for (var i = 0; i < n; i++)
			clazzes[i] = arguments[i];
	}
	ClazzLoader.unwrapArray(clazzes);
	for (var i = 0; i < n; i++)
		ClazzLoader.excludeClassMap["@" + clazzes[i]] = 1;
};

/* private */
ClazzLoader.isClassExcluded = function (clazz) {
	return ClazzLoader.excludeClassMap["@" + clazz];
};

/**
 * The following *.script* can be overriden to indicate the 
 * status of classes loading.
 *
 * TODO: There should be a Java interface with name like INativeLoaderStatus
 */
/* protected */
ClazzLoader.onScriptLoading = function (file){};

/* protected */
ClazzLoader.onScriptLoaded = function (file){};

/* protected */
ClazzLoader.onScriptInitialized = function (file){};

/* protected */
ClazzLoader.onScriptCompleted = function (file){};

/* protected */
ClazzLoader.onClassUnloaded = function (clazz){};

/**
 * After all the classes are loaded, this method will be called.
 * Should be overriden to run *.main([]).
 */
/* protected */
ClazzLoader.onGlobalLoaded = function () {};

/* protected */
ClazzLoader.keepOnLoading = true;

/* private */
ClazzLoader.mapPath2ClassNode = {};

ClazzLoader.evaluate = function(file, js) {
 		try {
			eval(js);
		} catch (e) {
			var s = "[Java2Script] Script error: " + e.message + " \n" + file + "\n\n" + js;
			alert (s)
			Clazz.alert (s);
			throw e;
		}
		ClazzLoader.onScriptLoaded(file);
		ClazzLoader.tryToLoadNext(file);
}

/* protected */
ClazzLoader.failedHandles = {};

/* private */
ClazzLoader.generateRemovingFunction = function (node) {
	return function () {
		if (node.readyState != "interactive") {
			try {
				if (node.parentNode)
					node.parentNode.removeChild (node);
			} catch (e) { }
			node = null;
		}
	};
};

/* private */
ClazzLoader.removeScriptNode = function (n) {
	if (window["j2s.script.debugging"]) {
		return;
	}
	// lazily remove script nodes.
	window.setTimeout (ClazzLoader.generateRemovingFunction (n), 1);
};

/* public */
Clazz._4Name = function(clazzName, applet, state) {
	if (Clazz.isClassDefined(clazzName))
		return Clazz.evalType(clazzName);
	var f = (Jmol._isAsync && applet ? applet._restoreState(clazzName, state) : null);
	if (f == 1)
		return null; // must be already being created
	if (ClazzLoader.setLoadingMode(f ? ClazzLoader.MODE_SCRIPT : "xhr.sync")) {
		ClazzLoader.loadClass(clazzName, f, false, true, 1);
		return null; // this will surely throw an error, but that is OK
	}
	//alert ("Using Java reflection: " + clazzName + " for " + applet._id + " \n"+ Clazz.getStackTrace());
	ClazzLoader.loadClass(clazzName);
	return Clazz.evalType(clazzName);
};

/**
 * Load *.js by adding script elements into head. Hook the onload event to
 * load the next class in dependency tree.
 */
/* protected */
ClazzLoader.loadScript = function (file, why, ignoreOnload, fSuccess) {
		Clazz.currentPath = file;
	// maybe some scripts are to be loaded without needs to know onload event.
	if (!ignoreOnload && ClazzLoader.loadedScripts[file]) {
		ClazzLoader.tryToLoadNext(file);
		return;
	}
	ClazzLoader.loadedScripts[file] = true;
	// also remove from queue
	Clazz.removeArrayItem(ClazzLoader.classQueue, file);

	System.out.println("\t" + file + (why ? "\n -- required by " + why : "") + "  ajax=" + ClazzLoader.isUsingXMLHttpRequest + " async=" + ClazzLoader.isAsynchronousLoading)


	ClazzLoader.onScriptLoading(file);
	if (ClazzLoader.isUsingXMLHttpRequest && !ClazzLoader.isAsynchronousLoading) {
		// alert("\t" + file + (why ? "\n -- required by " + why : "") + "  ajax=" + ClazzLoader.isUsingXMLHttpRequest + " async=" + ClazzLoader.isAsynchronousLoading + " " + Clazz.getStackTrace())
		// synchronous loading
		// works in MSIE locally unless a binary file :)
		// from Jmol.api.Interface only
		
		var data = Jmol._getFileData(file);
		ClazzLoader.evaluate(file, data); 
		return;
	}
	var info = {
		dataType:"script",
		async:true, 
		type:"GET", 
		url:file,
		success:ClazzLoader.W3CScriptOnCallback(file, false, fSuccess),
		error:function(e){ClazzLoader.W3CScriptOnCallback(file, true, fSuccess)}
	};
	ClazzLoader.inLoadingThreads++;
	Jmol.$ajax(info);
};

/* private */
ClazzLoader.W3CScriptOnCallback = function (path, forError, fSuccess) {
	return function () {
		if (forError && Clazz.__debuggingBH)Clazz.alert ("############ forError=" + forError + " path=" + path + " ####" + (forError ? "NOT" : "") + "LOADED###");
		if (ClazzLoader.isGecko && this.timeoutHandle)
			window.clearTimeout(this.timeoutHandle), this.timeoutHandle = null;
		if (ClazzLoader.inLoadingThreads > 0)
			ClazzLoader.inLoadingThreads--;
		//System.out.println("w3ccalback for " + path + " " + ClazzLoader.inLoadingThreads + " threads")
		this.onload = null;
		this.onerror = null;
		if (forError) 
			alert ("There was a problem loading " + path);
		ClazzLoader.onScriptLoaded(path);
		var node = this;			
		var f = function(){	ClazzLoader.removeScriptNode(node); fSuccess && fSuccess()};
		if (ClazzLoader.loadingTimeLag >= 0)
			window.setTimeout(function() { ClazzLoader.tryToLoadNext(path, f); }, ClazzLoader.loadingTimeLag);
		else
			ClazzLoader.tryToLoadNext(path, f);
	};
};

/* private */
ClazzLoader.isLoadingEntryClass = true;

/* private */
ClazzLoader.besidesJavaPackage = false;

/**
 * After class is loaded, this method will be executed to check whether there
 * are classes in the dependency tree that need to be loaded.
 */
/* private */
ClazzLoader.tryToLoadNext = function (file, fSuccess) {
	var node = ClazzLoader.mapPath2ClassNode["@" + file];
	if (!node) // maybe class tree root
		return;
	var n;
	var clazzes = ClazzLoader.classpathMap["$" + file];
	if (clazzes) {
		for (var i = 0; i < clazzes.length; i++) {
			var name = clazzes[i];
			if (name != node.name && (n = ClazzLoader.findClass(name))) {
				if (n.status < ClazzNode.STATUS_CONTENT_LOADED) {
					n.status = ClazzNode.STATUS_CONTENT_LOADED;
					ClazzLoader.updateNode(n);
				}
			} else {
				n = new ClazzNode();
				n.name = name;
				var pp = ClazzLoader.classpathMap["#" + name];
				if (!pp) {
					alert (name + " J2S error in tryToLoadNext");
					error("Java2Script implementation error! Please report this bug!");
				}
				n.path = pp;
				ClazzLoader.mappingPathNameNode (n.path, name, n);
				n.status = ClazzNode.STATUS_CONTENT_LOADED;
				ClazzLoader.addChildClassNode(ClazzLoader.clazzTreeRoot, n, false);
				ClazzLoader.updateNode(n);
			}
		}
	}
	if (node instanceof Array) {
		for (var i = 0; i < node.length; i++) {
			if (node[i].status < ClazzNode.STATUS_CONTENT_LOADED) {
				node[i].status = ClazzNode.STATUS_CONTENT_LOADED;
				ClazzLoader.updateNode(node[i]);
			}
		}
	} else if (node.status < ClazzNode.STATUS_CONTENT_LOADED) {
		var stillLoading = false;
		var ss = document.getElementsByTagName ("SCRIPT");
		for (var i = 0; i < ss.length; i++) {
			if (ClazzLoader.isIE) {
				if (ss[i].onreadystatechange && ss[i].onreadystatechange.path == node.path
						&& ss[i].readyState == "interactive") {
					stillLoading = true;
					break;
				}
			} else if (ss[i].onload && ss[i].onload.path == node.path) {
				stillLoading = true;
				break;
			}
		}
		if (!stillLoading) {
			node.status = ClazzNode.STATUS_CONTENT_LOADED;
			ClazzLoader.updateNode(node);
		}
	}
	/*
	 * Maybe in #optinalLoaded inside above ClazzLoader#updateNode calls, 
	 * ClazzLoader.keepOnLoading is set false (Already loaded the wanted
	 * classes), so here check to stop.
	 */
	 
	if (!ClazzLoader.keepOnLoading)
		return;

	var cq;
	var working = true;
	if ((n = ClazzLoader.findNextMustClass(ClazzNode.STATUS_KNOWN))) {
		ClazzLoader.loadClassNode(n);
		while (ClazzLoader.inLoadingThreads < ClazzLoader.maxLoadingThreads) {
			if (!(n = ClazzLoader.findNextMustClass(ClazzNode.STATUS_KNOWN)))
				break;
			ClazzLoader.loadClassNode(n); // will increase inLoadingThreads!
		}
	} else if ((cq = ClazzLoader.classQueue).length != 0) { 
		/* queue must be loaded in order! */
		n = cq.shift();
		if (!ClazzLoader.loadedScripts[n.path] 
				|| cq.length != 0 
				|| !ClazzLoader.isLoadingEntryClass
				|| n.musts.length
				|| n.optionals.length) {
			ClazzLoader.addChildClassNode(ClazzLoader.clazzTreeRoot, n, true);
			ClazzLoader.loadScript (n.path, n.requiredBy);
		} else if (ClazzLoader.isLoadingEntryClass) {
			/*
			 * The first time reaching here is the time when ClassLoader
			 * is trying to load entry class. Class with #main method and
			 * is to be executed is called Entry Class.
			 *
			 * Here when loading entry class, ClassLoader should not call
			 * the next following loading script. This is because, those
			 * scripts will try to mark the class as loaded directly and
			 * then continue to call #onRequiredLoaded callback method,
			 * which results in an script error!
			 */
			ClazzLoader.isLoadingEntryClass = false;
		}
	} else if ((n = ClazzLoader.findNextRequiredClass(ClazzNode.STATUS_KNOWN))) {
		ClazzLoader.loadClassNode(n);
		while (ClazzLoader.inLoadingThreads < ClazzLoader.maxLoadingThreads) {
			if (!(n = ClazzLoader.findNextRequiredClass(ClazzNode.STATUS_KNOWN)))
				break;
			ClazzLoader.loadClassNode(n); // will increase inLoadingThreads!
		}
	} else {
		working = false;
	}
	if (working || ClazzLoader.inLoadingThreads > 0)
		return;
	var f = [ClazzLoader.findNextMustClass,ClazzLoader.findNextRequiredClass];
	var lastNode = null;
	for (var i = 0; i < 2; i++)
		while ((n = f[i](ClazzNode.STATUS_CONTENT_LOADED))) {
			if (i == 1 && lastNode === n) // Already existed cycle ?
				n.status = ClazzNode.STATUS_OPTIONALS_LOADED;
			ClazzLoader.updateNode(n);
			lastNode = n;
		}
	while (true) {
		ClazzLoader.tracks = [];
		if (!ClazzLoader.checkCycle(ClazzLoader.clazzTreeRoot))
			break;
	}
	for (var i = 0; i < 2; i++) {
		lastNode = null;
		while ((n = f[i](ClazzNode.STATUS_DECLARED))) {
			if (lastNode === n) 
				break;
			ClazzLoader.updateNode(lastNode = n);
		}
	}
	var done = [];
	for (var i = 0; i < 2; i++) 
		while ((n = f[i](ClazzNode.STATUS_DECLARED)))
			done.push(n), n.status = ClazzNode.STATUS_OPTIONALS_LOADED;
	if (done.length) {
		for (var i = 0; i < done.length; i++)
			ClazzLoader.destroyClassNode(done[i]);
		for (var i = 0; i < done.length; i++)
			if ((f = done[i].onRequiredLoaded))
				done[i].onRequiredLoaded = null, f();
	}
	//System.out.println(node.name + " loaded completely" + ClazzLoader.onGlobalLoaded + "\n\n")
	ClazzLoader.onGlobalLoaded();
	fSuccess && fSuccess();
};

ClazzLoader.tracks = [];

/*
 * There are classes reference cycles. Try to detect and break those cycles.
 */
/* private */
ClazzLoader.checkCycle = function (node) {
	var ts = ClazzLoader.tracks;
	var len = ts.length;
	var i = len;
	for (; --i >= 0;)
		if (ts[i] === node && ts[i].status >= ClazzNode.STATUS_DECLARED) 
			break;
	ts.push(node);
	if (i >= 0) {
		var f;
		for (; i < ts.length; i++) {
			ts[i].status = ClazzNode.STATUS_OPTIONALS_LOADED;
			ClazzLoader.destroyClassNode (ts[i]); // Same as above
			for (var k = 0; k < ts[i].parents.length; k++)
				ClazzLoader.updateNode (ts[i].parents[k]);
			ts[i].parents = [];
			if ((f = ts[i].onRequiredLoaded))
				ts[i].onRequiredLoaded = null, f();
		}
		ts.length = 0;
		return true;
	}
	var a = [node.musts, node.optionals];
	for (var j = 0; j < 2; j++)
		for (var r = a[j], i = r.length; --i >= 0;)
			if (r[i].status == ClazzNode.STATUS_DECLARED && ClazzLoader.checkCycle(r[i])) 
				return true;
	ts.length = len;
	return false;
};


/**
 * Update the dependency tree nodes recursively.
 */
/* private */
ClazzLoader.updateNode = function(node) {
	if (!node.name || node.status >= ClazzNode.STATUS_OPTIONALS_LOADED) {
		ClazzLoader.destroyClassNode(node);
		return;
	}
	var ready = true;
	if (node.musts.length && node.declaration) {
		for (var mustLength = node.musts.length, i = mustLength; --i >= 0;) {
			var n = node.musts[i];
			n.requiredBy = node;
			if (n.status < ClazzNode.STATUS_DECLARED && ClazzLoader.isClassDefined (n.name)) {
				var nns = []; // for optional loaded events!
				n.status = ClazzNode.STATUS_OPTIONALS_LOADED;
				ClazzLoader.destroyClassNode(n); // Same as above
				if (n.declaration	&& n.declaration.clazzList) {
					// For those classes within one *.js file, update them synchronously.
					for (var j = 0, list = n.declaration.clazzList, l = list.length; j < l; j++) {
						var nn = ClazzLoader.findClass (list[j]);
						if (nn && nn.status != ClazzNode.STATUS_OPTIONALS_LOADED
								&& nn !== n) {
							nn.status = n.status;
							nn.declaration = null;
							ClazzLoader.destroyClassNode(nn);
							nn.onRequiredLoaded && nns.push(nn);
						}
					}
					n.declaration = null;
				}
				if (n.onRequiredLoaded)
					nns.push(n);
				for (var j = 0; j < nns.length; j++) {
					var optLoaded = nns[j].onRequiredLoaded;
					if (optLoaded) {
						nns[j].onRequiredLoaded = null;
						optLoaded();
					}
				}
			} else {
				n.status == ClazzNode.STATUS_CONTENT_LOADED && ClazzLoader.updateNode(n); // musts may be changed
				if (n.status < ClazzNode.STATUS_DECLARED)
					ready = false;
			}
			if (node.musts.length != mustLength) {
				// length changed -- restart!
				i = mustLength = node.musts.length;
				ready = true;
			}
		}
	}
	if (!ready)
		return;
	if (node.status < ClazzNode.STATUS_DECLARED) {
		var decl = node.declaration;
		if (decl)
			decl(), decl.executed = true;
		node.status = ClazzNode.STATUS_DECLARED;
		if (ClazzLoader.definedClasses)
			ClazzLoader.definedClasses[node.name] = true;
		ClazzLoader.onScriptInitialized(node.path);
		if (node.declaration && node.declaration.clazzList) {
			// For those classes within one *.js file, update them synchronously.
			for (var j = 0, list = node.declaration.clazzList, l = list.length; j < l; j++) {
				var nn = ClazzLoader.findClass(list[j]);
				if (nn && nn.status != ClazzNode.STATUS_DECLARED
						&& nn !== node) {
					nn.status = ClazzNode.STATUS_DECLARED;
					if (ClazzLoader.definedClasses)
						ClazzLoader.definedClasses[nn.name] = true;
					ClazzLoader.onScriptInitialized(nn.path);
				}
			}
		}
	}
	var level = ClazzNode.STATUS_DECLARED;
	if (node.optionals.length == 0 && node.musts.length == 0
			|| node.status > ClazzNode.STATUS_KNOWN && !node.declaration
			|| ClazzLoader.checkStatusIs(node.musts, ClazzNode.STATUS_OPTIONALS_LOADED)
					&& ClazzLoader.checkStatusIs(node.optionals, ClazzNode.STATUS_OPTIONALS_LOADED)) { 
		level = ClazzNode.STATUS_OPTIONALS_LOADED;
		if (!ClazzLoader.doneLoading(node, level))
			return false;
			// For those classes within one *.js file, update them synchronously.
		if (node.declaration && node.declaration.clazzList) {
			for (var j = 0, list = node.declaration.clazzList, l = list.length; j < l; j++) {
				var nn = ClazzLoader.findClass(list[j]);
				if (nn && nn.status != level && nn !== node) {
					nn.declaration = null;
					if (!ClazzLoader.doneLoading(nn, level))
						return false;
				}
			}
		}
	}
	ClazzLoader.updateParents(node, level);
};

/* private */
ClazzLoader.checkStatusIs = function(arr, status){
	for (var i = arr.length; --i >= 0;)
		if (arr[i].status < status)
			return false;
	return true;
}
/* private */
ClazzLoader.doneLoading = function(node, level) {
	node.status = level;
	ClazzLoader.onScriptCompleted(node.path);
	var onLoaded = node.onRequiredLoaded;
	if (onLoaded) {
		node.onRequiredLoaded = null;
		onLoaded();
		if (!ClazzLoader.keepOnLoading)
			return false;
	}
	ClazzLoader.destroyClassNode(node);
	return true;
}

/* private */
ClazzLoader.updateParents = function (node, level) {
	if (!node.parents || node.parents.length == 0)
		return;
	for (var i = 0; i < node.parents.length; i++) {
		var p = node.parents[i];
		if (p.status < level) 
			ClazzLoader.updateNode(p);
	}
	if (level == ClazzNode.STATUS_OPTIONALS_LOADED)
		node.parents = [];
};

/*
 * Be used to record already used random numbers. And next new random
 * number should not be in the property set.
 */
/* private */
ClazzLoader.usedRandoms = {};
ClazzLoader.usedRandoms["r" + 0.13412] = 1;

/* private */
ClazzLoader.getRnd = function() {
	while (true) { // get a unique random number
		var rnd = Math.random();
		var s = "r" + rnd;
		if (!ClazzLoader.usedRandoms[s])
			return (ClazzLoader.usedRandoms[s] = 1, ClazzLoader.clazzTreeRoot.random = rnd);
	}
}

/* protected */
ClazzLoader.findClass = function(clazzName) {
	ClazzLoader.getRnd();
	return ClazzLoader.findClassUnderNode(clazzName, ClazzLoader.clazzTreeRoot);
};

/* private */
ClazzLoader.findNextRequiredClass = function(status) {
	ClazzLoader.getRnd();
	return ClazzLoader.findNextRequiredNode(ClazzLoader.clazzTreeRoot, status);
};

/* private */
ClazzLoader.findNextMustClass = function(status) {
	return ClazzLoader.findNextMustNode(ClazzLoader.clazzTreeRoot, status);
};

/* private */
ClazzLoader.findClassUnderNode = function(clazzName, node) {
	var n;
	// node, then musts then optionals
	return (node.name == clazzName ? node 
		: (n = ClazzLoader.findNodeUnderNode(clazzName, node.musts))
		|| (n = ClazzLoader.findNodeUnderNode(clazzName, node.optionals)) 
		? n : null);
};

/* private */
ClazzLoader.findNodeUnderNode = function(name, arr) {
	var rnd = ClazzLoader.clazzTreeRoot.random;
	for (var i = arr.length; --i >= 0;) {
		var n = arr[i];
		if (n.name == name)
			return n;
		if (n.random != rnd) {
			n.random = rnd;
			if ((n = ClazzLoader.findClassUnderNode(name, n)))
				return n;
		}
	}
	return null;
}

/* private */
ClazzLoader.checkStatus = function(n, status) {
	return (n.status == status 
			&& (status != ClazzNode.STATUS_KNOWN || !ClazzLoader.loadedScripts[n.path])
			&& (status == ClazzNode.STATUS_DECLARED	|| !ClazzLoader.isClassDefined (n.name)));
}

/* private */
ClazzLoader.findNextMustNode = function(node, status) {
	for (var i = node.musts.length; --i >= 0;) {
		var n = node.musts[i];
		if (ClazzLoader.checkStatus(n, status) || (n = ClazzLoader.findNextMustNode(n, status)))
			return n;	
	}
	return (ClazzLoader.checkStatus(node, status) ? node : null); 
};

/* private */
ClazzLoader.findNextRequiredNode = function (node, status) {
	// search musts first
	// search optionals second
	// search itself last
	var n;
	return ((n = ClazzLoader.searchClassArray(node.musts, status))
		|| (n = ClazzLoader.searchClassArray(node.optionals, status))
		|| ClazzLoader.checkStatus(n = node, status) ? n : null);
};

/* private */
ClazzLoader.searchClassArray = function (arr, status) {
	if (arr) {
		var rnd = ClazzLoader.clazzTreeRoot.random;
		for (var i = 0; i < arr.length; i++) {
			var n = arr[i];
			if (ClazzLoader.checkStatus(n, status))
				return n;
			if (n.random != rnd) {
				n.random = rnd; // mark as visited!
				if ((n = ClazzLoader.findNextRequiredNode(n, status)))
					return n;
			}
		}
	}
	return null;
};

/**
 * This map variable is used to mark that *.js is correctly loaded.
 * In IE, ClazzLoader has defects to detect whether a *.js is correctly
 * loaded or not, so inner loading mark is used for detecting.
 */
/* private */
ClazzLoader.innerLoadedScripts = {};

/**
 * This method will be called in almost every *.js generated by Java2Script
 * compiler.
 */
/* protected */
ClazzLoader.load = function (musts, clazz, optionals, declaration) {
  // called as Clazz.load in Jmol
	if (clazz instanceof Array) {
		ClazzLoader.unwrapArray(clazz);
		for (var i = 0; i < clazz.length; i++)
			ClazzLoader.load(musts, clazz[i], optionals, declaration, clazz);
		return;
	}	
//	if (clazz.charAt (0) == '$')
//		clazz = "org.eclipse.s" + clazz.substring (1);
	var node = ClazzLoader.mapPath2ClassNode["#" + clazz];
	if (!node) { // ClazzLoader.load called inside *.z.js?
		var n = ClazzLoader.findClass(clazz);
		node = (n ? n : new ClazzNode());
		node.name = clazz;
		node.path = ClazzLoader.classpathMap["#" + clazz] || "unknown";
		ClazzLoader.mappingPathNameNode (node.path, clazz, node);
		node.status = ClazzNode.STATUS_KNOWN;
		ClazzLoader.addChildClassNode(ClazzLoader.clazzTreeRoot, node, false);
	}
	ClazzLoader.processRequired(node, musts, true);
	if (arguments.length == 5 && declaration) {
		declaration.status = node.status;
		declaration.clazzList = arguments[4];
	}
	node.declaration = declaration;
	if (declaration) 
		node.status = ClazzNode.STATUS_CONTENT_LOADED;
	ClazzLoader.processRequired(node, optionals, false);
};

/* private */
ClazzLoader.processRequired = function(node, arr, isMust) {
	if (arr && arr.length) {
		ClazzLoader.unwrapArray(arr);
		for (var i = 0; i < arr.length; i++) {
			var name = arr[i];
			if (!name)
				continue;
			if (ClazzLoader.isClassDefined(name)
					|| ClazzLoader.isClassExcluded(name))
				continue;
			var n = ClazzLoader.findClass(name);
			if (!n) {
				n = new ClazzNode();
				n.name = name;
				n.status = ClazzNode.STATUS_KNOWN;
			}
			n.requiredBy = node;
			ClazzLoader.addChildClassNode(node, n, isMust);
		}
	}
}

/*
 * Try to be compatiable of Clazz
 */
if (window["Clazz"]) {
	Clazz.load = ClazzLoader.load;
	//if (window["$_L"]) {
	//	$_L = Clazz.load;
	//}
}
/**
 * Map different class to the same path! Many classes may be packed into
 * a *.z.js already.
 *
 * @path *.js path
 * @name class name
 * @node ClazzNode object
 */
/* private */
ClazzLoader.mappingPathNameNode = function (path, name, node) {
	var map = ClazzLoader.mapPath2ClassNode;
	var keyPath = "@" + path;
	var v = map[keyPath];
	if (v) {
		if (v instanceof Array) {
			var existed = false;
			for (var i = 0; i < v.length; i++) {
				if (v[i].name == name) {
					existed = true;
					break;
				}
			}
			if (!existed)
				v.push(node);
		} else {
			map[keyPath] = [v, node];
		}
	} else {
		map[keyPath] = node;
	}
	map["#" + name] = node;
};

/* protected */
ClazzLoader.loadClassNode = function (node) {
	var name = node.name;
	if (!ClazzLoader.isClassDefined (name) 
			&& !ClazzLoader.isClassExcluded (name)) {
		var path = ClazzLoader.getClasspathFor (name/*, true*/);
		node.path = path;
		ClazzLoader.mappingPathNameNode (path, name, node);
		if (!ClazzLoader.loadedScripts[path]) {
			ClazzLoader.loadScript (path, node.requiredBy);
			return true;
		}
	}
	return false;
};


/* protected */
ClazzLoader.runtimeKeyClass = "java.lang.String";

/**
 * Queue used to store classes before key class is loaded.
 */
/* private */
ClazzLoader.queueBe4KeyClazz = [];

/**
 * Return J2SLib base path from existed SCRIPT src attribute.
 */
/* private */
ClazzLoader.getJ2SLibBase = function () {
	var o = window["j2s.lib"];
	return (o ? o.base + (o.alias == "." ? "" : (o.alias ? o.alias : (o.version ? o.version : "1.0.0")) + "/") : null);
};

/**
 * Indicate whether ClazzLoader is loading script synchronously or 
 * asynchronously.
 */
/* protected */
ClazzLoader.isAsynchronousLoading = true;

/* protected */
ClazzLoader.isUsingXMLHttpRequest = false;

/* protected */
ClazzLoader.loadingTimeLag = -1;

ClazzLoader.MODE_SCRIPT = 4;
ClazzLoader.MODE_XHR = 2;
ClazzLoader.MODE_SYNC = 1;

/**
 * String mode:
 * asynchronous modes:
 * async(...).script, async(...).xhr, async(...).xmlhttprequest,
 * script.async(...), xhr.async(...), xmlhttprequest.async(...),
 * script
 * 
 * synchronous modes:
 * sync(...).xhr, sync(...).xmlhttprequest,
 * xhr.sync(...), xmlhttprequest.sync(...),
 * xmlhttprequest, xhr
 *                                                    
 * Integer mode:
 * Script 4; XHR 2; SYNC bit 1; 
 */
/* public */
ClazzLoader.setLoadingMode = function (mode, timeLag) {
	var async = true;
	var ajax = true;
	if (typeof mode == "string") {
		mode = mode.toLowerCase();
		if (mode.indexOf("script") >= 0)
			ajax = false;
		else
			async = (mode.indexOf("async") >=0);
		async = false; // BH
	} else {
		if (mode & ClazzLoader.MODE_SCRIPT)
			ajax = false;
		else
			async = !(mode & ClazzLoader.MODE_SYNC);
	}
	ClazzLoader.isUsingXMLHttpRequest = ajax;
	ClazzLoader.isAsynchronousLoading = async;
	ClazzLoader.loadingTimeLag = (async && timeLag >= 0 ? timeLag: -1);
	return async;
};

/* private */
ClazzLoader.runtimeLoaded = function () {
	if (ClazzLoader.pkgRefCount	|| !ClazzLoader.isClassDefined(ClazzLoader.runtimeKeyClass))
		return;
	var qbs = ClazzLoader.queueBe4KeyClazz;
	for (var i = 0; i < qbs.length; i++)
		ClazzLoader.loadClass (qbs[i][0], qbs[i][1]);
	ClazzLoader.queueBe4KeyClazz = [];
};

/*
 * Load those key *.z.js. This *.z.js will be surely loaded before other 
 * queued *.js.
 */
/* public */
ClazzLoader.loadZJar = function (zjarPath, keyClass) {
// used only by package.js for core.z.js
	var f =	null;
	var isArr = (keyClass instanceof Array);
	if (isArr)
		keyClass = keyClass[keyClass.length - 1];
	else
		f = (keyClass == ClazzLoader.runtimeKeyClass ? ClazzLoader.runtimeLoaded : null);			
	ClazzLoader.jarClasspath(zjarPath, isArr ? keyClass : [keyClass]);
	// BH note: ClazzLoader.runtimeKeyClass is java.lang.String	
	ClazzLoader.loadClass(keyClass, f, true);
};

ClazzLoader._nodeMap = {};
ClazzLoader._allNodes = [];

/**
 * The method help constructing the multiple-binary class dependency tree.
 */
/* private */
ClazzLoader.addChildClassNode = function (parent, child, isMust) {
	var existed = false;
	var arr;
	if (isMust) {
		arr = parent.musts;
		if (!child.requiredBy)
			child.requiredBy = parent;
		if (!parent.requires){
			parent.requires = [];
			parent.requiresMap = {};
		}
		if (!parent.requiresMap[child.name]) {
			parent.requiresMap[child.name] = 1;
			parent.requires.push[child];
		}
	} else {
		arr = parent.optionals;
	}
	if (!ClazzLoader._nodeMap[child.name]) {
		ClazzLoader._allNodes.push(child)
		ClazzLoader._nodeMap[child.name]=child
	}
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].name == child.name) {
			existed = true;
			break;
		}
	}
	if (!existed) {
		arr.push(child);
		if (ClazzLoader.isLoadingEntryClass 
				&& child.name.indexOf("java") != 0 
				&& child.name.indexOf("net.sf.j2s.ajax") != 0) {
			if (ClazzLoader.besidesJavaPackage)
				ClazzLoader.isLoadingEntryClass = false;
			ClazzLoader.besidesJavaPackage = true;
//		} else if (child.name.indexOf("org.eclipse.swt") == 0 
//				|| child.name.indexOf("$wt") == 0) {
//			window["swt.lazy.loading.callback"] = ClazzLoader.swtLazyLoading;
//			if (ClazzLoader.needPackage("org.eclipse.swt"))
//				return ClazzLoader.loadPackage("org.eclipse.swt", function() {ClazzLoader.addParentClassNode(child, parent)});
		}
	}
	ClazzLoader.addParentClassNode(child, parent);
};

ClazzLoader.addParentClassNode = function(child, parent) {
	if (parent.name && parent != ClazzLoader.clazzTreeRoot && parent != child)
		for (var i = 0; i < child.parents.length; i++)
			if (child.parents[i].name == parent.name)
				return;
	child.parents.push(parent);
}

/* private */
ClazzLoader.destroyClassNode = function (node) {
	var parents = node.parents;
	if (parents)
		for (var k = parents.length; --k >= 0;)
			Clazz.removeArrayItem(parents[k].musts, node) || Clazz.removeArrayItem(parents[k].optionals, node);
};

/* protected */
ClazzLoader.unloadClassExt = function (qClazzName) {
	if (ClazzLoader.definedClasses)
		ClazzLoader.definedClasses[qClazzName] = false;
	if (ClazzLoader.classpathMap["#" + qClazzName]) {
		var pp = ClazzLoader.classpathMap["#" + qClazzName];
		ClazzLoader.classpathMap["#" + qClazzName] = null;
		var arr = ClazzLoader.classpathMap["$" + pp];
		Clazz.removeArrayItem(arr, qClazzName) && (ClazzLoader.classpathMap["$" + pp] = arr);
	}
	var n = ClazzLoader.findClass (qClazzName);
	if (n) {
		n.status = ClazzNode.STATUS_KNOWN;
		ClazzLoader.loadedScripts[n.path] = false;
	}
	var path = ClazzLoader.getClasspathFor (qClazzName);
	ClazzLoader.loadedScripts[path] = false;
	ClazzLoader.innerLoadedScripts[path] && (ClazzLoader.innerLoadedScripts[path] = false);
	ClazzLoader.onClassUnloaded(qClazzName);
};

/* protected */
ClazzLoader.assureInnerClass = function (clzz, fun) {
	clzz = clzz.__CLASS_NAME__;
	if (Clazz.unloadedClasses[clzz]) {
		if (clzz.indexOf("$") >= 0)
			return;
		var list = [];
		var key = clzz + "$";
		for (var s in Clazz.unloadedClasses)
			if (Clazz.unloadedClasses[s] && s.indexOf(key) == 0)
				list.push(s);
		if (!list.length) 
			return;
		fun = "" + fun;
		var idx1, idx2;
		if ((idx1 = fun.indexOf(key)) < 0 || (idx2 = fun.indexOf("\"", idx1 + key.length)) < 0) 
			return;
		clzz = fun.substring(idx1, idx2);
		if (!Clazz.unloadedClasses[clzz] || (idx1 = fun.indexOf("{", idx2) + 1) == 0)
			return;
		if ((idx2 = fun.indexOf("(" + clzz + ",", idx1 + 3)) < 0
			|| (idx2 = fun.lastIndexOf("}", idx2 - 1)) < 0)
				return;
		eval(fun.substring(idx1, idx2));
		Clazz.unloadedClasses[clzz] = null;
	}
};

Clazz.binaryFolders =  ClazzLoader.binaryFolders = [ ClazzLoader.getJ2SLibBase() ];

})(Clazz, Clazz._Loader, Clazz._Node);

//}
/******************************************************************************
 * Copyright (c) 2007 java2script.org and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Zhou Renjian - initial API and implementation
 *****************************************************************************/
/*******
 * @author zhou renjian
 * @create Jan 11, 2007
 *******/

Clazz._LoaderProgressMonitor = function() {};

;(function(clpm) {
clpm.fadeOutTimer = null;
clpm.fadeAlpha = 0;
clpm.monitorEl = null;
clpm.lastScrollTop = 0;
clpm.bindingParent = null;
clpm.DEFAULT_OPACITY = (self.Jmol && Jmol._j2sLoadMonitorOpacity ? Jmol._j2sLoadMonitorOpacity : 55);

/* private static */ 
clpm.clearChildren = function (el) {
	if (!el)
		return;
	for (var i = el.childNodes.length; --i >= 0;) {
		var child = el.childNodes[i];
		if (!child)
			continue;
		if (child.childNodes && child.childNodes.length)
			this.clearChildren (child);
		try {
			el.removeChild (child);
		} catch (e) {};
	}
};
/* private */ clpm.setAlpha = function (alpha) {
	if (this.fadeOutTimer && alpha == this.DEFAULT_OPACITY) {
		window.clearTimeout (this.fadeOutTimer);
		this.fadeOutTimer = null;
	}
	this.fadeAlpha = alpha;
	var ua = navigator.userAgent.toLowerCase ();
	this.monitorEl.style.filter = "Alpha(Opacity=" + alpha + ")";
	this.monitorEl.style.opacity = alpha / 100.0;
};
/* private */ clpm.hiddingOnMouseOver = function () {
	this.style.display = "none";
};
/* private */ clpm.attached = false;
/* private */ clpm.cleanup = function () {
	var oThis = clpm;
	//if (oThis.monitorEl) {
	//	oThis.monitorEl.onmouseover = null;
	//}
	oThis.monitorEl = null;
	oThis.bindingParent = null;
	//Clazz.removeEvent (window, "unload", oThis.cleanup);
	//window.detachEvent ("onunload", oThis.cleanup);
	oThis.attached = false;
};
/* private */ clpm.createHandle = function () {
	var div = document.createElement ("DIV");
	div.id = "clazzloader-status";
	div.style.cssText = "position:absolute;bottom:4px;left:4px;padding:2px 8px;"
			+ "z-index:" + (window["j2s.lib"].monitorZIndex || 10000) + ";background-color:#8e0000;color:yellow;" 
			+ "font-family:Arial, sans-serif;font-size:10pt;white-space:nowrap;";
	div.onmouseover = this.hiddingOnMouseOver;
	this.monitorEl = div;
	if (this.bindingParent) {
		this.bindingParent.appendChild (div);
	} else {
		document.body.appendChild (div);
	}
	return div;
};
/* private */ clpm.fadeOut = function () {
	if (this.monitorEl.style.display == "none") return;
	if (this.fadeAlpha == this.DEFAULT_OPACITY) {
		this.fadeOutTimer = window.setTimeout (function () {
					clpm.fadeOut ();
				}, 750);
		this.fadeAlpha -= 5;
	} else if (this.fadeAlpha - 10 >= 0) {
		this.setAlpha (this.fadeAlpha - 10);
		this.fadeOutTimer = window.setTimeout (function () {
					clpm.fadeOut ();
				}, 40);
	} else {
		this.monitorEl.style.display = "none";
	}
};
/* private */ clpm.getFixedOffsetTop = function (){
	if (this.bindingParent) {
		var b = this.bindingParent;
		return b.scrollTop;
	}
	var dua = navigator.userAgent;
	var b = document.body;
	var p = b.parentNode;
	var pcHeight = p.clientHeight;
	var bcScrollTop = b.scrollTop + b.offsetTop;
	var pcScrollTop = p.scrollTop + p.offsetTop;
	return (dua.indexOf("Opera") < 0 && document.all ? (pcHeight == 0 ? bcScrollTop : pcScrollTop)
		: dua.indexOf("Gecko") < 0 ? (pcHeight == p.offsetHeight 
				&& pcHeight == p.scrollHeight ? bcScrollTop : pcScrollTop) : bcScrollTop);
};
/* public */
/*clpm.initialize = function (parent) {
	this.bindingParent = parent;
	if (parent && !this.attached) {
		this.attached = true;
		//Clazz.addEvent (window, "unload", this.cleanup);
		// window.attachEvent ("onunload", this.cleanup);
	}
};
*/
/* public */
clpm.showStatus = function (msg, fading) {
	if (!this.monitorEl) {
		this.createHandle ();
		if (!this.attached) {
			this.attached = true;
			//Clazz.addEvent (window, "unload", this.cleanup);
			// window.attachEvent ("onunload", this.cleanup);
		}
	}
	this.clearChildren (this.monitorEl);
	this.monitorEl.appendChild (document.createTextNode ("" + msg));
	if (this.monitorEl.style.display == "none") {
		this.monitorEl.style.display = "";
	}
	this.setAlpha (this.DEFAULT_OPACITY);
	var offTop = this.getFixedOffsetTop ();
	if (this.lastScrollTop != offTop) {
		this.lastScrollTop = offTop;
		this.monitorEl.style.bottom = (this.lastScrollTop + 4) + "px";
	}
	if (fading) {
		this.fadeOut();
	}
};

if (window["ClazzLoader"]) {
	ClazzLoader.onScriptLoading = function(file) {
		clpm.showStatus("Loading " + file + "...");
	};
	ClazzLoader.onScriptLoaded = function(file) {
		clpm.showStatus(file + " loaded.", true);
	};
	ClazzLoader.onGlobalLoaded = function(file) {
		clpm.showStatus("Application loaded.", true);
	};
	ClazzLoader.onClassUnloaded = function(clazz) {
		clpm.showStatus("Class " + clazz + " is unloaded.", true);
	};
}

})(Clazz._LoaderProgressMonitor);

//}
/******************************************************************************
 * Copyright (c) 2007 java2script.org and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Zhou Renjian - initial API and implementation
 *****************************************************************************/
/*******
 * @author zhou renjian
 * @create Nov 5, 2005
 *******/

(function(Con, Sys) {
/**
 * Setting maxTotalLines to -1 will not limit the console result
 */
/* protected */
Con.maxTotalLines =	10000;

/* protected */
Con.setMaxTotalLines = function (lines) {
	Con.maxTotalLines = (lines > 0 ? lines : 999999);
}

/* protected */
Con.maxLatency = 40;

/* protected */
Con.setMaxLatency = function (latency) {
	Con.maxLatency = (latency > 0 ? latency : 40);
};

/* protected */
Con.pinning  = false;

/* protected */
Con.enablePinning = function (enabled) {
	Con.pinning = enabled;
};

/* private */
Con.linesCount = 0;

/* private */
Con.metLineBreak = false;


/*
 * Give an extension point so external script can create and bind the console
 * themself.
 *
 * TODO: provide more template of binding console window to browser.
 */
/* protected */
Con.createConsoleWindow = function (parentEl) {
	var console = document.createElement ("DIV");
	console.style.cssText = "font-family:monospace, Arial, sans-serif;";
	document.body.appendChild (console);
	return console;
};

/* protected */
Con.consoleOutput = function (s, color) {
	var o = window["j2s.lib"];
	var console = (o && o.console);
	if (console && typeof console == "string")
		console = document.getElementById(console)
	if (!console)
		return false; // BH this just means we have turned off all console action
	if (Con.linesCount > Con.maxTotalLines) {
		for (var i = 0; i < Con.linesCount - Con.maxTotalLines; i++) {
			if (console && console.childNodes.length > 0) {
				console.removeChild (console.childNodes[0]);
			}
		}
		Con.linesCount = Con.maxTotalLines;
	}

	var willMeetLineBreak = false;
	s = (typeof s == "undefined" ? "" : s == null ? "null" : "" + s);
	s = s.replace (/\t/g, Con.c160);
	if (s.length > 0)
		switch (s.charAt(s.length - 1)) {
		case '\n':
		case '\r':
			s = (s.length > 1 ? s.substring (0, s.length - (s.charAt (s.length - 2) == '\r' ? 2 : 1)) : "");
			willMeetLineBreak = true;
			break;
		}

	var lines = null;
	s = s.replace (/\t/g, Con.c160);
	lines = s.split(/\r\n|\r|\n/g);
	for (var i = 0, last = lines.length - 1; i <= last; i++) {
		var lastLineEl = null;
		if (Con.metLineBreak || Con.linesCount == 0 
				|| console.childNodes.length < 1) {
			lastLineEl = document.createElement ("DIV");
			console.appendChild (lastLineEl);
			lastLineEl.style.whiteSpace = "nowrap";
			Con.linesCount++;
		} else {
			try {
				lastLineEl = console.childNodes[console.childNodes.length - 1];
			} catch (e) {
				lastLineEl = document.createElement ("DIV");
				console.appendChild (lastLineEl);
				lastLineEl.style.whiteSpace = "nowrap";
				Con.linesCount++;
			}
		}
		var el = document.createElement ("SPAN");
		lastLineEl.appendChild (el);
		el.style.whiteSpace = "nowrap";
		if (color)
			el.style.color = color;
		var l = lines[i]
		if (l.length == 0)
			l = Con.c160;
		el.appendChild(document.createTextNode(l));
		if (!Con.pinning)
			console.scrollTop += 100;
		Con.metLineBreak = (i != last || willMeetLineBreak);
	}

	var cssClazzName = console.parentNode.className;
	if (!Con.pinning && cssClazzName
			&& cssClazzName.indexOf ("composite") != -1) {
		console.parentNode.scrollTop = console.parentNode.scrollHeight;
	}
	Con.lastOutputTime = new Date ().getTime ();
};

/*
 * Clear all contents inside the console.
 */
/* public */
Con.clear = function () {
	try {
		Con.metLineBreak = true;
		var o = window["j2s.lib"];
		var console = o && o.console;
		if (!console || !(console = document.getElementById (console)))
			return;
		var childNodes = console.childNodes;
		for (var i = childNodes.length; --i >= 0;)
			console.removeChild (childNodes[i]);
		Con.linesCount = 0;
	} catch(e){};
};

/* public */
Clazz.alert = function (s) {
	Con.consoleOutput (s + "\r\n");
};

Con.c160 = String.fromCharCode(160); //nbsp;
Con.c160 += Con.c160+Con.c160+Con.c160;


/* public */
Sys.out.print = function (s) { 
	Con.consoleOutput (s);
};

/* public */
Sys.out.println = function(s) {
	Con.consoleOutput(typeof s == "undefined" ? "\r\n" : s == null ?  s = "null\r\n" : s + "\r\n");
};

Sys.out.write = function (buf, offset, len) {
	Sys.out.print(String.instantialize(buf).substring(offset, offset+len));
};

/* public */
Sys.err.__CLASS_NAME__ = "java.io.PrintStream";

/* public */
Sys.err.print = function (s) { 
	Con.consoleOutput (s, "red");
};

/* public */
Sys.err.println = function (s) {
	Con.consoleOutput (typeof s == "undefined" ? "\r\n" : s == null ?  s = "null\r\n" : s + "\r\n", "red");
};

Sys.err.write = function (buf, offset, len) {
	Sys.err.print(String.instantialize(buf).substring(offset, offset+len));
};

})(Clazz.Console, System);

})(Clazz);

};
