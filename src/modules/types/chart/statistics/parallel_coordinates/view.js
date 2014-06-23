define(['modules/default/defaultview', "src/util/util", "src/util/datatraversing", "src/util/context", "lib/parallel-coordinates/d3.parcoords"], function(Default, Util, Traversing, Context) {

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
            var that = this;
            var html = '<div class="parcoords" id="'+this._id+'"></div>';

            this.dom = $(html).css({
                height: '100%',
                width: '100%'
            });
            
            Context.listen(this.dom[0], [
                    ['<li><a><span class="ui-icon ui-icon-refresh"></span>Reset selection</a></li>', 
                    function() {
                            that.resetBrush();
                    }]]
            );
	
			this.jpathConfig = $.extend(true, [], this.module.getConfiguration("colsjPaths"));

            this.module.getDomContent( ).html(this.dom);
            
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
                if(!value.length)
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
		inDom: function() {
			this.resolveReady();
		},
        onResize: function() {
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
                    
                    if(this._data.length > 1000) {
                        parcoords.mode("queue");
                        parcoords.rate(200);
                    }

                    parcoords.render()
                            .brushable()
                            .reorderable();
                    parcoords.on("brush", function(d){
                        that.module.controller.onBrushSelection(d);
                    });
                this._parcoords=parcoords;

                this.module.controller.onBrushSelection(this._data);
            } else {
                this.dom.html("No column to display");
            }
        },
        createIntermediateData: function() {
            var columns = this.getColumns(), l = columns.length;
            var colorJpath = this.module.getConfiguration("colorjpath");
			if(colorJpath) colorJpath = Util.makejPathFunction(colorJpath);

            var value = this._value, vl = value.length;

            if(!l || !vl) {
                this._data=[];
                return;
            }
            
            var newValue = Array(vl);
            var names = Array(l);
            for(var i = 0; i < l; i++){
                names[i] = columns[i].name.toString();
            }
            this._names = names;

			var newVal, val;
            for(var i = 0; i < vl; i++) {
                newVal = {};
				val = value[i];
                newValue[i] = newVal;
               
                for(var j = 0; j < l; j++) {

                    newVal[columns[j].name] = columns[j].jpath(val);
                }
				if(colorJpath) {
                    newVal.__color = colorJpath(val);
                }
                newVal.__id = i;
            }
            this._data = newValue;
        },
        getColumns: function() {
            var totalConfig = [], i;
            var objConfig = {};
            var config = this.jpathConfig;
            if(config) {
                for(var i = 0; i < config.length; i++){
                    if(config[i].jpath) {
                        objConfig[config[i].name] = $.extend( true, {}, config[i]);
					}
                }
            }

            $.extend(objConfig, this._currentColumns, this._addedColumns);

            for(i in objConfig){
                totalConfig.push(objConfig[i]);
            }
			
			for(var i = 0; i < totalConfig.length; i++) {
				if(typeof totalConfig[i].jpath === "function")
					continue;
				totalConfig[i].jpath = Util.makejPathFunction(totalConfig[i].jpath);
			}
			
            return totalConfig;
        },
        resetBrush: function(){
            if(this._parcoords)
                this._parcoords.brushReset();
        }
      
    });
    
    return view;
});
