
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var fs = require('fs');

// mongo
var mongo = require('mongoskin');
var monk = require('monk');
var db = mongo.db([
    'localhost:27017/?auto_reconnect'
], {
        database: 'quizapp',
        safe: true
    }
);

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/', routes.index);
app.get('/', function(request, response) {
    var readFile = "./public/html/quiz.html";
    var fileContents = fs.readFileSync(readFile);

    response.send(fileContents.toString());
});

app.post('/adduserscore', function(request, response) {
    var userName = request.body.userName;
    var password = request.body.password;
    var score = request.body.score;

    //var collection = db.get('usercollection');

    db.collection('usercollection').insert({
        "username": userName,
        "pwd": password,
        "totalScore": score
    }, function (err, doc) {
        if (err) {
            response.send("There was a problem adding the information to the database.");
        }
        else {
            response.location("userlist");
        }
    });
});

app.get('/getavgscore', function(request, response) {

   // var collection = db.get('usercollection');

    db.collection('usercollection').find().toArray(function (err, items) {

        var addedScores = 0;
        for (var i = 0; i < items.length; i++) {
            addedScores += items[i].totalScore;
        }
        var avgScore = addedScores / items.length;
        var serializedJson = JSON.stringify(avgScore);
        response.json({ average: avgScore });
    })
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
