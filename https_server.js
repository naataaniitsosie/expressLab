var express = require('express');
var bodyParser = require('body-parser');
var basicAuth = require('basic-auth-connect');
var https = require('https');
var http = require('http');
var fs = require('fs');
var url = require('url');
var app = express();
app.use(bodyParser());
var ROOT_DIR = "files/";
var options = {
	host: '54.173.180.106',
	key: fs.readFileSync('ssl/server.key'),
	cert: fs.readFileSync('ssl/server.crt')
};
var auth = basicAuth(function(user, pass){
	return((user === 'cs360')&&(pass === 'test'));
});

http.createServer(app).listen(80);
https.createServer(options, app).listen(443);
app.get('/', function(req, res) {
	res.send("Get Index");
});

app.use('/', express.static('./files', {maxAge: 60*60*1000}));

app.get('/getcity', function(req, res) {

	fs.readFile(ROOT_DIR + 'cities.dat.txt', function(err,data){	
		var jsonresult = [];	
		var myRe = new RegExp("^" + req.query["q"]);
		var cities = data.toString().split("\n");
		for(var i = 0; i < cities.length; i++) {
			var result = cities[i].search(myRe);
			if(result != -1) {
				jsonresult.push({city:cities[i]});
			}
		}
		res.json(jsonresult);
	});
});

app.get('/comment', function(req, res){
	// Read all of the database entries and return them in a JSON array
	var MongoClient = require('mongodb').MongoClient;
	MongoClient.connect("mongodb://localhost/weather", function(err, db) {
		if(err) {
			throw err;
		}
		db.collection("comments", function(err, comments) {
			if(err) {
				throw err;
			}
			comments.find(function(err, items) {
				items.toArray(function(err, itemArr) {
					res.json(itemArr);
				});
			});
		});
	});
});

app.post('/comment', auth, function(req, res) {
			
	// Put req.body into database
	var MongoClient = require('mongodb').MongoClient;
	MongoClient.connect("mongodb://localhost/weather", function(err, db) {
		if(err) {
			throw err;
		}
		db.collection('comments').insert(req.body, function(err, records) {});
	});
	res.status(200);
	res.end();
});
