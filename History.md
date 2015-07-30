<a name="2.26.1"></a>
## 2.26.1 (2015-07-30)


### Bug Fixes

* **jsgraph:** fix bug with 1d xy arrays ([0fd2145](https://github.com/NPellet/visualizer/commit/0fd2145)), closes [#656](https://github.com/NPellet/visualizer/issues/656) [#659](https://github.com/NPellet/visualizer/issues/659) [#661](https://github.com/NPellet/visualizer/issues/661)



<a name="2.26.0"></a>
# 2.26.0 (2015-07-29)


### Bug Fixes

* **code_executor:** run code in current window ([c716eff](https://github.com/NPellet/visualizer/commit/c716eff))
* **datas:** fetch can fail ([47ad16b](https://github.com/NPellet/visualizer/commit/47ad16b))
* **onde:** :arrow_up: onde (remove logs) ([2eb72cc](https://github.com/NPellet/visualizer/commit/2eb72cc))
* **slickgrid:** :arrow_up: slickgrid ([40b9876](https://github.com/NPellet/visualizer/commit/40b9876)), closes [#458](https://github.com/NPellet/visualizer/issues/458)
* :arrow_up: jsgraph@v1.12.4-4 ([c142f32](https://github.com/NPellet/visualizer/commit/c142f32))
* **slickgrid:** avoid layout problem when shrinking height of the module ([6b371e5](https://github.com/NPellet/visualizer/commit/6b371e5)), closes [#648](https://github.com/NPellet/visualizer/issues/648)
* ignore errors when pasting ([2989a15](https://github.com/NPellet/visualizer/commit/2989a15))
* initialize mousetracker state to  'grid' ([26d3b8a](https://github.com/NPellet/visualizer/commit/26d3b8a))
* **slickgrid:** correct error when resizing column ([7c902dc](https://github.com/NPellet/visualizer/commit/7c902dc)), closes [#655](https://github.com/NPellet/visualizer/issues/655)
* **slickgrid:** fix breaking change. Could not create slickgrid module. ([d638721](https://github.com/NPellet/visualizer/commit/d638721))
* **slickgrid:** only consider configuration columns that have a name ([c1191dc](https://github.com/NPellet/visualizer/commit/c1191dc)), closes [#654](https://github.com/NPellet/visualizer/issues/654)
* **slickgrid:** proper total number of lines in tooltip on load ([e29d593](https://github.com/NPellet/visualizer/commit/e29d593)), closes [#657](https://github.com/NPellet/visualizer/issues/657)
* **spectra_displayer:** enable markersIndependant option ([5ab6344](https://github.com/NPellet/visualizer/commit/5ab6344)), closes [#477](https://github.com/NPellet/visualizer/issues/477)
* **spectra_displayer:** serie type is in "type", not "serieType" ([1f21552](https://github.com/NPellet/visualizer/commit/1f21552))

### Features

* don't be silent when fullscreen fails ([25bdf5e](https://github.com/NPellet/visualizer/commit/25bdf5e))
* **code_executor:** add Ctrl-Return command ([f9f725f](https://github.com/NPellet/visualizer/commit/f9f725f))
* **lib:** :arrow_up: twig.js ([fad1d01](https://github.com/NPellet/visualizer/commit/fad1d01))
* **slickgrid:** add action out on remove and on select ([74df15c](https://github.com/NPellet/visualizer/commit/74df15c))
* **spectra_displayer:** add support for scatter select plugin ([ab2185b](https://github.com/NPellet/visualizer/commit/ab2185b))
* **typerenderer:** add backgroundColor general option ([5859825](https://github.com/NPellet/visualizer/commit/5859825)), closes [#634](https://github.com/NPellet/visualizer/issues/634)



2.25.0 / 2015-07-27
===================
* Modules
 * dendrogram: Images now allowed in the annotated tree.
 * phylogram: Annotated tree added.
 * panzoom: add scaling option Fix #646
 * code executor: reload when preferences are saved
 * rich text editor and postit: replace tape.png with data url
 * slickgrid editor: save custom chosen editor with same type as it had Fix #643
 * Commit change without navigation when focusout in auto-edit mode Fix #640
 * dendrogram: Annotated tree added.
 * panzoom: fix error when checking array
 * panzoom: fix onResize
 * panzoom: implement highlight Also fixes image flickering new image arrives The transform action is no longer available Fix #633
* Core
 * correct eslint non-passing code
 * Copy paste of module/view. Fix #635
 * undef global config aliases before reconfiguring them ref: #528
 * ui: add copyToClipboard Only tested in chrome. Works if called on user action (for example click)
 * Add fullscreen icon to all modules
 * fix css for fullscreen :warning: changing global css rule Fix #510
 * Fix module selection in context menu
 * Fix layer selection in context menu
 * update testcase structure
* Util
 * colorbar: normalize to hexadecimal before creating scale Fix #644
 * fix error in diagram when no vars_in
 * fix error in diagram when no vars_out
* Libraries
 * :arrow_up: slickgrid


2.24.0 / 2015-07-17
===================
* Util
 * search box: fix select first element
 * Allow switch layer via search box
 * rename searchModules -> searchBox
 * util: add objectToString method
 * Upload ui: Add checkbox to select/unselect all files to delete
* Testcase
 * update testcase structure
* Headers
 * couchdb2: fix upload inline as string
 * Couchdb2: handle logout when httpd auth is used
 * couchdb2: better logout when using httpd auth
 * ctrl+s shortcut to save last loaded document
* Libraries
 * :arrow_up: couch.jquery
 * new library: notifyjs
 * :arrow_up: select2
* Modules
 * phylogram layout fixed
 * code_executor: fix crash when eval fails because of syntax error
 * code_executor: better name for evaled file
 * code_executor: improve console output for errors
 * scatter3d: fix error when module initialized
 * onde: call filter after send var
 * slickgrid: check filter exists in just in time filtering
 * rename object editor
 * 2d_list_fast: add support for matrix of objects
* Core
 * ctrl+s shortcut to save last loaded document


2.23.1 / 2015-07-15
===================
* Testcase
 * testcase: update array example
 * fix some old views
 
* Core
 * add npm release scripts
 * Return to bluebird for Promises (for IE11 support)
 * add editorconfig file
 * fix jslint
 * fix jsgraph resolution in bower.json
 * fix code lint
 
* Modules
 * spectra_displayer: fix when lineWidth option is 0
 * spectra_displayer: add options for markers (shape and size)
 * slickgrid: use dataurls instead of files for background images
 * slickgrid: add -webkit prefixes for flexbox
 * periodic table: hover and click to focus on an element
 * move periodic table to science/chemistry
 * onde: fix schema inspection (for arrays)
 * code_executor: add title of module in error message
 * slickgrid: fix bug with custom editors

* Util
 * move periodic table to science/chemistry
 * couchdb attachments: fix list
 * Add getDistinctColorsAsString to directly get the list of the colors to use in CSS for example

* Libraries
 * bower: :arrow_up: onde
 * update bio-pv
 * update jsgraph@1.12.2
 * upgrade eslint to 0.24.0

* Renderer
 * pdb renderer: load all models


2.23.0 / 2015-07-01
===================
* Modules
 * onde: check items/properties exist when getting jpaths from schema
 * scatter3d: rewrite colors with alpha value
 * scatter3d: fix info out
 * scatter3d: better support for chart format (axis min/max, xyzAxis, unit, label etc...)
 * scatter3d: add x,y,z axe labels in module configuration
 * scatter3D: fix backgroundColor and annotationColor options
 * scatter3d: add default point color option
 * scatter3D: add blank
 * scatter3d: fix threejs warnings
 * Fix bug in code_editor (non-built visualizer only) See issue #612
 * slickgrid: alternative long text editor inside composite editor
 * onde: callback script on change with jpath of modified element
 * slickgrid: add filter with just-in-time option
 * Add jsme hover/click atom/bond actions
 * panzoom: fix default value for scaling method
* Core
 * typerenderer: destroy pv viewer on dom remove
 * typerenderer: add pv viewer mode _option
 * typrenderer: fix crollbars when pdb renderered in display_value
 * type renderer: 'image' is an alias for 'picture'
 * Add css option to picture renderer
 * Add feedback  in contextual menu
 * Built version concatenates module style files
 * Add getLayerNames and switchToLayer in API
 * remove SMIL browser requirement
 * util: correctly normalize url before creating a requirejs path for it
* Libraries
 * Update JSME: support of click/hover on bonds/atoms

2.22.2 / 2015-06-22
===================
* Core
 * uploadUi: make sortable
 * couchdbAttachments: simplify
 * couchshare: add callback argument
* Components
 * :arrow_up: mime-types
* Modules
 * slickgrid highlight: Check array with Array.isArray Fix #600
 * Periodic table : adding indications for users like periods and groups numbers
* Headers
 * remove couch button from default config

2.22.1 / 2015-06-17
===================
* Headers
 * couchdb2: reload tree after upload
* Core
 * util/couchdbAttachments: update doc
 * util/couchdbAttachments: add methods names, urls
 * Prevent error in firefox when initializing the indexedDB global object
* Modules
 * webservice_search: don't show error if options not enabled
 * webservice_search: fix dosearch being called unnecessarily often
 * dragdrop: support alternative browsers for dropping files
 * periodic table: Graphical changes

2.22.0 / 2015-06-15
===================
* Modules
 * slickgrid: update checkmark formatter
 * slickgrid: fix doubled rendering: reblank on update
 * Update periodic table module and add CSS with flexbox layout 
* Core
 * add utils/couchAttachments: small library for managing attachments in a couchdb document
 * add utils/uploadUi: a ui utility to drop files and folders
 * add mime-types library: lookup mime-type from file name and more
* Headers
 * couchdb2: fix breaking change in couchdb login

2.21.2 / 2015-06-11
===================
* Modules
 * slickgrid: add long text editor
 * slickgrid: fix show/hide on refresh and small css change
* Core
 * fix gruntfile
 * Remove unnecessary jshint inline configuration


2.21.1 / 2015-06-10
===================
* Modules
 * slickgrid: move slickgrid core code to cheminfo/SlickGrid github repository
 * slickgrid: Add toolbar options: add, update in pop-up div, remove, show/hide columns
 * slickgrid: Add checkbox selection plugin
 * slickgrid: add date editor
 * slickgrid: bug fixes
 * Add periodic table module
 * wordcloud: fix fontSize initialization
 * jsme: add support for SMILES input

 
* Typerenderer
 * Fix #514. Update sparkline renderer

* Headers
 * couchdb2: login in new window
 
* Components
 * Upgrade jsgraph v1.11.3-3
 * Upgrade jquery-ui v1.11.4
 * Upgrade jquery v2.1.4
 * components: add x2js shortcut
 * remove unused sdf-parser
 * Upgrade requirejs v2.1.18

* Code conventions
 * switch eslintrc to yaml
 * fix remaining uses of self
 * lint: add consistent-this rule

* Core
 * utils: add couchdb attachment manager
 * Issue #529 - Use lru in couchdb attachments api
 * use superagent shortcut in require calls
 * Update docs

2.20.3 / 2015-06-04
===================
* Core
 * forms: fix important bug introduced button by last release
 
* Modules
 * slick grid: bug fix

2.20.2 / 2015-06-03
===================
* Modules
 * code_executor: call ace editor resize onResize Fixes the editor's viewport being 0 when switching layers
 * button_action: add 'Start state' option
 * panzoom: bug fixes
 * panzoom: show, hide and transform actions in
 * panzoom: rerender option
 * code_executor: add context.variable
 * code_executor: fix onload execution
 * code_executor: change "get" behaviour to unwrap the object
* Typerenderer
 * svg renderer fix scroll bar
 * fix svg renderer if input is DataString
* Components
 * :arrow_up: jsgraph
* Core
 * re: sandbox fix for Safari
 * ui: add makeElementSafe to API
 * lib/forms: allow to set button in 'on' state on initialization

2.20.1 / 2015-06-01
===================
* Modules
 * code_executor: add execute script on load option Fix #512
 * jqrid: don't reload on remove column action if nothing had to be removed
 * code_editor: in situ option Fix #583
 * code_editor: add debouncing option
 * hex: adjust colorbar
 * hex: add axes
 * hex: redraw on resize
 * dendrogram: fix output on hover

* Core
 * remove indexedDBshim
 * fix error in dataurl
 * fetch variables from general config: fix ignored timeout
 * Delete .nojekyll
 * shortcut: don't accept search module shortcut if alt key pressed

* Components
 * bower: install components quietly
 * update d3-plugin dependency
 * remove components folder from git
 * bower: include jsNMR and jszip

* npm scripts
 * lint: add no-delete-var, no-label-var, no-shadow-restricted-names, no-undef and no-undef-init rules
 * add npm test script



2.20.0 / 2015-05-21
===================

* Core
 * add eslint for style check of the codebase
 * util: add ui.getSafeElement
 * core: add workaround for chrome bug with svg elements
 * new util: colorbar
 * util/color: make rgb2hex to work with rgb css syntax
 * util/color: round rgb values
 * grid: try to wait for module readyness before removing it from the DOM
 * typerenderer: make renderer selection case-insensitive
 * typerenderer: fix colorBar
* Modules
 * new wordcloud module
 * new hexagonal map module
 * new OCL molecule editor
 * Fix a lot of issues with scrollbars and sizing
 * jsmol: add sync script action in and var out
 * matrix: fix inversion out row and column for output variable
 * scatter3D: add colorbar
 * scatter3D: fix size computation
 * slick_grid: fix CSV export
 * slick_grid: custom action buttons
 * slick_grid: delete toolbar button
 * slick_grid: add toolbar button
 * slick_grid: Change default selection model
 * slick_grid: add multiple line selection var out
 * slick_grid: Fix color editor when undefined
 * slick_grid: reset delete listeners on cell change fix #548
* Components
 * :arrow_up: jsgraph v1.11.2
 * :arrow_up: openchemlib v3.0.0-beta4
 * :arrow_up: papaparse v4.1.1
 * forms/wysiwyg: fix error loading ckeditor custom config
 * remove bluebird
 * remove chemcalc
 * lib: add d3.layout.cloud
 * Add d3 plugins
 * twig: rendertype option precedes variable type
 * forms: fix textstyle problem in strict mode
* Header
 * couchdb2: metadata wysiwyg default value
 * meta form: default type is text
 * On meta saved, change hasMeta flag fix #544

2.19.2 / 2015-05-05
===================

* Add version selector header

2.19.1 / 2015-05-04
===================

* Remove Base64 library
* Update JSME

2.19.0 / 2015-05-04
===================

* Modules
 * progress: change behavior to use actions and text template
 * panzoom: handle image loading failure
 * spectra_displayer: corretly assign serie label
* Util
 * typerenderer: can force image width

2.18.0 / 2015-04-29
===================

 * Modules
    * slick_grid: bug fixes
    * jqgrid: option not to systematically highlight the hovered line
    * New progress bar module
    * panzoom: minor improvements

 * Util
    * shortcuts: bug fix
    * search module: display name instead of id but search both
    * shortcuts: bug fix

 * Type renderer
    * Add webp renderer
  
 * Testcases
    * add progress bar examples
 
2.17.8 / 2015-04-23
===================

 * v2.17.7 removed due to a bug with typerenderer
 * typerenderer: ensure values are fetched before calling the renderer

2.17.6 / 2015-04-23
===================

* Util
 * diagram: bigger arrows
 * diagram: show jpath in link if present
 * diagram: style changes
 * typerenderer: hack to force height on empty divs with background color
 * typerenderer: correctly wait for init to finish
* Module
 * 2d_list: hide 2d_list from module list
 * object_editor: ensure that no DataObject is sent to the editing library
 * object_editor: if input is invalid, send a string describing the error instead of silently failing
 * rich_text: force english language in CKEDITOR
 * rich_text: add option to force plain HTML rendering
 * scatter3d: fix _completeData
 * leaflet: fix viewport output

2.17.5 / 2015-04-21
===================

* entrypoint: remove cron-related dead code
* typerenderer: add html renderer

2.17.4 / 2015-04-21
===================

* 2d_list_fast: fix updateVisibility (#503)

2.17.3 / 2015-04-21
===================

* Core
 * deprecate non-standard HTML attributes on ci-visualizer
 * remove unused tabs from global preferences (#498)
* Util
 * add warnOnce method
* Module
 * rich_text: fix in-place variable modification (#497)
 * single_value: fix html rendering of default value (#500)

2.17.2 / 2015-04-17
===================

* build: add missing json-chart library

2.17.1 / 2015-04-17
===================

* Core
 * version: fix check of Intl crashing on Safari
 * data: get(true) should resolve with value when data is fetched from url
* Forms
 * fix spectrum color init
* Module
 * jqgrid: on action in don't add the column if a column with same jpath exists
* Components
 * Add jszip and file-save.js librairies

2.17.0 / 2015-04-16
===================

* Core
 * version: add isBuild property
 * change how requirejs loads modules
 * fix loading of external modules
 * add module searchbox (CTRL + /)
* Typerenderer
 * various fixes with new structure
 * sparkline type renderer 
 * Change the way typerenderer works and update related modules
 * add toPrecision and toFixed options for number type
* Util
 * Debug diagram to see relation between modules
* Module
 * Deprecate controller.sendAction 
 * code_executor: add methods and keep values between executions
 * code_executor: recompile function when module is reloaded
 * parallel_coordinates: default color to black if jpath is not set
 * scatter3d: bug fix with chart format
 * slick_grid: additional option (don't scroll on highlight)
 * spectra_displayer: add option for line style
* Components:
 * install json-chart and remove lib/chart
 * install select2

2.16.0 / 2015-04-01
===================

* Core
 * introduce version.js and bump task
 * Make modules and filter loadable from preferences (#456)
 * add link to GitHub in context menu
* Util
 * ui: add showNotification method
* Module
 * fix SVG editor
 * panzoom: improve performance

2.15.3 / 2015-03-25
===================

* Grunt
 * Fix jquery.panzoom build
 * Add task: writes a json file with info about the build
* Core
 * display build time in context menu

2.15.2 / 2015-03-25
===================

* Core
 * Add version of visualizer in context menu
 * Add Utils section in context menu (copy view etc...)
 * Better color renderer (opacity is seen)
* Modules
 * panzoom: add var out with clicked pixel(s)
 * panzoom: fix bugs
 * slick grid: enhance color editor
 * slick grid: fix bugs
 * onde: fix bugs
 * spectra_displayer: fix highlight blanking
* Header
 * couchdb2: fix meta save

2.15.1 / 2015-03-17
===================

* Lib
 * add bio-pv
* Core
 * add support for pdb and mol3d in typerenderer
 * gruntfile: sort modules by name
 * change loading animation
* Modules
 * slick_grid: Fix some edge case bugs
 * spectra_displayer: fix bug with fromTo actions and remove fromTo var in
 * object_editor: allow to select jpath for output
 * sandbox: add setImmediate
* Headers
 * Couchdb2: use couchdb's sort list (smart sort of flavors)
 * Couchdb2: bug fix

2.15.0 / 2015-03-09
===================

* Header
 * couchdb2: new login methods (google,facebook, github). Metadata keywords saved in doc for indexing in couchdb map/reduce
* Modules
 * dragdrop: fix bugs
 * form_simple: fix bug

2.14.4 / 2015-03-04
===================

* Components
 * Move highlight.js to libs
* Header
 * couchdb2: fix logout

2.14.3 / 2015-03-02
===================

* Core
 * Fix main CSS
 * Fix CSS for jquery-ui dialogs
 * Fix browser feature message (IE)

2.14.2 / 2015-03-02
===================

* Core
 * Bootstrap css compatibility (fixes cheminfo.org)
* Components
 * Fix cross-origin Image in THREE.js
 * Fix marked and highlight.js build

2.14.1 / 2015-02-26
===================

* Modules
 * fix SlickGrid module

2.14.0 / 2015-02-26
===================

* Core
 * datas: export classes and functions
 * util: Add unloadCss that disables some css
 * ui: Add dialog creation helper
 * typerenderer: add regex type using RegExper
 * add support to evaluate code in a sandbox
 * add external worker loader
* Modules
 * onde: add option to create variable on load
 * spectra_displayer: fix various events
 * code_executor: use sandboxing and precompilation
* Filters
 * Add markdown filter with code highlighting
* Components
 * Update all components
 * Remove alpaca
 * Add [marked](https://github.com/chjj/marked)
 * Add [highlight.js](https://github.com/isagalaev/highlight.js)

2.13.0 / 2015-02-04
===================

* Core
 * grid : fix resize bug on IE11
 * layout: no more global rules in main.css. Improve height calculations.
* Modules
 * leaflet : add autofit option
 * leaflet : fix circular event bug
 * leaflet : add 5 new possible inputs : CSV, KML, GPX, WKT and TopoJSON
* Headers
 * couchdb2 : performance improvements
 * couchdb2: new meta data button
* Components
 * install leaflet-omnivore

2.12.1 / 2015-01-26
===================

* slick_grid: have fallback values when jpath not found
* init : add browser check for IE <= 8
* build : fix ui-contextmenu

2.12.0 / 2015-01-26
===================

* twig : support passing options in rendertype
* typerenderer : allow rendering options for molecules
* header : improvements to couchdb2
* components : update jquery-ui-contextmenu, bluebird, fancytree, chemcalc, d3, font-awesome, jcampconverter, twig.js

2.11.0 / 2015-01-22
===================

* scatter3D: add shapes and do some fixes
* Got rid of ChemDoodle Web Components
* slick_grid: implement export

2.10.1 / 2015-01-21
===================

* slick_grid: support jpath line color
* module: toolbar on header to access configuration more quickly
* onde: bug fixes
* model : better logging of errors
* update jsgraph
* loading_plot : fix highlight
* spectra_displayer : add events for clicking a marker
* core: allow data's attributes to be changed (like _highlight)
* single_value: option to append values to the dom with limit and auto-scroll
* jsmol: support highlight and add var out (messages, click, hover)
* rename some modules

2.10.0 / 2015-01-13
===================

* loading_plot : fix output variables
* fix some onde problems
* spectra_displayer : fix legend positioning
* slick_grid: support single and multi-column sorting
* button_action: more display options
* new module : Code executor
* prevent modules from updating undefined variables

2.9.10 / 2015-01-02
===================

* update JSME
* modernize all headers
* add util.inherits

2.9.9 / 2014-12-12
==================
* slickgrid:
 * better highlight support
 * Columns determined automatically if none specified
 * Scroll back to top option
* core: view url is now relative to http host not to where the visualizer is hosted

2.9.8 / 2014-12-12
==================

* new module: self-organising map
* couchdb2 : soft delete to allow replication and easier view recovery
* util : add deprecate method
* add src/util/color for color-manipulation functions
* debug : add named levels / add getDebugLevel
* module XYZoomNavigator is back !
* defaultmodel : add getData and getAllDataFromRel methods
* add `date` typerenderer
* API : executAction is deprecated. use API.doAction instead
* spectra displayer : add wheel baseline option
* parallel coordinates : allow to send selection only on brush end

2.9.7 / 2014-12-09
==================

* parallel_coordinates : add option to prevent highlight of hidden lines
* update JSME
* spectra_displayer : fix highlight and output variable for chart objects
* code editor : output value on load

2.9.6 / 2014-12-03
==================

* fix cross-origin image loading issue in scatter 3d
* function plotter: make pref editable with action in

2.9.5 / 2014-12-03
==================

* fix jsNMR not being copied in build

2.9.4 / 2014-12-03
==================

* 1D nmr module is back
* parallel coordinates :
  * new brush mode : 2D strums
  * brushes can be combined with AND but also OR
  * options for reorderable axes and shadows
  * add highlight support
* spectra displayer : add mouse over shape event and variable out
* New library : [async](https://github.com/caolan/async)
* modules : view.onResize now receives width and height arguments
* scatter3D: Can set x,y,z,color,size with jpaths. Performance fix. Better testcase.
* slickgrid: Highlighted row is scrolled to.

2.9.3 / 2014-11-26
==================

* Slickgrid: option that provides an input on the header of each column where you can just type in to search something.
* :arrow_up: chemcalc (v2.0.0)

2.9.2 / 2014-11-25
==================

* fix sdf-parser not being in the build

2.9.1 / 2014-11-24
==================

* New file: util/ui.js ui-related utility function.
* util/ui.js: confirm dialog box
* webservice_search: confirmation option
* action_button: confirmation option
* add support for hidden option in module's folder.json

2.9.0 / 2014-11-18
==================

* Slickgrid: Bug fixes.Row numbering overlay. Selected Row & Cell highlighting. DataNumber and DataBoolean edition. Hierarchical grouping. Hover and click actions in.
* button_action : add option to disable toggle
* datas
 * fix several issues with DataObject and triggers
 * add DataBoolean.cast
* add API.cache, API.getData
* webservice_search : add action to change button color
* add setImmediate and clearImmediate
* Merge postit module into richtext module
* New library: [chroma](https://github.com/gka/chroma.js). Small library for color edition.
* :arrow_up: ml (v0.1.0)
* add util.noop
* add [setImmediate](https://github.com/YuzuJS/setImmediate) library

2.8.0 / 2014-11-10
==================

* New module : Edition / Alpaca (create forms using JSON Schema)
* API : add possibility to change loading message
* API : add doc
* Util: add doc
* add smiles and actelionID types and renderers
* add module.reload method
* add new action for all modules : edit preferences
 * add module.getConfigExample and context menu to show what should be sent with the action
* code_editor : new type of output (JSON-parsed value)

2.7.3 / 2014-11-05
==================

* new API method : existVar
* bug fixes

2.7.0 / 2014-11-03
==================

* jsmol / jsme : change communication with iframe to allow cross-origin loading
* core: load main css and js files in entry point. Now only two lines are necessary to boot the visualizer

2.6.0-1 / 2014-10-31
====================

* View sharing (and feedback) : version is exported and redirection is done to lactame.com. It is now possible to share a view on localhost / private network !
* spectra_displayer : 
 * added shift+drag to move the spectra
 * added option to autoscale once per input variable
* jsme :
 * added highlight color option

2.6.0-0 / 2014-10-29
====================

* New module : Edition / Table editor
* New header : Switch layer
* New filter : SDF parser
* Added [ml](https://github.com/mljs/ml) library
