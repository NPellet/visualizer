define(function() {

    return function(olfaction) {
        var pieChart = {y:[],info:[]};
        for(var i = 0, ii = olfaction.length; i < ii; i++) {
            var olf = olfaction[i];
            pieChart.y.push(olf.aspect);
            pieChart.info.push({name: olf.desc, color:olf.color?olf.color:"#777"});
        }
        return new DataObject({type:"chart",value:{data:[pieChart]}});
    };

});