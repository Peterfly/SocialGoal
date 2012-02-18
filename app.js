
/**
 * Module dependencies.
 */
var http	= require('http'),
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

//socket.io dependency
io.sockets.on('connection', function (socket) {
  socket.on('receive', function (data){
  myModel.findOne({userID: data.userID}, function (err, user){
		if (err){
			throw err;
		}
		if (user){
			user.goals[data.goal.name] = data.goal;
			user.save();
		}else{
			var temp = new myModel();
			temp.userID = user.userID;
			temp.goals[data.goal.name] = data.goal;
			temp.save();
		}
	  });
  setTimeout(function(){
	///now still keep the goal in the goals array
	socket.emit(data.userID, data.goal);
  }, data.goal.expire);
  });
});


var base64ToString = function(str) {
	return (new Buffer(str || "", "base64")).toString("ascii");
};

var base64UrlToString = function(str) {
	return base64ToString( base64UrlToBase64(str) );
};

var base64UrlToBase64 = function(str) {
	var paddingNeeded = (4- (str.length%4));
	for (var i = 0; i < paddingNeeded; i++) {
		str = str + '=';
	}
	return str.replace(/\-/g, '+').replace(/_/g, '/');
};

function handleAuthData(req, res) {
	var data = req.params.data;
	console.log(data);
}

function handlePOSTData(req, res) {
	var signed_request = req.param('signed_request');
	var parts = signed_request.split('.');
	var sig = base64UrlToBase64(parts[0]);
	var payload = parts[1];
	var data = JSON.parse(base64UrlToString(payload));
	
	if (!data.userid)
	{
		res.redirect('https://www.facebook.com/dialog/oauth?client_id=369903096353188&redirect_uri=http://ec2-184-169-254-137.us-west-1.compute.amazonaws.com/');
	}
	else
	{
		if (data.algorithm.toUpperCase() != 'HMAC-SHA256') {
		  res.end('Error: Unknown algorithm');
		  console.log("unknown algorithm");
		  return;
		}
	}

	var secret = 'd555b78179720597ace237f871a820d9';
	// Make sure the data posted is valid and comes from facebook.
	var hmac = crypto.createHmac('sha256', secret);
	hmac.update(payload);
	var expected_sig = digest('base64');

	if (sig != signature) {
	  res.end('Error: Bad signature');
	  console.log("bad signature");
	  return;
	}

	console.log(facebook.user_id);
}

app.get('/?code=data:', handleAuthData);

app.get('/', routes.index);

app.get('/channel.html', function (req, res) {
	res.sendfile('views/channel.html');
});

app.get('/fb', handlePOSTData);

app.post('/', function (req, res) {
	res.redirect('https://www.facebook.com/dialog/oauth?client_id=369903096353188&redirect_uri=http://ec2-184-169-254-137.us-west-1.compute.amazonaws.com/');
});

app.post('/data', function (req, res) {
	//console.log(req);
	routes.index(req, res);
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
