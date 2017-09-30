'use strict';

const express = require('express');
const nano = require('nano')('http://couchdb:5984');
const bodyParser = require('body-parser');
const PORT = 1337;
const HOST = '0.0.0.0';

const app = express();
app.use(express.static(__dirname));
app.use(bodyParser.json());
//after db created - setup server.
nano.db.create('items', function () {
  // on root route - show index file.
  app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
  });

  app.listen(PORT, HOST);
  let items = nano.use('items');
  app.get('/items', function (req, res) {
    //response with all docs on GET request
    items.list({include_docs: true}, (error, body) => {
      if (error) {
        res.status(500).send('Error in DB.');
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(body.rows);
      }
    });
  });
  app.delete('/items', function (req, res) {
    //check if all required arguements present for DELETE request, if not - send error.
    if (req.body._id && req.body.rev) {
      items.destroy(req.body._id, req.body.rev, function (error, body) {
        if (error) {
          res.status(500).send(error);
          console.log(error);
        } else {
          res.status(200).send(body);
          console.log(body);
        }
      })
    } else {
      res.status(403).send('Wrong arguments.');
    }
  });
  app.post('/items', function (req, res) {
    //check if all required arguements present for POST request, if not - send error.
    if (req.body._id && req.body.firstName && req.body.lastName && req.body.age && req.body.profession) {
      items.insert(req.body, req.body._id, function (error, body) {
        if (error) {
          res.status(500).send(error);
          console.log(error);
        } else {
          res.status(200).send(body);
          console.log(body);
        }
      });
    } else {
      res.status(403).send('Wrong arguments.');
    }
  });
});
