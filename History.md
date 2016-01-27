<a name="2.37.0"></a>
# 2.37.0 (2016-01-27)


### Bug Fixes

* Remove destructuring declarations because uglifyjs cannot parse it ([43bad10](https://github.com/NPellet/visualizer/commit/43bad10))
* **rich_text:** wait for ckeditor to be ready before resolveReady ([0e1804c](https://github.com/NPellet/visualizer/commit/0e1804c))

### Features

* **core:** use babel to translate es-2015 into browser-compliant javascript ([248d5a3](https://github.com/NPellet/visualizer/commit/248d5a3))
* **rich_text:** new option allows not to store the content in view ([57703b2](https://github.com/NPellet/visualizer/commit/57703b2))
* **single_value:** typerenderer options ([1832d10](https://github.com/NPellet/visualizer/commit/1832d10))
* **typerenderer:** add numeral ([e6db670](https://github.com/NPellet/visualizer/commit/e6db670))
* **typerenderer:** add sprintf option for number ([d9cf55d](https://github.com/NPellet/visualizer/commit/d9cf55d))
* **ui:** ui.choose no confirmation option ([bcaf287](https://github.com/NPellet/visualizer/commit/bcaf287))



<a name="2.36.0"></a>
# 2.36.0 (2016-01-22)


### Bug Fixes

* **jsme:** output correct SVG ([f09c0a5](https://github.com/NPellet/visualizer/commit/f09c0a5))
* **rich_text:** when instantiating ckeditor configure path to mathjax lib ([2d209a8](https://github.com/NPellet/visualizer/commit/2d209a8))
* **slickgrid:** on update, scrolling back to row should not set focus on it ([fdb269f](https://github.com/NPellet/visualizer/commit/fdb269f))
* **spectra_displayer:** set a different primary grid color ([57f85d2](https://github.com/NPellet/visualizer/commit/57f85d2))
* **spectra_displayer:** shapes can be drawn again ([3ab42d5](https://github.com/NPellet/visualizer/commit/3ab42d5))
* **type_renderer:** when a molfile is loaded from url ([29b9e02](https://github.com/NPellet/visualizer/commit/29b9e02))

### Features

* **rich_text:** add possibility to debounce output variable ([a056f17](https://github.com/NPellet/visualizer/commit/a056f17))
* **slick_grid:** Choose which columns to be displayed in main and in popup ([a857e5a](https://github.com/NPellet/visualizer/commit/a857e5a))
* **spectra_displayer:** add option to control the number of primary axis ticks ([ecc6af4](https://github.com/NPellet/visualizer/commit/ecc6af4))
* **spectra_displayer:** redesign configuration tab ([f574b31](https://github.com/NPellet/visualizer/commit/f574b31))
* **webservice_search:** allow filter to return a Promise ([dd3d5b3](https://github.com/NPellet/visualizer/commit/dd3d5b3))



<a name="2.35.1"></a>
## 2.35.1 (2016-01-13)


### Bug Fixes

* **webservice_search:** Can set header from input variable ([c44f42c](https://github.com/NPellet/visualizer/commit/c44f42c))



<a name="2.35.0"></a>
# 2.35.0 (2016-01-11)


### Bug Fixes

* **panzoom:** set transform to identity when scaling mode is 'no' ([f23cea2](https://github.com/NPellet/visualizer/commit/f23cea2))
* **slickgrid:** sorting should trigger change ([423f954](https://github.com/NPellet/visualizer/commit/423f954))

### Features

* **spectra_displayer:** legend is now displayed outside of the graph ([8aae5d1](https://github.com/NPellet/visualizer/commit/8aae5d1))



<a name="2.34.2"></a>
## 2.34.2 (2015-11-20)


### Bug Fixes

* **ocl_editor:** dialog box must be over other elements ([bdcd730](https://github.com/NPellet/visualizer/commit/bdcd730))



<a name="2.34.1"></a>
## 2.34.1 (2015-11-16)




<a name="2.34.0"></a>
# 2.34.0 (2015-11-13)


### Features

* **smart_array_filter:** choose font-size ([82650b8](https://github.com/NPellet/visualizer/commit/82650b8))



<a name="2.33.0"></a>
# 2.33.0 (2015-11-13)


### Features

* **slickgrid:** implement addRow action ([7d31a1d](https://github.com/NPellet/visualizer/commit/7d31a1d))



<a name="2.32.0"></a>
# 2.32.0 (2015-11-12)


### Bug Fixes

* **slickgrid:** correct selected elements when filtering ([37c1394](https://github.com/NPellet/visualizer/commit/37c1394))

### Features

* **action button:** 3 types of content possible: image url, svg, or just content ([6a4c385](https://github.com/NPellet/visualizer/commit/6a4c385))
* **slickgrid:** add selectRows action in ([e3f1bed](https://github.com/NPellet/visualizer/commit/e3f1bed))



<a name="2.31.1"></a>
## 2.31.1 (2015-11-11)


### Bug Fixes

* **smart_array_filter:** handle DataObjects ([80d0495](https://github.com/NPellet/visualizer/commit/80d0495))



<a name="2.31.0"></a>
# 2.31.0 (2015-11-11)


### Bug Fixes

* **slickgrid:** Fix wrong highlighted line when table is filtered ([f694a3f](https://github.com/NPellet/visualizer/commit/f694a3f))

### Features

* add smart-array-filter library ([7edd214](https://github.com/NPellet/visualizer/commit/7edd214))
* add smart-array-filter module ([2d64a90](https://github.com/NPellet/visualizer/commit/2d64a90))



<a name="2.30.1"></a>
## 2.30.1 (2015-11-09)


### Features

* **button_action:** possibility to insert image ([673b66f](https://github.com/NPellet/visualizer/commit/673b66f))
* **ocl_editor:** add option to enable query features ([7e8d4d3](https://github.com/NPellet/visualizer/commit/7e8d4d3))



<a name="2.30.0"></a>
# 2.30.0 (2015-11-04)


### Bug Fixes

* **leaflet:** Convert to string before parsing ([bdfd4e9](https://github.com/NPellet/visualizer/commit/bdfd4e9))
* **typerenderer:** in indicator, cell should not grow with text ([284f5ba](https://github.com/NPellet/visualizer/commit/284f5ba))

### Features

* **leaflet:** add point var in (renders a circle on the map) ([1d80f1f](https://github.com/NPellet/visualizer/commit/1d80f1f))
* **typerenderer:** date rendering for strings ([cd5102c](https://github.com/NPellet/visualizer/commit/cd5102c))
* **typerenderer:** for number add dateFromNow and dateCalendar options ([35df8d1](https://github.com/NPellet/visualizer/commit/35df8d1))
* **typerenderer:** possibility to render number as date ([0a8b545](https://github.com/NPellet/visualizer/commit/0a8b545)), closes [#743](https://github.com/NPellet/visualizer/issues/743)



<a name="2.29.0"></a>
# 2.29.0 (2015-10-29)


### Bug Fixes

* copy web-animations-js when building ([3c1abf9](https://github.com/NPellet/visualizer/commit/3c1abf9))
* **data:** do not overwrite prototype with DataObject ([b4618eb](https://github.com/NPellet/visualizer/commit/b4618eb))
* **panzoom:** fix incorrect mouse to pixel mapping when page is scrolled ([a615ea9](https://github.com/NPellet/visualizer/commit/a615ea9)), closes [#736](https://github.com/NPellet/visualizer/issues/736)
* **slickgrid:** fix bug when renaming a column that is filtered ([dde8c78](https://github.com/NPellet/visualizer/commit/dde8c78))
* **spectra_displayer:** update jsgraph to v1.13.3-20 ([7cf325a](https://github.com/NPellet/visualizer/commit/7cf325a))

### Features

* **dragdrop:** allow to read as ArrayBuffer ([6b328d3](https://github.com/NPellet/visualizer/commit/6b328d3))
* **form:** templated forms can use default template ([55da27c](https://github.com/NPellet/visualizer/commit/55da27c))
* **richtext:** add action that add text or html on cursor position ([6608a0e](https://github.com/NPellet/visualizer/commit/6608a0e))
* **script_executor:** allow to return a Promise for async scripts ([fc9ac0a](https://github.com/NPellet/visualizer/commit/fc9ac0a))
* **slickgrid:** type renderer options for a column ([377c395](https://github.com/NPellet/visualizer/commit/377c395)), closes [#689](https://github.com/NPellet/visualizer/issues/689)
* **util/ui:** add choose to api (choose from list) ([3f31464](https://github.com/NPellet/visualizer/commit/3f31464))



<a name="2.28.4"></a>
## 2.28.4 (2015-10-16)




<a name="2.28.3"></a>
## 2.28.3 (2015-10-15)


### Bug Fixes

* **slickgrid:** click event should be generated on each consecutive click ([d1b913f](https://github.com/NPellet/visualizer/commit/d1b913f))



<a name="2.28.2"></a>
## 2.28.2 (2015-10-13)


### Bug Fixes

* No event sent when click on 123 or new molecule in JSME ([c973d65](https://github.com/NPellet/visualizer/commit/c973d65))
* **jquery.couch:** send xhrFields everywhere ([4555025](https://github.com/NPellet/visualizer/commit/4555025))
* update jsgraph to v1.13.3-18 ([70ce50e](https://github.com/NPellet/visualizer/commit/70ce50e))

### Features

* **couchdb2:** can perform switchView withCredentials ([38c3b2b](https://github.com/NPellet/visualizer/commit/38c3b2b))
* **panzoom:** add possibility to select a jpath from hover and click pixels events ([5fb93c1](https://github.com/NPellet/visualizer/commit/5fb93c1)), closes [#723](https://github.com/NPellet/visualizer/issues/723)
* **slickgrid:** If an element was clicked, jpath structure in var out is calculated on this elem ([037db0d](https://github.com/NPellet/visualizer/commit/037db0d))



<a name="2.28.1"></a>
## 2.28.1 (2015-10-02)


### Bug Fixes

* **code_editor:** fix bug due to misuse of model.data ([a0000f6](https://github.com/NPellet/visualizer/commit/a0000f6))
* **couchdb:** better handling of DataObjects ([d4e9ac5](https://github.com/NPellet/visualizer/commit/d4e9ac5))
* **panzoom:** highlight out was not working ([119e773](https://github.com/NPellet/visualizer/commit/119e773))
* **slickgrid:** call get() on input variable ([9513ba4](https://github.com/NPellet/visualizer/commit/9513ba4)), closes [#717](https://github.com/NPellet/visualizer/issues/717)
* **slickgrid:** fix error with pop-up update/new when column name is has special characters ([634a5b1](https://github.com/NPellet/visualizer/commit/634a5b1))

### Features

* Update JSME to allow the chiral flag in molfile V2000 ([3831a44](https://github.com/NPellet/visualizer/commit/3831a44))
* **grid:** add create blank layer option ([c6e6da7](https://github.com/NPellet/visualizer/commit/c6e6da7))
* **grid:** add rename layer option ([7e50be3](https://github.com/NPellet/visualizer/commit/7e50be3))
* **grid:** add the remove layer option ([89e1cc5](https://github.com/NPellet/visualizer/commit/89e1cc5))
* **grid:** remove layer notification and update setLayers ([b6193f7](https://github.com/NPellet/visualizer/commit/b6193f7))
* **slickgrid:** add newRow filter event ([5ec9227](https://github.com/NPellet/visualizer/commit/5ec9227))
* **webservice_search:** add withCredentials options ([3adb484](https://github.com/NPellet/visualizer/commit/3adb484))



<a name="2.28.0"></a>
# 2.28.0 (2015-09-23)


### Bug Fixes

* **core:** make sure couch.jquery is loaded after jQuery ([567aa70](https://github.com/NPellet/visualizer/commit/567aa70))
* **pie_chart:** highlight called only when necessary ([8c1b5ab](https://github.com/NPellet/visualizer/commit/8c1b5ab))
* remove useless and problematic line in module save dialog ([9ffe1cf](https://github.com/NPellet/visualizer/commit/9ffe1cf))
* **slickgrid:** correct slick grid filter 'documentation' ([0232baa](https://github.com/NPellet/visualizer/commit/0232baa))
* **slickgrid:** fix error when first element of array is undefined ([e80f273](https://github.com/NPellet/visualizer/commit/e80f273))
* **slickgrid:** fix just-in-time filter when an item does not exist ([4eec928](https://github.com/NPellet/visualizer/commit/4eec928))
* **slickgrid:** handle pref script is undefined ([4a2bef1](https://github.com/NPellet/visualizer/commit/4a2bef1))
* **slickgrid:** init slick before listeners ([6fe647e](https://github.com/NPellet/visualizer/commit/6fe647e)), closes [#690](https://github.com/NPellet/visualizer/issues/690)
* **slickgrid:** log error correctly when eval fails ([01a379c](https://github.com/NPellet/visualizer/commit/01a379c))
* **slickgrid:** update the highlights array after sorting ([82076cb](https://github.com/NPellet/visualizer/commit/82076cb)), closes [#694](https://github.com/NPellet/visualizer/issues/694)
* **spectra_displayer:** correctly redraw graph ([aa903cf](https://github.com/NPellet/visualizer/commit/aa903cf)), closes [#675](https://github.com/NPellet/visualizer/issues/675)
* **spectra_displayer:** Update jsgraph to v1.13.3-17 ([d4f11ba](https://github.com/NPellet/visualizer/commit/d4f11ba)), closes [#701](https://github.com/NPellet/visualizer/issues/701)

### Features

* **colorbar:** support colors with opacity ([52c12cf](https://github.com/NPellet/visualizer/commit/52c12cf)), closes [#685](https://github.com/NPellet/visualizer/issues/685)
* **core:** add possibility to specify senderId in highlight ([42cc263](https://github.com/NPellet/visualizer/commit/42cc263))
* **couchdbAttachments:** add support for uploading dataurls ([1504631](https://github.com/NPellet/visualizer/commit/1504631))
* **couchdbAttachments:** Allow to call any method without having to call fetchList first ([f5b5bd9](https://github.com/NPellet/visualizer/commit/f5b5bd9))
* **feedback:** change feedback to open new tab in github issues ([626e2e8](https://github.com/NPellet/visualizer/commit/626e2e8))
* **hex:** reset zoom on double click ([0fe1fe9](https://github.com/NPellet/visualizer/commit/0fe1fe9)), closes [#688](https://github.com/NPellet/visualizer/issues/688)
* **panzoom:** add inline svg support ([1ea67fe](https://github.com/NPellet/visualizer/commit/1ea67fe)), closes [#707](https://github.com/NPellet/visualizer/issues/707)
* **panzoom:** implement focus on highlight option ([18f7995](https://github.com/NPellet/visualizer/commit/18f7995)), closes [#671](https://github.com/NPellet/visualizer/issues/671)
* **panzoom:** use 2 arrays for highlight (_highlight, _highlightArray) ([b8bedd6](https://github.com/NPellet/visualizer/commit/b8bedd6)), closes [#667](https://github.com/NPellet/visualizer/issues/667)
* **slickgrid:** add scriptChanged event in filter ([f1d3d5c](https://github.com/NPellet/visualizer/commit/f1d3d5c))
* **slickgrid:** filter now called with event ([3de7ecc](https://github.com/NPellet/visualizer/commit/3de7ecc))
* **slickgrid:** script as var in ([aebfafa](https://github.com/NPellet/visualizer/commit/aebfafa)), closes [#705](https://github.com/NPellet/visualizer/issues/705)


### BREAKING CHANGES

* S:
Changes both how and when the filter function is called in slick grid
Breaks previous view that use the filter feature

* The colorbar interpolation function now returns on object {color: '#ff0000', opacity: 0.5} and not directly a color



<a name="2.27.1"></a>
## 2.27.1 (2015-09-03)


### Bug Fixes

* **parallel_coordinates:** fix onResize handling ([6a07644](https://github.com/NPellet/visualizer/commit/6a07644)), closes [#695](https://github.com/NPellet/visualizer/issues/695)

### Features

* **parallel_coordinates:** add 1D-axes-multi and angular brush modes ([da1654e](https://github.com/NPellet/visualizer/commit/da1654e))



<a name="2.27.0"></a>
# 2.27.0 (2015-08-28)


### Bug Fixes

* **hex:** fix the axe arrows ([05c2a58](https://github.com/NPellet/visualizer/commit/05c2a58))
* incorrect usage of require.toUrl for CSS ([537b9a0](https://github.com/NPellet/visualizer/commit/537b9a0))
* **module:** conflict with actionIn in Code executor and Filter editor ([1d140ad](https://github.com/NPellet/visualizer/commit/1d140ad)), closes [#686](https://github.com/NPellet/visualizer/issues/686)
* **onde_module:** The action onSubmit is always send event in case of in-place modification ([ba25c33](https://github.com/NPellet/visualizer/commit/ba25c33))
* **plot_function:** fix reference to Parser lib ([54b9d6b](https://github.com/NPellet/visualizer/commit/54b9d6b))
* **spectra_displayer:** Add none option to x axis modification ([f097bb6](https://github.com/NPellet/visualizer/commit/f097bb6))
* **util:** rewriteRequirePath should not rewrite valid URLs ([ab70686](https://github.com/NPellet/visualizer/commit/ab70686))

### Features

* **hex:** add font-size option ([d9902e2](https://github.com/NPellet/visualizer/commit/d9902e2))
* **hex:** add possibility to manually decide which ticks to display ([a23a2c7](https://github.com/NPellet/visualizer/commit/a23a2c7))
* **hex:** automatic font size ([c5ce997](https://github.com/NPellet/visualizer/commit/c5ce997))
* **hex:** axes can be on graph, as legend or not present ([65b9a8e](https://github.com/NPellet/visualizer/commit/65b9a8e))
* **hex:** stop postions can be given either as percent or as values ([719c420](https://github.com/NPellet/visualizer/commit/719c420))



<a name="2.26.3"></a>
## 2.26.3 (2015-08-10)


### Bug Fixes

* **code_executor:** fix crash when editor is not displayed ([bbb1309](https://github.com/NPellet/visualizer/commit/bbb1309)), closes [#665](https://github.com/NPellet/visualizer/issues/665)
* **components:** :arrow_up: jsgraph v1.13.0 ([c6120ae](https://github.com/NPellet/visualizer/commit/c6120ae)), closes [#615](https://github.com/NPellet/visualizer/issues/615) [#666](https://github.com/NPellet/visualizer/issues/666)
* **function_3d:** enable var in ([8c6b243](https://github.com/NPellet/visualizer/commit/8c6b243)), closes [#542](https://github.com/NPellet/visualizer/issues/542)
* **function_3d:** fix blank ([c17856e](https://github.com/NPellet/visualizer/commit/c17856e))
* **hex:** Accept the correct chart format ([ee7eb6f](https://github.com/NPellet/visualizer/commit/ee7eb6f)), closes [#550](https://github.com/NPellet/visualizer/issues/550)
* **panzoom:** not using endsWith for browser compatibilty reason ([02f6ea1](https://github.com/NPellet/visualizer/commit/02f6ea1))

### Features

* **panzoom:** accept typed arrays as highlight ([47382d2](https://github.com/NPellet/visualizer/commit/47382d2))
* **slickgrid:** side-by-side 3d ([bde1707](https://github.com/NPellet/visualizer/commit/bde1707)), closes [#652](https://github.com/NPellet/visualizer/issues/652)
* **util:** add isArray ([4fb9ff6](https://github.com/NPellet/visualizer/commit/4fb9ff6))


### BREAKING CHANGES

* The chart input should be changed to the correct format.
 See https://github.com/cheminfo/json-chart



<a name="2.26.2"></a>
## 2.26.2 (2015-07-30)


### Bug Fixes

* **spectra_displayer:** chart input with multiple series and same name ([62dea07](https://github.com/NPellet/visualizer/commit/62dea07))

### Features

* **spectra_displayer:** change scatter selection shortcut to ALT+draw ([664c96d](https://github.com/NPellet/visualizer/commit/664c96d)), closes [#658](https://github.com/NPellet/visualizer/issues/658)


### BREAKING CHANGES

* Spectra displayer: the scatter selection plugin is now using ALT + draw interaction instead of just draw.
Previous behavior was in conflict with the zoom plugin.



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
