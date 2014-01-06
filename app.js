var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , TumblrStrategy = require('passport-tumblr').Strategy
  , tumblr = require('tumblr.js')
  , config = require('./config');

console.log(config)

var TUMBLR_CONSUMER_KEY = config.TUMBLR_CONSUMER_KEY
var TUMBLR_SECRET_KEY = config.TUMBLR_SECRET_KEY
var BLOG_NAME = config.BLOG_NAME

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the TumblrStrategy within Passport.
passport.use(new TumblrStrategy({
    consumerKey: TUMBLR_CONSUMER_KEY,
    consumerSecret: TUMBLR_SECRET_KEY,
    callbackURL: "http://127.0.0.1:3000/auth/tumblr/callback"
  },
  function(token, tokenSecret, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Tumblr profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Tumblr account with a user record in your database,
      // and return that user instead.
      profile.accessToken = token
      profile.accessSecret = tokenSecret
      return done(null, profile);
    });
  }
));



var app = express();

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'oh so very secret' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/../../public'));
});



app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.post('/queue', ensureAuthenticated, function(req, res){

  var client = tumblr.createClient({
    consumer_key: TUMBLR_CONSUMER_KEY,
    consumer_secret: TUMBLR_SECRET_KEY,
    token: req.user.accessToken,
    token_secret: req.user.accessSecret
  });

  var finished = function() {
    client.queue(BLOG_NAME, {limit: 50}, function(er,resp) {
      console.log("Queue retrieved!")
      console.log(resp.posts);
      res.render('queue', { posts: resp.posts });
    });
  }

  var lines = req.body['csv'].split("\n")
  var count = lines.length
  var done = function(er,resp) {
    count--
    if (count == 0) finished()
  }

  lines.forEach(function(line,index) {

    var firstComma = line.indexOf(',')

    if (firstComma == -1) {
      done()
    } else {
      var dateString = line.substr(0,firstComma)
      var text = line.substr(firstComma+1)
      var publishOn = new Date(dateString).toISOString()
      console.log("Want to post " + text + " at " + dateString + " parsed to " + publishOn)

      client.text(BLOG_NAME, {
        state: 'queue',
        body: text,
        publish_on: publishOn
      }, done)
    }
  })

});


// GET /auth/tumblr
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Tumblr authentication will involve redirecting
//   the user to tumblr.com.  After authorization, Tumblr will redirect the user
//   back to this application at /auth/tumblr/callback
app.get('/auth/tumblr',
  passport.authenticate('tumblr'),
  function(req, res){
    // The request will be redirected to Tumblr for authentication, so this
    // function will not be called.
  });

// GET /auth/tumblr/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/tumblr/callback', 
  passport.authenticate('tumblr', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(3000);


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page (in this case also the root)
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}
