'use strict'
const mongodb = {
	'DB_PATH' : 'mongodb+srv://admin:admin@cluster0-g3d7m.mongodb.net',
	'DB_NAME' : 'admin_auth',
	'DB_USER' : 'admin',
	'DB_PASSWORD' : 'admin',
}
/*
const MongoClient = require(‘mongodb’).MongoClient;
const uri = "mongodb+srv://admin:<password>@cluster0-g3d7m.mongodb.net/test?retryWrites=true";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});*/