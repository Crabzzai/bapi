// Imports
const {MongoClient} = require('mongodb');

// Module Export
module.exports = (url, cb) => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(db_err, client) {
        cb(db_err, client)
    });
}