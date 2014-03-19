define(['modules/default/defaultview', "src/util/util", "src/util/datatraversing", "lib/parallel-coordinates/d3.parcoords"], function(Default, Util, Traversing) {

    function view() {
        this._id = Util.getNextUniqueId();
        this._value = new DataArray();
        this._addedColumns = {};
        this._currentColumns = {};
        this._previousColumns = [];
    }
    ;

    Util.loadCss('lib/parallel-coordinates/d3.parcoords.css');

    view.prototype = $.extend(true, {}, Default, {
        init: function() {
            var html = '<div class="parcoords" id="'+this._id+'"></div>';

            this.dom = $(html).css({
                height: '100%',
                width: '100%'
            });

            this.module.getDomContent( ).html(this.dom);
            this.onReady = $.Deferred();
            
        },
        blank: {
            value: function() {
                this.dom.empty();
            }
        },
        update: {
            value : function(value) {
                if(!value)
                    return;
                value = value.get();
                if(!value instanceof Array)
                    return;
                
                this._value = value;
                
                this.redrawChart();
            },
            columns: function(value) {
                if(!(value instanceof Array))
                    return;
                for(var i = 0; i < this._previousColumns.length; i++) {
                    delete this._currentColumns[this._previousColumns[i].name];
                }
                for(var i = 0; i < value.length; i++) {
                    this._currentColumns[value[i].name] = value[i];
                }
                this._previousColumns = value;
                this.redrawChart();
            }
        },
        onActionReceive: {
            addColumn: function(value) {
                if(value && value.name && value.jpath) {
                    this._addedColumns[value.name] = value;
                    this.redrawChart();
                }
            },
            removeColumn: function(value) {
                if(value && value.name) {
                    delete this._addedColumns[value.name];
                    this.redrawChart();
                }
            }
        },
        onResize: function() {
            this.onReady.resolve();
            this.redrawChart();
        },
        redrawChart: function() {
            var that=this;
            this.createIntermediateData();
            this.dom.empty();
            
            if(this._data) {
                var parcoords = d3.parcoords()("#"+(this._id));
                    parcoords.data(this._data);
                    parcoords.detectDimensions();
                    if(this._names)
                        parcoords.dimensions(this._names);

                    parcoords.color(function(item) {
                        return item.__color ? item.__color : "#000";
                    });

                    parcoords.render()
                            .brushable()
                            .reorderable();
                    parcoords.on("brush", function(d){
                        that.module.controller.onBrushSelection(d);
                    });

                this.module.controller.onBrushSelection(this._data);
            } else {
                this.dom.html("No column to display");
            }
        },
        createIntermediateData: function() {
            
            var columns = this.getColumns(), l = columns.length;
            var colorJpath = this.module.getConfiguration("colorjpath");
            
            var value = this._value;
            
            if(!l) {
                this._data=false;
                return;
            }
            
            var newValue = new DataArray();
            var names = [];
            for(var i = 0; i < l; i++){
                names[i] = columns[i].name;
            }
            this._names = names;
            
            for(var i = 0; i < value.length; i++) {
                var val = new DataObject();
                newValue[i] = val;
                for(var j = 0; j < l; j++) {
                    Traversing.getValueFromJPath(value[i],columns[j].jpath).always(function(result){
                        val[columns[j].name] = result;
                    });
                    if(colorJpath) {
                        Traversing.getValueFromJPath(value[i],colorJpath).always(function(result){
                            if(result)
                                val.__color = result;
                        });
                    }
                    val.__id = i;
                }
            }
            
            this._data = newValue;
        },
        getColumns: function() {
            var totalConfig = [], i;
            var objConfig = {};
            var config = this.module.getConfiguration("colsjPaths");
            if(config) {
                for(var i = 0; i < config.length; i++){
                    if(config[i].jpath)
                        objConfig[config[i].name] = config[i];
                }
            }
            $.extend(objConfig, this._currentColumns, this._addedColumns);

            for(i in objConfig){
                totalConfig.push(objConfig[i]);
            }

            return totalConfig;
        }
      
    });
    
    return view;
});