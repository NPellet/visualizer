define(["lib/webtoolkit/base64", "src/util/versioning", "lib/couchdb/jquery.couch"],function(Base64, Versioning){
    function share(options) {
        
        var urlPrefix = (options.couchUrl || window.location.origin).replace(/\/$/,"");
        var database = options.database || "x";
        var tinyPrefix = (options.tinyUrl || window.location.origin+"/x/_design/x/_show/x").replace(/\/$/,"")+"/";
        $.couch.urlPrefix = urlPrefix;
        var db = $.couch.db(database);
        
        var encodedView = Base64.encode(Versioning.getViewJSON());
        var encodedData = Base64.encode(Versioning.getDataJSON());
        
        var docid = guid();
        
        var doc = {
            _id: docid,
            _attachments: {
                "view.json": {
                    "content_type": "application/json",
                    "data": encodedView
                },
                "data.json": {
                    "content_type": "application/json",
                    "data": encodedData
                }
            },
            visualizer: window.location.origin+window.location.pathname,
            couchdb: urlPrefix+"/"+database+"/"
        };
        
        var def = $.Deferred();
        
        db.saveDoc(doc, {
            success: function(){
                var tinyUrl = tinyPrefix+docid;
                def.resolve(tinyUrl);
            },
            error: function() {
                def.reject();
            }
        });
        
        return def;
    }
    
    var str = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    function guid() {
        var result = "";
        for(var i = 0; i < 20; i++) {
            result += str[Math.floor(Math.random()*62)];
        }
        return result;
    }
    
    return {
        share: share
    };
});