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
    
    var data = {};
    try {
      <?php foreach($_POST as $key=>$postvar): ?>
      console.log("post var: <?php echo $key ?>", "<?php echo $postvar ?>");
      try {
        data["<?php echo $key ?>"] = JSON.parse("<?php echo $postvar ?>")
      } catch(e) {
        data["<?php echo $key ?>"] = "<?php echo $postvar ?>";
      }
      <?php endforeach; ?>
    } catch(e) {
      console.log("went wrong");
    }
    
    try {
      <?php foreach($_GET as $key=>$postvar): ?>
      console.log("post var: <?php echo $key ?>", "<?php echo $postvar ?>");
      try {
        data["<?php echo $key ?>"] = JSON.parse("<?php echo $postvar ?>")
      } catch(e) {
        data["<?php echo $key ?>"] = "<?php echo $postvar ?>";
      }
      <?php endforeach; ?>
    } catch(e) {
      console.log("went wrong");
    }
    
    
    
    console.log(data);
        
    if(!data.name || typeof data.name !== "string" || !types[data.name] || !data.value) {
      writeBody('Error: '+data.name+' has no corresponding type');
    }
    else {
      var db = new PouchDB('external_infos');
      var rev = null;
    
      db.get(data.name, function(err, res) {
        if(!err) {
          rev = res._rev
        }
        db.put({
          _id: data.name,
          _rev: rev ? rev : undefined,
          type: types[data.name],
          value: data.value,
          views: views[data.name]
        }, function(err, res) {
          if(!err) {
            db.compact();
            writeBody('Document written to database. Redirecting...');
            setTimeout(function() {
               //window.location = '/visualizer/_design/visualizer_head/index.html?config=default.json&viewURL=/c/'+views[data.name]+'/view.json'
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