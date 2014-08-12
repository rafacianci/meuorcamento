var express = require('express')
	, app = express()
	, load = require('express-load')
	, error = require('./middleware/erro')
	, mongoose = require('mongoose')
;

global.db = mongoose.connect('mongodb://craveiro:moises@ds050077.mongolab.com:50077/craveiro');

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.cookieParser('craveiro'));
app.use(express.session());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(__dirname + '/public'));
app.use(error.notFound);
app.use(error.serverError);

load('models')
	.then('controllers')
	.then('routes')
	.into(app);


app.listen(3000, function(){
   console.log('No AR!');
});

