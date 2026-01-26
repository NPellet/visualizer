#!/bin/sh

/wait.sh

response=$(curl --write-out %{http_code} --silent --output /dev/null http://couchdb:5984/visualizer)

if [ ${response} = "404" ]
then

echo "Database is not instantiated. Create it."

curl -X POST -H "Content-Type: application/json" http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@couchdb:5984/_cluster_setup -d '{"action": "finish_cluster"}'

# Init rest-on-couch users
curl -X POST http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@couchdb:5984/_users \
     -H 'Content-Type: application/json' \
     -d '{ "_id": "org.couchdb.user:rest-on-couch", "name": "rest-on-couch", "type": "user", "roles": [], "password": "'${COUCHDB_PASSWORD}'" }'

curl -X POST http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@couchdb:5984/_users \
     -H 'Content-Type: application/json' \
     -d '{ "_id": "org.couchdb.user:admin@cheminfo.org", "name": "admin@cheminfo.org", "type": "user", "roles": [], "password": "'${COUCHDB_PASSWORD}'" }'


# Init couchdb databases and security setup, and create rest-on-couch groups (they all can be edited later)

echo "Create visualizer database"
curl -X PUT http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@couchdb:5984/visualizer
echo "Create groups in visualizer database"
curl -X POST http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@couchdb:5984/visualizer \
     -H 'Content-Type: application/json' \
     -d '{"$type": "group", "$owners": ["admin@cheminfo.org"], "name": "anonymousRead", "users": [], "rights": ["read"], "$lastModification": "admin@cheminfo.org", "$modificationDate": 0, "$creationDate": 0}';
curl -X POST http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@couchdb:5984/visualizer \
     -H 'Content-Type: application/json' \
     -d '{"$type": "group", "$owners": ["admin@cheminfo.org"], "name": "anyuserRead", "users": [], "rights": ["read"], "$lastModification": "admin@cheminfo.org", "$modificationDate": 0, "$creationDate": 0}';

echo "Create default groups in visualizer"
curl -X PUT http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@couchdb:5984/visualizer/defaultGroups \
     -H 'Content-Type: application/json' \
     -d '{"_id": "defaultGroups","$type": "db","anonymous": ["anonymousRead"],"anyuser": ["anyuserRead"]}'

echo "Setup visualizer database _security"
curl -X PUT http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@couchdb:5984/visualizer/_security \
     -H 'Content-Type: application/json' \
     -d '{ "admins": { "names": ["rest-on-couch"], "roles": [] }, "members": { "names": ["rest-on-couch"], "roles": [] } }'


fi
