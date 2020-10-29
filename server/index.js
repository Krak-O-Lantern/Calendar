/* eslint-disable no-console */
const path = require('path');
const express = require('express');
// const compression = require('compression');
// const bodyParser = require('body-parser');
const Arango = require('arangojs').Database;
const { username, password } = require('../cred.js');
require('newrelic');

// require('../database-mongodb/index.js');
// const { Listing } = require('../database-mongodb/index');

// ## Connection to ArangoDB

const arangoURL = 'http://127.0.0.1:8529';
const db = new Arango(arangoURL);
db.useBasicAuth(username, password);

db.listCollections().then((res) => {
  res.forEach((coll, i) => {
    console.log(`${i + 1}. ${coll.name} (ID=${coll.id}, system=${coll.isSystem})`);
  });
}, (err) => {
  const res = err.response.body;
  console.log(`Error ${res.errorNum}: ${res.errorMessage} (HTTP ${res.code})`);
});

// require('../database-mongodb/index.js');
// const { Listing } = require('../database-mongodb/index');

const app = express();
// app.use(compression());

const PORT = 3001;
// const PUBLIC_DIR = path.join(__dirname, '/../public');

// app.use(bodyParser.json());
app.use('/listings/:listing_id', express.static(path.join(__dirname, '/../public')));

app.get('/api/listings/:listing_id', (req, res) => {
  const id = req.params.listing_id;
  // Listing.findOne({ listing_id: id })
  db.query(`FOR i IN reservations FILTER i.listing_id == ${id} RETURN i`)
    .then(({ _result }) => res.send(_result[0]))
    .catch((err) => res.status(418).send(err));
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
