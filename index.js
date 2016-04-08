var express = require('express');
var app = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var swig = require('swig');
var bodyParser = require('body-parser');
var marked = require('marked');
var multer = require('multer');


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
	Page.findOne({url: 'home'}, function(err, page) {
		if (err) res.send(err);
    if (!page) {
      page = new Page({url: 'home'});
    }      
    page.title = "Welcome to nodewiki";
    page.text = "Installation\r\n========\r\nYou must have\r\n* nodejs\r\n* mongodb\r\n\r\nClone the repository, and inside the project directory, do\r\n\r\n    $ npm install\r\n\r\nRunning the code\r\n=============\r\nJust do\r\n\r\n    $ npm start\r\n\r\nand the wiki should start. You can navigate to localhost:8080, and you should be greeted by the home page.\r\n\r\nFeatures\r\n=======\r\n* MathJax integration\r\n* basic image uploading\r\n* markdown support via marker\r\n* on the go creation of new pages\r\n* pages searchable\r\n\r\nTo Do\r\n=====\r\n* more theming\r\n* image uploading without losing edit progress\r\n* image search\r\n* all searches via dropdown\r\n* deleting pages\r\n\r\n![Simple Desktops](/img/sunRising.png)";
    page.save(function(err, page) {
      if (err) res.send(err);
			res.redirect('/home');
    });  
  });
});

app.get('/:url', function(req, res) {
  if (req.params.url !== 'favicon.ico')
  Page.findOne({url: req.params.url}, function(err, page) {
    if (err) res.send(err);
    if (page) {
      res.end(swig.renderFile('./index.html', {
        link: page.url,
        title: page.title,
        text: marked(page.text
					.replaceAll('\r\n', '\n'))
      }));
    } else {
      res.redirect('/edit/'+req.params.url);
    }
  });
});

app.get('/edit/:url', function(req, res) {
  Page.findOne({url: req.params.url}, function(err, page) {
    if (err) res.send(err);
		console.log(req.params.url);
    res.end(swig.renderFile('./edit.html', {
      link: req.params.url,
      title: (page ? page.title : ""),
      text: (page ? page.text : ""),
      keepdiscard: (page ? true : false)
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

app.get('/upload/image/:mode/:url', function (req, res) {
	res.end(swig.renderFile('./upload.html', {
		mode: req.params.mode,
		url: req.params.url	
	}));
});

app.post('/upload/image/:mode/:url', multer({storage: multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/img/')
  },
  filename: function (req, file, cb) {
    cb(null, req.body.imgname)
  }
})}).single('image'), function (req, res) {
	res.redirect((req.params.mode == 'view' ? '/' : '/edit/')+req.params.url);	
});

app.post('/search/', function(req, res) {
	Page.find({$or: [{url: {"$regex":req.body.searchbox, "$options":"i"}}, 
									 {title: {"$regex":req.body.searchbox, "$options":"i"}},
									 {text: {"$regex":req.body.searchbox, "$options":"i"}}]},
						function(err, pages) {
		if (err) res.send(err);		
		res.end(swig.renderFile('search.html', {term: req.body.searchbox, pages: pages}));
	});	
});
    
app.listen(8080);
console.log('Listening...');
