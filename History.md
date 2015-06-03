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
