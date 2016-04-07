var express = require('express');
var app = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var swig = require('swig');

app.use(morgan('dev'));
mongoose.connect('mongodb://localhost/nodewiki');

var pageSchema = mongoose.Schema({
  url : String,
  title : String,
  created : Date,
  author : String,
  text : String
});

var Page = mongoose.model('Page', pageSchema);

app.get('/', function(req, res) {
  Page.find(function(err, pages) {
    if (err) res.send(err);
    res.json(pages);
  });
});

app.get('/:url', function(req, res) {
  console.log(req.params.url);
  Page.findOne({url: req.params.url}, function(err, page) {
    console.log(page);
    if (err) res.send(err);
    if (page)
      res.end(swig.renderFile('./index.html', {
        title: page.title,
        text: page.text
      }));
    else
      res.end(swig.renderFile('./index.html', {
        title: req.params.url+' not found',
        text: 'This page was not found.'
      }));
  });
});

app.listen(8080);
console.log('Listening...');
