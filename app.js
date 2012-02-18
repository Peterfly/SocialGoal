
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();

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
app.get('/', app.get('/', routes.index));

app.post('/', function (req, res) {
	res.redirect('https://www.facebook.com/dialog/oauth?client_id=369903096353188&redirect_uri=http://ec2-184-169-254-137.us-west-1.compute.amazonaws.com/');
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
