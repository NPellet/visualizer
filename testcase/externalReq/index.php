<html>
<head>
    <script src="lib/pouchdb-nightly.min.js" type="text/javascript" charset="utf-8"></script>
</head>
<body>
    <script type="text/javascript" charset="utf-8">
    //console.log('in script');
    var types = {
      molfile: 'mol2d'
    };
    var views = {
      molfile: '2e853f5d3e21623f28d235a412e1e169'
    }
    
    var jsonval = "<?php echo $_POST['value'] ?>";
    var name = "<?php echo $_POST['name'] ?>";
    
    if(!types[name]) {
      writeBody('Error: '+name+' has no corresponding type');
    }
    else {
      var db = new PouchDB('external_infos');
      var rev = null;
    
      db.get(name, function(err, res) {
        if(!err) {
          rev = res._rev
        }
        db.put({
          _id: name,
          _rev: rev ? rev : undefined,
          type: types[name],
          value: jsonval,
          views: views[name]
        }, function(err, res) {
          if(!err) {
            db.compact();
            writeBody('Document written to database. Redirecting...');
            setTimeout(function() {
               window.location = '/visualizer/_design/visualizer_head/index.html?config=default.json&viewURL=/c/'+views[name]+'/view.json'
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