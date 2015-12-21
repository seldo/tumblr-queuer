# Tumblr queuer

This is a huge hack. It creates a very small Tumblr OAuth app
that can put things into your tumblr queue at specified times,
in very large batches. It exists to power the Twitter account
@sunofseldo (I post to Tumblr and IFTTT cross-posts. Should I
use Buffer or something? I dunno.)

Anyway. It creates an app that listens on [http://127.0.0.1:3000](http://127.0.0.1:3000)
(it is **very important** to use 127.0.0.1 and not `localhost`). It requires that
you have created an app on Tumblr and created a config.js file that looks like this:

```
module.exports = {
  TUMBLR_CONSUMER_KEY: "XXXXX",
  TUMBLR_SECRET_KEY: "YYYYY",
  BLOG_NAME: 'myblogname'
}
```

Once that's in place, run `npm start`. It will try to open your browser and then use 
cookie-based OAuth to authorize this app and store the results in memory
(so if you stop the app and start it again, you will need to re-auth).
The app calls back to `http://127.0.0.1:3000/auth/tumblr/callback` which is
why it's so important to use that instead of localhost; if you use localhost
the local app will run but the OAuth step will always fail.

Once you are authed you will get a big box that expects input in the form of

```
Jan 8 2014 5:08 PM,Any text here.
Jan 9 2014 1.15 AM,Any text here at all, even if it has commas.
```

Everything up to the first comma will be parsed as a date. Everything after the
first comma will be posted as the text. If you're just posting to tumblr this is
fine but if you're using it to relay to Twitter remember that you have a 140-character
limit.
