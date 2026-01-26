#!/usr/bin/env sh

/create_db.sh
echo "create_db done"
ls /rest-on-couch-source/bin
exec node /rest-on-couch-source/bin/rest-on-couch-server.js
