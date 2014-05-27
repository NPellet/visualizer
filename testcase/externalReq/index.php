<html>
<head>
    <script src="lib/pouchdb-2.2.2.min.js" type="text/javascript" charset="utf-8"></script>
</head>
<body>
    <script type="text/javascript" charset="utf-8">
    //console.log('in script');
    var types = {
      molfile: 'mol2d',
      smiles: 'smiles'
    };
    var views = {
      molfile: '1a2f56c6e19761ec8e64c07c006eaa5b'
    };
    
    var data = {};
    try {
      <?php foreach($_POST as $key=>$postvar): ?>
      try {
        data["<?php echo $key ?>"] = JSON.parse(<?php echo json_encode($postvar) ?>)
      } catch(e) {
        data["<?php echo $key ?>"] = <?php echo json_encode($postvar) ?>;
      }
      <?php endforeach; ?>
    } catch(e) {
      console.log("went wrong");
    }
    
    try {
      <?php foreach($_GET as $key=>$postvar): ?>
      try {
        data["<?php echo $key ?>"] = JSON.parse(<?php echo json_encode($postvar) ?>)
      } catch(e) {
        data["<?php echo $key ?>"] = <?php echo json_encode($postvar) ?>;
      }
      <?php endforeach; ?>
    } catch(e) {
      alert("Something went wrong");
    }
    
    
    
    console.log(data);
    
    if(!data.value) data.value = {};
    if(!data.name || typeof data.name !== "string" || !types[data.name]) {
      writeBody('Error: '+data.name+' service does not exist');
    }
    else {
      var db = new PouchDB('external_infos');
      var rev = null;
    
      db.get(data.name, function(err, res) {
        if(!err) {
          rev = res._rev
        }
        var x = {
          _id: data.name,
          _rev: rev ? rev : undefined,
          type: types[data.name],
          value: data.value,
          views: views[data.name]
        };
        console.log(x);
        db.put(x, function(err, res) {
          if(!err) {
            db.compact().then(function() {
              writeBody('Document written to database. Redirecting...');
              setTimeout(function() {
                 window.location = '/visualizer/_design/visualizer_head/index.html?viewURL=/c/'+views[data.name]+'/view.json'
              }, 500);
            });
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