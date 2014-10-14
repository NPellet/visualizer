/*!
 * jsGraphs JavaScript Graphing Library v@VERSION
 * http://github.com/NPellet/jsGraphs
 *
 * Copyright 2014 Norman Pellet
 * Released under the MIT license
 *
 * Date: @DATE
 */

(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		
		module.exports = factory( global );
			
	} else {

		factory( global );

	}

// Pass this if window is not defined yet
}( ( typeof window !== "undefined" ? window : this ) , function( window ) {

	"use strict";

	var Graph = function( $ ) {

		var build = [ ];

		build[ './jquery' ] = $;
