#!/bin/bash
docker run -d -p 5984:5984 --name couchdbapp couchdb
docker build -t testapp .
docker run -d -p 1337:1337 --link couchdbapp:couchdb --name testappdocker testapp
echo "Now visit: http://localhost:1337"