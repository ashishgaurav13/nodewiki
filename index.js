var express = require('express');
var app = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var swig = require('swig');
var bodyParser = require('body-parser');

// extended global replace
String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

app.use(morgan('dev'));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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
  Page.findOne({url: req.params.url}, function(err, page) {
    if (err) res.send(err);
    if (page) {
      res.end(swig.renderFile('./index.html', {
        linktext: "Edit this page",
        link: "/edit/"+page.url,
        title: page.title,
        text: page.text.replaceAll('\r\n', "<br>")
      }));
    } else {
      res.redirect('/edit/'+req.params.url);
    }
  });
});

app.get('/edit/:url', function(req, res) {
  Page.findOne({url: req.params.url}, function(err, page) {
    if (err) res.send(err);
    res.end(swig.renderFile('./edit.html', {
      url: req.params.url,
      title: (page ? page.title : ""),
      text: (page ? page.text : ""),
      keepdiscard: (page? true : false)
    }));
  });
});

app.post('/save/:url', function(req, res) {
  var wanted = Page.findOne({url: req.params.url}, function(err, page) {
    if (err) res.send(err);
    if (!page) {
      page = new Page({url: req.params.url});
    }      
    page.title = req.body.title;
    page.text = req.body.text;
    page.save(function(err, page) {
      if (err) res.send(err);
      res.redirect('/'+req.params.url);
    });
  });
});
    
app.listen(8080);
console.log('Listening...');
