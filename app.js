
/**
 * Module dependencies.
 */

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


app.get('/', function (req, res){
	res.sendfile(__dirname + '/index.html');
});

app.post('/', function (req, res) {
	res.redirect('https://www.facebook.com/dialog/oauth?client_id=369903096353188&redirect_uri=http://ec2-184-169-254-137.us-west-1.compute.amazonaws.com/');
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
