var express = require('express');
var app = express();
var mongoose = require('mongoose');
var morgan = require('morgan');

mongoose.connect('mongodb://localhost/nodewiki');
app.use(morgan('dev'));

var Page = mongoose.model('Page', {
  url : String,
  title : String,
  created : Date,
  author : String,
  text : String
});

app.get('/api/', function(req, res) {
  Page.find(function(err, pages) {
    if (err) res.send(err);
    res.json(pages);
  });
});

app.get('/api/:url', function(req, res) {
  Page.findOne({url : req.params.url}, function(err, page) {
    if (err) res.send(err);
    res.json(page);
  });
});

app.get('*', function(req, res) {
  res.sendFile(__dirname+'/public/index.html');
});

app.listen(8080);
console.log('Listening...');
