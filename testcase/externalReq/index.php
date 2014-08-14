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
    
    // docIDs for service views, indexed by service name
    var views = {
      'nmr-spectra-predictor': '../../src/index.html?config=../testcase/config/default.json&viewURL=../testcase/externalReq/views/nmrpredictall.json',
	  'nmr-predictor': '../../src/index.html?config=../testcase/config/default.json&viewURL=../testcase/externalReq/views/nmrpredict.json'
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
    
    var service = data.name;
    delete data.name;
    
    if(!service || typeof service !== "string" || !views[service]) {
        writeBody('Error: '+service+' service does not exist');
    } else {

        var deletePouch;
        if(Object.keys(data).length) {
            deletePouch = new Promise(function(resolve){
                PouchDB.destroy('external_infos').then(resolve);
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
                                value: data[i],
								timestamp: new Date().getTime()
                            };
                            db.put(x, function(err){
                                if(err)
                                    reject();
                                else
                                    resolve();
                            });
                        });
                    }));
                })(i);
            }
            Promise.all(docs).then(function(){
                writeBody('Document written to database. Redirecting...');
                setTimeout(function() {
                    window.location = views[service];
                }, 500);
            }, function(){
                writeBody('Error: Could not write to database.');
            });
        
        });
    }
    
    function writeBody(text) {
      var body = document.getElementsByTagName('body');
      body[0].innerHTML += text;
    }

    </script>
</body>
</html>