
/**
 * Module dependencies.
 */
var http	= require('http'),
	querystring = require('querystring'),
	crypto	= require('crypto');
	
var express = require('express')
  , routes = require('./routes');
var lab = 1;
var app = module.exports = express.createServer()
  , io = require('socket.io').listen(app);

///database initialized
var mong = require('mongoose')
  , schema = mong.Schema
  , ObjectId = schema.ObjectId;

db = mong.connect('mongodb://136.152.36.245/my_database');

var myschema = new schema({
	userID: {type: Number}
  , goals : {type: Array}
  , counts: {type: Number, default: 1}
  , buff  : Buffer
});
var myModel = mong.model('goalers', myschema);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

//app.get('/', function (req, res) {
//  res.sendfile('views/index.html');
//});
function loadUser(req, res, next){
	var user = new myModel();
	user.userID = lab;
	user.save(function (err, x){
		next();
	});
	
}
/*
console.log(lab);
myModel.findOne({userID: lab}, function (err, doc){
	console.log("sdsfjaf");
	doc.counts ++;
	res.send(doc);
	doc.save();
});
console.log("first step");
console.log("good");
*/

// Simple function to decode a base64url encoded string.
function base64_url_decode(data) {
  return new Buffer(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('ascii');
}

// Wait for and parse POST data
function parse_post(req, callback) {
  // Pushing things into an array and joining them in the end is faster then concatenating strings.
  var data = [];

  console.log("parsing post");
  
  req.addListener('data', function(chunk) {
    data.push(chunk);
  });

  console.log("all data collected");
  req.addListener('end', function() {
    callback(querystring.parse(data.join('')));
  });
}

function handlePOSTData(data) {
	if (!data.signed_request) {
		console.log("no signed request");
		res.end('Error: No signed_request');
		return;
	}
	data = data.signed_request.split('.', 2);

	var facebook = JSON.parse(base64_url_decode(data[1])); // The second string is a base64url encoded json object

	if (!facebook.algorithm || (facebook.algorithm.toUpperCase() != 'HMAC-SHA256')) {
	  res.end('Error: Unknown algorithm');
	  console.log("unknown algorithm");
	  return;
	}

	// Make sure the data posted is valid and comes from facebook.
	var signature = crypto.createHmac('sha256', 'd555b78179720597ace237f871a820d9').update(data[1]).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace('=', '');

	if (data[0] != signature) {
	  res.end('Error: Bad signature');
	  console.log("bad signature");
	  return;
	}

	console.log(facebook.user_id);
}

app.get('/', routes.index);

app.get('/channel.html', function (req, res) {
	res.sendfile('views/channel.html');
});

app.post('/', function (req, res) {
	console.log("POST detected");
	parse_post(req, handlePOSTData);
	console.log("Part 2");
	res.redirect('https://www.facebook.com/dialog/oauth?client_id=369903096353188&redirect_uri=http://ec2-184-169-254-137.us-west-1.compute.amazonaws.com/');
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
