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
