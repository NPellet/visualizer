  1 ﻿/*
  2 Copyright (c) 2003-2012, CKSource - Frederico Knabben. All rights reserved.
  3 For licensing, see LICENSE.html or http://ckeditor.com/license
  4 */
  5 
  6 /**
  7  * @fileOverview jQuery adapter provides easy use of basic CKEditor functions
  8  *   and access to internal API. It also integrates some aspects of CKEditor with
  9  *   jQuery framework.
 10  *
 11  * Every TEXTAREA, DIV and P elements can be converted to working editor.
 12  *
 13  * Plugin exposes some of editor's event to jQuery event system. All of those are namespaces inside
 14  * ".ckeditor" namespace and can be binded/listened on supported textarea, div and p nodes.
 15  *
 16  * Available jQuery events:
 17  * - instanceReady.ckeditor( editor, rootNode )
 18  *   Triggered when new instance is ready.
 19  * - destroy.ckeditor( editor )
 20  *   Triggered when instance is destroyed.
 21  * - getData.ckeditor( editor, eventData )
 22  *   Triggered when getData event is fired inside editor. It can change returned data using eventData reference.
 23  * - setData.ckeditor( editor )
 24  *   Triggered when getData event is fired inside editor.
 25  *
 26  * @example
 27  * <script src="jquery.js"></script>
 28  * <script src="ckeditor.js"></script>
 29  * <script src="adapters/jquery/adapter.js"></script>
 30  */
 31 
 32 (function()
 33 {
 34 	/**
 35 	 * Allows CKEditor to override jQuery.fn.val(), making it possible to use the val()
 36 	 * function on textareas, as usual, having it synchronized with CKEditor.<br>
 37 	 * <br>
 38 	 * This configuration option is global and executed during the jQuery Adapter loading.
 39 	 * It can't be customized across editor instances.
 40 	 * @type Boolean
 41 	 * @example
 42 	 * <script>
 43 	 * CKEDITOR.config.jqueryOverrideVal = true;
 44 	 * </script>
 45 	 * <!-- Important: The JQuery adapter is loaded *after* setting jqueryOverrideVal -->
 46 	 * <script src="/ckeditor/adapters/jquery.js"></script>
 47 	 * @example
 48 	 * // ... then later in the code ...
 49 	 *
 50 	 * $( 'textarea' ).ckeditor();
 51 	 * // ...
 52 	 * $( 'textarea' ).val( 'New content' );
 53 	 */
 54 	CKEDITOR.config.jqueryOverrideVal = typeof CKEDITOR.config.jqueryOverrideVal == 'undefined'
 55 		? true : CKEDITOR.config.jqueryOverrideVal;
 56 
 57 	var jQuery = window.jQuery;
 58 
 59 	if ( typeof jQuery == 'undefined' )
 60 		return;
 61 
 62 	// jQuery object methods.
 63 	jQuery.extend( jQuery.fn,
 64 	/** @lends jQuery.fn */
 65 	{
 66 		/**
 67 		 * Return existing CKEditor instance for first matched element.
 68 		 * Allows to easily use internal API. Doesn't return jQuery object.
 69 		 *
 70 		 * Raised exception if editor doesn't exist or isn't ready yet.
 71 		 *
 72 		 * @name jQuery.ckeditorGet
 73 		 * @return CKEDITOR.editor
 74 		 * @see CKEDITOR.editor
 75 		 */
 76 		ckeditorGet: function()
 77 		{
 78 			var instance = this.eq( 0 ).data( 'ckeditorInstance' );
 79 			if ( !instance )
 80 				throw "CKEditor not yet initialized, use ckeditor() with callback.";
 81 			return instance;
 82 		},
 83 		/**
 84 		 * Triggers creation of CKEditor in all matched elements (reduced to DIV, P and TEXTAREAs).
 85 		 * Binds callback to instanceReady event of all instances. If editor is already created, than
 86 		 * callback is fired right away.
 87 		 *
 88 		 * Mixed parameter order allowed.
 89 		 *
 90 		 * @param callback Function to be run on editor instance. Passed parameters: [ textarea ].
 91 		 * Callback is fiered in "this" scope being ckeditor instance and having source textarea as first param.
 92 		 *
 93 		 * @param config Configuration options for new instance(s) if not already created.
 94 		 * See URL
 95 		 *
 96 		 * @example
 97 		 * $( 'textarea' ).ckeditor( function( textarea ) {
 98 		 *   $( textarea ).val( this.getData() )
 99 		 * } );
100 		 *
101 		 * @name jQuery.fn.ckeditor
102 		 * @return jQuery.fn
103 		 */
104 		ckeditor: function( callback, config )
105 		{
106 			if ( !CKEDITOR.env.isCompatible )
107 				return this;
108 
109 			if ( !jQuery.isFunction( callback ))
110 			{
111 				var tmp = config;
112 				config = callback;
113 				callback = tmp;
114 			}
115 			config = config || {};
116 
117 			this.filter( 'textarea, div, p' ).each( function()
118 			{
119 				var $element = jQuery( this ),
120 					editor = $element.data( 'ckeditorInstance' ),
121 					instanceLock = $element.data( '_ckeditorInstanceLock' ),
122 					element = this;
123 
124 				if ( editor && !instanceLock )
125 				{
126 					if ( callback )
127 						callback.apply( editor, [ this ] );
128 				}
129 				else if ( !instanceLock )
130 				{
131 					// CREATE NEW INSTANCE
132 
133 					// Handle config.autoUpdateElement inside this plugin if desired.
134 					if ( config.autoUpdateElement
135 						|| ( typeof config.autoUpdateElement == 'undefined' && CKEDITOR.config.autoUpdateElement ) )
136 					{
137 						config.autoUpdateElementJquery = true;
138 					}
139 
140 					// Always disable config.autoUpdateElement.
141 					config.autoUpdateElement = false;
142 					$element.data( '_ckeditorInstanceLock', true );
143 
144 					// Set instance reference in element's data.
145 					editor = CKEDITOR.replace( element, config );
146 					$element.data( 'ckeditorInstance', editor );
147 
148 					// Register callback.
149 					editor.on( 'instanceReady', function( event )
150 					{
151 						var editor = event.editor;
152 						setTimeout( function()
153 						{
154 							// Delay bit more if editor is still not ready.
155 							if ( !editor.element )
156 							{
157 								setTimeout( arguments.callee, 100 );
158 								return;
159 							}
160 
161 							// Remove this listener.
162 							event.removeListener( 'instanceReady', this.callee );
163 
164 							// Forward setData on dataReady.
165 							editor.on( 'dataReady', function()
166 							{
167 								$element.trigger( 'setData' + '.ckeditor', [ editor ] );
168 							});
169 
170 							// Forward getData.
171 							editor.on( 'getData', function( event ) {
172 								$element.trigger( 'getData' + '.ckeditor', [ editor, event.data ] );
173 							}, 999 );
174 
175 							// Forward destroy event.
176 							editor.on( 'destroy', function()
177 							{
178 								$element.trigger( 'destroy.ckeditor', [ editor ] );
179 							});
180 
181 							// Integrate with form submit.
182 							if ( editor.config.autoUpdateElementJquery && $element.is( 'textarea' ) && $element.parents( 'form' ).length )
183 							{
184 								var onSubmit = function()
185 								{
186 									$element.ckeditor( function()
187 									{
188 										editor.updateElement();
189 									});
190 								};
191 
192 								// Bind to submit event.
193 								$element.parents( 'form' ).submit( onSubmit );
194 
195 								// Bind to form-pre-serialize from jQuery Forms plugin.
196 								$element.parents( 'form' ).bind( 'form-pre-serialize', onSubmit );
197 
198 								// Unbind when editor destroyed.
199 								$element.bind( 'destroy.ckeditor', function()
200 								{
201 									$element.parents( 'form' ).unbind( 'submit', onSubmit );
202 									$element.parents( 'form' ).unbind( 'form-pre-serialize', onSubmit );
203 								});
204 							}
205 
206 							// Garbage collect on destroy.
207 							editor.on( 'destroy', function()
208 							{
209 								$element.data( 'ckeditorInstance', null );
210 							});
211 
212 							// Remove lock.
213 							$element.data( '_ckeditorInstanceLock', null );
214 
215 							// Fire instanceReady event.
216 							$element.trigger( 'instanceReady.ckeditor', [ editor ] );
217 
218 							// Run given (first) code.
219 							if ( callback )
220 								callback.apply( editor, [ element ] );
221 						}, 0 );
222 					}, null, null, 9999);
223 				}
224 				else
225 				{
226 					// Editor is already during creation process, bind our code to the event.
227 					CKEDITOR.on( 'instanceReady', function( event )
228 					{
229 						var editor = event.editor;
230 						setTimeout( function()
231 						{
232 							// Delay bit more if editor is still not ready.
233 							if ( !editor.element )
234 							{
235 								setTimeout( arguments.callee, 100 );
236 								return;
237 							}
238 
239 							if ( editor.element.$ == element )
240 							{
241 								// Run given code.
242 								if ( callback )
243 									callback.apply( editor, [ element ] );
244 							}
245 						}, 0 );
246 					}, null, null, 9999);
247 				}
248 			});
249 			return this;
250 		}
251 	});
252 
253 	// New val() method for objects.
254 	if ( CKEDITOR.config.jqueryOverrideVal )
255 	{
256 		jQuery.fn.val = CKEDITOR.tools.override( jQuery.fn.val, function( oldValMethod )
257 		{
258 			/**
259 			 * CKEditor-aware val() method.
260 			 *
261 			 * Acts same as original jQuery val(), but for textareas which have CKEditor instances binded to them, method
262 			 * returns editor's content. It also works for settings values.
263 			 *
264 			 * @param oldValMethod
265 			 * @name jQuery.fn.val
266 			 */
267 			return function( newValue, forceNative )
268 			{
269 				var isSetter = typeof newValue != 'undefined',
270 					result;
271 
272 				this.each( function()
273 				{
274 					var $this = jQuery( this ),
275 						editor = $this.data( 'ckeditorInstance' );
276 
277 					if ( !forceNative && $this.is( 'textarea' ) && editor )
278 					{
279 						if ( isSetter )
280 							editor.setData( newValue );
281 						else
282 						{
283 							result = editor.getData();
284 							// break;
285 							return null;
286 						}
287 					}
288 					else
289 					{
290 						if ( isSetter )
291 							oldValMethod.call( $this, newValue );
292 						else
293 						{
294 							result = oldValMethod.call( $this );
295 							// break;
296 							return null;
297 						}
298 					}
299 
300 					return true;
301 				});
302 				return isSetter ? this : result;
303 			};
304 		});
305 	}
306 })();
307 