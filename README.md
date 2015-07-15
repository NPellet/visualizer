Concept
==========
The visualizer is a tool developped by the cheminformatics department of the Swiss Federal Institute of Technology. We promote the development of open source projects that we use internally for our daily research. As a consequence, we release the visualizer under the MIT license unless specified otherwise. We try to use only open source third party libraries.

The visualizer aims at the rendering of complex datasets. It is suited to display and interact in a multiple of ways thanks to modules that can be placed on your browser page. The modules display some type of information in some way (table, chart, matrix, 2D list, 1D list), and they can interact with each other through a central API. The visualization is started by passing only three URLs in the browser address bar.

Modules may be added, moved, duplicated, resized and removed through the UI. Each module can be configured with built-in options to allow their customization. In addition, some modules can interact with the mouse pointer and are able to send variables and actions to other modules through an event-based system.


Visualize your data
==========

To get started, you need three json files located anywhere accessible by XHR requests.

* view.json
* data.json
* config.json

The view file will contain information about the visualization in a JSON format : which modules should be placed and where, which mouse interactions should be defined, which variables or actions to send or receive, etc. The view.json is *independant on the dataset you want to visualize*. In the view file will be defined which modules should be displayed and which initial variables from the dataset should be readily available to the modules.

The data file contains the data to visualize in a JSON format. The user is responsible to generate that file according to a few guidelines.

The config file is typically common to your projects. It defines which modules are available (built-in or not), which buttons should be displayed in the header, which variable filters and action files should be available to the visualizer.

Variables and Actions
----------------------
The visualizer allows the modules to comminucate via a central repository of variables and actions. When an event is triggered on a module ( mouse click, mouse hover, resize, ... ), a variable or an action is sent towards the repository.

Installation
============
To install the development version of the visualizer, you need Node.js.  
Run `npm install` and all the dependencies will be downloaded.
