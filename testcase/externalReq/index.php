<html>
<head>
    <script src="lib/pouchdb-2.2.2.min.js" type="text/javascript" charset="utf-8"></script>
    <script src="lib/setimmediate.js" type="text/javascript"></script>
    <script src="lib/promise.js" type="text/javascript"></script>
</head>
<body>
    <script type="text/javascript" charset="utf-8">
        
    // data types mapping (default to string)
    var types = {
      molfile: 'mol2d'
    };
    
    // Creating data object
    var data = {};
    try {
      <?php foreach($_POST as $key=>$postvar): ?>
      try {
        data["<?php echo $key ?>"] = JSON.parse(<?php echo json_encode($postvar) ?>);
      } catch(e) {
        data["<?php echo $key ?>"] = <?php echo json_encode($postvar) ?>;
      }
      <?php endforeach; ?>
    } catch(e) {
      console.log("Something went wrong");
    }
    
    try {
      <?php foreach($_GET as $key=>$postvar): ?>
      try {
        data["<?php echo $key ?>"] = JSON.parse(<?php echo json_encode($postvar) ?>);
      } catch(e) {
        data["<?php echo $key ?>"] = <?php echo json_encode($postvar) ?>;
      }
      <?php endforeach; ?>
    } catch(e) {
      alert("Something went wrong");
    }
    
    var view = data.view;
    delete data.view;
    
    if(!view || typeof view !== "string") {
        writeBody('Error: view parameter must be specified');
    } else {
        if(window.localStorage) {
	    window.localStorage.setItem('external_cache', JSON.stringify(data));
        }
        var deletePouch;
        if(Object.keys(data).length) {
            deletePouch = new Promise(function(resolve){
                PouchDB.destroy('external_infos').then(resolve,function() {
                    writeBody('PouchDB failed... Redirecting...');
                    doRedirect();
                });               
            });
        }
        else {
            deletePouch = Promise.resolve();
        }
        
        deletePouch.then(function(){
            
            var db = new PouchDB('external_infos');
        
            var docs = [];
            for(var i in data) {
                (function(i){
                    docs.push(new Promise(function(resolve, reject){
                        var rev;
                        db.get(i, function(err, res){
                            if(!err) {
                                rev = res._rev;
                            }
                            var x = {
                                _id: i,
                                _rev: rev,
                                type: types[i] || "string",
                                value: data[i]
                            };
                            db.put(x, function(err){
                                if(err)
                                    reject(err);
                                else
                                    resolve();
                            });
                        });
                    }));
                })(i);
            }
            Promise.all(docs).then(function(){
                writeBody('Document written to database. Redirecting...');
                doRedirect();
            }, function(err){
		console.log(err);
                writeBody('Error: Could not write to database.',err);
            });
        
        });
    }

    function doRedirect() {
        setTimeout(function() {
            var flavor = data.flavor || "default";
//            var version = data.version || "visualizer_201405281409";
            window.location = '/cheminfo/home/load.html?config=../_design/flavor/_list/config/alldocs%3Fkey%3D%22'+flavor+'%22&viewURL='+escape(view);
        }, 100);
    }
    
    function writeBody(text) {
      var body = document.getElementsByTagName('body');
      body[0].innerHTML += text;
    }

    </script>
</body>
</html>
