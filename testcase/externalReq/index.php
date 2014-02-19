<?php
//header("Access-Control-Allow-Origin: *");
?>

<html>
<head>
  <script src="pouchdb.js" type="text/javascript" charset="utf-8"></script>
</head>
<body>
    <script type="text/javascript" charset="utf-8">
    console.log('in script');
    var types = {
      molfile: 'mol2d'
    };
    var views = {
      molfile: {
        nmrPredict: "/example/nmrPredictURL.json"
      }
    }
    
    var jsonval = "<?php echo $_POST['value'] ?>";
    var name = "<?php echo $_POST['name'] ?>";
    
    if(!types[name]) {
      writeBody('Error: '+name+' has no corresponding type');
    }
    else {
      var db = new PouchDB('external_info');
      var rev = null;
    
      db.get(name, function(err, res) {
        if(!err) {
          rev = res._rev
        }
        db.put({
          _id: name,
          _rev: rev ? rev : undefined,
          type: types[name],
          value: JSON.parse(jsonval),
          views: views[name]
        }, function(err, res) {
          if(!err) {
            db.compact();
            writeBody('Document written to database. Redirecting...');
            setTimeout(function() {
               window.location = '../../src/index.html?config=usr/config/default.json'
            }, 1000);
          }
          else {
            writeBody('Error: Could not write to database.');
          }
        });
      });
    }
    
    function writeBody(text) {
      var body = document.getElementsByTagName('body')
      body[0].innerHTML += text;
    }

    </script>
</body>
</html>